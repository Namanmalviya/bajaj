import React from 'react';
import { Layers, PlayCircle, CheckCircle, Archive, AlertOctagon } from 'lucide-react';

export default function StatsStrip({ stats, loading }) {
  const { statusCounts = { open: 0, in_progress: 0, resolved: 0, closed: 0 }, breachedOpenCount = 0 } = stats || {};

  const statItems = [
    {
      label: 'Open',
      value: statusCounts.open,
      icon: <Layers className="w-5 h-5 text-slate-500" />,
      bg: 'bg-slate-50',
      border: 'border-slate-200/60',
      text: 'text-slate-700'
    },
    {
      label: 'In Progress',
      value: statusCounts.in_progress,
      icon: <PlayCircle className="w-5 h-5 text-sky-600" />,
      bg: 'bg-sky-50/40',
      border: 'border-sky-100',
      text: 'text-sky-700'
    },
    {
      label: 'Resolved',
      value: statusCounts.resolved,
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50/30',
      border: 'border-emerald-100',
      text: 'text-emerald-800'
    },
    {
      label: 'Closed',
      value: statusCounts.closed,
      icon: <Archive className="w-5 h-5 text-amber-900/60" />,
      bg: 'bg-stone-100/60',
      border: 'border-stone-200/50',
      text: 'text-stone-700'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
      {statItems.map((item, idx) => (
        <div
          key={idx}
          className={`flex items-center gap-3 p-4 rounded-xl border ${item.bg} ${item.border} transition-all duration-300 shadow-xs`}
        >
          <div className="p-2 rounded-lg bg-white shadow-2xs shrink-0">
            {item.icon}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">
              {item.label}
            </div>
            <div className={`text-xl font-bold font-display ${item.text}`}>
              {loading ? (
                <span className="inline-block w-8 h-6 bg-slate-200/60 animate-pulse rounded-md"></span>
              ) : (
                item.value
              )}
            </div>
          </div>
        </div>
      ))}

      {/* SLA Breach Highlight block */}
      <div
        className={`col-span-2 sm:col-span-1 flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 shadow-xs ${
          breachedOpenCount > 0
            ? 'bg-rose-50/50 border-rose-100 text-rose-900'
            : 'bg-stone-50 border-stone-200/60 text-slate-700'
        }`}
      >
        <div className={`p-2 rounded-lg bg-white shadow-2xs shrink-0`}>
          <AlertOctagon
            className={`w-5 h-5 ${
              breachedOpenCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-400'
            }`}
          />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">
            SLA Breached
          </div>
          <div className="text-xl font-bold font-display">
            {loading ? (
              <span className="inline-block w-8 h-6 bg-slate-200/60 animate-pulse rounded-md"></span>
            ) : (
              breachedOpenCount
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
