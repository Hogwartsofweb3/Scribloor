export interface CleanedContact {
  email: string;
  name: string | null;
  sourceSubscriptionStatus: string | null;
}

/**
 * Parses a CSV line into an array of column values, handling quote-enclosed fields correctly.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Check if it's an escaped quote "" inside a quoted field
      if (inQuotes && line[i + 1] === '"') {
        currentVal += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(currentVal.trim());
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  result.push(currentVal.trim());

  // Clean surrounding quotes if they exist
  return result.map(val => {
    let cleaned = val;
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    return cleaned.trim();
  });
}

/**
 * Validates email format.
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Downloads and parses CSV subscriber export files.
 */
export async function parseMigrationCsv(
  fileUrl: string,
  platform: 'substack' | 'beehiiv' | 'ghost' | 'other',
  includeFreeTier: boolean
): Promise<CleanedContact[]> {
  let csvText = '';
  if (fileUrl.startsWith('data:text/csv;base64,')) {
    try {
      const base64Data = fileUrl.split(',')[1];
      csvText = Buffer.from(base64Data, 'base64').toString('utf-8');
    } catch (err) {
      throw new Error('Failed to decode base64 CSV file content.');
    }
  } else {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV file: ${response.statusText}`);
    }
    csvText = await response.text();
  }

  const rawLines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (rawLines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(rawLines[0]).map(h => h.toLowerCase().trim());
  const contacts: CleanedContact[] = [];
  const seenEmails = new Set<string>();

  // Helper to find column index by common header names
  const getColIndex = (possibleNames: string[]): number => {
    return headers.findIndex(h => possibleNames.includes(h));
  };

  // Resolve headers based on platform
  let emailIdx = -1;
  let nameIdx = -1;
  let statusIdx = -1;
  let tierIdx = -1;
  let compIdx = -1;
  let stripeIdx = -1;

  if (platform === 'substack') {
    emailIdx = getColIndex(['email', 'email address']);
    nameIdx = getColIndex(['name', 'first name', 'last name']);
    statusIdx = getColIndex(['subscription_status', 'status']);
  } else if (platform === 'beehiiv') {
    emailIdx = getColIndex(['email', 'email address']);
    nameIdx = getColIndex(['name', 'first name', 'last name']);
    statusIdx = getColIndex(['status']);
    tierIdx = getColIndex(['tier']);
  } else if (platform === 'ghost') {
    emailIdx = getColIndex(['email', 'email address']);
    nameIdx = getColIndex(['name']);
    compIdx = getColIndex(['complimentary_plan']);
    stripeIdx = getColIndex(['stripe_customer_id', 'stripe_customer']);
  } else {
    // Other / Custom: Search for email
    emailIdx = headers.findIndex(h => h.includes('email'));
    // Try to detect name
    nameIdx = headers.findIndex(h => h.includes('name'));
    statusIdx = headers.findIndex(h => h.includes('status') || h.includes('active') || h.includes('state'));
  }

  // Fallback search if index is -1
  if (emailIdx === -1) {
    // If we can't find an email column, check if there's any column that contains '@' in the first data row
    const firstDataRow = parseCsvLine(rawLines[1]);
    emailIdx = firstDataRow.findIndex(val => isValidEmail(val));
  }

  if (emailIdx === -1) {
    throw new Error('Could not identify an email column in the CSV file.');
  }

  // Parse lines
  for (let i = 1; i < rawLines.length; i++) {
    const line = rawLines[i];
    const columns = parseCsvLine(line);

    // Skip empty lines or malformed rows
    if (columns.length <= emailIdx) continue;

    const email = columns[emailIdx]?.trim();
    if (!email || !isValidEmail(email)) continue;

    // Skip duplicate emails within this import job
    const lowerEmail = email.toLowerCase();
    if (seenEmails.has(lowerEmail)) continue;

    const name = nameIdx !== -1 ? columns[nameIdx]?.trim() || null : null;
    let sourceSubscriptionStatus: string | null = null;
    let keep = true;

    if (platform === 'substack') {
      const subStatus = statusIdx !== -1 ? columns[statusIdx]?.toLowerCase().trim() || '' : '';
      sourceSubscriptionStatus = subStatus || 'active';
      
      // If includeFreeTier is false, filter out free subscribers
      if (!includeFreeTier) {
        // Substack statuses: 'active', 'paid', 'free', 'gift', etc.
        // Usually, 'active' or 'paid' are premium, and 'free' is free tier.
        if (subStatus === 'free' || subStatus === 'free_tier') {
          keep = false;
        } else if (subStatus && subStatus !== 'active' && subStatus !== 'paid' && subStatus !== 'gift') {
          keep = false;
        }
      }
    } else if (platform === 'beehiiv') {
      const beeStatus = statusIdx !== -1 ? columns[statusIdx]?.toLowerCase().trim() || '' : '';
      const beeTier = tierIdx !== -1 ? columns[tierIdx]?.toLowerCase().trim() || '' : '';
      sourceSubscriptionStatus = beeTier || beeStatus;

      // Beehiiv filters status = 'active'
      if (beeStatus !== 'active') {
        keep = false;
      }
      
      // Filter out free if includeFreeTier is false
      if (!includeFreeTier && (beeTier === 'free' || beeTier === 'free_tier')) {
        keep = false;
      }
    } else if (platform === 'ghost') {
      const isComp = compIdx !== -1 ? columns[compIdx]?.toLowerCase().trim() === 'true' : false;
      const stripeId = stripeIdx !== -1 ? columns[stripeIdx]?.trim() || '' : '';
      sourceSubscriptionStatus = stripeId ? 'paid' : (isComp ? 'complimentary' : 'free');

      // Ghost filter: free is when stripe_customer_id is empty and complimentary_plan is false
      if (!includeFreeTier && !stripeId && !isComp) {
        keep = false;
      }
    } else {
      const statusVal = statusIdx !== -1 ? columns[statusIdx]?.trim() || null : null;
      sourceSubscriptionStatus = statusVal;
    }

    if (keep) {
      seenEmails.add(lowerEmail);
      contacts.push({
        email,
        name: name || null,
        sourceSubscriptionStatus,
      });

      // Enforce the maximum of 10,000 contacts
      if (contacts.length >= 10000) {
        break;
      }
    }
  }

  return contacts;
}
