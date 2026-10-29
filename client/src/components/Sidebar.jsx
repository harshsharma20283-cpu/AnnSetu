import React from 'react';
import { 
  Home, 
  Layers, 
  Clock, 
  PlusCircle, 
  Lightbulb, 
  User, 
  Leaf,
  ChevronRight,
  LogIn,
  Sparkles,
  Bot
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, expiringCount, currentUser, onOpenAuth, onOpenAiChef }) {
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

        {/* AI Chef Quick Access Banner in Sidebar */}
        {onOpenAiChef && (
          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">
                👩‍🍳
              </div>
              <span className="text-xs font-bold text-slate-800">AI Assistant</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 ml-auto">
                NEW
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2 leading-tight">
              Ask recipes & zero-waste hacks for your fridge.
            </p>
            <button
              onClick={onOpenAiChef}
              className="w-full py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Chat with Chef</span>
            </button>
          </div>
        )}
      </div>

      {/* User Profile Card */}
      {currentUser ? (
        <div 
          onClick={() => setActiveTab('profile')}
          className="cursor-pointer p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-600/20 uppercase">
              {currentUser.name ? currentUser.name[0] : 'H'}
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold text-slate-800 block truncate group-hover:text-emerald-700 transition">
                {currentUser.name || 'Chef'}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded-full inline-block">
                Premium
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition" />
        </div>
      ) : (
        <div 
          onClick={onOpenAuth}
          className="cursor-pointer p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/60 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-900 block">Sign In</span>
              <span className="text-[10px] text-emerald-600 block">Sync Kitchen</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-600" />
        </div>
      )}

    </aside>
  );
}
