import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowDown, Play, RotateCcw, Sparkles, ShieldCheck, Lightbulb, Refrigerator, Leaf } from 'lucide-react';

const TOTAL_FRAMES = 120;

export default function FridgeCanvasHero({ onScrollToDashboard }) {
  const containerRef = useRef(null);
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

    // 6px crop to eliminate video compression black border artifacts
    const cropInset = 6;
    const cropX = cropInset;
    const cropY = cropInset;
    const cropW = img.naturalWidth - cropInset * 2;
    const cropH = img.naturalHeight - cropInset * 2;

    const imgRatio = cropW / cropH;
    const canvasRatio = canvasWidth / canvasHeight;

    const scale = 0.88;

    let drawWidth, drawHeight;
    if (canvasRatio > imgRatio) {
      drawHeight = canvasHeight * scale;
      drawWidth = drawHeight * imgRatio;
    } else {
      drawWidth = canvasWidth * scale;
      drawHeight = drawWidth / imgRatio;
    }

    const offsetX = (canvasWidth - drawWidth) / 2;
    const offsetY = (canvasHeight - drawHeight) / 2;

    // Studio background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    bgGrad.addColorStop(0, '#8c9983');
    bgGrad.addColorStop(0.5, '#9aa892');
    bgGrad.addColorStop(1, '#b0bba9');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Seamless edge extension
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
  }, [drawFrame]);

  useEffect(() => {
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
  }, [currentFrame, drawFrame]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || isPlaying) return;
      const rect = containerRef.current.getBoundingClientRect();
      const containerHeight = containerRef.current.offsetHeight - window.innerHeight;

      if (containerHeight <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.min(Math.max(scrolled / containerHeight, 0), 1);
      const frameIndex = Math.min(
        Math.max(Math.floor(progress * (TOTAL_FRAMES - 1)) + 1, 1),
        TOTAL_FRAMES
      );

      setCurrentFrame(frameIndex);
      drawFrame(frameIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [drawFrame, isPlaying]);

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

  const progress = (currentFrame - 1) / (TOTAL_FRAMES - 1);
  const contentFadeOpacity = progress > 0.85 ? Math.max(0, 1 - (progress - 0.85) / 0.12) : 1;

  return (
    <div ref={containerRef} className="relative h-[250vh] w-full bg-[#8c9983]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Fullscreen 3D Canvas */}
        <div className="absolute inset-0 w-full h-full">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>

        {/* Smooth Blend into #f5f8f5 Light Dashboard at the end */}
        <div
          className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#f5f8f5] via-[#f5f8f5]/80 to-transparent pointer-events-none transition-opacity duration-300"
          style={{ opacity: Math.max(0, (progress - 0.45) / 0.55) }}
        />

        {/* Loading Pill */}
        {loadedCount < TOTAL_FRAMES && (
          <div className="absolute top-6 left-8 z-20 bg-slate-950/75 backdrop-blur-md border border-white/10 text-xs text-white px-4 py-2 rounded-full flex items-center gap-2.5 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Preloading 3D frames: {Math.round((loadedCount / TOTAL_FRAMES) * 100)}%</span>
          </div>
        )}

        {/* 
          HERO OVERLAY (Matching Mockup "Fresh Food. Less Forgotten.") 
          Positioned on the side with clean center for the Refrigerator
        */}
        <div
          className="absolute top-12 left-6 sm:left-14 z-20 max-w-lg pointer-events-auto transition-opacity duration-200"
          style={{ opacity: contentFadeOpacity }}
        >
          {/* Badge (Matching Mockup) */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide shadow-xl mb-3">
            <Leaf className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
            <span>Smart Grocery Management</span>
          </div>

          {/* Big Hero Title (Matching Mockup) */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] leading-tight">
            Fresh Food.<br />
            <span className="text-emerald-300">Less Forgotten.</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base font-medium text-slate-100 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] max-w-md leading-relaxed">
            Track your groceries, monitor expiry, and keep your food fresh — always.
          </p>

          {/* Explore Button (Matching Mockup) */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={onScrollToDashboard}
              className="group flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-6 py-3 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all active:scale-95"
            >
              <span>Explore Dashboard</span>
              <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition" />
            </button>

            <button
              onClick={isPlaying ? resetAnimation : playAnimation}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-950/70 hover:bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-xl transition active:scale-95"
            >
              {isPlaying ? <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />}
              <span>{isPlaying ? 'Reset' : 'Auto Play 3D'}</span>
            </button>
          </div>
        </div>

        {/* 
          BOTTOM FEATURE PILLS (Matching Mockup exactly)
          🍏 Track Expiry | 🥗 Smart Suggestions | 🧊 Organized Fridge
        */}
        <div
          className="absolute bottom-10 inset-x-6 sm:inset-x-14 z-20 hidden md:flex items-center justify-between gap-4 pointer-events-auto transition-opacity duration-200"
          style={{ opacity: contentFadeOpacity }}
        >
          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 backdrop-blur-md border border-white/10 flex items-center gap-3 text-white shadow-xl">
              <span className="text-xl">🍏</span>
              <div>
                <span className="text-xs font-bold block">Track Expiry</span>
                <span className="text-[10px] text-slate-300">Never waste food</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 backdrop-blur-md border border-white/10 flex items-center gap-3 text-white shadow-xl">
              <span className="text-xl">🥗</span>
              <div>
                <span className="text-xs font-bold block">Smart Suggestions</span>
                <span className="text-[10px] text-slate-300">Eat healthier</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 backdrop-blur-md border border-white/10 flex items-center gap-3 text-white shadow-xl">
              <span className="text-xl">🧊</span>
              <div>
                <span className="text-xs font-bold block">Organized Fridge</span>
                <span className="text-[10px] text-slate-300">Everything in one place</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
