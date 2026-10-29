import React, { useState } from 'react';
import { X, ScanBarcode, Search, Check, Sparkles, ExternalLink } from 'lucide-react';
import { lookupBarcode } from '../api';

export default function BarcodeLookupModal({ isOpen, onClose, onProductSelected }) {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [product, setProduct] = useState(null);

  const sampleBarcodes = [
    { label: 'Maggi Noodles', code: '8901058852271' },
    { label: 'Parle-G Biscuits', code: '8901719101038' },
    { label: 'Tata Salt', code: '8904043901007' },
    { label: 'Amul Butter', code: '8901262010054' },
  ];

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
      price: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
              <ScanBarcode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Packaged Item Barcode</h2>
              <p className="text-xs text-slate-400">Fetch details via Open Food Facts database</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Enter Barcode / EAN</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. 8901058852271"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-semibold transition active:scale-95"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Quick Sample Barcodes */}
        <div className="mt-3">
          <span className="text-[11px] text-slate-400 block mb-1.5">Try sample Indian FMCG items:</span>
          <div className="flex flex-wrap gap-1.5">
            {sampleBarcodes.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setBarcode(sample.code);
                  handleSearch(sample.code);
                }}
                className="text-[11px] bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 px-2.5 py-1 rounded-lg transition"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Product Result Card */}
        {product && (
          <div className="mt-5 p-4 rounded-2xl bg-slate-950 border border-slate-800 animate-in fade-in">
            <div className="flex gap-3">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-contain rounded-xl bg-slate-900 p-1 border border-slate-800 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0 text-xs">
                  No Image
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-semibold text-teal-400 tracking-wider">
                  {product.brand || 'Verified Product'}
                </span>
                <h4 className="text-sm font-bold text-white truncate">{product.name}</h4>
                <p className="text-xs text-slate-400 capitalize mt-0.5">{product.category}</p>
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Use Details in Add Item</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
