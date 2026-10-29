import React, { useState } from 'react';
import { Plus, Check, X, Trash2, Sparkles, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MyFridgeTab({ items, onMarkUsed, onMarkWasted, onDelete, onOpenAdd }) {
  const [selectedZone, setSelectedZone] = useState('all'); // all, fridge, room, freezer
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Vegetables', 'Dairy', 'Fruits', 'Grains', 'Bakery', 'Leftovers'];

  const getEmoji = (name, cat) => {
    const text = (name + ' ' + (cat || '')).toLowerCase();
    if (text.includes('atta') || text.includes('wheat') || text.includes('flour')) return '🌾';
    if (text.includes('rice') || text.includes('chawal')) return '🍚';
    if (text.includes('dal') || text.includes('lentil') || text.includes('besan')) return '🥣';
    if (text.includes('potato') || text.includes('aloo')) return '🥔';
    if (text.includes('onion') || text.includes('pyaaz')) return '🧅';
    if (text.includes('garlic') || text.includes('ginger')) return '🧄';
    if (text.includes('milk') || text.includes('doodh')) return '🥛';
    if (text.includes('paneer') || text.includes('cheese')) return '🧀';
    if (text.includes('tomato') || text.includes('tamatar')) return '🍅';
    if (text.includes('chilli') || text.includes('mirch')) return '🌶️';
    if (text.includes('spinach') || text.includes('palak')) return '🥬';
    if (text.includes('egg') || text.includes('anda')) return '🥚';
    if (text.includes('apple') || text.includes('seb')) return '🍎';
    if (text.includes('banana') || text.includes('kela')) return '🍌';
    if (text.includes('bread') || text.includes('pav')) return '🍞';
    if (text.includes('cooked') || text.includes('leftover')) return '🍛';
    if (text.includes('chicken') || text.includes('meat')) return '🍗';
    return '🥗';
  };

  const handleUsed = (id) => {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#34d399', '#6ee7b7'],
    });
    onMarkUsed(id);
  };

  const locationBadge = (loc) => {
    if (loc === 'room') return { text: '🏠 Dry Pantry', bg: 'bg-amber-50 text-amber-800 border-amber-200/80' };
    if (loc === 'freezer') return { text: '🧊 Freezer', bg: 'bg-cyan-50 text-cyan-800 border-cyan-200/80' };
    return { text: '❄️ Refrigerator', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80' };
  };

  // Count items by location zone
  const counts = {
    all: items.length,
    fridge: items.filter((i) => i.location === 'fridge').length,
    room: items.filter((i) => i.location === 'room').length,
    freezer: items.filter((i) => i.location === 'freezer').length,
  };

  // Filter items
  const filtered = items.filter((it) => {
    if (selectedZone !== 'all' && it.location !== selectedZone) return false;
    if (selectedCategory !== 'All') {
      return (it.category || '').toLowerCase().includes(selectedCategory.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            My Pantry & Kitchen
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track groceries across your Fridge, Dry Pantry Shelves & Freezer
          </p>
        </div>

        <button
          onClick={onOpenAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Storage Zone Selector (Fridge vs Dry Pantry vs Freezer) */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Storage', count: counts.all },
          { id: 'fridge', label: '❄️ Refrigerator', count: counts.fridge },
          { id: 'room', label: '🏠 Dry Pantry / Shelf', count: counts.room },
          { id: 'freezer', label: '🧊 Deep Freezer', count: counts.freezer },
        ].map((zone) => (
          <button
            key={zone.id}
            onClick={() => setSelectedZone(zone.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
              selectedZone === zone.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/70'
            }`}
          >
            <span>{zone.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
              selectedZone === zone.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {zone.count}
            </span>
          </button>
        ))}
      </div>

      {/* Food Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grocery Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((item) => {
            const isUrgent = item.daysLeft !== null && item.daysLeft <= 0;
            const isSoon = item.daysLeft !== null && item.daysLeft > 0 && item.daysLeft <= 3;
            const locInfo = locationBadge(item.location);

            return (
              <div
                key={item.id}
                className="group relative bg-white p-5 rounded-3xl border border-emerald-950/5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Food Emoji Avatar */}
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-4xl mb-3 shadow-inner group-hover:scale-105 transition">
                    {getEmoji(item.name, item.category)}
                  </div>

                  {/* Title & Storage Location Badge */}
                  <div className="text-center">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border mb-1.5 ${locInfo.bg}`}>
                      {locInfo.text}
                    </span>
                    <h3 className="text-base font-bold text-slate-800 capitalize truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 capitalize mt-0.5">
                      {item.category || 'Grocery'}
                    </p>
                  </div>

                  {/* Expiry Pill */}
                  <div className="mt-3 text-center">
                    <span
                      className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full ${
                        isUrgent
                          ? 'bg-rose-50 text-rose-600 border border-rose-200/80'
                          : isSoon
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                      }`}
                    >
                      {item.daysLeft === null 
                        ? 'No Expiry'
                        : item.daysLeft <= 0 
                        ? 'Expires Today' 
                        : item.daysLeft === 1
                        ? 'Expires in 1 day'
                        : `Expires in ${item.daysLeft} days`}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                  <button
                    onClick={() => handleUsed(item.id)}
                    className="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-1.5 rounded-xl transition"
                    title="Mark as consumed"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Used</span>
                  </button>

                  <button
                    onClick={() => onMarkWasted(item.id)}
                    className="px-2 py-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Mark as wasted"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDelete(item.id)}
                    className="px-2 py-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-xl transition"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center text-slate-400">
          No groceries found in this section. Click "+ Add Item" above to add some!
        </div>
      )}

    </div>
  );
}
