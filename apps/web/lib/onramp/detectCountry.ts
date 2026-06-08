import type { NextRequest } from 'next/server';

/**
 * Detects the user's country code based on the CF-IPCountry header added by Cloudflare.
 * Returns ISO 3166-1 alpha-2 code in uppercase (e.g. 'NG', 'KE'), or null if undetected.
 */
export function detectUserCountry(request: NextRequest): string | null {
  const countryHeader = request.headers.get('cf-ip-country');
  
  if (countryHeader && countryHeader.trim().length === 2) {
    const code = countryHeader.trim().toUpperCase();
    // Validate it's not a private or block region (e.g. XX or T1)
    if (/^[A-Z]{2}$/.test(code)) {
      return code;
    }
  }
  
  return null;
}
