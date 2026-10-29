import React from 'react';
import { 
  Home, 
  Layers, 
  Clock, 
  PlusCircle, 
  Lightbulb, 
  User, 
  Leaf,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, expiringCount }) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'fridge', label: 'My Pantry', icon: Layers },
    { id: 'expiry', label: 'Expiry Tracker', icon: Clock, badge: expiringCount > 0 ? expiringCount : null },
    { id: 'add', label: 'Add Item', icon: PlusCircle },
    { id: 'suggestions', label: 'Smart Suggestions', icon: Lightbulb },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-white/90 backdrop-blur-xl border-r border-emerald-950/5 flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0 hidden md:flex z-30">
      
      {/* Brand */}
      <div>
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
            <Leaf className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-slate-800">AnnSetu</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            </div>
            <p className="text-[11px] font-semibold text-emerald-600/80 uppercase tracking-wider">
              Smart Grocery
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-500/10'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Card */}
      <div 
        onClick={() => setActiveTab('profile')}
        className="cursor-pointer p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-600/20">
            H
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-slate-800 block truncate group-hover:text-emerald-700 transition">
              Harsh
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded-full inline-block">
              Premium
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition" />
      </div>

    </aside>
  );
}
