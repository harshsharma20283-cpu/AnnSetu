import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Calendar, Check, Camera, ScanBarcode, ArrowRight, Image as ImageIcon, FileText, X } from 'lucide-react';
import { getShelfLifeSuggestions, estimateItemExpiry, createItem, uploadGroceryPhoto } from '../../api';
import { performGroceryOCR } from '../../utils/ocrParser';
import OcrScanModal from '../OcrScanModal';
import confetti from 'canvas-confetti';

export default function AddItemTab({ onItemAdded, onOpenBarcode, initialData = null }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('vegetable');
  const [location, setLocation] = useState('fridge');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState('');
  const [alertDate, setAlertDate] = useState('');
  const [price, setPrice] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState('');
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [expirySource, setExpirySource] = useState('manual');
  const [estimateDetails, setEstimateDetails] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef(null);

  // Smart storage detector: Atta, Dal, Rice, Potatoes, Onions belong in room/pantry!
  const getSmartLocation = (itemName, cat) => {
    const text = (itemName + ' ' + (cat || '')).toLowerCase();
    const roomKeywords = [
      'atta', 'dal', 'rice', 'chawal', 'potato', 'aloo', 'onion', 'pyaaz', 
      'garlic', 'lehsun', 'ginger', 'adrak', 'besan', 'maida', 'flour', 
      'grain', 'biscuit', 'oil', 'masala', 'spice'
    ];
    if (roomKeywords.some((k) => text.includes(k))) return 'room';
    return 'fridge';
  };

  // Pre-fill if barcode scanned
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCategory(initialData.category || 'dairy');
      if (initialData.image) setPhotoUrl(initialData.image);
      const smartLoc = getSmartLocation(initialData.name, initialData.category);
      setLocation(smartLoc);
      if (initialData.price) setPrice(initialData.price);
    }
  }, [initialData]);

  // Autocomplete
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

  const runAutoEstimate = async (targetName, targetLocation, targetDate) => {
    if (!targetName || targetName.trim().length < 2) return;
    setIsEstimating(true);
    try {
      const est = await estimateItemExpiry(targetName.trim(), targetLocation, targetDate);
      if (est && est.expiry_date) {
        setExpiryDate(est.expiry_date);
        setAlertDate(est.alert_date || est.expiry_date);
        setExpirySource('estimated');
        if (est.category) setCategory(est.category);
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

    const smartLoc = getSmartLocation(sug.name, sug.category);
    setLocation(smartLoc);
    runAutoEstimate(sug.name, smartLoc, purchaseDate);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setOcrSuccessMsg('');
    setError('');

    try {
      // 1. Upload photo to server / storage
      const url = await uploadGroceryPhoto(file);
      setPhotoUrl(url);

      // 2. Automatically run OCR to detect Best Before / Expiry Date!
      setOcrScanning(true);
      try {
        const ocrData = await performGroceryOCR(file);
        if (ocrData.expiryDate) {
          setExpiryDate(ocrData.expiryDate);
          setAlertDate(ocrData.expiryDate);
          setExpirySource('printed');
          setOcrSuccessMsg(`✨ OCR Auto-Detected Expiry Date: ${ocrData.expiryDate} (from packet: "${ocrData.rawExpiryMatch || 'label'}")`);
          confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
        }
        if (ocrData.mfgDate && !purchaseDate) {
          setPurchaseDate(ocrData.mfgDate);
        }
        if (ocrData.price && !price) {
          setPrice(String(ocrData.price));
        }
        if (ocrData.detectedName && (!name || name.trim() === '')) {
          setName(ocrData.detectedName);
        }
      } catch (ocrErr) {
        console.warn('Background OCR notice:', ocrErr);
      } finally {
        setOcrScanning(false);
      }
    } catch (err) {
      setError('Photo upload failed: ' + err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleOcrData = (ocrResult) => {
    if (!ocrResult) return;
    if (ocrResult.expiryDate) {
      setExpiryDate(ocrResult.expiryDate);
      setAlertDate(ocrResult.expiryDate);
      setExpirySource('printed');
      setOcrSuccessMsg(`✨ OCR Auto-Detected Expiry: ${ocrResult.expiryDate}`);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    }
    if (ocrResult.mfgDate) {
      setPurchaseDate(ocrResult.mfgDate);
    }
    if (ocrResult.price) {
      setPrice(String(ocrResult.price));
    }
    if (ocrResult.name && (!name || name.trim() === '')) {
      setName(ocrResult.name);
    }
    if (ocrResult.image && !photoUrl) {
      setPhotoUrl(ocrResult.image);
    }
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
        photo_url: photoUrl || null,
        location,
        purchase_date: purchaseDate || null,
        expiry_date: expiryDate || null,
        alert_date: alertDate || null,
        expiry_source: expirySource,
        price: price ? parseFloat(price) : null,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });

      setSuccessMsg(`✓ Added "${name}" successfully to your ${location === 'room' ? 'Pantry Shelf' : 'Fridge'}!`);
      setTimeout(() => setSuccessMsg(''), 4000);

      setName('');
      setPhotoUrl('');
      setExpiryDate('');
      setAlertDate('');
      setPrice('');
      setEstimateDetails(null);
      onItemAdded();
    } catch (err) {
      setError(err.message || 'Failed to add item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEmoji = () => {
    const t = name.toLowerCase();
    if (t.includes('atta') || t.includes('flour') || t.includes('wheat')) return '🌾';
    if (t.includes('rice') || t.includes('chawal')) return '🍚';
    if (t.includes('dal') || t.includes('besan')) return '🥣';
    if (t.includes('potato') || t.includes('aloo')) return '🥔';
    if (t.includes('onion') || t.includes('pyaaz')) return '🧅';
    if (t.includes('milk') || t.includes('doodh')) return '🥛';
    if (t.includes('paneer') || t.includes('cheese')) return '🧀';
    if (t.includes('tomato')) return '🍅';
    if (t.includes('chilli') || t.includes('mirch')) return '🌶️';
    if (t.includes('spinach')) return '🥬';
    if (t.includes('egg')) return '🥚';
    if (t.includes('bread')) return '🍞';
    return '🥗';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          Add New Grocery
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Store in Fridge, Dry Pantry Shelves, or Freezer with smart shelf-life predictions
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 animate-in fade-in">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800">
          {error}
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-950/5 shadow-sm space-y-5">
        
        {/* Photo / Emoji Avatar Box with live photo upload */}
        <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Grocery item"
              className="w-20 h-20 rounded-2xl object-cover bg-white shadow-sm border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center text-4xl shrink-0">
              {getEmoji()}
            </div>
          )}

          <div>
            <h4 className="text-sm font-bold text-slate-800">Item Photo / Image</h4>
            <p className="text-xs text-slate-400 mt-0.5">Upload a picture or use auto-detected emoji</p>
            
            <div className="mt-2.5 flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto || ocrScanning}
                className="text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200/80 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-700" />
                <span>{uploadingPhoto ? 'Uploading...' : photoUrl ? 'Change Photo' : 'Upload Photo'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOcrModalOpen(true)}
                className="text-xs font-bold text-teal-800 bg-teal-100 hover:bg-teal-200/80 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 active:scale-95 shadow-sm"
                title="Scan packet with AI OCR to auto-detect Best Before / Expiry date"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                <span>AI Scan Packet (OCR)</span>
              </button>

              <button
                type="button"
                onClick={onOpenBarcode}
                className="text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 active:scale-95"
              >
                <ScanBarcode className="w-3.5 h-3.5 text-slate-600" />
                <span>Scan Barcode</span>
              </button>
            </div>

            {/* OCR Live Progress / Result Banner */}
            {ocrScanning && (
              <div className="mt-2.5 text-xs font-bold text-teal-700 flex items-center gap-2 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                <span>AI OCR reading packet for Best Before / Expiry Date...</span>
              </div>
            )}

            {ocrSuccessMsg && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-bold text-teal-900 flex items-center justify-between gap-2 animate-in fade-in">
                <span>{ocrSuccessMsg}</span>
                <button
                  type="button"
                  onClick={() => setOcrSuccessMsg('')}
                  className="w-5 h-5 rounded-full hover:bg-teal-100 flex items-center justify-center text-teal-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Item Name with live autocomplete */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Item Name *
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Atta, Dal, Rice, Milk, Paneer, Tomatoes, Eggs..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setShowSuggestions(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200);
                const smartLoc = getSmartLocation(name, category);
                setLocation(smartLoc);
                runAutoEstimate(name, smartLoc, purchaseDate);
              }}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition"
            />
            {isEstimating && (
              <span className="absolute right-4 top-3.5 text-xs text-emerald-600 font-semibold animate-pulse">
                Estimating...
              </span>
            )}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 divide-y divide-slate-100 overflow-hidden">
              {suggestions.map((sug, idx) => (
                <div
                  key={idx}
                  onMouseDown={() => handleSelectSuggestion(sug)}
                  className="p-3 hover:bg-emerald-50 cursor-pointer flex items-center justify-between text-xs transition"
                >
                  <span className="font-bold text-slate-800 capitalize">{sug.name}</span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full capitalize">
                    {sug.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Storage Location & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Storage Place * {location === 'room' && <span className="text-amber-700 font-semibold">(Pantry Recommended)</span>}
            </label>
            <select
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                runAutoEstimate(name, e.target.value, purchaseDate);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none font-medium"
            >
              <option value="room">🏠 Dry Pantry / Shelf (Room Temp)</option>
              <option value="fridge">❄️ Refrigerator</option>
              <option value="freezer">🧊 Deep Freezer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none capitalize"
            >
              <option value="grains">Grains, Atta & Dal 🌾</option>
              <option value="vegetable">Vegetables 🥦</option>
              <option value="dairy">Dairy 🥛</option>
              <option value="fruit">Fruits 🍎</option>
              <option value="bakery">Bakery 🍞</option>
              <option value="leftovers">Leftovers 🍛</option>
              <option value="meat">Meat & Poultry 🍗</option>
            </select>
          </div>
        </div>

        {/* Quantity + Unit */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Quantity</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="e.g. 5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 outline-none"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-28 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-sm text-slate-800 outline-none font-semibold"
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="packs">packs</option>
              <option value="pcs">pcs</option>
              <option value="litres">litres</option>
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Purchase Date *</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => {
                setPurchaseDate(e.target.value);
                runAutoEstimate(name, location, e.target.value);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Expiry Date {expirySource === 'estimated' && <span className="text-emerald-600">(Smart Auto)</span>}
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => {
                setExpiryDate(e.target.value);
                setExpirySource('manual');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 outline-none"
            />
          </div>
        </div>

        {/* Auto Estimation Banner */}
        {estimateDetails && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
            <span className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>
                Shelf life in {location === 'room' ? 'Pantry' : location === 'freezer' ? 'Freezer' : 'Fridge'}: {estimateDetails.shelf_life_days} days
              </span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              20% buffer included
            </span>
          </div>
        )}

        {/* Price */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Estimated Price (₹ optional)</label>
          <input
            type="number"
            placeholder="e.g. 60"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 outline-none"
          />
        </div>

        {/* Primary Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition active:scale-95 disabled:opacity-50"
        >
          <span>{isSubmitting ? 'Saving...' : 'Add to Inventory →'}</span>
        </button>

      </form>

      {/* OCR Scan Modal */}
      <OcrScanModal
        isOpen={isOcrModalOpen}
        onClose={() => setIsOcrModalOpen(false)}
        onDataDetected={handleOcrData}
      />

    </div>
  );
}
