import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { detectUserCountry } from '@/lib/onramp/detectCountry';
import { getOnrampProviders, ONRAMP_PROVIDERS } from '@/lib/onramp/providers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onramp/providers
 * Returns on-ramp providers for the user's country detected from Cloudflare headers.
 * Falls back to defaults (Transak, Coinbase, Jupiter) if country is undetected.
 */
export async function GET(request: NextRequest) {
  try {
    const countryCode = detectUserCountry(request);
    
    let resolvedCountryCode = countryCode;
    let countryName = 'Global';
    let providers = [];

    if (resolvedCountryCode) {
      providers = getOnrampProviders(resolvedCountryCode);
      
      // Resolve region name using Intl.DisplayNames
      try {
        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
        countryName = regionNames.of(resolvedCountryCode) || resolvedCountryCode;
      } catch (err) {
        console.error('[Onramp API] Error formatting region name:', err);
        countryName = resolvedCountryCode;
      }
    } else {
      // Default to Transak, Coinbase, and Jupiter
      providers = ONRAMP_PROVIDERS.filter((p) =>
        ['transak', 'coinbase', 'jupiter'].includes(p.id)
      ).sort((a, b) => {
        if (a.beginner_friendly && !b.beginner_friendly) return -1;
        if (!a.beginner_friendly && b.beginner_friendly) return 1;
        return 0;
      });
      resolvedCountryCode = null;
      countryName = 'your country';
    }

    return NextResponse.json({
      countryCode: resolvedCountryCode,
      countryName,
      providers,
    });
  } catch (error) {
    console.error('[Onramp API] Error resolving providers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
