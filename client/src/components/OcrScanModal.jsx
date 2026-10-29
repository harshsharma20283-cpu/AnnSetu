import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Clock, 
  Calendar,
  Tag,
  Loader2,
  RefreshCw,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { performGroceryOCR } from '../utils/ocrParser';

export default function OcrScanModal({ isOpen, onClose, onDataDetected }) {
  const [activeMode, setActiveMode] = useState('camera'); // 'camera' | 'upload'
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Live Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera stream safely
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Start live webcam or phone camera
  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Camera access was blocked or is not available. Please allow camera permissions in browser, or use the "Upload File" tab.');
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeMode === 'camera' && !imagePreview) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen, activeMode, imagePreview]);

  // Reset when closing
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setImagePreview(null);
      setResult(null);
      setError('');
      setProgressMsg('');
      setActiveMode('camera');
    }
  }, [isOpen]);

  // Snap photo from live video feed
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !cameraActive) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        stopCamera();
        await handleFile(blob);
      }, 'image/jpeg', 0.95);
    } catch (e) {
      console.error('Frame capture failed', e);
      setError('Could not capture photo from camera. Please try again.');
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setResult(null);

    // Create local object URL for preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    setLoading(true);
    setProgressMsg('AI Text Engine initializing...');

    try {
      setProgressMsg('Scanning packet for Best Before / Expiry Date...');
      const ocrData = await performGroceryOCR(file);

      setResult(ocrData);

      if (ocrData.expiryDate) {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7'],
        });
      }
    } catch (err) {
      console.error('OCR process error:', err);
      setError(err.message || 'Could not detect clear text on packet. Please ensure the label is well lit and hold steady.');
    } finally {
      setLoading(false);
      setProgressMsg('');
    }
  };

  const handleApply = () => {
    if (!result) return;
    onDataDetected({
      expiryDate: result.expiryDate || '',
      mfgDate: result.mfgDate || '',
      price: result.price ? String(result.price) : '',
      name: result.detectedName || '',
      image: imagePreview || '',
    });
    onClose();
  };

  const handleReset = () => {
    setImagePreview(null);
    setResult(null);
    setError('');
    setProgressMsg('');
    if (activeMode === 'camera') {
      startCamera();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-emerald-950/10 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 font-bold">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Packet OCR Camera</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">AI</span>
              </div>
              <p className="text-xs text-slate-400">Point camera at Best Before or Expiry stamp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher: Camera vs Upload */}
        {!imagePreview && (
          <div className="mt-4 p-1 rounded-2xl bg-slate-100 flex gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveMode('camera');
                setImagePreview(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeMode === 'camera'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Camera</span>
            </button>
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setActiveMode('upload');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeMode === 'upload'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Upload Image</span>
            </button>
          </div>
        )}

        {/* 1. Live Camera Viewfinder */}
        {activeMode === 'camera' && !imagePreview && (
          <div className="mt-4 space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-200 shadow-inner">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />

              {/* Target Scan Frame */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                <div className="w-56 h-32 border-2 border-dashed border-emerald-400 rounded-2xl relative shadow-lg">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-400/60 animate-pulse" />
                  <span className="absolute -bottom-6 left-0 right-0 text-center text-[10px] text-white font-bold bg-black/60 py-0.5 rounded-full backdrop-blur-xs">
                    Align Expiry / Best Before stamp inside
                  </span>
                </div>
              </div>
            </div>

            {cameraError && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Snap Shutter Button */}
            <button
              type="button"
              onClick={capturePhoto}
              disabled={!cameraActive}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition"
            >
              <Camera className="w-5 h-5" />
              <span>📸 Take Photo & Scan Expiry Date</span>
            </button>
          </div>
        )}

        {/* 2. File Upload Zone */}
        {activeMode === 'upload' && !imagePreview && (
          <div className="mt-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-emerald-200 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/70 rounded-3xl cursor-pointer text-center transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white text-emerald-600 mx-auto flex items-center justify-center shadow-md shadow-emerald-500/10 group-hover:scale-105 transition mb-3">
                <Upload className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-sm font-black text-slate-800 mb-1">Select Food Packet Photo</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Choose a photo of the expiry date, manufacturing date, or price stamp from your computer or gallery.
              </p>
              <span className="inline-block mt-3 text-xs font-bold text-emerald-700 bg-white border border-emerald-200/80 px-4 py-1.5 rounded-full shadow-sm">
                Browse Files
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
            />
          </div>
        )}

        {/* 3. Photo Captured & Live OCR Analysis */}
        {imagePreview && (
          <div className="mt-4 space-y-4">
            
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-video max-h-56 flex items-center justify-center border border-slate-200">
              <img
                src={imagePreview}
                alt="Captured Packet"
                className="w-full h-full object-contain"
              />
              
              {loading && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
                  <span className="text-xs font-bold">{progressMsg}</span>
                  <span className="text-[10px] text-slate-300 mt-1">Reading printed expiry text...</span>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* OCR Detection Results */}
            {result && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>OCR Detection Results</span>
                  </span>
                  {result.confidence && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-emerald-700 border border-emerald-200">
                      {Math.round(result.confidence)}% Confidence
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" /> Expiry Date
                    </span>
                    <span className="text-sm font-black text-slate-800">
                      {result.expiryDate ? result.expiryDate : <span className="text-slate-400 text-xs font-medium">Not found</span>}
                    </span>
                    {result.rawExpiryMatch && (
                      <span className="text-[10px] text-emerald-600 block truncate mt-0.5 font-bold">
                        "{result.rawExpiryMatch}"
                      </span>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> Mfg / Pkg Date
                    </span>
                    <span className="text-sm font-black text-slate-800">
                      {result.mfgDate ? result.mfgDate : <span className="text-slate-400 text-xs font-medium">—</span>}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-500" /> Price / MRP
                    </span>
                    <span className="text-sm font-black text-slate-800">
                      {result.price ? `₹${result.price}` : <span className="text-slate-400 text-xs font-medium">—</span>}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                      Food Item
                    </span>
                    <span className="text-sm font-black text-slate-800">
                      {result.detectedName ? result.detectedName : <span className="text-slate-400 text-xs font-medium">—</span>}
                    </span>
                  </div>
                </div>

                {/* Raw text snippet accordion */}
                {result.rawText && (
                  <details className="text-[11px] text-slate-500">
                    <summary className="cursor-pointer font-bold text-slate-600 hover:text-emerald-700">
                      View Raw Extracted Text
                    </summary>
                    <pre className="mt-1.5 p-2 bg-white rounded-xl border border-slate-200 overflow-x-auto text-[10px] font-mono whitespace-pre-wrap max-h-24">
                      {result.rawText}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake Photo</span>
              </button>

              <button
                type="button"
                disabled={loading || !result}
                onClick={handleApply}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition"
              >
                <Check className="w-4 h-4" />
                <span>Autofill in "Add Item" Form →</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
