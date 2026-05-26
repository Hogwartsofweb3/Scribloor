'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Star, Target } from 'lucide-react';
import type { CreatorMilestone } from '@solscribe/db';

interface NextMilestone {
  type: string;
  label: string;
  currentValue: number;
  targetValue: number;
  percentComplete: number;
}

interface MilestonesData {
  achieved: CreatorMilestone[];
  next: NextMilestone[];
}

export function MilestoneCard() {
  const [data, setData] = useState<MilestonesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/milestones')
      .then(res => res.json())
      .then((d: MilestonesData) => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6 bg-white rounded-2xl border border-slate-200 animate-pulse h-64"></div>;
  if (!data) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
        <Target className="w-5 h-5 text-indigo-600 mr-2" />
        Your Goals
      </h2>

      {/* Progress towards next milestones */}
      <div className="space-y-6 mb-8">
        {data.next.map(milestone => (
          <div key={milestone.type}>
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="font-medium text-slate-700">{milestone.label}</span>
              <span className="text-slate-500 font-mono">
                {milestone.currentValue.toLocaleString()} / {milestone.targetValue.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${milestone.percentComplete}%` }}
              ></div>
            </div>
            {milestone.percentComplete > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                You're {Math.round(milestone.targetValue - milestone.currentValue).toLocaleString()} away from the goal!
              </p>
            )}
          </div>
        ))}
        {data.next.length === 0 && (
          <div className="text-sm text-slate-500 italic">You've hit all current goals!</div>
        )}
      </div>

      {/* Trophy Shelf (Achieved) */}
      {data.achieved.length > 0 && (
        <div className="pt-6 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-500 mr-2" />
            Trophy Shelf
          </h3>
          <div className="flex flex-wrap gap-3">
            {data.achieved.map(m => (
              <div 
                key={m.id} 
                className="w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center relative group"
                title={m.milestoneType.replace(/_/g, ' ')}
              >
                <Star className="w-6 h-6 text-amber-500" />
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg z-10">
                  {m.milestoneType.replace(/_/g, ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
