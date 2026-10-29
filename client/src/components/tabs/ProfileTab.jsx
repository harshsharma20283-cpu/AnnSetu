import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Sliders, 
  HelpCircle, 
  Info, 
  LogOut, 
  ChevronRight, 
  Award, 
  ShieldCheck, 
  Heart, 
  LogIn,
  X,
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone,
  Save,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProfileTab({ 
  itemsCount = 0, 
  usedCount = 0, 
  currentUser, 
  onOpenAuth, 
  onLogout 
}) {
  const [activeModal, setActiveModal] = useState(null); // 'personal' | 'notifications' | 'preferences' | 'help' | 'about'
  const [saveToast, setSaveToast] = useState('');

  // 1. Personal Information State
  const [personalName, setPersonalName] = useState(currentUser?.name || 'Harsh Sharma');
  const [kitchenName, setKitchenName] = useState('Harsh\'s Smart Kitchen');
  const [dietPreference, setDietPreference] = useState('Vegetarian');

  // 2. Notification Settings State
  const [notifyTime, setNotifyTime] = useState('08:30');
  const [advanceDays, setAdvanceDays] = useState('2');
  const [browserNotifs, setBrowserNotifs] = useState(false);

  // 3. App Preferences State
  const [defaultZone, setDefaultZone] = useState('fridge');
  const [autoDetectZone, setAutoDetectZone] = useState(true);
  const [enableConfetti, setEnableConfetti] = useState(true);

  // 4. Help & Support FAQ state
  const [expandedFaq, setExpandedFaq] = useState(0);

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('annsetu_user_preferences');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.personalName) setPersonalName(p.personalName);
        if (p.kitchenName) setKitchenName(p.kitchenName);
        if (p.dietPreference) setDietPreference(p.dietPreference);
        if (p.notifyTime) setNotifyTime(p.notifyTime);
        if (p.advanceDays) setAdvanceDays(p.advanceDays);
        if (p.browserNotifs !== undefined) setBrowserNotifs(p.browserNotifs);
        if (p.defaultZone) setDefaultZone(p.defaultZone);
        if (p.autoDetectZone !== undefined) setAutoDetectZone(p.autoDetectZone);
        if (p.enableConfetti !== undefined) setEnableConfetti(p.enableConfetti);
      } else if (currentUser?.name) {
        setPersonalName(currentUser.name);
        setKitchenName(`${currentUser.name.split(' ')[0]}'s Smart Kitchen`);
      }
    } catch (e) {
      console.warn('Failed to parse saved preferences', e);
    }
  }, [currentUser]);

  // Save changes to localStorage
  const savePreferences = (customMsg = 'Settings saved successfully!') => {
    try {
      const p = {
        personalName,
        kitchenName,
        dietPreference,
        notifyTime,
        advanceDays,
        browserNotifs,
        defaultZone,
        autoDetectZone,
        enableConfetti,
      };
      localStorage.setItem('annsetu_user_preferences', JSON.stringify(p));
      setSaveToast(customMsg);
      setTimeout(() => setSaveToast(''), 3000);
      setActiveModal(null);
    } catch (e) {
      console.error('Save failed', e);
    }
  };

  // Browser notification toggle handler
  const handleToggleBrowserNotif = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }

    if (Notification.permission === 'granted') {
      const next = !browserNotifs;
      setBrowserNotifs(next);
      if (next) {
        new Notification('🔔 AnnSetu Smart Grocery', {
          body: 'Expiry alerts are enabled! You will be notified before food expires.',
          icon: '/favicon.ico',
        });
      }
    } else {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setBrowserNotifs(true);
        new Notification('🔔 AnnSetu Smart Grocery', {
          body: 'Expiry alerts are enabled! You will be notified before food expires.',
          icon: '/favicon.ico',
        });
      } else {
        alert('Notification permission was blocked in your browser. Please enable it in browser site settings.');
        setBrowserNotifs(false);
      }
    }
  };

  const menuOptions = [
    { id: 'personal', label: 'Personal Information', desc: 'Name, kitchen name & dietary preferences', icon: User },
    { id: 'notifications', label: 'Notification Settings', desc: 'Expiry alert time & browser push notifications', icon: Bell },
    { id: 'preferences', label: 'App Preferences', desc: 'Default storage zone & smart detection', icon: Sliders },
    { id: 'help', label: 'Help & Support', desc: 'Frequently asked questions & assistance', icon: HelpCircle },
    { id: 'about', label: 'About AnnSetu', desc: 'Version 1.2.0 & zero-waste mission', icon: Info },
  ];

  const faqs = [
    {
      q: 'How does the Shelf Life Engine calculate expiry?',
      a: 'AnnSetu includes a database of 40+ Indian kitchen items. When you type an ingredient name (e.g., "Amul Taaza Milk" or "Aashirvaad Atta"), our algorithm matches the root item and applies safety shelf-life duration based on your storage zone.',
    },
    {
      q: 'Why does Atta, Dal, and Aloo default to Dry Pantry instead of Refrigerator?',
      a: 'In Indian households, grains, flour, potatoes, onions, and garlic spoil or absorb moisture if kept in the fridge. AnnSetu automatically assigns dry pantry goods to the Dry Pantry / Shelf zone.',
    },
    {
      q: 'How does the Barcode Scanner work?',
      a: 'You can either type any 13-digit Indian FMCG barcode (like Maggi, Parle-G, Tata Salt) or use your camera in Live Camera mode. AnnSetu queries the Open Food Facts global database to auto-fill the product name, photo, and category.',
    },
    {
      q: 'Is my data synced across my phone and laptop?',
      a: 'Yes! When you log in with your kitchen account, all items are stored in your cloud database (Supabase PostgreSQL), so any changes you make on your phone will reflect on your laptop immediately.',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-600/30 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your account, kitchen preferences and notifications
        </p>
      </div>

      {/* User Card */}
      {currentUser ? (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-950/5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-600/25 uppercase">
              {personalName ? personalName[0] : (currentUser.name ? currentUser.name[0] : 'H')}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">{personalName || currentUser.name || 'Chef'}</h3>
              <p className="text-xs text-slate-400">{currentUser.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold shadow-sm">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Premium Member ({dietPreference})</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-950/5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xl">
              👤
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Guest Kitchen Account</h3>
              <p className="text-xs text-slate-400">Log in to sync groceries across devices & enable notifications</p>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Register</span>
          </button>
        </div>
      )}

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

      {/* Interactive Settings Navigation List */}
      <div className="bg-white rounded-3xl border border-emerald-950/5 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {menuOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <div
              key={opt.id}
              onClick={() => setActiveModal(opt.id)}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-emerald-50/50 cursor-pointer transition group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-700 flex items-center justify-center transition shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-bold text-slate-800 block group-hover:text-emerald-700 transition">
                    {opt.label}
                  </span>
                  <span className="text-xs text-slate-400 block truncate">
                    {opt.desc}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Auth Action Button */}
      {currentUser ? (
        <button
          onClick={onLogout}
          className="w-full py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm flex items-center justify-center gap-2 border border-rose-200/60 transition active:scale-95 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out ({currentUser.email})</span>
        </button>
      ) : (
        <button
          onClick={onOpenAuth}
          className="w-full py-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center gap-2 border border-emerald-200/60 transition active:scale-95 shadow-sm"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In to Your Account</span>
        </button>
      )}

      {/* ============================================================== */}
      {/* 1. PERSONAL INFORMATION MODAL                                  */}
      {/* ============================================================== */}
      {activeModal === 'personal' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white border border-emerald-950/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Personal Information</h3>
                  <p className="text-xs text-slate-400">Update your kitchen profile</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={personalName}
                  onChange={(e) => setPersonalName(e.target.value)}
                  placeholder="e.g. Harsh Sharma"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={currentUser?.email || 'guest@annsetu.local'}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Linked with your cloud database</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kitchen / Household Name</label>
                <input
                  type="text"
                  value={kitchenName}
                  onChange={(e) => setKitchenName(e.target.value)}
                  placeholder="e.g. Sharma Family Kitchen"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Dietary Preference</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Vegetarian', 'Eggetarian', 'Non-Vegetarian', 'Jain / Satvik', 'Vegan'].map((diet) => (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => setDietPreference(diet)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-left flex items-center justify-between ${
                        dietPreference === diet
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{diet}</span>
                      {dietPreference === diet && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => savePreferences('Personal profile updated!')}
                className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. NOTIFICATION SETTINGS MODAL                                 */}
      {/* ============================================================== */}
      {activeModal === 'notifications' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white border border-emerald-950/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Notification Settings</h3>
                  <p className="text-xs text-slate-400">Configure automated expiry alerts</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Daily Automated Audit Time</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="time"
                    value={notifyTime}
                    onChange={(e) => setNotifyTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Cron audits inventory every morning at this time</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Advance Warning Notice</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { days: '1', label: '1 Day Before' },
                    { days: '2', label: '2 Days Before' },
                    { days: '3', label: '3 Days Before' },
                  ].map((item) => (
                    <button
                      key={item.days}
                      type="button"
                      onClick={() => setAdvanceDays(item.days)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition text-center ${
                        advanceDays === item.days
                          ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Browser Push Notifications Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Browser Push Alerts</h4>
                    <p className="text-[11px] text-slate-400">Receive desktop/mobile browser alerts</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleBrowserNotif}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    browserNotifs ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    browserNotifs ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => savePreferences('Notification preferences saved!')}
                className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Notification Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. APP PREFERENCES MODAL                                       */}
      {/* ============================================================== */}
      {activeModal === 'preferences' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white border border-emerald-950/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">App Preferences</h3>
                  <p className="text-xs text-slate-400">Storage defaults & behavior</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Default Storage Zone For New Items</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'fridge', label: '❄️ Fridge' },
                    { id: 'room', label: '🏠 Dry Pantry' },
                    { id: 'freezer', label: '🧊 Freezer' },
                  ].map((z) => (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => setDefaultZone(z.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${
                        defaultZone === z.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {z.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Smart Auto Detect Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Smart Storage Auto-Detect</h4>
                  <p className="text-[11px] text-slate-400">Auto-routes Atta/Dal/Rice to Pantry, Milk to Fridge</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoDetectZone(!autoDetectZone)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    autoDetectZone ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    autoDetectZone ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Confetti Blast Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Confetti Celebration Effects</h4>
                  <p className="text-[11px] text-slate-400">Celebration blast whenever you rescue food</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !enableConfetti;
                    setEnableConfetti(next);
                    if (next) {
                      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                    }
                  }}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    enableConfetti ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    enableConfetti ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Currency & Unit System</label>
                <div className="p-3 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Indian Rupee (₹ INR) & Metric (kg / g / pcs)</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Default</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => savePreferences('App preferences updated!')}
                className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save App Preferences</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. HELP & SUPPORT MODAL                                        */}
      {/* ============================================================== */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-emerald-950/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Help & Support</h3>
                  <p className="text-xs text-slate-400">Everything you need to know about AnnSetu</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* FAQs Accordion */}
            <div className="mt-5 space-y-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Frequently Asked Questions
              </span>

              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(expandedFaq === idx ? -1 : idx)}
                    className="w-full p-3.5 text-left text-xs font-bold text-slate-800 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition"
                  >
                    <span>{faq.q}</span>
                    <span className="text-slate-400 font-extrabold ml-2">
                      {expandedFaq === idx ? '−' : '+'}
                    </span>
                  </button>
                  {expandedFaq === idx && (
                    <div className="p-3.5 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Support Banner */}
            <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
              <div className="font-bold text-emerald-800 flex items-center gap-1.5 mb-1">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Need Personalized Help?</span>
              </div>
              <p className="text-emerald-700 text-[11px] mb-3">
                Have an idea, bug report, or missing ingredient request? Contact our team directly.
              </p>
              <a
                href="mailto:harshsharma20283@gmail.com?subject=AnnSetu%20App%20Feedback"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
              >
                <span>Email Developer Support</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. ABOUT ANNSETU MODAL                                         */}
      {/* ============================================================== */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white border border-emerald-950/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/25 text-white mb-4">
              🍃
            </div>

            <h3 className="text-2xl font-black text-slate-800 tracking-tight">AnnSetu</h3>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-0.5">
              Smart Grocery & Zero-Waste Kitchen
            </p>

            <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 text-left space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Version</span>
                <span className="text-slate-800">1.2.0 (Stable)</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Database Engine</span>
                <span className="text-emerald-700">Supabase Cloud PostgreSQL</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Interactive 3D Engine</span>
                <span className="text-slate-800">120-Frame Canvas Scroll</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Developer</span>
                <span className="text-slate-800">Harsh Sharma</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              AnnSetu is designed to eliminate food waste in modern Indian households by bridging intelligent shelf-life prediction, smart pantry storage zones, and rescue meal planning.
            </p>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full mt-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition active:scale-95"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
