import React from 'react';
import { AlertCircle, Clock, CheckCircle2, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

export default function DashboardStats({ items, usedItems = [], onFilterSelect, activeFilter }) {
  const expired = items.filter((i) => i.daysLeft !== null && i.daysLeft <= 0);
  const expiringSoon = items.filter((i) => i.daysLeft !== null && i.daysLeft > 0 && i.daysLeft <= 3);
  const fresh = items.filter((i) => i.daysLeft === null || i.daysLeft > 3);

  const totalSavedPrice = usedItems.reduce((acc, it) => acc + (Number(it.price) || 45), 0);

  const stats = [
    {
      id: 'all',
      title: 'Total Tracked',
      count: items.length,
      icon: ShieldCheck,
      color: 'text-emerald-400',
      accentGlow: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/30',
      tagText: 'Active Groceries',
      tagBg: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      id: 'expired',
      title: 'Action Required',
      count: expired.length,
      icon: AlertCircle,
      color: 'text-rose-400',
      accentGlow: 'from-rose-500/15 via-rose-500/5 to-transparent',
      borderColor: 'border-rose-500/30',
      tagText: 'Expired / Today',
      tagBg: 'bg-rose-500/20 text-rose-300',
    },
    {
      id: 'expiring',
      title: 'Expiring Soon',
      count: expiringSoon.length,
      icon: Clock,
      color: 'text-amber-400',
      accentGlow: 'from-amber-500/15 via-amber-500/5 to-transparent',
      borderColor: 'border-amber-500/30',
      tagText: 'Within 3 Days',
      tagBg: 'bg-amber-500/20 text-amber-300',
    },
    {
      id: 'used',
      title: 'Food Rescued',
      count: usedItems.length,
      icon: CheckCircle2,
      color: 'text-cyan-400',
      accentGlow: 'from-cyan-500/15 via-cyan-500/5 to-transparent',
      borderColor: 'border-cyan-500/30',
      tagText: `₹${totalSavedPrice} Value Saved`,
      tagBg: 'bg-cyan-500/20 text-cyan-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
      {stats.map((s) => {
        const Icon = s.icon;
        const isSelected = activeFilter === s.id;
        return (
          <div
            key={s.id}
            onClick={() => onFilterSelect(s.id)}
            className={`relative group cursor-pointer overflow-hidden p-6 rounded-3xl border bg-gradient-to-b bg-slate-900/60 backdrop-blur-xl transition-all duration-300 shadow-xl ${
              s.borderColor
            } ${
              isSelected
                ? 'ring-2 ring-emerald-400 ring-offset-4 ring-offset-slate-950 scale-[1.02]'
                : 'hover:scale-[1.02] hover:bg-slate-900/80'
            }`}
          >
            {/* Ambient Corner Glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${s.accentGlow} rounded-full blur-2xl pointer-events-none`} />

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  {s.title}
                </span>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {s.count}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-center ${s.color} shadow-lg`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>

            <div className="relative z-10 mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className={`px-2.5 py-1 rounded-full font-semibold ${s.tagBg}`}>
                {s.tagText}
              </span>
              <span className="text-slate-400 group-hover:text-slate-200 transition">
                Filter list →
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
