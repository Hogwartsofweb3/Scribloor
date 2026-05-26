import React from 'react';
import * as LucideIcons from 'lucide-react';

export interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  highlight?: boolean;
}

export function FeatureCard({ icon, title, description, highlight }: FeatureCardProps) {
  // Map Tabler-like names to Lucide react names dynamically or statically
  // Assuming 'icon' is passed as a valid Lucide component name (e.g. 'Globe', 'Users')
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.CheckCircle;

  return (
    <div className={`bg-slate-50 rounded-2xl p-8 border ${highlight ? 'border-l-4 border-l-indigo-600 border-slate-100' : 'border-slate-100'}`}>
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
        <IconComponent className={`w-6 h-6 ${highlight ? 'text-indigo-600' : 'text-slate-700'}`} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
