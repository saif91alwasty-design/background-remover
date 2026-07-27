'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Download, RotateCcw, Sparkles, Zap, Eraser, Undo2, Paintbrush, Pipette, RefreshCw } from 'lucide-react';

type Tool = 'pick' | 'erase' | 'restore';

interface BgColor {
  r: number;
  g: number;
  b: number;
}

export default function BackgroundRemover() {
  const [step, setStep] = useState<'upload' | 'result'>('upload');
  const [tolerance, setTolerance] = useState(43);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>('pick');
  const [bgColor, setBgColor] = useState<BgColor>({ r: 255, g: 255, b: 255 });
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const workCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const originalImageDataRef = useRef<ImageData | null>(null);
  const processedImageDataRef = useRef<ImageData | null>(null);
  const undoStackRef = useRef<Uint8ClampedArray[]>([]);
  const isDraggingRef = useRef(false);
  const imgDimensionsRef = useRef({ w: 0, h: 0 });

  const MAX_UNDO = 10;
  const MAX_DIM = 1200;

  const hexColor = useCallback(() => {
    return '#' + [bgColor.r, bgColor.g, bgColor.b]
      .map(c => c.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  }, [bgColor]);

  const detectBackgroundColor = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number): BgColor => {
    const samples = [
      {x: 0, y: 0}, {x: w-1, y: 0},
      {x: 0, y: h-1}, {x: w-1, y: h-1},
      {x: Math.floor(w/2), y: 0}, {x: Math.floor(w/2), y: h-1},
      {x: 0, y: Math.floor(h/2)}, {x: w-1, y: Math.floor(h/2)},
      {x: Math.floor(w/4), y: 0}, {x: Math.floor(3*w/4), y: 0},
      {x: 0, y: Math.floor(h/4)}, {x: 0, y: Math.floor(3*h/4)},
    ];

    const colorGroups: { key: string; count: number; r: number; g: number; b: number }[] = [];
    
    samples.forEach(pos => {
      if (pos.x >= 0 && pos.x < w && pos.y >= 0 && pos.y < h) {
        const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
        const key = `${Math.round(pixel[0]/16)*16},${Math.round(pixel[1]/16)*16},${Math.round(pixel[2]/16)*16}`;
        const existing = colorGroups.find(g => g.key === key);
        if (existing) {
          existing.count++;
          existing.r += pixel[0];
          existing.g += pixel[1];
          existing.b += pixel[2];
        } else {
          colorGroups.push({ key, count: 1, r: pixel[0], g: pixel[1], b: pixel[2] });
        }
      }
    });

    colorGroups.sort((a, b) => b.count - a.count);
    const dominant = colorGroups[0];
    return {
      r: Math.round(dominant.r / dominant.count),
      g: Math.round(dominant.g / dominant.count),
      b: Math.round(dominant.b / dominant.count)
    };
  }, []);

  const processImage = useCallback(() => {
    const originalData = originalImageDataRef.current;
    const workCanvas = workCanvasRef.current;
    if (!originalData || !workCanvas || isProcessing) return;

    setIsProcessing(true);
    const ctx = workCanvas.getContext('2d')!;
    
    requestAnimationFrame(() => {
      const w = originalData.width;
      const h = originalData.height;
      const src = originalData.data;
      const dst = new Uint8ClampedArray(src);

      const threshold = tolerance * 2.55;
      const feather = Math.max(20, threshold * 0.3);
      const bgLum = 0.299 * bgColor.r + 0.587 * bgColor.g + 0.114 * bgColor.b;
      const adaptiveThreshold = threshold * (bgLum < 50 ? 0.7 : bgLum > 200 ? 1.3 : 1.0);

      for (let i = 0; i < dst.length; i += 4) {
        const r = src[i], g = src[i+1], b = src[i+2];
        const dr = r - bgColor.r;
        const dg = g - bgColor.g;
        const db = b - bgColor.b;
        const distance = Math.sqrt(2*dr*dr + 4*dg*dg + 3*db*db) / 3;

        if (distance < adaptiveThreshold) {
          dst[i+3] = 0;
        } else if (distance < adaptiveThreshold + feather) {
          dst[i+3] = Math.round(255 * (distance - adaptiveThreshold) / feather);
        } else {
          dst[i+3] = 255;
        }
      }

      const newImageData = new ImageData(dst, w, h);
      processedImageDataRef.current = newImageData;
      ctx.putImageData(newImageData, 0, 0);
      setProcessedImage(workCanvas.toDataURL('image/png'));
      setIsProcessing(false);
    });
  }, [tolerance, bgColor, isProcessing]);

  const handleImageSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('الرجاء اختيار ملف صورة');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً. الحد الأقصى 10 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > MAX_DIM || h > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / w, MAX_DIM / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        imgDimensionsRef.current = { w, h };

        const origCanvas = originalCanvasRef.current!;
        const workCanvas = workCanvasRef.current!;
        origCanvas.width = w; origCanvas.height = h;
        workCanvas.width = w; workCanvas.height = h;

        const ctx = origCanvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        originalImageDataRef.current = ctx.getImageData(0, 0, w, h);

        const detected = detectBackgroundColor(ctx, w, h);
        setBgColor(detected);
        setStep('result');
        undoStackRef.current = [];

        setTimeout(() => processImage(), 100);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, [detectBackgroundColor, processImage]);

  const pushUndo = useCallback(() => {
    const data = processedImageDataRef.current?.data;
    if (!data) return;
    undoStackRef.current.push(new Uint8ClampedArray(data));
    if (undoStackRef.current.length > MAX_UNDO) undoStackRef.current.shift();
  }, []);

  const brushAt = useCallback((cx: number, cy: number, radius: number, mode: 'erase' | 'restore') => {
    const pData = processedImageDataRef.current;
    const oData = originalImageDataRef.current;
    if (!pData || !oData) return;

    const data = pData.data;
    const orig = oData.data;
    const w = pData.width;
    const h = pData.height;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx*dx + dy*dy > radius*radius) continue;
        const px = cx + dx, py = cy + dy;
        if (px < 0 || px >= w || py < 0 || py >= h) continue;
        const idx = (py * w + px) * 4;
        if (mode === 'erase') {
          data[idx + 3] = 0;
        } else {
          data[idx] = orig[idx];
          data[idx+1] = orig[idx+1];
          data[idx+2] = orig[idx+2];
          data[idx+3] = orig[idx+3];
        }
      }
    }

    const workCanvas = workCanvasRef.current!;
    workCanvas.getContext('2d')!.putImageData(pData, 0, 0);
    setProcessedImage(workCanvas.toDataURL('image/png'));
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = originalCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (currentTool === 'pick') {
      const ctx = canvas.getContext('2d')!;
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      setBgColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
      processImage();
    } else {
      pushUndo();
      brushAt(x, y, 15, currentTool);
    }
  }, [currentTool, processImage, pushUndo, brushAt]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || currentTool === 'pick') return;
    const canvas = originalCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    brushAt(x, y, 12, currentTool);
  }, [currentTool, brushAt]);

  const handleToleranceChange = useCallback((value: number) => {
    setTolerance(value);
    if (originalImageDataRef.current) {
      clearTimeout((window as any)._tolTimeout);
      (window as any)._tolTimeout = setTimeout(() => processImage(), 150);
    }
  }, [processImage]);

  const downloadImage = useCallback(() => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `bg-removed-${Date.now()}.png`;
    link.click();
  }, [processedImage]);

  const reset = useCallback(() => {
    setStep('upload');
    setProcessedImage(null);
    setTolerance(43);
    setCurrentTool('pick');
    setBgColor({ r: 255, g: 255, b: 255 });
    originalImageDataRef.current = null;
    processedImageDataRef.current = null;
    undoStackRef.current = [];
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  }, [handleImageSelect]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4" dir="rtl">
      <canvas ref={workCanvasRef} className="hidden" />
      
      <div className="text-center space-y-1 mb-4">
        <h1 className="text-2xl font-bold">🖼️ إزالة خلفية الصور</h1>
        <p className="text-sm text-gray-500">يعمل 100% في المتصفح — لا رفع للخادم</p>
      </div>

      {step === 'upload' ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-gray-800 hover:bg-gray-50 transition-all"
        >
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
            className="hidden"
          />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">اسحب صورة هنا أو انقر للاختيار</h3>
          <p className="text-xs text-gray-400">PNG, JPG, WEBP, BMP — حتى 10 ميجابايت</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Tolerance */}
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3 mb-2">
              <label className="text-sm font-medium whitespace-nowrap">الحساسية</label>
              <input 
                type="range" min="5" max="100" value={tolerance}
                onChange={(e) => handleToleranceChange(Number(e.target.value))}
                className="flex-1 accent-black"
              />
              <span className="text-sm font-medium w-10">{tolerance}%</span>
            </div>
            <p className="text-xs text-gray-400 text-center">زد النسبة لإزالة المزيد، قللها للحفاظ على التفاصيل</p>
          </div>

          {/* Tools */}
          <div className="bg-white rounded-xl p-3 shadow-sm border">
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'pick', icon: Pipette, label: 'اختيار لون' },
                { id: 'erase', icon: Eraser, label: 'مسح يدوي' },
                { id: 'restore', icon: Paintbrush, label: 'استعادة' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setCurrentTool(t.id as Tool)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                    currentTool === t.id 
                      ? 'bg-black text-white border-black' 
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              ))}
              <button
                onClick={() => {
                  const ctx = originalCanvasRef.current?.getContext('2d');
                  if (ctx) {
                    const d = detectBackgroundColor(ctx, imgDimensionsRef.current.w, imgDimensionsRef.current.h);
                    setBgColor(d);
                    processImage();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                إعادة ضبط
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">اللون المختار:</span>
              <div 
                className="w-6 h-6 rounded border-2 border-gray-300" 
                style={{ background: hexColor() }}
              />
              <span className="text-xs font-mono text-gray-500">{hexColor()}</span>
            </div>
          </div>

          {/* Images Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-3 shadow-sm border">
              <h4 className="text-sm font-medium mb-2 text-center flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                الصورة الأصلية
              </h4>
              <div className="relative rounded-lg overflow-hidden border">
                <canvas 
                  ref={originalCanvasRef}
                  onClick={handleCanvasClick}
                  onMouseDown={() => isDraggingRef.current = true}
                  onMouseUp={() => isDraggingRef.current = false}
                  onMouseLeave={() => isDraggingRef.current = false}
                  onMouseMove={handleCanvasMouseMove}
                  className="w-full cursor-crosshair"
                />
                <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                  💡 انقر لاختيار لون الخلفية
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 shadow-sm border">
              <h4 className="text-sm font-medium mb-2 text-center flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                النتيجة ✨
              </h4>
              <div 
                className="rounded-lg border overflow-hidden min-h-[200px] flex items-center justify-center"
                style={{
                  backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                  backgroundSize: '16px 16px'
                }}
              >
                {isProcessing ? (
                  <div className="w-10 h-10 border-3 border-gray-300 border-t-black rounded-full animate-spin" />
                ) : processedImage ? (
                  <img src={processedImage} alt="Result" className="w-full" />
                ) : (
                  <span className="text-gray-400 text-sm">جارٍ المعالجة...</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button 
              onClick={downloadImage}
              disabled={!processedImage || isProcessing}
              className="flex-1 bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              تحميل PNG
            </button>
            <button 
              onClick={reset}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              صورة جديدة
            </button>
          </div>

          {/* Tips */}
          <div className="bg-gray-50 rounded-xl p-4 border-r-4 border-black">
            <h4 className="text-sm font-medium mb-2">💡 نصائح للحصول على أفضل نتيجة:</h4>
            <ul className="text-xs text-gray-600 space-y-1 pr-4">
              <li>انقر على لون الخلفية في الصورة الأصلية لتحديده يدوياً</li>
              <li>اضبط الحساسية: 30-50% مثالي لمعظم الصور</li>
              <li>استخدم أداة \"مسح يدوي\" لإزالة بقايا الخلفية الصعبة</li>
              <li>الصور بخلفية موحدة تعطي أفضل النتائج</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
