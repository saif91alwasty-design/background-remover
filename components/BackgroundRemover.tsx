'use client';

import { useState, useRef } from 'react';
import { Upload, Download, RotateCcw, Check, Sparkles, Wand2 } from 'lucide-react';
import { getTranslation } from '@/lib/translations';
import { Language } from '@/lib/languages';
import LanguageSwitcher from './LanguageSwitcher';

export default function BackgroundRemover({ lang }: { lang: string }) {
  const currentLang = lang as Language;
  const t = (key: string) => getTranslation(currentLang, key);
  const txt = (ar: string, en: string) => (currentLang === 'ar' ? ar : en);

  const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'webp'>('png');
  const [downloadQuality, setDownloadQuality] = useState(100);
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [maintainRatio, setMaintainRatio] = useState<boolean>(true);
  const [originalDimensions, setOriginalDimensions] = useState({ w: 0, h: 0 });
  const [tolerance, setTolerance] = useState(40);
  const [selectedColor, setSelectedColor] = useState<{r: number, g: number, b: number} | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setStep('processing');
      setTimeout(() => processImageAutomatically(e.target?.result as string), 100);
    };
    reader.readAsDataURL(file);
  };

  const colorDistance = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
    return Math.sqrt(
      Math.pow(r1 - r2, 2) + 
      Math.pow(g1 - g2, 2) + 
      Math.pow(b1 - b2, 2)
    );
  };

  const processImageAutomatically = (imageSrc: string) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      setOriginalDimensions({ w: img.width, h: img.height });
      setTargetWidth(img.width);
      setTargetHeight(img.height);
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // تحديد لون الخلفية
      let targetColor = selectedColor;
      if (!targetColor) {
        // الكشف التلقائي من الزوايا
        const corners = [
          {x: 0, y: 0},
          {x: canvas.width - 1, y: 0},
          {x: 0, y: canvas.height - 1},
          {x: canvas.width - 1, y: canvas.height - 1}
        ];
        
        let r = 0, g = 0, b = 0;
        corners.forEach(c => {
          const pixel = ctx.getImageData(c.x, c.y, 1, 1).data;
          r += pixel[0];
          g += pixel[1];
          b += pixel[2];
        });
        
        targetColor = {
          r: Math.round(r / 4),
          g: Math.round(g / 4),
          b: Math.round(b / 4)
        };
      }

      const maxDistance = tolerance * 2.55;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const distance = colorDistance(r, g, b, targetColor.r, targetColor.g, targetColor.b);

        if (distance <= maxDistance) {
          data[i + 3] = 0;
        } else if (distance <= maxDistance + 30) {
          const alpha = Math.round(255 * (distance - maxDistance) / 30);
          data[i + 3] = alpha;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setProcessedImage(canvas.toDataURL('image/png'));
      setStep('result');
    };
    img.src = imageSrc;
  };

  // النقر على Canvas لاختيار اللون
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    
    const ctx = canvas.getContext('2d')!;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    
    setSelectedColor({
      r: pixel[0],
      g: pixel[1],
      b: pixel[2]
    });
    
    // إعادة المعالجة فوراً
    if (originalImage) {
      processImageAutomatically(originalImage);
    }
  };

  const handleWidthChange = (value: number) => {
    setTargetWidth(value);
    if (maintainRatio && originalDimensions.w > 0) {
      setTargetHeight(Math.round(value * (originalDimensions.h / originalDimensions.w)));
    }
  };

  const handleHeightChange = (value: number) => {
    setTargetHeight(value);
    if (maintainRatio && originalDimensions.h > 0) {
      setTargetWidth(Math.round(value * (originalDimensions.w / originalDimensions.h)));
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const resizeCanvas = document.createElement('canvas');
    resizeCanvas.width = targetWidth;
    resizeCanvas.height = targetHeight;
    const ctx = resizeCanvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      const link = document.createElement('a');
      if (downloadFormat === 'webp') {
        link.href = resizeCanvas.toDataURL('image/webp', downloadQuality / 100);
        link.download = `resized-${targetWidth}x${targetHeight}-${Date.now()}.webp`;
      } else {
        link.href = resizeCanvas.toDataURL('image/png');
        link.download = `resized-${targetWidth}x${targetHeight}-${Date.now()}.png`;
      }
      link.click();
    };
    img.src = processedImage;
  };

  const reset = () => {
    setStep('upload');
    setOriginalImage(null);
    setProcessedImage(null);
    setSelectedColor(null);
    setTolerance(40);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      {/* Canvas مخفي للمعالجة فقط */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex justify-end">
        <LanguageSwitcher currentLang={currentLang} />
      </div>

      {/* Banner Hostinger */}
      <a href="https://www.hostinger.com?REFERRALCODE=DUWSAIF91G7J" target="_blank" rel="noopener noreferrer" className="block bg-gradient-to-r from-purple-900 via-purple-700 to-blue-600 rounded-2xl p-6 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-right">
            <h2 className="text-2xl font-bold mb-2">🚀 {txt('ابدأ موقعك مع Hostinger', 'Start Your Website with Hostinger')}</h2>
            <p className="text-purple-100 text-sm">{txt('استضافة من $2.99/شهر', 'Hosting from $2.99/month')}</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold px-6 py-3 rounded-xl text-center">
            {txt('خصم 90%', 'Get 90% OFF')}
          </div>
        </div>
      </a>

      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-gray-900">{txt('إزالة خلفية الصور بالذكاء الاصطناعي 2026', 'AI Background Remover 2026')}</h1>
        <p className="text-lg text-gray-600">{txt('دقة عالية - نتائج احترافية في ثوانٍ', 'High Accuracy - Professional Results in Seconds')}</p>
      </div>

      {step === 'upload' && (
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border-2 border-dashed border-blue-200">
          <div onClick={() => document.getElementById('file-input')?.click()} className="cursor-pointer text-center space-y-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('uploadTitle')}</h3>
              <p className="text-gray-500">{t('uploadSubtitle')}</p>
            </div>
            <input id="file-input" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])} className="hidden" />
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center space-y-6">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-2xl font-bold text-gray-800">{t('processing')}</h3>
        </div>
      )}

      {step === 'result' && (
        <div className="space-y-6">
          {/* أدوات التحكم */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-blue-600" />
              {txt('أدوات التحسين', 'Optimization Tools')}
            </h3>
            
            <div className="bg-white rounded-xl p-4 mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {txt('الحساسية', 'Tolerance')}: {tolerance}%
              </label>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={tolerance} 
                onChange={(e) => {
                  setTolerance(Number(e.target.value));
                  if (originalImage) processImageAutomatically(originalImage);
                }}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                {txt('زد النسبة لإزالة المزيد، قللها للحفاظ على التفاصيل', 'Increase to remove more, decrease to preserve details')}
              </p>
            </div>

            {selectedColor && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">{txt('اللون المحدد:', 'Selected Color:')}</span>
                <div 
                  className="w-8 h-8 rounded border-2 border-gray-300"
                  style={{ backgroundColor: `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})` }}
                />
                <button
                  onClick={() => {
                    setSelectedColor(null);
                    if (originalImage) processImageAutomatically(originalImage);
                  }}
                  className="text-red-600 text-sm hover:underline"
                >
                  {txt('إلغاء', 'Clear')}
                </button>
              </div>
            )}

            <p className="text-sm text-blue-700 mt-4">
              {txt('💡 انقر على الصورة الأصلية لاختيار لون الخلفية يدوياً', '💡 Click on the original image to select background color manually')}
            </p>
          </div>

          {/* عرض الصور - Canvas مرئي للنقر */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">{t('original')}</h3>
              <canvas 
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="w-full rounded-xl cursor-crosshair border border-gray-200"
              />
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">{t('result')}</h3>
              <div 
                className="rounded-xl overflow-hidden border-2 border-gray-200"
                style={{ 
                  backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                  backgroundSize: '20px 20px'
                }}
              >
                <img src={processedImage!} alt="Processed" className="w-full" />
              </div>
            </div>
          </div>

          {/* خيارات التحميل */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t('resizeOptions')}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('width')}</label>
                <input type="number" min="10" value={targetWidth} onChange={(e) => handleWidthChange(Number(e.target.value))} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('height')}</label>
                <input type="number" min="10" value={targetHeight} onChange={(e) => handleHeightChange(Number(e.target.value))} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={downloadImage} className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-bold">
                {t('download')}
              </button>
              <button onClick={reset} className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold">
                {t('newImage')}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-100 rounded-2xl p-8 text-center text-gray-600">
        <p>© {new Date().getFullYear()} Free Background Remover</p>
      </footer>
    </div>
  );
}
