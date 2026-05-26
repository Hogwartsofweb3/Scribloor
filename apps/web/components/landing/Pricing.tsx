import React from 'react';
import { Check, Minus } from 'lucide-react';

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Honest pricing
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            No monthly fees. No hidden Stripe charges. We only make money when you do.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-4 border-b border-slate-200 w-1/4"></th>
                <th className="p-4 border-b-2 border-indigo-600 bg-indigo-50/50 rounded-t-xl text-center w-1/4">
                  <div className="text-xl font-bold text-indigo-900">Solscribe</div>
                </th>
                <th className="p-4 border-b border-slate-200 text-center text-slate-500 w-1/4">Substack</th>
                <th className="p-4 border-b border-slate-200 text-center text-slate-500 w-1/4">Beehiiv</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              <tr>
                <td className="p-4 border-b border-slate-100 font-medium text-slate-900">Platform fee</td>
                <td className="p-4 border-b border-indigo-100 bg-indigo-50/30 text-center font-bold text-indigo-700">4%</td>
                <td className="p-4 border-b border-slate-100 text-center">10% + Stripe</td>
                <td className="p-4 border-b border-slate-100 text-center">$49/mo+</td>
              </tr>
              <tr>
                <td className="p-4 border-b border-slate-100 font-medium text-slate-900">Payment method</td>
                <td className="p-4 border-b border-indigo-100 bg-indigo-50/30 text-center font-bold text-indigo-700">USDC (Global)</td>
                <td className="p-4 border-b border-slate-100 text-center">Credit Card</td>
                <td className="p-4 border-b border-slate-100 text-center">Credit Card</td>
              </tr>
              <tr>
                <td className="p-4 border-b border-slate-100 font-medium text-slate-900">Creator owns data</td>
                <td className="p-4 border-b border-indigo-100 bg-indigo-50/30 text-center"><Check className="w-5 h-5 mx-auto text-emerald-500" /></td>
                <td className="p-4 border-b border-slate-100 text-center text-slate-400">Partial</td>
                <td className="p-4 border-b border-slate-100 text-center"><Check className="w-5 h-5 mx-auto text-slate-400" /></td>
              </tr>
              <tr>
                <td className="p-4 border-b border-slate-100 font-medium text-slate-900">Instant settlement</td>
                <td className="p-4 border-b border-indigo-100 bg-indigo-50/30 text-center"><Check className="w-5 h-5 mx-auto text-emerald-500" /></td>
                <td className="p-4 border-b border-slate-100 text-center text-slate-400">7-day hold</td>
                <td className="p-4 border-b border-slate-100 text-center text-slate-400">7-day hold</td>
              </tr>
              <tr>
                <td className="p-4 border-b border-slate-100 font-medium text-slate-900">Research library</td>
                <td className="p-4 border-b border-indigo-100 bg-indigo-50/30 text-center"><Check className="w-5 h-5 mx-auto text-emerald-500" /></td>
                <td className="p-4 border-b border-slate-100 text-center"><Minus className="w-5 h-5 mx-auto text-slate-300" /></td>
                <td className="p-4 border-b border-slate-100 text-center"><Minus className="w-5 h-5 mx-auto text-slate-300" /></td>
              </tr>
              <tr>
                <td className="p-4 border-b border-slate-100 font-medium text-slate-900">Mobile app</td>
                <td className="p-4 border-b border-indigo-100 bg-indigo-50/30 text-center rounded-b-xl"><Check className="w-5 h-5 mx-auto text-emerald-500" /></td>
                <td className="p-4 border-b border-slate-100 text-center"><Check className="w-5 h-5 mx-auto text-slate-400" /></td>
                <td className="p-4 border-b border-slate-100 text-center"><Minus className="w-5 h-5 mx-auto text-slate-300" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
