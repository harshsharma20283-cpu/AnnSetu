import React from 'react';
import { Plus, Utensils, ScanBarcode, Refrigerator } from 'lucide-react';

export default function Navbar({ onOpenAdd, onOpenCook, onOpenBarcode, serverStatus, expiringCount }) {
  return (
    <nav className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-6 sm:px-10 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Refrigerator className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">AnnSetu</span>
              <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                अन्न सेतु
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Smart Indian Kitchen & Expiry Guard</p>
          </div>
        </div>

        {/* Database Status indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-full text-slate-400">
          <span className={`w-2 h-2 rounded-full ${serverStatus ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
          <span className="font-mono">{serverStatus ? 'Supabase Connected' : 'Connecting DB...'}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          
          {/* Rescue Recipe Generator Button */}
          <button
            onClick={onOpenCook}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 px-3.5 py-2.5 rounded-2xl transition active:scale-95 shadow-sm"
          >
            <Utensils className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Cook Today</span>
            {expiringCount > 0 && (
              <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow">
                {expiringCount}
              </span>
            )}
          </button>

          {/* Barcode Scanner Button */}
          <button
            onClick={onOpenBarcode}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium bg-slate-900 hover:bg-slate-850 border border-slate-700/80 text-slate-200 px-3.5 py-2.5 rounded-2xl transition active:scale-95 shadow-sm"
            title="Scan or lookup packaged food barcode"
          >
            <ScanBarcode className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Barcode</span>
          </button>

          {/* Primary Add Item Button */}
          <button
            onClick={onOpenAdd}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 sm:px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Grocery</span>
          </button>

        </div>

      </div>
    </nav>
  );
}
