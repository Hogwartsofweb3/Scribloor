'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  ArrowLeft,
  Clock,
  Shield,
  CheckCircle2,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ONRAMP_PROVIDERS, getOnrampProviders, type OnrampProvider } from '@/lib/onramp/providers';
import { getSupportedCurrencies, formatLocalCurrency } from '@/lib/currency/exchangeRates';

interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

const COUNTRIES: CountryOption[] = [
  { code: 'NG', name: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}' },
  { code: 'KE', name: 'Kenya', flag: '\u{1F1F0}\u{1F1EA}' },
  { code: 'GH', name: 'Ghana', flag: '\u{1F1EC}\u{1F1ED}' },
  { code: 'ZA', name: 'South Africa', flag: '\u{1F1FF}\u{1F1E6}' },
  { code: 'IN', name: 'India', flag: '\u{1F1EE}\u{1F1F3}' },
  { code: 'ID', name: 'Indonesia', flag: '\u{1F1EE}\u{1F1E9}' },
  { code: 'PK', name: 'Pakistan', flag: '\u{1F1F5}\u{1F1F0}' },
  { code: 'BR', name: 'Brazil', flag: '\u{1F1E7}\u{1F1F7}' },
  { code: 'EG', name: 'Egypt', flag: '\u{1F1EA}\u{1F1EC}' },
  { code: 'US', name: 'United States', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'GB', name: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}' },
];

// Step-by-step Nigeria guide for Yellow Card
const NIGERIA_STEPS = [
  {
    step: 1,
    title: 'Download the Yellow Card app',
    description: 'Available on iOS and Android. Create an account with your email and phone number.',
  },
  {
    step: 2,
    title: 'Complete KYC verification',
    description: 'Upload a valid government-issued ID (NIN slip, international passport, or driver\'s license). Verification takes 2\u201310 minutes.',
  },
  {
    step: 3,
    title: 'Select "Buy" and choose USDC',
    description: 'From the home screen, tap "Buy Crypto" and select USDC (USD Coin) from the token list.',
  },
  {
    step: 4,
    title: 'Enter the amount you want to buy',
    description: 'Enter the naira amount or USDC amount. Yellow Card will show you the exact exchange rate and fees.',
  },
  {
    step: 5,
    title: 'Pay via bank transfer',
    description: 'Select "Bank Transfer" as the payment method. Transfer the exact naira amount to the bank account shown. Payments are confirmed within 5\u201315 minutes.',
  },
  {
    step: 6,
    title: 'Receive USDC in your Yellow Card wallet',
    description: 'Once your payment is confirmed, the USDC will appear in your Yellow Card wallet.',
  },
  {
    step: 7,
    title: 'Send USDC to your Solana wallet',
    description: 'Tap "Send", enter your Solana wallet address (from Phantom, Solflare, or your Privy wallet), select the Solana network, and confirm. The USDC will arrive in under 30 seconds.',
  },
];

const FAQ_ITEMS = [
  {
    question: 'What is USDC?',
    answer: 'USDC is a digital dollar (stablecoin) that is always worth $1 USD. It runs on blockchain networks like Solana. You can use it to subscribe to publications on Solscribe.',
  },
  {
    question: 'Do I need a crypto wallet?',
    answer: 'Yes, but Solscribe creates one for you automatically when you sign up. You can also connect an external wallet like Phantom or Solflare.',
  },
  {
    question: 'How much does it cost to buy USDC?',
    answer: 'Most on-ramp providers charge 1\u20134% fees depending on the payment method. Bank transfers are usually cheapest. The exact rate is shown before you confirm.',
  },
  {
    question: 'How long does it take to receive USDC?',
    answer: 'Card payments are usually instant. Bank transfers take 5\u201330 minutes depending on your country and provider. Once USDC is in your Solana wallet, subscribing takes under 10 seconds.',
  },
  {
    question: 'Is it safe?',
    answer: 'Yes. USDC is issued by Circle, a regulated US financial company. The providers listed here are all licensed and regulated in their respective countries. Your Solana wallet uses end-to-end cryptographic security.',
  },
  {
    question: 'Can I cancel my subscription?',
    answer: 'Solscribe subscriptions do not auto-renew. You pay month-by-month and choose whether to renew. There are no hidden charges or recurring debits.',
  },
];

export default function BuyUsdcGuidePage() {
  const [selectedCountry, setSelectedCountry] = useState<string>('NG');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [ngnRate, setNgnRate] = useState<number | null>(null);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const selectedCountryObj = COUNTRIES.find((c) => c.code === selectedCountry) || COUNTRIES[0];
  const providers = useMemo(() => getOnrampProviders(selectedCountry), [selectedCountry]);

  // Fetch NGN exchange rate for cost estimator
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=ngn'
        );
        if (res.ok) {
          const data = await res.json();
          setNgnRate(data['usd-coin']?.ngn || null);
        }
      } catch {
        setNgnRate(null);
      }
    })();
  }, []);

  const costEstimates = useMemo(() => {
    if (!ngnRate) return [];
    return [5, 10, 20].map((usdc) => ({
      usdc,
      ngn: formatLocalCurrency(usdc * ngnRate, 'NGN'),
    }));
  }, [ngnRate]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A09]">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-8 pb-4">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Explore
        </Link>

        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-text-primary)] tracking-tight leading-tight">
          How to Get USDC
        </h1>
        <p className="text-base text-[var(--color-text-secondary)] mt-3 max-w-xl leading-relaxed">
          USDC is the digital dollar used to subscribe to publications on Solscribe. Here is how to buy it in your country.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-10">
        {/* Country Selector */}
        <section>
          <label className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)] mb-2 block">
            Select your country
          </label>
          <div className="relative select-none">
            <button
              onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
              className="flex items-center justify-between w-full sm:w-72 px-4 py-3 rounded-xl border border-[var(--color-border-strong)] bg-white dark:bg-[#111110] text-sm font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-brand-500)] transition shadow-sm"
              type="button"
            >
              <span className="flex items-center gap-2.5">
                <span className="text-lg">{selectedCountryObj.flag}</span>
                <span>{selectedCountryObj.name}</span>
              </span>
              <ChevronDown className={cn('w-4 h-4 text-[var(--color-text-muted)] transition-transform', countryDropdownOpen && 'rotate-180')} />
            </button>

            {countryDropdownOpen && (
              <div className="absolute z-50 mt-2 w-full sm:w-72 bg-white dark:bg-[#111110] border border-[var(--color-border)] rounded-xl shadow-2xl max-h-64 overflow-y-auto py-1">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setSelectedCountry(c.code); setCountryDropdownOpen(false); }}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-black/5 dark:hover:bg-white/5 transition',
                      c.code === selectedCountry && 'text-[var(--color-brand-500)] font-bold bg-[var(--color-brand-50)]/30 dark:bg-violet-950/10'
                    )}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Available Providers for Selected Country */}
        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">
            Buy USDC in {selectedCountryObj.name}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            These platforms allow you to purchase USDC using local payment methods.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {providers.map((provider) => (
              <a
                key={provider.id}
                href={provider.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-3 p-5 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-brand-500)]/40 bg-white dark:bg-[#111110] hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={provider.logo} alt={provider.name} className="w-10 h-10 rounded-xl shrink-0 object-contain" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-500)] transition">{provider.name}</span>
                      {provider.beginner_friendly && (
                        <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Best for beginners</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{provider.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {provider.paymentMethods.map((m) => (
                    <span key={m} className="text-[9px] text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)] px-2 py-1 rounded-md font-mono">{m}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {provider.estimatedTime}</span>
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Fees: {provider.fees}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Nigeria-Specific Detailed Guide */}
        {selectedCountry === 'NG' && (
          <section className="border border-amber-500/20 rounded-2xl bg-amber-500/[0.02] dark:bg-amber-950/10 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/10 text-amber-500 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                  Step-by-Step: Buy USDC with Yellow Card (Nigeria)
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  The easiest way for Nigerians to buy USDC with naira
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {NIGERIA_STEPS.map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-500 shrink-0 mt-0.5">
                    {s.step}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--color-text-primary)]">{s.title}</h4>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Naira Cost Estimator */}
            {costEstimates.length > 0 && (
              <div className="mt-8 pt-6 border-t border-amber-500/10">
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  How much naira do I need?
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">
                  Approximate costs at current exchange rates (excluding provider fees).
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {costEstimates.map((est) => (
                    <div key={est.usdc} className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-[var(--color-border)] text-center">
                      <span className="block text-lg font-bold text-[var(--color-brand-500)]">{est.usdc} USDC</span>
                      <span className="block text-xs text-[var(--color-text-muted)] mt-1 font-mono">{est.ngn}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* FAQ Section */}
        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[var(--color-brand-500)]" />
            Frequently Asked Questions
          </h2>

          <div className="flex flex-col gap-2">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="border border-[var(--color-border)] rounded-xl bg-white dark:bg-[#111110] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-[var(--color-text-primary)] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition"
                  type="button"
                >
                  <span>{item.question}</span>
                  <ChevronRight className={cn('w-4 h-4 text-[var(--color-text-muted)] transition-transform shrink-0 ml-3', expandedFaq === i && 'rotate-90')} />
                </button>
                {expandedFaq === i && (
                  <div className="px-5 pb-4 text-sm text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)] pt-3">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center py-8 border-t border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Ready to subscribe? Head back and unlock premium content.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white text-sm font-bold shadow-lg shadow-[var(--color-brand-500)]/10 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            Browse Publications
          </Link>
        </section>
      </div>
    </div>
  );
}
