import React from 'react';
import { Home, Layers, Clock, PlusCircle, Lightbulb } from 'lucide-react';

export default function MobileBottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'fridge', label: 'Pantry', icon: Layers },
    { id: 'add', label: 'Add', icon: PlusCircle, isMain: true },
    { id: 'expiry', label: 'Expiry', icon: Clock },
    { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-emerald-950/5 px-4 py-2 flex items-center justify-around shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        if (tab.isMain) {
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition"
            >
              <Icon className="w-6 h-6" />
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 transition ${
              isActive ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
