import React, { useMemo } from 'react';
import { Sparkles, Utensils, CheckCircle2, ShoppingCart, Leaf, Clock, ArrowRight, Bot, ChefHat } from 'lucide-react';
import { getSmartRecipes } from '../../utils/recipeEngine';

export default function SuggestionsTab({ items = [], onOpenCook, onOpenAdd, onOpenAiChef }) {
  const expiringSoon = items.filter((i) => i.daysLeft !== null && i.daysLeft <= 3);

  // Dynamic top recipe based on actual user fridge items
  const smartRecipes = useMemo(() => {
    return getSmartRecipes(items, 3);
  }, [items]);

  const topRecipe = smartRecipes[0] || {
    title: 'Zero-Waste Kitchen Toss',
    time: '15 mins',
    tag: 'Quick Meal',
    description: 'Toss available veggies or dairy with aromatic Indian spices.',
    usedIngredients: items.slice(0, 3)
  };

  // Check staples in inventory
  const hasMilk = items.some(i => (i.name || '').toLowerCase().includes('milk') || (i.name || '').toLowerCase().includes('doodh'));
  const hasGrains = items.some(i => ['atta', 'rice', 'dal', 'flour', 'wheat'].some(k => (i.name || '').toLowerCase().includes(k)));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Smart Suggestions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dynamic culinary recommendations tailored to your fridge & pantry
          </p>
        </div>

        {/* AI Chef Quick Trigger Button */}
        {onOpenAiChef && (
          <button
            onClick={onOpenAiChef}
            className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition"
          >
            <Bot className="w-4 h-4 text-emerald-200" />
            <span>Chat with AI Chef</span>
          </button>
        )}
      </div>

      {/* Mint Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 p-6 rounded-3xl border border-emerald-500/20 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {expiringSoon.length > 0
                ? `${expiringSoon.length} Ingredients need attention today!`
                : items.length > 0
                ? "You're all set! Pantry is fresh & monitored"
                : "Welcome to AnnSetu Smart Suggestions"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {expiringSoon.length > 0
                ? 'Cook them today using our zero-waste smart recipe engine.'
                : items.length > 0
                ? 'We dynamically match delicious recipes to your inventory.'
                : 'Add grocery items to unlock personalized zero-waste recipe magic.'}
            </p>
          </div>
        </div>
        <div className="hidden sm:block text-3xl">🍃</div>
      </div>

      {/* "Based on your fridge" Dynamic Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">Based on your fridge</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live Matched
            </span>
          </div>
          <span className="text-xs font-semibold text-emerald-600">Personalized</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Dynamic Recipe Suggestion matching user items */}
          <div className="bg-white p-6 rounded-3xl border border-emerald-950/5 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
            <div>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl mb-4 shadow-inner group-hover:scale-105 transition-transform">
                🍳
              </div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">
                  {topRecipe.tag || 'Zero-Waste Recipe'}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {topRecipe.time}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition">
                {topRecipe.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                Uses: {topRecipe.usedIngredients && topRecipe.usedIngredients.length > 0 
                  ? topRecipe.usedIngredients.map(i => i.name).join(', ')
                  : 'Your pantry staples'}
              </p>
            </div>
            <button
              onClick={onOpenCook}
              className="mt-5 w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>View Recipe & Cook</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Restock / Dairy Alert */}
          <div className="bg-white p-6 rounded-3xl border border-emerald-950/5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-50 flex items-center justify-center text-3xl mb-4 shadow-inner">
                🥛
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full inline-block mb-1">
                {hasMilk ? 'Dairy Alert' : 'Restock Suggestion'}
              </span>
              <h4 className="text-base font-bold text-slate-800">
                {hasMilk ? 'Milk & Dairy Active' : 'Fresh Milk Running Low'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {hasMilk 
                  ? 'Dairy items spoil rapidly. Keep on the coldest middle shelf.'
                  : 'Daily Indian kitchens consume milk in 3 days. Consider adding a fresh pack.'}
              </p>
            </div>
            <button
              onClick={onOpenAdd}
              className="mt-5 w-full py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>+ Add to Fridge</span>
            </button>
          </div>

          {/* Card 3: Whole Grains / Staples */}
          <div className="bg-white p-6 rounded-3xl border border-emerald-950/5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-3xl mb-4 shadow-inner">
                🌾
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full inline-block mb-1">
                Pantry Staples
              </span>
              <h4 className="text-base font-bold text-slate-800">
                {hasGrains ? 'Atta & Lentils In Stock' : 'Atta & Lentils (Dal)'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Whole grains have 6+ months shelf life. Store in airtight containers away from humidity.
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

      {/* Quick Storage Tips */}
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
