import React, { useState, useRef, useEffect } from 'react';
import { X, ScanBarcode, Search, Check, Sparkles, Camera, CameraOff, AlertCircle } from 'lucide-react';
import { lookupBarcode } from '../api';

export default function BarcodeLookupModal({ isOpen, onClose, onProductSelected }) {
  const [activeMode, setActiveMode] = useState('manual'); // 'manual' | 'camera'
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [product, setProduct] = useState(null);

  // Camera scanner states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const sampleBarcodes = [
    { label: 'Maggi Noodles', code: '8901058852271' },
    { label: 'Parle-G Biscuits', code: '8901719101038' },
    { label: 'Tata Salt', code: '8904043901007' },
    { label: 'Amul Butter', code: '8901262010054' },
  ];

  // Stop camera stream safely
  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Start live camera scanner
  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);

      // Start detection loop if BarcodeDetector is supported
      if ('BarcodeDetector' in window) {
        const formats = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'];
        const detector = new window.BarcodeDetector({ formats });

        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const detected = await detector.detect(videoRef.current);
            if (detected && detected.length > 0) {
              const code = detected[0].rawValue;
              stopCamera();
              setBarcode(code);
              setActiveMode('manual');
              handleSearch(code);
            }
          } catch (e) {
            // Frame detection error, continue next tick
          }
        }, 300);
      } else {
        setCameraError('Live barcode auto-detection requires Chrome/Edge/Android. You can view the camera and type the numbers below.');
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setCameraError('Camera access was denied or is not available. Please enter the barcode number manually.');
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setProduct(null);
      setError('');
      setBarcode('');
    }
    return () => stopCamera();
  }, [isOpen]);

  useEffect(() => {
    if (activeMode === 'camera' && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [activeMode, isOpen]);

  const handleSearch = async (codeToSearch) => {
    const code = (codeToSearch || barcode).trim();
    if (!code) {
      setError('Please enter a barcode number');
      return;
    }

    setLoading(true);
    setError('');
    setProduct(null);

    try {
      const data = await lookupBarcode(code);
      setProduct(data);
    } catch (err) {
      setError(err.message || 'Product not found in Open Food Facts database');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (!product) return;
    onProductSelected({
      name: product.name,
      category: product.category,
      image: product.image || '',
      price: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-emerald-950/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <ScanBarcode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Barcode Scanner</h2>
              <p className="text-xs text-slate-400">Lookup product info via Open Food Facts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="mt-4 p-1 rounded-2xl bg-slate-100 flex gap-1">
          <button
            type="button"
            onClick={() => setActiveMode('manual')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeMode === 'manual'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Type / Search</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('camera')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeMode === 'camera'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>
        </div>

        {/* Camera View Mode */}
        {activeMode === 'camera' && (
          <div className="mt-4 space-y-3">
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-200">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Target Scan Box overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                <div className="w-48 h-28 border-2 border-emerald-400/80 rounded-2xl relative shadow-lg">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-400/60 animate-pulse" />
                  <span className="absolute -bottom-6 left-0 right-0 text-center text-[10px] text-white font-bold bg-black/60 py-0.5 rounded-full">
                    Align barcode inside box
                  </span>
                </div>
              </div>
            </div>

            {cameraError && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>
        )}

        {/* Input Form */}
        <div className="mt-4">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Barcode / EAN Number</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 8901058852271"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
            >
              {loading ? 'Searching...' : 'Lookup'}
            </button>
          </div>
        </div>

        {/* Quick Sample Barcodes */}
        <div className="mt-3">
          <span className="text-[11px] font-bold text-slate-400 block mb-1.5">Quick Try Indian FMCG Packets:</span>
          <div className="flex flex-wrap gap-1.5">
            {sampleBarcodes.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setBarcode(sample.code);
                  handleSearch(sample.code);
                }}
                className="text-[11px] bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/80 px-2.5 py-1 rounded-xl font-bold transition"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        {/* Product Result Card */}
        {product && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 animate-in fade-in">
            <div className="flex gap-3">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-contain rounded-xl bg-white p-1 border border-emerald-100 shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 text-xs font-bold">
                  No Photo
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                  {product.brand || 'Verified Food Product'}
                </span>
                <h4 className="text-sm font-black text-slate-800 truncate">{product.name}</h4>
                <p className="text-xs text-slate-500 capitalize mt-0.5">{product.category}</p>
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Autofill in "Add Item" Form →</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
