import React from 'react';

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah J.",
      publication: "Macro Insights",
      quote: "I made my first USDC payment in 4 minutes. My readers in Nigeria could finally subscribe without their cards being blocked.",
      stat: "$4,200 MRR",
      avatar: "SJ"
    },
    {
      name: "David Chen",
      publication: "Tech Frontiers",
      quote: "Leaving Substack's 10% fee means I can actually afford health insurance this year. The math just makes sense.",
      stat: "+$12k Annual Savings",
      avatar: "DC"
    },
    {
      name: "Elena R.",
      publication: "The Daily Crypto",
      quote: "I didn't have to explain wallets to my non-technical audience. They just sign in with email and read. It's magic.",
      stat: "450 Subscribers",
      avatar: "ER"
    }
  ];

  return (
    <section className="py-24 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <h2 className="text-center text-3xl font-bold mb-16">Creators who made the switch</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700/50 flex flex-col h-full">
              <div className="text-indigo-400 text-4xl font-serif mb-4">"</div>
              <p className="text-lg text-slate-300 leading-relaxed mb-8 flex-grow">
                {t.quote}
              </p>
              <div className="flex items-center mt-auto">
                <div className="w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center font-bold text-indigo-200 mr-4">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-bold">{t.name}</div>
                  <div className="text-sm text-slate-400">{t.publication}</div>
                </div>
                <div className="ml-auto text-right">
                  <span className="inline-block bg-slate-800 text-emerald-400 text-xs font-bold px-2 py-1 rounded">
                    {t.stat}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
