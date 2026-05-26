import React from 'react';
import { FeatureCard } from './FeatureCard';

export function Features() {
  const features = [
    {
      icon: "Globe",
      title: "Instant global payments",
      description: "Get paid in USDC to any wallet, in 180+ countries. Zero cross-border fees, instant settlement.",
      highlight: true
    },
    {
      icon: "Users",
      title: "Own your subscribers",
      description: "Their wallet addresses and emails belong to you. Export your list anytime. No lock-in.",
      highlight: false
    },
    {
      icon: "Percent",
      title: "4% fee, not 10%",
      description: "We only take a flat 4% platform fee. You keep 96% of your revenue. No hidden Stripe fees.",
      highlight: true
    },
    {
      icon: "Library",
      title: "The Vault",
      description: "Publish deep research. Readers can pay per article or subscribe. You earn every time someone reads.",
      highlight: false
    },
    {
      icon: "ShieldCheck",
      title: "No payment friction",
      description: "No Stripe bans. No bank accounts needed. No chargebacks. True permissionless publishing.",
      highlight: false
    },
    {
      icon: "Mail",
      title: "Sign up with email",
      description: "Readers don't need crypto experience. We create invisible wallets for them using just their email.",
      highlight: false
    }
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Everything you need. Nothing you don't.
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Built from the ground up to maximize your revenue and protect your independence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <FeatureCard 
              key={i}
              icon={feat.icon}
              title={feat.title}
              description={feat.description}
              highlight={feat.highlight}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
