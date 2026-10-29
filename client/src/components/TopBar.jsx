import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  Sparkles, 
  Refrigerator, 
  LogIn, 
  X, 
  Check, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Bot,
  ChefHat
} from 'lucide-react';

export default function TopBar({ 
  searchQuery, 
  setSearchQuery, 
  serverStatus, 
  onToggleMobileNav, 
  expiringCount,
  items = [],
  onMarkUsed,
  onNavigate,
  onOpenFridge3D,
  currentUser,
  onOpenAuth,
  onNavigateProfile
}) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Expiring items for the notification drawer (<= 3 days left)
  const expiringItems = items.filter(
    (i) => i.daysLeft !== null && i.daysLeft <= 3 && i.status === 'active'
  );

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifOpen]);

  const getEmoji = (cat, name) => {
    const text = (name + ' ' + (cat || '')).toLowerCase();
    if (text.includes('milk') || text.includes('doodh')) return '🥛';
    if (text.includes('paneer') || text.includes('cheese')) return '🧀';
    if (text.includes('tomato') || text.includes('tamatar')) return '🍅';
    if (text.includes('spinach') || text.includes('palak')) return '🥬';
    if (text.includes('egg') || text.includes('anda')) return '🥚';
    if (text.includes('bread') || text.includes('pav')) return '🍞';
    return '🥗';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-emerald-950/5 px-6 sm:px-10 py-3.5 flex items-center justify-between gap-4">
      
      {/* Mobile Menu Button + Brand (Mobile Only) */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={onToggleMobileNav}
          className="p-2 rounded-xl bg-slate-100 text-slate-700 active:scale-95 transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-lg font-black tracking-tight text-slate-800">AnnSetu</span>
      </div>

      {/* Global Search Bar */}
      <div className="relative flex-1 max-w-lg">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
        <input
          type="text"
          placeholder="Search foods, items, or categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200/80 focus:border-emerald-500 rounded-2xl pl-11 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition shadow-sm"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        
        {/* 3D Refrigerator Opening Button */}
        <button
          onClick={onOpenFridge3D}
          className="flex items-center gap-2 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 px-3.5 py-2 rounded-2xl transition shadow-sm active:scale-95"
          title="Open Interactive 3D Refrigerator Animation"
        >
          <Refrigerator className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">3D Fridge</span>
        </button>

        {/* Database Status */}
        <div className="hidden lg:flex items-center gap-2 text-xs bg-slate-100 px-3 py-1.5 rounded-full text-slate-600 font-medium">
          <span className={`w-2 h-2 rounded-full ${serverStatus ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
          <span>{serverStatus ? 'Cloud Synced' : 'Offline'}</span>
        </div>

        {/* Notifications Button & Dropdown Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative p-2.5 rounded-2xl transition border active:scale-95 ${
              isNotifOpen 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 border-transparent'
            }`}
            title="Kitchen Expiry Notifications"
          >
            <Bell className="w-4 h-4" />
            {expiringItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                {expiringItems.length}
              </span>
            )}
          </button>

          {/* Notification Dropdown Drawer */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-emerald-950/10 rounded-3xl shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Dropdown Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">Kitchen Alerts</h3>
                    <span className="text-[10px] text-slate-400">Expiring groceries</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {expiringItems.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700">
                      {expiringItems.length} Needs Attention
                    </span>
                  )}
                  <button
                    onClick={() => setIsNotifOpen(false)}
                    className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Notification Items List */}
              <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
                {expiringItems.length > 0 ? (
                  expiringItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/80 transition flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg shrink-0">{getEmoji(item.category, item.name)}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-800 truncate">{item.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-extrabold text-rose-600">
                              {item.daysLeft <= 0 ? 'Expired Today' : `${item.daysLeft}d left`}
                            </span>
                            <span className="text-[10px] text-slate-400 capitalize">
                              • {item.location || 'Fridge'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {onMarkUsed && (
                        <button
                          type="button"
                          onClick={() => {
                            onMarkUsed(item.id);
                          }}
                          className="shrink-0 text-[10px] font-bold bg-white hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-xl transition shadow-sm flex items-center gap-1 active:scale-95"
                          title="Mark as Used"
                        >
                          <Check className="w-3 h-3" />
                          <span>Used</span>
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 text-xl">
                      🍃
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">Your Kitchen is Fresh!</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      No ingredients are expiring in the next 3 days.
                    </p>
                  </div>
                )}
              </div>

              {/* Dropdown Footer Action */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {items.length} total items tracked
                </span>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotifOpen(false);
                      onNavigate('expiry');
                    }}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
                  >
                    <span>View Expiry Tracker</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Profile Avatar or Sign In */}
        {currentUser ? (
          <div 
            onClick={onNavigateProfile}
            className="cursor-pointer w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-sm uppercase hover:ring-2 hover:ring-emerald-400 transition"
            title={`Logged in as ${currentUser.name}`}
          >
            {currentUser.name ? currentUser.name[0] : 'H'}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl transition shadow-sm active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}

      </div>

    </header>
  );
}
