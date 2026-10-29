import React from 'react';
import { 
  Package, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  ScanBarcode, 
  Clock, 
  Lightbulb, 
  ArrowRight,
  Refrigerator
} from 'lucide-react';

export default function HomeTab({ 
  items, 
  usedItems, 
  currentUser,
  onNavigate, 
  onOpenAdd, 
  onOpenBarcode, 
  onOpenFridge3D 
}) {
  const expired = items.filter((i) => i.daysLeft !== null && i.daysLeft <= 0);
  const expiringSoon = items.filter((i) => i.daysLeft !== null && i.daysLeft > 0 && i.daysLeft <= 3);
  const fresh = items.filter((i) => i.daysLeft === null || i.daysLeft > 3);

  // Freshness score (default 92% if healthy)
  const freshnessScore = items.length > 0 
    ? Math.max(20, Math.round(((fresh.length) / items.length) * 100))
    : 92;

  const quickActions = [
    { label: 'Add Item', icon: Plus, onClick: onOpenAdd, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
    { label: 'Scan Barcode', icon: ScanBarcode, onClick: onOpenBarcode, color: 'text-teal-600 bg-teal-50 hover:bg-teal-100' },
    { label: 'View Expiry', icon: Clock, onClick: () => onNavigate('expiry'), color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
    { label: 'Get Suggestions', icon: Lightbulb, onClick: () => onNavigate('suggestions'), color: 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100' },
  ];

  const getEmoji = (cat) => {
    const c = String(cat || '').toLowerCase();
    if (c.includes('dairy') || c.includes('milk')) return '🥛';
    if (c.includes('veg') || c.includes('tomato')) return '🍅';
    if (c.includes('spinach')) return '🥬';
    if (c.includes('fruit') || c.includes('apple')) return '🍎';
    if (c.includes('cheese') || c.includes('paneer')) return '🧀';
    if (c.includes('egg')) return '🥚';
    if (c.includes('bread')) return '🍞';
    return '🥗';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Greeting */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            {currentUser?.name ? `Welcome back, ${currentUser.name.split(' ')[0]}` : 'Welcome, Kitchen Chef'}
          </h1>
          <span className="text-2xl">🌱</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Here's what's happening with your groceries today.
        </p>
      </div>

      {/* 4 Metric Cards (Matching Mockup exactly) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Items */}
        <div 
          onClick={() => onNavigate('fridge')}
          className="cursor-pointer bg-white p-5 rounded-3xl border border-emerald-950/5 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
        >
          <div>
            <div className="text-3xl font-black text-slate-800">{items.length}</div>
            <span className="text-xs font-semibold text-slate-400 mt-1 block">Total Items</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Expiring Soon */}
        <div 
          onClick={() => onNavigate('expiry')}
          className="cursor-pointer bg-white p-5 rounded-3xl border border-emerald-950/5 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
        >
          <div>
            <div className="text-3xl font-black text-rose-500">{expiringSoon.length}</div>
            <span className="text-xs font-semibold text-slate-400 mt-1 block">Expiring Soon</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Fresh Items */}
        <div 
          onClick={() => onNavigate('fridge')}
          className="cursor-pointer bg-white p-5 rounded-3xl border border-emerald-950/5 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
        >
          <div>
            <div className="text-3xl font-black text-teal-600">{fresh.length}</div>
            <span className="text-xs font-semibold text-slate-400 mt-1 block">Fresh Items</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Fridge Freshness Score (Circular Gauge Style) */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-950/5 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-3xl font-black text-slate-800">{freshnessScore}%</div>
            <span className="text-xs font-semibold text-slate-400 mt-1 block">Fridge Freshness</span>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-emerald-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray={`${freshnessScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <Sparkles className="w-4 h-4 text-emerald-600 absolute" />
          </div>
        </div>

      </div>

      {/* Middle Grid: Fridge Banner & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* "Your Fridge Looks Great!" Banner (Matching Mockup) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          
          <div className="space-y-2 z-10 text-center sm:text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
              Kitchen Intelligence
            </span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Your Fridge Looks Great!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
              {expiringSoon.length > 0 
                ? `${expiringSoon.length} items will expire in the next 3 days. Use them today!`
                : 'All tracked ingredients are fresh. No emergency spoilage detected.'}
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenFridge3D}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition active:scale-95"
              >
                <span>View 3D Fridge Opening</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Refrigerator 3D graphic */}
          <div 
            onClick={onOpenFridge3D}
            className="cursor-pointer w-32 h-36 sm:w-40 sm:h-44 rounded-3xl bg-white border border-emerald-100 p-3 shadow-md flex flex-col items-center justify-center hover:scale-105 transition-all group shrink-0"
          >
            <div className="w-16 h-20 rounded-xl bg-gradient-to-b from-slate-100 to-slate-200 border-2 border-slate-300 flex items-center justify-center relative shadow-inner">
              <div className="w-1 h-8 bg-slate-400 rounded-full absolute left-1" />
              <div className="w-1 h-8 bg-slate-400 rounded-full absolute right-1" />
              <span className="text-2xl group-hover:scale-110 transition">🥗</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 mt-2">Open 3D Model</span>
          </div>

        </div>

        {/* Quick Actions (Matching Mockup) */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-950/5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Quick Actions</h3>
            <span className="text-[11px] text-slate-400">Shortcuts</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((qa, idx) => {
              const Icon = qa.icon;
              return (
                <button
                  key={idx}
                  onClick={qa.onClick}
                  className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 transition active:scale-95 shadow-sm ${qa.color}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-bold text-slate-700">{qa.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Section: Recent Items List (Matching Mockup) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-950/5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Recent Groceries</h3>
            <p className="text-xs text-slate-400">Quick view of items currently inside your fridge</p>
          </div>
          <button
            onClick={() => onNavigate('fridge')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.slice(0, 5).map((it) => (
              <div
                key={it.id}
                onClick={() => onNavigate('fridge')}
                className="cursor-pointer p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 transition-all text-center group"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl mb-3 group-hover:scale-105 transition">
                  {getEmoji(it.name + ' ' + it.category)}
                </div>
                <h4 className="text-sm font-bold text-slate-800 truncate capitalize">{it.name}</h4>
                <p className="text-[11px] text-slate-400 capitalize mt-0.5">{it.location || 'Fridge'}</p>
                <span className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  it.daysLeft <= 0 
                    ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                    : it.daysLeft <= 3 
                    ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {it.daysLeft <= 0 ? 'Expires Today' : `${it.daysLeft}d left`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            No groceries added yet. Click "+ Add Item" above or select "My Fridge" to start.
          </div>
        )}
      </div>

    </div>
  );
}
