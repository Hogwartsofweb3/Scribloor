export interface OnrampProvider {
  id: string;
  name: string;
  url: string;
  logo: string;
  description: string;
  countries: string[];
  paymentMethods: string[];
  estimatedTime: string;
  fees: string;
  beginner_friendly: boolean;
}

export const ONRAMP_PROVIDERS: OnrampProvider[] = [
  {
    id: 'yellow_card',
    name: 'Yellow Card',
    url: 'https://yellowcard.io',
    logo: '/images/onramp/yellow-card.svg',
    description: 'Buy USDC with mobile money or bank transfer',
    countries: ['NG', 'GH', 'KE', 'ZA', 'UG', 'TZ', 'RW', 'CM', 'SN', 'CI', 'ZM', 'MW'],
    paymentMethods: ['Mobile money', 'Bank transfer'],
    estimatedTime: '5–15 minutes',
    fees: 'Low',
    beginner_friendly: true,
  },
  {
    id: 'transak',
    name: 'Transak',
    url: 'https://transak.com',
    logo: '/images/onramp/transak.svg',
    description: 'Buy USDC with debit card or bank transfer',
    countries: ['IN', 'PK', 'ID', 'BR', 'EG', 'MX', 'PH', 'VN', 'BD', 'TH', 'MY'],
    paymentMethods: ['Debit card', 'Bank transfer', 'UPI (India)'],
    estimatedTime: '2–10 minutes',
    fees: 'Medium',
    beginner_friendly: true,
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    url: 'https://coinbase.com',
    logo: '/images/onramp/coinbase.svg',
    description: 'Buy USDC with bank transfer or debit card',
    countries: ['US', 'GB', 'EU', 'CA', 'AU', 'SG'],
    paymentMethods: ['Bank transfer', 'Debit card'],
    estimatedTime: '1–5 minutes',
    fees: 'Medium',
    beginner_friendly: true,
  },
  {
    id: 'binance',
    name: 'Binance',
    url: 'https://binance.com',
    logo: '/images/onramp/binance.svg',
    description: "Buy USDC on the world's largest crypto exchange",
    countries: ['*'], // Global
    paymentMethods: ['Bank transfer', 'Debit card', 'P2P'],
    estimatedTime: '10–30 minutes',
    fees: 'Low',
    beginner_friendly: false,
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    url: 'https://jup.ag',
    logo: '/images/onramp/jupiter.svg',
    description: 'Swap any crypto for USDC',
    countries: ['*'],
    paymentMethods: ['Crypto swap only'],
    estimatedTime: 'Instant',
    fees: 'Very low',
    beginner_friendly: false,
  },
];

/**
 * Returns on-ramp providers available in the specified country.
 * - Always shows beginner-friendly options first.
 * - Always includes at least one global option (Binance or Jupiter) as a fallback.
 * - Sorts by beginner_friendly=true first, then by country match specificity.
 */
export function getOnrampProviders(countryCode: string): OnrampProvider[] {
  const code = countryCode.toUpperCase();
  
  // Filter providers that list the specific country or are global ('*')
  const matched = ONRAMP_PROVIDERS.filter(
    (p) => p.countries.includes(code) || p.countries.includes('*')
  );

  // Sort matched providers:
  // 1. Beginner friendly first
  // 2. Specific country match (e.g. contains 'NG' directly) before global match ('*')
  return matched.sort((a, b) => {
    if (a.beginner_friendly && !b.beginner_friendly) return -1;
    if (!a.beginner_friendly && b.beginner_friendly) return 1;

    const aSpecific = a.countries.includes(code);
    const bSpecific = b.countries.includes(code);
    if (aSpecific && !bSpecific) return -1;
    if (!aSpecific && bSpecific) return 1;

    return 0;
  });
}
