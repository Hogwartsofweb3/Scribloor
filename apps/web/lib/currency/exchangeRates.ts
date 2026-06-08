import { redis } from '@/lib/redis';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  country: string;
  flag: string;
}

export function getSupportedCurrencies(): Currency[] {
  return [
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', country: 'Nigeria', flag: '🇳🇬' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', country: 'Kenya', flag: '🇰🇪' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', country: 'Ghana', flag: '🇬🇭' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', country: 'South Africa', flag: '🇿🇦' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', country: 'Indonesia', flag: '🇮🇩' },
    { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', country: 'Pakistan', flag: '🇵🇰' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', country: 'India', flag: '🇮🇳' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', country: 'Brazil', flag: '🇧🇷' },
    { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', country: 'Egypt', flag: '🇪🇬' },
    { code: 'GBP', name: 'British Pound', symbol: '£', country: 'UK', flag: '🇬🇧' },
    { code: 'EUR', name: 'Euro', symbol: '€', country: 'Europe', flag: '🇪🇺' },
    { code: 'USD', name: 'US Dollar', symbol: '$', country: 'United States', flag: '🇺🇸' },
  ];
}

interface CachePayload {
  rates: Record<string, number>;
  fetchedAt: number;
}

/**
 * Fetches exchange rates from CoinGecko, with a 10-minute caching rule in Redis.
 * If CoinGecko fails or is rate-limited, the stale Redis cache is returned instead.
 */
export async function getExchangeRates(currencies: string[]): Promise<Record<string, number> | null> {
  if (currencies.length === 0) return {};

  const cleanCurrencies = Array.from(new Set(currencies.map(c => c.toUpperCase())));
  // Sort to make cache key stable
  const currenciesHash = [...cleanCurrencies].sort().join('_');
  const cacheKey = `exchange_rates:${currenciesHash}`;

  let cached: CachePayload | null = null;
  try {
    cached = await redis.get<CachePayload>(cacheKey);
  } catch (err) {
    console.error('[ExchangeRates] Redis cache read error:', err);
  }

  const cacheTtlMs = 10 * 60 * 1000; // 10 minutes
  const now = Date.now();

  // If cache is fresh, return it
  if (cached && (now - cached.fetchedAt < cacheTtlMs)) {
    return cached.rates;
  }

  // If stale or missing, retrieve from CoinGecko API
  try {
    const vsCurrencies = cleanCurrencies.map(c => c.toLowerCase()).join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=${vsCurrencies}`,
      {
        next: { revalidate: 0 }, // Ensure Next.js doesn't cache fetch request globally
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko returned HTTP error status ${response.status}`);
    }

    const data = await response.json();
    const usdCoinData = data['usd-coin'];
    if (!usdCoinData) {
      throw new Error('CoinGecko returned missing or invalid schema');
    }

    const rates: Record<string, number> = {};
    for (const [key, val] of Object.entries(usdCoinData)) {
      rates[key.toUpperCase()] = val as number;
    }

    // Fallback ensure USD is exactly 1 if requested
    if (cleanCurrencies.includes('USD')) {
      rates['USD'] = 1.0;
    }

    // Save in Redis (no absolute TTL, we manage invalidation manually to support stale fallback)
    try {
      await redis.set(cacheKey, { rates, fetchedAt: now });
    } catch (err) {
      console.error('[ExchangeRates] Redis cache write error:', err);
    }

    return rates;
  } catch (error) {
    console.error('[ExchangeRates] Error calling CoinGecko API:', error);

    // Fallback: If we have stale cache values, return them
    if (cached) {
      console.log('[ExchangeRates] Falling back to stale cached rates from Redis');
      return cached.rates;
    }

    // No cache and API failed
    return null;
  }
}

/**
 * Converted amount using rate multiplication, rounded to 2 decimal places.
 */
export function convertUsdc(amountUsdc: number, rate: number): number {
  return parseFloat((amountUsdc * rate).toFixed(2));
}

/**
 * Formats a currency amount into locale-aware symbols and spacing.
 */
export function formatLocalCurrency(amount: number, currencyCode: string): string {
  const code = currencyCode.toUpperCase();
  const currency = getSupportedCurrencies().find(c => c.code === code);
  const symbol = currency?.symbol || '';

  const numberFormat = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedNumber = numberFormat.format(amount);

  if (code === 'KES') {
    return `KSh ${formattedNumber}`;
  }
  if (code === 'BRL') {
    return `R$ ${formattedNumber}`;
  }
  if (code === 'GHS') {
    return `GH₵${formattedNumber}`;
  }

  return `${symbol}${formattedNumber}`;
}
