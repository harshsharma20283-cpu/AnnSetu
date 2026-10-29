import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Calendar, DollarSign, MapPin, Check, Search } from 'lucide-react';
import { getShelfLifeSuggestions, estimateItemExpiry, createItem } from '../api';

export default function AddItemModal({ isOpen, onClose, onItemAdded, initialData = null }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('fridge');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState('');
  const [alertDate, setAlertDate] = useState('');
  const [price, setPrice] = useState('');
  const [expirySource, setExpirySource] = useState('manual');
  const [estimateDetails, setEstimateDetails] = useState(null);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const inputRef = useRef(null);

  // Fill initialData (e.g. from Barcode scan) if provided
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCategory(initialData.category || '');
      if (initialData.price) setPrice(initialData.price);
    }
  }, [initialData]);

  // Handle autocomplete search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (name.trim().length >= 2 && showSuggestions) {
        try {
          const res = await getShelfLifeSuggestions(name.trim());
          setSuggestions(res);
        } catch {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [name, showSuggestions]);

  // Auto-estimate expiry when name and location change
  const runAutoEstimate = async (targetName, targetLocation, targetDate) => {
    if (!targetName || targetName.trim().length < 2) return;
    setIsEstimating(true);
    try {
      const est = await estimateItemExpiry(targetName.trim(), targetLocation, targetDate);
      if (est && est.expiry_date) {
        setExpiryDate(est.expiry_date);
        setAlertDate(est.alert_date || est.expiry_date);
        setExpirySource('estimated');
        setCategory(est.category || category);
        setEstimateDetails(est);
      }
    } catch (err) {
      console.warn('Auto estimation error', err);
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSelectSuggestion = (sug) => {
    setName(sug.name);
    setCategory(sug.category);
    setShowSuggestions(false);
    runAutoEstimate(sug.name, location, purchaseDate);
  };

  const handleLocationChange = (loc) => {
    setLocation(loc);
    runAutoEstimate(name, loc, purchaseDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter item name');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await createItem({
        name: name.trim(),
        category: category || 'general',
        location,
        purchase_date: purchaseDate || null,
        expiry_date: expiryDate || null,
        alert_date: alertDate || null,
        expiry_source: expirySource,
        price: price ? parseFloat(price) : null,
      });

      // Reset and close
      setName('');
      setCategory('');
      setExpiryDate('');
      setAlertDate('');
      setPrice('');
      setEstimateDetails(null);
      onItemAdded();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-visible">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Add Pantry Item</h2>
              <p className="text-xs text-slate-400">Smart shelf-life estimation with safety alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Name & Autocomplete Input */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Item Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="e.g. Milk, Paneer, Doodh, Tamatar, Eggs..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setShowSuggestions(true);
                }}
                onBlur={() => {
                  // Delay so click on suggestion registers
                  setTimeout(() => setShowSuggestions(false), 200);
                  runAutoEstimate(name, location, purchaseDate);
                }}
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
              />
              {isEstimating && (
                <div className="absolute right-3 top-3 text-xs text-emerald-400 animate-pulse">
                  Estimating...
                </div>
              )}
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800">
                {suggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    onMouseDown={() => handleSelectSuggestion(sug)}
                    className="p-3 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition"
                  >
                    <span className="font-semibold text-white capitalize">{sug.name}</span>
                    <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full capitalize">
                      {sug.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Storage Location Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Storage Location</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'fridge', label: '❄️ Fridge' },
                { id: 'room', label: '🏠 Room/Pantry' },
                { id: 'freezer', label: '🧊 Freezer' },
              ].map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleLocationChange(loc.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition ${
                    location === loc.id
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dates (Purchase & Expiry) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Purchase Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => {
                  setPurchaseDate(e.target.value);
                  runAutoEstimate(name, location, e.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Expiry Date {expirySource === 'estimated' && <span className="text-emerald-400">(Auto)</span>}
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => {
                  setExpiryDate(e.target.value);
                  setExpirySource('manual');
                }}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Estimation Hint Callout */}
          {estimateDetails && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs text-emerald-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Estimated shelf life: <strong>{estimateDetails.shelf_life_days} days</strong></span>
              </span>
              <span className="text-[10px] text-emerald-400/80 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                20% safe buffer added
              </span>
            </div>
          )}

          {/* Price & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Price (₹ optional)</label>
              <input
                type="number"
                placeholder="e.g. 60"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <input
                type="text"
                placeholder="e.g. dairy, vegetable"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none capitalize"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Add to Pantry'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
