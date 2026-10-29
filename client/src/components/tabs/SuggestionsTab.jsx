import React from 'react';
import { Sparkles, Utensils, CheckCircle2, ShoppingCart, Leaf, Clock, ArrowRight } from 'lucide-react';

export default function SuggestionsTab({ items, onOpenCook, onOpenAdd }) {
  const expiringSoon = items.filter((i) => i.daysLeft !== null && i.daysLeft <= 3);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          Smart Suggestions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Healthy choices, zero food waste
        </p>
      </div>

      {/* Mint Banner (Matching Mockup exactly) */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 p-6 rounded-3xl border border-emerald-500/20 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {expiringSoon.length > 0
                ? `${expiringSoon.length} Ingredients need attention today!`
                : "You're all set! Pantry is fresh"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {expiringSoon.length > 0
                ? 'Cook them today using the zero-waste rescue ideas below.'
                : 'No critical expirations detected in the next 48 hours.'}
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-3xl">🍃</div>
      </div>

      {/* "Based on your fridge" Cards (Matching Mockup) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Based on your fridge</h2>
          <span className="text-xs font-semibold text-emerald-600">Personalized</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Recipe Suggestion */}
          <div className="bg-white p-6 rounded-3xl border border-emerald-950/5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl mb-4 shadow-inner">
                🍲
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mb-1">
                Zero-Waste Recipe
              </span>
              <h4 className="text-base font-bold text-slate-800">
                Quick Desi Stir-Fry
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Uses: Tomatoes, Onions, Paneer, or whatever veggies are in your fridge.
              </p>
            </div>
            <button
              onClick={onOpenCook}
              className="mt-5 w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>View Recipe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Restock Milk */}
          <div className="bg-white p-6 rounded-3xl border border-emerald-950/5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 flex items-center justify-center text-3xl mb-4 shadow-inner">
                🥛
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full inline-block mb-1">
                Restock Alert
              </span>
              <h4 className="text-base font-bold text-slate-800">
                Fresh Milk Running Low
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Daily Indian kitchens consume milk in 3 days. Consider adding a fresh pack.
              </p>
            </div>
            <button
              onClick={onOpenAdd}
              className="mt-5 w-full py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>+ Add to Fridge</span>
            </button>
          </div>

          {/* Card 3: Whole Grains */}
          <div className="bg-white p-6 rounded-3xl border border-emerald-950/5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-3xl mb-4 shadow-inner">
                🌾
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full inline-block mb-1">
                Pantry Staples
              </span>
              <h4 className="text-base font-bold text-slate-800">
                Atta & Lentils (Dal)
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Grains have 6+ months shelf life. Keep airtight at room temperature.
              </p>
            </div>
            <button
              onClick={onOpenAdd}
              className="mt-5 w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>+ Add to Pantry</span>
            </button>
          </div>

        </div>
      </div>

      {/* Quick Storage Tips (Matching Mockup) */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-950/5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Quick Kitchen Storage Hacks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <span className="text-2xl">🍅</span>
            <div>
              <h5 className="text-xs font-bold text-slate-800">Tomatoes</h5>
              <p className="text-[11px] text-slate-400">Keep at room temp for best flavor</p>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <span className="text-2xl">🥛</span>
            <div>
              <h5 className="text-xs font-bold text-slate-800">Milk & Curd</h5>
              <p className="text-[11px] text-slate-400">Store in coldest back shelf</p>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <span className="text-2xl">🌿</span>
            <div>
              <h5 className="text-xs font-bold text-slate-800">Fresh Dhaniya</h5>
              <p className="text-[11px] text-slate-400">Wrap in paper towel in fridge</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
