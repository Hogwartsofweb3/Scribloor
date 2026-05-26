import React from 'react';
import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';

export function VaultSection() {
  const sampleEntries = [
    {
      title: "The State of L2 Rollups 2026",
      author: "Blockspace Research",
      price: "5.00 USDC",
      category: "Research",
      readTime: "12 min read"
    },
    {
      title: "Consumer Crypto Adoption Metrics",
      author: "DataDive",
      price: "2.50 USDC",
      category: "Data",
      readTime: "8 min read"
    },
    {
      title: "Solana DeFi Composability Guide",
      author: "DeFi Architect",
      price: "10.00 USDC",
      category: "Guide",
      readTime: "15 min read"
    }
  ];

  return (
    <section id="vault" className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
              Introducing The Vault — the internet's research library
            </h2>
            <p className="text-xl text-slate-600">
              Publish deep research that earns forever. Readers pay once or subscribe for 5 USDC/month. You earn every time someone reads your work.
            </p>
          </div>
          <Link 
            href="/vault"
            className="inline-flex items-center space-x-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
          >
            <span>Explore The Vault</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {sampleEntries.map((entry, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                  {entry.category}
                </span>
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full flex items-center">
                  <Lock className="w-3 h-3 mr-1" />
                  {entry.price}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{entry.title}</h3>
              <div className="text-sm text-slate-500 mb-6">by {entry.author}</div>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                <span className="text-sm text-slate-400">{entry.readTime}</span>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Unlock article &rarr;</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
