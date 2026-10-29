import React, { useMemo } from 'react';
import { X, Utensils, Sparkles, Clock, Flame, CheckCircle } from 'lucide-react';

export default function CookTodayModal({ isOpen, onClose, items }) {
  // Find expiring items
  const expiringItems = useMemo(() => {
    return items.filter((i) => i.daysLeft !== null && i.daysLeft <= 3);
  }, [items]);

  // Generate dynamic recipe suggestions based on current inventory
  const recipes = useMemo(() => {
    const itemNames = items.map((i) => i.name.toLowerCase());
    const has = (name) => itemNames.some((it) => it.includes(name));

    const suggestions = [];

    // Rule 1: Paneer + Tomato or Onion
    if (has('paneer') || has('panir')) {
      suggestions.push({
        title: 'Quick Paneer Bhurji / Masala',
        time: '15 mins',
        difficulty: 'Easy',
        description: 'Rescue expiring paneer into a spicy scrambled dry sabzi or curry.',
        usedIngredients: items.filter((i) => ['paneer', 'tomato', 'tamatar', 'onion', 'pyaaz', 'green chilli', 'coriander'].some((k) => i.name.toLowerCase().includes(k))),
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
        usedIngredients: items.filter((i) => ['bread', 'cooked food', 'rice', 'onion', 'tomato', 'green peas'].some((k) => i.name.toLowerCase().includes(k))),
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
        usedIngredients: items.filter((i) => ['spinach', 'palak', 'potato', 'aloo', 'paneer', 'garlic', 'ginger'].some((k) => i.name.toLowerCase().includes(k))),
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
      usedIngredients: items.filter((i) => i.category === 'vegetable' || ['tomato', 'potato', 'onion', 'capsicum', 'cauliflower', 'carrot'].some((k) => i.name.toLowerCase().includes(k))),
      steps: [
        'Dice all available veggies into equal sizes.',
        'Temper cumin seeds, ginger-garlic paste and onions in a kadhai.',
        'Add veggies in order of hardness (potatoes/carrots first, capsicum/tomatoes last).',
        'Cover and cook on low flame for 12 minutes with coriander powder and amchur.',
      ],
    });

    return suggestions.slice(0, 3);
  }, [items]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Rescue Kitchen: What to Cook Today</h2>
              <p className="text-xs text-slate-400">Zero-waste recipe ideas built from your expiring inventory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Expiring Ingredients Summary Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
          <div className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>{expiringItems.length} Ingredients need attention soon</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {expiringItems.length > 0 ? (
              expiringItems.map((it) => (
                <span
                  key={it.id}
                  className="bg-amber-500/20 text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded-lg text-[11px] font-medium capitalize"
                >
                  {it.name} ({it.daysLeft <= 0 ? 'Expires Today' : `${it.daysLeft}d left`})
                </span>
              ))
            ) : (
              <span className="text-slate-400">All pantry items have safe shelf-life right now! Here are delicious ideas using current stock:</span>
            )}
          </div>
        </div>

        {/* Recipe Cards */}
        <div className="mt-6 space-y-4">
          {recipes.map((rec, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{rec.title}</span>
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">{rec.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-slate-800 px-2.5 py-1 rounded-full">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {rec.time}
                  </span>
                </div>
              </div>

              {/* Ingredients matching */}
              {rec.usedIngredients.length > 0 && (
                <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px]">
                  <span className="text-slate-500">Rescues:</span>
                  {rec.usedIngredients.map((ing) => (
                    <span key={ing.id} className="text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded capitalize">
                      ✓ {ing.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Steps */}
              <div className="mt-4 pt-3 border-t border-slate-900">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Quick Steps:
                </span>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300">
                  {rec.steps.map((st, sIdx) => (
                    <li key={sIdx} className="leading-relaxed">{st}</li>
                  ))}
                </ol>
              </div>

            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
