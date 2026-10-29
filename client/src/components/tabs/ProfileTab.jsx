import React from 'react';
import { User, Bell, Sliders, HelpCircle, Info, LogOut, ChevronRight, Award, ShieldCheck, Heart } from 'lucide-react';

export default function ProfileTab({ itemsCount = 0, usedCount = 0 }) {
  const menuOptions = [
    { label: 'Personal Information', icon: User },
    { label: 'Notification Settings', icon: Bell },
    { label: 'App Preferences', icon: Sliders },
    { label: 'Help & Support', icon: HelpCircle },
    { label: 'About AnnSetu', icon: Info },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your account and kitchen preferences
        </p>
      </div>

      {/* User Card (Matching Mockup exactly) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-950/5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-600/25">
            H
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Harsh</h3>
            <p className="text-xs text-slate-400">harsh@example.com</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold shadow-sm">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Premium Member</span>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Stats Banner */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-800">{itemsCount}</div>
            <span className="text-xs font-semibold text-emerald-600">Tracked Groceries</span>
          </div>
        </div>

        <div className="bg-teal-50 p-5 rounded-3xl border border-teal-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-teal-800">{usedCount}</div>
            <span className="text-xs font-semibold text-teal-600">Meals Rescued</span>
          </div>
        </div>
      </div>

      {/* Settings Navigation List (Matching Mockup) */}
      <div className="bg-white rounded-3xl border border-emerald-950/5 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {menuOptions.map((opt, idx) => {
          const Icon = opt.icon;
          return (
            <div
              key={idx}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
            >
              <div className="flex items-center gap-3.5">
                <Icon className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-bold text-slate-700">{opt.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          );
        })}
      </div>

      {/* Log Out Button (Matching Mockup) */}
      <button
        onClick={() => alert('Log out clicked')}
        className="w-full py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm flex items-center justify-center gap-2 border border-rose-200/60 transition active:scale-95"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out</span>
      </button>

    </div>
  );
}
