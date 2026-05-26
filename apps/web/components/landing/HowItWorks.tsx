import React from 'react';
import { PenTool, Tags, Wallet } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      title: "Write",
      description: "Publish newsletters, deep research, and long-form content using our premium, distraction-free editor.",
      icon: <PenTool className="w-8 h-8 text-indigo-600" />
    },
    {
      title: "Set your price",
      description: "Choose what's free and what's paid. Price your subscriptions in USDC for global accessibility.",
      icon: <Tags className="w-8 h-8 text-indigo-600" />
    },
    {
      title: "Get paid",
      description: "Subscribers pay directly to your wallet. You receive the funds in seconds, not days.",
      icon: <Wallet className="w-8 h-8 text-indigo-600" />
    }
  ];

  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Publishing, simplified.
          </h2>
        </div>

        <div className="space-y-16 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16`}>
              <div className="w-full md:w-1/2 flex justify-center">
                <div className="w-24 h-24 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-inner relative">
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  {step.icon}
                </div>
              </div>
              
              <div className="w-full md:w-1/2 text-center md:text-left">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
