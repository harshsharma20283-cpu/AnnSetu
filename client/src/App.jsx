import React, { useState, useEffect, useRef } from 'react';
import FridgeCanvasHero from './components/FridgeCanvasHero';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import MobileBottomNav from './components/MobileBottomNav';

// Tabs
import HomeTab from './components/tabs/HomeTab';
import MyFridgeTab from './components/tabs/MyFridgeTab';
import ExpiryTrackerTab from './components/tabs/ExpiryTrackerTab';
import AddItemTab from './components/tabs/AddItemTab';
import SuggestionsTab from './components/tabs/SuggestionsTab';
import ProfileTab from './components/tabs/ProfileTab';

// Modals
import CookTodayModal from './components/CookTodayModal';
import BarcodeLookupModal from './components/BarcodeLookupModal';
import AuthModal from './components/AuthModal';

import { 
  fetchItems, 
  updateItem, 
  deleteItem, 
  getCurrentUser, 
  logoutUser,
  handleOAuthCallback 
} from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [items, setItems] = useState([]);
  const [usedItems, setUsedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Modals state
  const [isCookOpen, setIsCookOpen] = useState(false);
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [barcodeScannedData, setBarcodeScannedData] = useState(null);

  const dashboardRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const activeData = await fetchItems('active');
      setItems(Array.isArray(activeData) ? activeData : []);
      setServerOnline(true);

      const usedData = await fetchItems('used').catch(() => []);
      setUsedItems(Array.isArray(usedData) ? usedData : []);
    } catch (err) {
      console.error('Failed to load items:', err);
      setServerOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for Google OAuth callback params in URL
    const hash = window.location.hash;
    const search = window.location.search;
    
    let accessToken = null;
    let code = null;

    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      accessToken = params.get('access_token');
    }
    if (search && search.includes('code=')) {
      const params = new URLSearchParams(search);
      code = params.get('code');
    }

    if (accessToken || code) {
      setLoading(true);
      handleOAuthCallback({ accessToken, code })
        .then((res) => {
          if (res?.user) {
            setCurrentUser(res.user);
            window.history.replaceState({}, document.title, window.location.pathname);
            loadData();
          }
        })
        .catch((err) => {
          console.error('Google OAuth callback failed:', err);
          window.history.replaceState({}, document.title, window.location.pathname);
          loadData();
        });
    } else {
      loadData();
      getCurrentUser().then((user) => {
        if (user) setCurrentUser(user);
      }).catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    loadData();
  };

  const handleMarkUsed = async (id) => {
    try {
      await updateItem(id, { status: 'used' });
      await loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleMarkWasted = async (id) => {
    if (!window.confirm('Mark this item as wasted/discarded?')) return;
    try {
      await updateItem(id, { status: 'wasted' });
      await loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item permanently?')) return;
    try {
      await deleteItem(id);
      await loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const scrollToDashboard = () => {
    dashboardRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBarcodeProductSelected = (product) => {
    setBarcodeScannedData(product);
    setActiveTab('add');
    scrollToDashboard();
  };

  // Filtered items based on search query
  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (item.name || '').toLowerCase().includes(q) ||
           (item.category || '').toLowerCase().includes(q);
  });

  const expiringCount = items.filter((i) => i.daysLeft !== null && i.daysLeft <= 3).length;

  return (
    <div className="min-h-screen bg-[#f5f8f5] text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* 1. Interactive 3D Refrigerator Opening Scroll Hero */}
      <FridgeCanvasHero onScrollToDashboard={scrollToDashboard} />

      {/* 2. AnnSetu Application & Dashboard Section */}
      <div ref={dashboardRef} className="min-h-screen flex flex-col md:flex-row relative">
        
        {/* Desktop Sidebar (Matching Mockup) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            scrollToDashboard();
          }}
          expiringCount={expiringCount}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-10">
          
          {/* Top Bar with Search & 3D Scroll Jump */}
          <TopBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            serverStatus={serverOnline}
            onToggleMobileNav={() => setActiveTab('home')}
            expiringCount={expiringCount}
            onOpenFridge3D={scrollToHero}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onNavigateProfile={() => {
              setActiveTab('profile');
              scrollToDashboard();
            }}
          />

          {/* Tab Views */}
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
            {loading ? (
              <div className="py-24 text-center">
                <div className="w-10 h-10 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin mx-auto mb-4" />
                <p className="text-xs font-bold text-slate-400">Loading your pantry from Supabase...</p>
              </div>
            ) : (
              <>
                {activeTab === 'home' && (
                  <HomeTab
                    items={filteredItems}
                    usedItems={usedItems}
                    onNavigate={(tab) => {
                      setActiveTab(tab);
                      scrollToDashboard();
                    }}
                    onOpenAdd={() => {
                      setActiveTab('add');
                      scrollToDashboard();
                    }}
                    onOpenBarcode={() => setIsBarcodeOpen(true)}
                    onOpenFridge3D={scrollToHero}
                  />
                )}

                {activeTab === 'fridge' && (
                  <MyFridgeTab
                    items={filteredItems}
                    onMarkUsed={handleMarkUsed}
                    onMarkWasted={handleMarkWasted}
                    onDelete={handleDelete}
                    onOpenAdd={() => {
                      setActiveTab('add');
                      scrollToDashboard();
                    }}
                  />
                )}

                {activeTab === 'expiry' && (
                  <ExpiryTrackerTab
                    items={filteredItems}
                    onMarkUsed={handleMarkUsed}
                    onMarkWasted={handleMarkWasted}
                  />
                )}

                {activeTab === 'add' && (
                  <AddItemTab
                    onItemAdded={loadData}
                    onOpenBarcode={() => setIsBarcodeOpen(true)}
                    initialData={barcodeScannedData}
                  />
                )}

                {activeTab === 'suggestions' && (
                  <SuggestionsTab
                    items={filteredItems}
                    onOpenCook={() => setIsCookOpen(true)}
                    onOpenAdd={() => {
                      setActiveTab('add');
                      scrollToDashboard();
                    }}
                  />
                )}

                {activeTab === 'profile' && (
                  <ProfileTab
                    itemsCount={items.length}
                    usedCount={usedItems.length}
                    currentUser={currentUser}
                    onOpenAuth={() => setIsAuthOpen(true)}
                    onLogout={handleLogout}
                  />
                )}
              </>
            )}
          </main>

        </div>

      </div>

      {/* 3. Mobile Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          scrollToDashboard();
        }}
      />

      {/* 4. Modals */}
      <CookTodayModal
        isOpen={isCookOpen}
        onClose={() => setIsCookOpen(false)}
        items={items}
      />

      <BarcodeLookupModal
        isOpen={isBarcodeOpen}
        onClose={() => setIsBarcodeOpen(false)}
        onProductSelected={handleBarcodeProductSelected}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          loadData();
        }}
      />

    </div>
  );
}
