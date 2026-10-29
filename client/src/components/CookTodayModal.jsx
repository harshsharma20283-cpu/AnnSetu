import React, { useState, useMemo, useEffect } from 'react';
import { X, Utensils, Sparkles, Clock, Flame, CheckCircle, ChefHat, Check, RefreshCw, Bot } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getSmartRecipes } from '../utils/recipeEngine';
import { generateAiRecipes } from '../api';

export default function CookTodayModal({ isOpen, onClose, items = [], onMarkUsed }) {
  const [customAiRecipes, setCustomAiRecipes] = useState(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Find expiring items
  const expiringItems = useMemo(() => {
    return items.filter((i) => i.daysLeft !== null && i.daysLeft <= 3);
  }, [items]);

  // Compute smart base recipes from current pantry items (0ms latency, always matching)
  const defaultSmartRecipes = useMemo(() => {
    return getSmartRecipes(items, 4);
  }, [items]);

  // Active recipes displayed to user
  const activeRecipes = customAiRecipes && customAiRecipes.length > 0 
    ? customAiRecipes 
    : defaultSmartRecipes;

  // Reset custom AI state when modal reopens with different items
  useEffect(() => {
    if (isOpen) {
      setAiError(null);
    }
  }, [isOpen, items]);

  const handleGenerateAi = async () => {
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      const data = await generateAiRecipes({
        items,
        expiringItems,
        dietPreference: 'all',
      });
      if (data && data.recipes && data.recipes.length > 0) {
        setCustomAiRecipes(data.recipes);
      } else {
        setAiError('No custom recipes returned, using smart kitchen engine.');
      }
    } catch (err) {
      console.warn('AI recipe generation error, relying on smart culinary engine:', err.message);
      // Even if AI fails, fallback immediately to newly varied smart recipes
      setCustomAiRecipes(defaultSmartRecipes);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCooked = (recipe) => {
    confetti({
      particleCount: 55,
      spread: 75,
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Cook Today</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-400">Zero-waste dishes tailored to your exact fridge ingredients</p>
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
          <div className="font-bold text-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{expiringItems.length > 0 ? `${expiringItems.length} Ingredients need attention soon` : 'Pantry Status'}</span>
            </div>
            <span className="text-[11px] text-amber-700 font-semibold">
              Total items: {items.length}
            </span>
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
            ) : items.length > 0 ? (
              items.slice(0, 5).map((it) => (
                <span
                  key={it.id || it.name}
                  className="px-2.5 py-1 rounded-full bg-white text-slate-700 text-xs font-medium border border-amber-200/60 shadow-sm"
                >
                  {it.name}
                </span>
              ))
            ) : (
              <span className="text-slate-500">Your pantry is currently empty! Add items to get instant recipe magic.</span>
            )}
          </div>
        </div>

        {/* AI Generator CTA Bar */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-slate-700">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Want creative new dishes?</p>
              <p className="text-[11px] text-slate-500">Let AI craft unique zero-waste combinations from your pantry.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {customAiRecipes && (
              <button
                onClick={() => setCustomAiRecipes(null)}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition"
              >
                Reset
              </button>
            )}
            <button
              onClick={handleGenerateAi}
              disabled={isGeneratingAi || items.length === 0}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>AI Chef is Cooking...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{customAiRecipes ? 'Regenerate with AI' : 'Generate with AI'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recipe Cards List */}
        <div className="mt-6 space-y-4">
          {activeRecipes.map((rec, idx) => (
            <div
              key={rec.id || idx}
              className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 hover:border-emerald-300 transition-all shadow-sm group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍲</span>
                  <div>
                    <h3 className="text-base font-black text-slate-800 group-hover:text-emerald-900 transition">{rec.title}</h3>
                    {rec.tag && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {rec.tag}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 font-bold text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {rec.time}
                  </span>
                  <span className="font-bold text-teal-800 bg-teal-100/80 px-2.5 py-1 rounded-full">
                    {rec.difficulty}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-3">{rec.description}</p>

              {/* Ingredients Chips */}
              {rec.usedIngredients && rec.usedIngredients.length > 0 && (
                <div className="mb-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Uses From Your Pantry:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.usedIngredients.map((ing, iIdx) => (
                      <span
                        key={iIdx}
                        className="text-[11px] bg-white border border-emerald-300 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full shadow-2xs flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>{ing.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recipe Steps */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 mb-4 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">
                  Quick Steps:
                </span>
                <ol className="text-xs text-slate-700 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                  {rec.steps && rec.steps.map((st, sIdx) => (
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
