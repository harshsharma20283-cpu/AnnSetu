import React from 'react';
import { Calendar, Trash2, Check, X, Sparkles, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ItemCard({ item, onMarkUsed, onMarkWasted, onDelete }) {
  const { id, name, category, location, expiry_date, daysLeft, color, expiry_source, price } = item;

  const handleUsedClick = (e) => {
    e.stopPropagation();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#34d399', '#6ee7b7', '#f59e0b'],
    });
    onMarkUsed(id);
  };

  // Category Emoji
  const getCategoryEmoji = (cat) => {
    const c = String(cat || '').toLowerCase();
    if (c.includes('dairy') || c.includes('milk')) return '🥛';
    if (c.includes('veg') || c.includes('sabzi')) return '🥦';
    if (c.includes('fruit')) return '🍎';
    if (c.includes('bakery') || c.includes('bread')) return '🍞';
    if (c.includes('grain') || c.includes('atta') || c.includes('rice')) return '🌾';
    if (c.includes('leftover') || c.includes('cooked')) return '🍛';
    if (c.includes('meat') || c.includes('chicken')) return '🍗';
    return '🛒';
  };

  const locationLabels = {
    fridge: '❄️ Fridge',
    room: '🏠 Room/Pantry',
    freezer: '🧊 Freezer',
  };

  // Freshness bar percentage (assumes up to 14 days max for full bar)
  const safeDays = Math.max(0, daysLeft || 0);
  const freshnessPercent = Math.min(100, Math.round((safeDays / 10) * 100));

  const statusConfig = {
    red: {
      border: 'border-rose-500/40 hover:border-rose-500/70',
      glow: 'from-rose-500/10 to-transparent',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      barColor: 'bg-rose-500',
      text: daysLeft < 0 ? `Expired ${Math.abs(daysLeft)}d ago` : 'Expires TODAY!',
    },
    yellow: {
      border: 'border-amber-500/40 hover:border-amber-500/70',
      glow: 'from-amber-500/10 to-transparent',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      barColor: 'bg-amber-400',
      text: daysLeft === 1 ? 'Expires Tomorrow' : `${daysLeft} days left`,
    },
    green: {
      border: 'border-emerald-500/30 hover:border-emerald-500/60',
      glow: 'from-emerald-500/10 to-transparent',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      barColor: 'bg-emerald-400',
      text: `${daysLeft} days fresh`,
    },
    grey: {
      border: 'border-slate-800 hover:border-slate-700',
      glow: 'from-slate-800/10 to-transparent',
      badge: 'bg-slate-800 text-slate-300 border-slate-700',
      barColor: 'bg-slate-600',
      text: 'No expiry date',
    },
  };

  const current = statusConfig[color] || statusConfig.grey;

  return (
    <div className={`relative group overflow-hidden rounded-3xl border bg-slate-900/70 backdrop-blur-md p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 ${current.border}`}>
      
      {/* Background Soft Glow */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${current.glow} rounded-full blur-2xl pointer-events-none`} />

      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-2 rounded-2xl bg-slate-950/80 border border-white/5 shadow-inner">
              {getCategoryEmoji(category)}
            </span>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {locationLabels[location] || location}
              </span>
              <h3 className="text-xl font-bold text-white capitalize tracking-tight group-hover:text-emerald-300 transition">
                {name}
              </h3>
            </div>
          </div>

          {/* Urgency Badge */}
          <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm whitespace-nowrap ${current.badge}`}>
            {current.text}
          </span>
        </div>

        {/* Freshness Meter */}
        {daysLeft !== null && (
          <div className="mt-4">
            <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
              <span>Freshness Meter</span>
              <span>{Math.max(0, daysLeft)} days</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${current.barColor}`}
                style={{ width: `${daysLeft <= 0 ? 100 : Math.max(10, freshnessPercent)}%` }}
              />
            </div>
          </div>
        )}

        {/* Metadata Details */}
        <div className="mt-4 space-y-2 text-xs text-slate-400 bg-slate-950/50 p-3 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Expiry Date:</span>
            </span>
            <span className="font-semibold text-slate-200">{expiry_date || 'Not set'}</span>
          </div>

          {price && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Grocery Value:</span>
              <span className="font-bold text-emerald-400">₹{price}</span>
            </div>
          )}

          {expiry_source === 'estimated' && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-300/90 font-medium pt-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Estimated shelf-life with 20% safe alert buffer</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Mark as Used / Rescued */}
          <button
            onClick={handleUsedClick}
            className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 px-3.5 py-2 rounded-xl transition active:scale-95 shadow-sm"
            title="Mark as consumed (Saved from waste)"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Used</span>
          </button>

          {/* Mark as Wasted */}
          <button
            onClick={() => onMarkWasted(id)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-2 rounded-xl transition active:scale-95"
            title="Mark as spoiled / discarded"
          >
            <X className="w-3.5 h-3.5 text-rose-400" />
            <span>Wasted</span>
          </button>
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(id)}
          className="text-slate-500 hover:text-rose-400 p-2 rounded-xl hover:bg-slate-800 transition"
          title="Delete item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
