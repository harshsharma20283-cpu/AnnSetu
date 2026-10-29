import React, { useMemo } from 'react';
import { X, Utensils, Sparkles, Clock, Flame, CheckCircle, ChefHat, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CookTodayModal({ isOpen, onClose, items, onMarkUsed }) {
  // Find expiring items
  const expiringItems = useMemo(() => {
    return items.filter((i) => i.daysLeft !== null && i.daysLeft <= 3);
  }, [items]);

  // Generate dynamic recipe suggestions based on current inventory
  const recipes = useMemo(() => {
    const itemNames = items.map((i) => (i.name || '').toLowerCase());
    const has = (name) => itemNames.some((it) => it.includes(name));

    const suggestions = [];

    // Rule 1: Paneer + Tomato or Onion
    if (has('paneer') || has('panir')) {
      suggestions.push({
        title: 'Quick Paneer Bhurji / Masala',
        time: '15 mins',
        difficulty: 'Easy',
        description: 'Rescue expiring paneer into a spicy scrambled dry sabzi or curry.',
        usedIngredients: items.filter((i) => ['paneer', 'tomato', 'tamatar', 'onion', 'pyaaz', 'green chilli', 'coriander'].some((k) => (i.name || '').toLowerCase().includes(k))),
        steps: [
          'Crumble or chop paneer into small cubes.',
          'Sauté chopped onions, green chillies, and tomatoes in a pan with cumin.',
          'Add turmeric, red chilli, and garam masala.',
          'Toss crumbled paneer for 3 minutes. Garnish with fresh dhaniya.',
        ],
      });
    }

    // Rule 2: Leftover cooked food / Rice / Bread
    if (has('bread') || has('pav') || has('cooked food') || has('rice')) {
      suggestions.push({
        title: 'Spiced Tawa Poha / Fried Rice or Bread Upma',
        time: '12 mins',
        difficulty: 'Super Fast',
        description: 'Transform day-old bread, cooked rice or leftovers into a wholesome hot snack.',
        usedIngredients: items.filter((i) => ['bread', 'cooked food', 'rice', 'onion', 'tomato', 'green peas'].some((k) => (i.name || '').toLowerCase().includes(k))),
        steps: [
          'Chop bread into cubes or separate leftover rice grains.',
          'Temper mustard seeds, curry leaves, and sliced onions in hot oil.',
          'Add a pinch of turmeric and salt, then toss the carbs until toasted and warm.',
          'Finish with a squeeze of fresh lemon juice.',
        ],
      });
    }

    // Rule 3: Spinach / Palak / Greens
    if (has('spinach') || has('palak') || has('coriander')) {
      suggestions.push({
        title: 'Desi Palak Saag / Green Veggie Toss',
        time: '18 mins',
        difficulty: 'Medium',
        description: 'Leafy greens spoil fastest! Cook them right away into a nutritious gravy or paratha filling.',
        usedIngredients: items.filter((i) => ['spinach', 'palak', 'potato', 'aloo', 'paneer', 'garlic', 'ginger'].some((k) => (i.name || '').toLowerCase().includes(k))),
        steps: [
          'Wash and roughly chop the spinach leaves.',
          'Heat ghee/oil, sauté minced garlic and green chillies until golden.',
          'Add spinach and cook until wilted (4-5 minutes).',
          'Blend or mash lightly with potatoes or paneer.',
        ],
      });
    }

    // Rule 4: Vegetable Mix Sabzi (Fallback for any veggies)
    suggestions.push({
      title: 'Pantry Rescue Mix-Veg Kadhai',
      time: '20 mins',
      difficulty: 'Easy',
      description: 'The ultimate zero-waste Indian dish: chop whichever vegetables are expiring and toss together.',
      usedIngredients: items.filter((i) => i.category === 'vegetable' || ['tomato', 'potato', 'onion', 'capsicum', 'cauliflower', 'carrot'].some((k) => (i.name || '').toLowerCase().includes(k))),
      steps: [
        'Dice all available veggies into equal sizes.',
        'Temper cumin seeds, ginger-garlic paste and onions in a kadhai.',
        'Add veggies in order of hardness (potatoes/carrots first, capsicum/tomatoes last).',
        'Cover and cook on low flame for 12 minutes with coriander powder and amchur.',
      ],
    });

    return suggestions.slice(0, 3);
  }, [items]);

  const handleCooked = (recipe) => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#10b981', '#34d399', '#f59e0b'],
    });

    if (onMarkUsed && recipe.usedIngredients && recipe.usedIngredients.length > 0) {
      recipe.usedIngredients.forEach((it) => {
        if (it.id) onMarkUsed(it.id);
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-emerald-950/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Rescue Kitchen: Cook Today</h2>
              <p className="text-xs text-slate-400">Zero-waste meal ideas using your expiring pantry ingredients</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Expiring Ingredients Summary Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs">
          <div className="font-bold text-amber-800 flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{expiringItems.length} Ingredients need attention soon</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {expiringItems.length > 0 ? (
              expiringItems.map((it) => (
                <span
                  key={it.id || it.name}
                  className="px-2.5 py-1 rounded-full bg-white text-slate-700 text-xs font-bold border border-amber-200 shadow-sm"
                >
                  {it.name} <span className="text-amber-600 font-extrabold">({it.daysLeft <= 0 ? 'Expired' : `${it.daysLeft}d left`})</span>
                </span>
              ))
            ) : (
              <span className="text-slate-500">Your pantry is currently fresh! No items expiring in the next 3 days.</span>
            )}
          </div>
        </div>

        {/* Recipe Cards List */}
        <div className="mt-6 space-y-4">
          {recipes.map((rec, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-300 transition-all shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🍲</span>
                  <h3 className="text-base font-black text-slate-800">{rec.title}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {rec.time}
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                    {rec.difficulty}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-3">{rec.description}</p>

              {/* Ingredients Chips */}
              {rec.usedIngredients && rec.usedIngredients.length > 0 && (
                <div className="mb-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Uses From Your Pantry:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.usedIngredients.map((ing, iIdx) => (
                      <span
                        key={iIdx}
                        className="text-[11px] bg-white border border-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded-full"
                      >
                        ✓ {ing.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recipe Steps */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/60 mb-4">
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
                  Quick Steps:
                </span>
                <ol className="text-xs text-slate-700 space-y-1 list-decimal list-inside font-medium">
                  {rec.steps.map((st, sIdx) => (
                    <li key={sIdx}>{st}</li>
                  ))}
                </ol>
              </div>

              {/* Cook Action */}
              <button
                onClick={() => handleCooked(rec)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition"
              >
                <Check className="w-4 h-4" />
                <span>I Cooked This! (Mark Ingredients Used)</span>
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
