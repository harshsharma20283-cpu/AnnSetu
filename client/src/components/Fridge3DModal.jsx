import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Play, RotateCcw, Sparkles, ArrowRight } from 'lucide-react';

const TOTAL_FRAMES = 120;

export default function Fridge3DModal({ isOpen, onClose, onEnterPantry }) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const animFrameIdRef = useRef(null);

  const getFramePath = (index) => {
    const padded = String(index).padStart(4, '0');
    return `/frames/frame_${padded}.webp`;
  };

  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = imagesRef.current[frameIndex - 1];
    if (!img || !img.complete) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // 6px crop to remove video compression border artifacts
    const cropInset = 6;
    const cropX = cropInset;
    const cropY = cropInset;
    const cropW = img.naturalWidth - cropInset * 2;
    const cropH = img.naturalHeight - cropInset * 2;

    const imgRatio = cropW / cropH;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth, drawHeight;
    if (canvasRatio > imgRatio) {
      drawHeight = canvasHeight * 0.92;
      drawWidth = drawHeight * imgRatio;
    } else {
      drawWidth = canvasWidth * 0.92;
      drawHeight = drawWidth / imgRatio;
    }

    const offsetX = (canvasWidth - drawWidth) / 2;
    const offsetY = (canvasHeight - drawHeight) / 2;

    // Gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    bgGrad.addColorStop(0, '#8c9983');
    bgGrad.addColorStop(0.5, '#9aa892');
    bgGrad.addColorStop(1, '#b0bba9');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Seamless edge extensions
    if (offsetX > 0) {
      ctx.drawImage(img, cropX, cropY, 12, cropH, 0, offsetY, offsetX + 1, drawHeight);
      ctx.drawImage(img, cropX + cropW - 12, cropY, 12, cropH, offsetX + drawWidth - 1, offsetY, canvasWidth - (offsetX + drawWidth) + 1, drawHeight);
    }
    if (offsetY > 0) {
      ctx.drawImage(img, cropX, cropY, cropW, 12, offsetX, 0, drawWidth, offsetY + 1);
      ctx.drawImage(img, cropX, cropY + cropH - 12, cropW, 12, offsetX, offsetY + drawHeight - 1, drawWidth, canvasHeight - (offsetY + drawHeight) + 1);

      if (offsetX > 0) {
        ctx.drawImage(img, cropX, cropY, 12, 12, 0, 0, offsetX + 1, offsetY + 1);
        ctx.drawImage(img, cropX + cropW - 12, cropY, 12, 12, offsetX + drawWidth - 1, 0, canvasWidth - (offsetX + drawWidth) + 1, offsetY + 1);
        ctx.drawImage(img, cropX, cropY + cropH - 12, 12, 12, 0, offsetY + drawHeight - 1, offsetX + 1, canvasHeight - (offsetY + drawHeight) + 1);
        ctx.drawImage(img, cropX + cropW - 12, cropY + cropH - 12, 12, 12, offsetX + drawWidth - 1, offsetY + drawHeight - 1, canvasWidth - (offsetX + drawWidth) + 1, canvasHeight - (offsetY + drawHeight) + 1);
      }
    }

    ctx.drawImage(img, cropX, cropY, cropW, cropH, offsetX, offsetY, drawWidth, drawHeight);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const images = [];

    const firstImg = new Image();
    firstImg.src = getFramePath(1);
    firstImg.onload = () => {
      if (!isMounted) return;
      setLoadedCount((c) => c + 1);
      drawFrame(1);
    };
    images[0] = firstImg;

    for (let i = 2; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        if (!isMounted) return;
        setLoadedCount((prev) => prev + 1);
      };
      images[i - 1] = img;
    }

    imagesRef.current = images;

    return () => {
      isMounted = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isOpen, drawFrame]);

  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      drawFrame(currentFrame);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, currentFrame, drawFrame]);

  const playAnimation = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    let startFrame = currentFrame >= TOTAL_FRAMES ? 1 : currentFrame;

    const step = () => {
      startFrame += 1;
      if (startFrame <= TOTAL_FRAMES) {
        setCurrentFrame(startFrame);
        drawFrame(startFrame);
        animFrameIdRef.current = requestAnimationFrame(step);
      } else {
        setIsPlaying(false);
      }
    };
    animFrameIdRef.current = requestAnimationFrame(step);
  };

  const resetAnimation = () => {
    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    setIsPlaying(false);
    setCurrentFrame(1);
    drawFrame(1);
  };

  const handleSlider = (e) => {
    const val = parseInt(e.target.value, 10);
    setCurrentFrame(val);
    drawFrame(val);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#8c9983] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-white/20">
        
        {/* Top Controls Header */}
        <div className="p-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950/70 backdrop-blur-md text-emerald-400 flex items-center justify-center border border-white/10 shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white drop-shadow">Interactive 3D Refrigerator</h3>
              <p className="text-xs text-slate-200 drop-shadow">Drag slider or hit Auto Play to open the doors</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center border border-white/10 shadow-lg transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Display */}
        <div className="absolute inset-0 w-full h-full">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>

        {/* Bottom Interactive Controls Bar */}
        <div className="p-6 z-20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          
          {/* Scrubber Slider */}
          <div className="flex items-center gap-3 w-full sm:max-w-md">
            <span className="text-xs font-mono font-bold text-white drop-shadow">1</span>
            <input
              type="range"
              min="1"
              max={TOTAL_FRAMES}
              value={currentFrame}
              onChange={handleSlider}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <span className="text-xs font-mono font-bold text-white drop-shadow">{TOTAL_FRAMES}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={isPlaying ? resetAnimation : playAnimation}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950/80 hover:bg-slate-950 text-white text-xs font-bold border border-white/15 shadow-xl transition active:scale-95"
            >
              {isPlaying ? <RotateCcw className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />}
              <span>{isPlaying ? 'Reset' : 'Auto Play'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEnterPantry();
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-xl transition active:scale-95"
            >
              <span>Enter My Fridge</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
