import React from 'react';
import { Search, Bell, Menu, Sparkles, Refrigerator, LogIn } from 'lucide-react';

export default function TopBar({ 
  searchQuery, 
  setSearchQuery, 
  serverStatus, 
  onToggleMobileNav, 
  expiringCount,
  onOpenFridge3D,
  currentUser,
  onOpenAuth,
  onNavigateProfile
}) {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-emerald-950/5 px-6 sm:px-10 py-3.5 flex items-center justify-between gap-4">
      
      {/* Mobile Menu Button + Brand (Mobile Only) */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={onToggleMobileNav}
          className="p-2 rounded-xl bg-slate-100 text-slate-700"
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

        {/* Notifications */}
        <div className="relative cursor-pointer p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 transition">
          <Bell className="w-4 h-4" />
          {expiringCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
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
