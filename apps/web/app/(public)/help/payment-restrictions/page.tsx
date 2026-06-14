import React from 'react';
import { Nav } from '@/components/landing/Nav';
import { Footer } from '@/components/landing/Footer';
import { Shield, Globe, AlertCircle, HelpCircle, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Payment Restrictions - Solscribe Help',
  description:
    'Learn why your payment may have been declined due to geographic restrictions or OFAC sanctions compliance.',
};

export default function PaymentRestrictionsPage() {
  const restrictedCountries = [
    { flag: '🇨🇺', name: 'Cuba' },
    { flag: '🇮🇷', name: 'Iran' },
    { flag: '🇰🇵', name: 'North Korea' },
    { flag: '🇸🇾', name: 'Syria' },
    { flag: '🇷🇺', name: 'Crimea (Ukraine)' },
    { flag: '🇷🇺', name: 'Donetsk Region (Ukraine)' },
    { flag: '🇷🇺', name: 'Luhansk Region (Ukraine)' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Nav />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-2xl mb-6">
              <Shield className="w-7 h-7 text-amber-600" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
              Payment <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-500">Restrictions</span>
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto">
              Why your payment may have been declined and what you can do about it.
            </p>
          </div>

          {/* Why Was My Payment Declined */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10 mb-8">
            <div className="flex gap-4 mb-6">
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 shrink-0 h-fit">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Why Was My Payment Declined?</h2>
                <p className="text-slate-600 leading-relaxed">
                  Solscribe is headquartered in the United States and is required by federal law to
                  comply with economic sanctions administered by the U.S. Office of Foreign Assets
                  Control (OFAC). As a result, we are legally prohibited from processing payments
                  to or from certain countries, territories, and individuals.
                </p>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed">
              If your payment was declined with a message mentioning &quot;geographic restrictions,&quot;
              &quot;sanctions,&quot; or &quot;OFAC,&quot; it means our compliance systems detected that the
              transaction may originate from a restricted region or involve a sanctioned party.
            </p>
          </div>

          {/* Restricted Countries */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10 mb-8">
            <div className="flex gap-4 mb-6">
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-100 shrink-0 h-fit">
                <Globe className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Currently Restricted Regions</h2>
                <p className="text-slate-500 text-sm">
                  Solscribe cannot process payments involving persons or entities based in the following
                  countries and territories subject to U.S. comprehensive economic sanctions:
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {restrictedCountries.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 border border-rose-100"
                >
                  <span className="text-xl">{c.flag}</span>
                  <span className="text-sm font-semibold text-rose-800">{c.name}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-5 leading-relaxed">
              This list is subject to change as OFAC updates sanctions programs. For the authoritative
              list, refer to the{' '}
              <a
                href="https://www.treasury.gov/resource-center/sanctions/Programs/Pages/Programs.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline inline-flex items-center gap-1"
              >
                OFAC Sanctions Programs page <ExternalLink className="w-3 h-3" />
              </a>.
            </p>
          </div>

          {/* SDN List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Specially Designated Nationals (SDN)</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              In addition to country-based restrictions, OFAC maintains a Specially Designated
              Nationals and Blocked Persons (SDN) List. Individuals and entities on this list are
              prohibited from using Solscribe regardless of their geographic location.
            </p>
            <a
              href="https://sanctionssearch.ofac.treas.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition"
            >
              Search the OFAC SDN List <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* What To Do */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10 mb-8">
            <div className="flex gap-4 mb-6">
              <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 shrink-0 h-fit">
                <HelpCircle className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">What Can I Do?</h2>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-1">If you believe this is an error</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  If you are not located in a restricted region and believe your payment was incorrectly
                  declined, please contact our support team with the error details and your wallet address.
                  VPN usage may sometimes trigger false positives — try disabling your VPN and retrying.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-1">If you are in a restricted region</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Unfortunately, we cannot process your payment while you are located in a sanctioned
                  territory. This restriction is mandated by U.S. law and cannot be waived at the
                  platform level. We apologize for any inconvenience.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-1">For creators: reader appeals</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  If one of your subscribers received this error, please direct them to this page.
                  You may also contact{' '}
                  <a href="mailto:legal@solscribe.app" className="text-indigo-600 hover:underline">
                    legal@solscribe.app
                  </a>{' '}
                  if you have questions about platform-level compliance obligations.
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100 p-8 text-center">
            <Mail className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900 mb-2">Still Need Help?</h2>
            <p className="text-slate-500 text-sm mb-4">
              Our team can help clarify whether your situation is covered and guide you through next steps.
            </p>
            <a
              href="mailto:legal@solscribe.app"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition text-sm"
            >
              <Mail className="w-4 h-4" />
              Contact legal@solscribe.app
            </a>
            <p className="mt-4 text-xs text-slate-400">
              You can also review our full{' '}
              <Link href="/terms#section-16-sanctions" className="text-indigo-500 hover:underline">
                Terms of Service — Section 16 (OFAC Sanctions)
              </Link>{' '}
              for the complete legal text.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
