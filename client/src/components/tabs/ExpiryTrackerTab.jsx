import React, { useState } from 'react';
import { Clock, AlertTriangle, ShieldCheck, Check, Sparkles, ChevronRight, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ExpiryTrackerTab({ items, onMarkUsed, onMarkWasted }) {
  const [filter, setFilter] = useState('all'); // all, soon, expired

  const expired = items.filter((i) => i.daysLeft !== null && i.daysLeft <= 0);
  const expiringSoon = items.filter((i) => i.daysLeft !== null && i.daysLeft > 0 && i.daysLeft <= 3);

  const filtered = items.filter((it) => {
    if (filter === 'soon') return it.daysLeft !== null && it.daysLeft > 0 && it.daysLeft <= 3;
    if (filter === 'expired') return it.daysLeft !== null && it.daysLeft <= 0;
    return true;
  });

  const getEmoji = (name, cat) => {
    const text = (name + ' ' + (cat || '')).toLowerCase();
    if (text.includes('milk')) return '🥛';
    if (text.includes('paneer') || text.includes('cheese')) return '🧀';
    if (text.includes('tomato')) return '🍅';
    if (text.includes('spinach')) return '🥬';
    if (text.includes('egg')) return '🥚';
    if (text.includes('apple')) return '🍎';
    if (text.includes('banana')) return '🍌';
    if (text.includes('bread')) return '🍞';
    return '🥗';
  };

  const handleUsed = (id) => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#34d399', '#6ee7b7'],
    });
    onMarkUsed(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          Expiry Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          See what's expiring and when
        </p>
      </div>

      {/* Filter Tabs (Matching Mockup) */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'soon', label: 'Expiring Soon' },
          { id: 'expired', label: 'Expired' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              filter === tab.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid: List on Left, Tips & Circular Gauge on Right (Matching Mockup) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left List of Expiring Items */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const isExpired = item.daysLeft !== null && item.daysLeft <= 0;
              const isSoon = item.daysLeft !== null && item.daysLeft > 0 && item.daysLeft <= 3;

              return (
                <div
                  key={item.id}
                  className="bg-white p-4 sm:p-5 rounded-3xl border border-emerald-950/5 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition">
                      {getEmoji(item.name, item.category)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 capitalize truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-400 capitalize truncate">
                        {item.location || 'Fridge'} • {item.category || 'Kitchen'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                        isExpired
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : isSoon
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {item.daysLeft === null
                        ? 'No Date'
                        : isExpired
                        ? 'Expires Today'
                        : item.daysLeft === 1
                        ? 'Expires in 1 day'
                        : `Expires in ${item.daysLeft} days`}
                    </span>

                    <button
                      onClick={() => handleUsed(item.id)}
                      className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                      title="Mark as Used"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white p-10 rounded-3xl border border-slate-100 text-center text-slate-400 text-xs">
              No items matching this filter.
            </div>
          )}
        </div>

        {/* Right Info & Tips Card (Matching Mockup exactly) */}
        <div className="space-y-6">
          
          {/* Circular Indicator Card */}
          <div className="bg-white p-6 rounded-3xl border border-emerald-950/5 shadow-sm text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 border-4 border-emerald-200 flex flex-col items-center justify-center mb-3">
              <span className="text-2xl font-black text-emerald-700">{expiringSoon.length}</span>
              <span className="text-[9px] font-bold text-emerald-600 uppercase">Items</span>
            </div>
            <h4 className="text-sm font-bold text-slate-800">Items Expiring Soon</h4>
            <p className="text-xs text-slate-400 mt-1">Cook or consume within the next 72 hours</p>
          </div>

          {/* Kitchen Tips Card (Matching Mockup) */}
          <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/70 p-6 rounded-3xl border border-emerald-100 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-3">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Smart Tips</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">1.</span>
                <span>Use items with earlier expiry dates first (FIFO principle).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">2.</span>
                <span>Keep milk in the coldest back shelf, never in door racks.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">3.</span>
                <span>Check your fridge weekly to prevent forgotten groceries.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
