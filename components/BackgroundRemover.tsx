'use client';

import { useState, useRef } from 'react';
import { Upload, Download, RotateCcw, Check, Sparkles, Star, Zap, Shield, Image as ImageIcon, Crop, HelpCircle, Wand2, Target } from 'lucide-react';
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // إعدادات الخلفية المتقدمة
  const [tolerance, setTolerance] = useState(40);
  const [smoothness, setSmoothness] = useState(3);
  const [selectedColor, setSelectedColor] = useState<{r: number, g: number, b: number} | null>(null);
  const [useSmartDetection, setUseSmartDetection] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setStep('processing');
      setTimeout(() => processImageAutomatically(e.target?.result as string), 100);
    };
    reader.readAsDataURL(file);
  };

  // حساب المسافة بين لونين (Euclidean Distance)
  const colorDistance = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) => {
    return Math.sqrt(
      Math.pow(r1 - r2, 2) + 
      Math.pow(g1 - g2, 2) + 
      Math.pow(b1 - b2, 2)
    );
  };

  // الكشف الذكي عن لون الخلفية (من الزوايا والحواف)
  const detectBackgroundColor = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const corners = [
      {x: 0, y: 0},
      {x: width - 1, y: 0},
      {x: 0, y: height - 1},
      {x: width - 1, y: height - 1}
    ];

    const colors: {r: number, g: number, b: number}[] = [];

    // أخذ عينات من الزوايا
    corners.forEach(corner => {
      const pixel = ctx.getImageData(corner.x, corner.y, 1, 1).data;
      colors.push({ r: pixel[0], g: pixel[1], b: pixel[2] });
    });

    // أخذ عينات من الحواف (كل 10 بكسل)
    for (let i = 0; i < width; i += 10) {
      const top = ctx.getImageData(i, 0, 1, 1).data;
      const bottom = ctx.getImageData(i, height - 1, 1, 1).data;
      colors.push({ r: top[0], g: top[1], b: top[2] });
      colors.push({ r: bottom[0], g: bottom[1], b: bottom[2] });
    }

    for (let i = 0; i < height; i += 10) {
      const left = ctx.getImageData(0, i, 1, 1).data;
      const right = ctx.getImageData(width - 1, i, 1, 1).data;
      colors.push({ r: left[0], g: left[1], b: left[2] });
      colors.push({ r: right[0], g: right[1], b: right[2] });
    }

    // حساب اللون المتوسط
    const avgColor = colors.reduce((acc, color) => ({
      r: acc.r + color.r,
      g: acc.g + color.g,
      b: acc.b + color.b
    }), { r: 0, g: 0, b: 0 });

    return {
      r: Math.round(avgColor.r / colors.length),
      g: Math.round(avgColor.g / colors.length),
      b: Math.round(avgColor.b / colors.length)
    };
  };

  // خوارزمية تنعيم الحواف (Edge Smoothing)
  const smoothEdges = (ctx: CanvasRenderingContext2D, width: number, height: number, radius: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const newData = new Uint8ClampedArray(data);

    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        const idx = (y * width + x) * 4;
        
        // إذا كان البكسل شبه شفاف
        if (data[idx + 3] > 0 && data[idx + 3] < 255) {
          let alphaSum = data[idx + 3];
          let count = 1;

          // أخذ متوسط من البكسلات المحيطة
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              if (dx === 0 && dy === 0) continue;
              const neighborIdx = ((y + dy) * width + (x + dx)) * 4;
              alphaSum += data[neighborIdx + 3];
              count++;
            }
          }

          newData[idx + 3] = Math.round(alphaSum / count);
        }
      }
    }

    return new ImageData(newData, width, height);
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

      // الكشف الذكي عن لون الخلفية
      let targetColor = selectedColor;
      if (useSmartDetection && !targetColor) {
        targetColor = detectBackgroundColor(ctx, canvas.width, canvas.height);
      } else if (!targetColor) {
        // افتراضي: أبيض أو فاتح جداً
        targetColor = { r: 255, g: 255, b: 255 };
      }

      // تطبيق الخوارزمية المتقدمة
      const maxDistance = tolerance * 2.55; // تحويل النسبة إلى مسافة

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const distance = colorDistance(r, g, b, targetColor.r, targetColor.g, targetColor.b);

        if (distance <= maxDistance) {
          // إزالة كاملة
          data[i + 3] = 0;
        } else if (distance <= maxDistance + 50) {
          // إزالة تدريجية للحواف
          const alpha = Math.round(255 * (distance - maxDistance) / 50);
          data[i + 3] = alpha;
        }
      }

      // تنعيم الحواف
      const smoothedData = smoothEdges(ctx, canvas.width, canvas.height, smoothness);
      ctx.putImageData(smoothedData, 0, 0);

      setProcessedImage(canvas.toDataURL('image/png'));
      setStep('result');
    };
    img.src = imageSrc;
  };

  // اختيار لون الخلفية بالنقر على الصورة
  const handleImageClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageRef.current || !canvasRef.current) return;
    
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
    setSmoothness(3);
  };

  const faqs = [
    {
      question: txt('كيف أحصل على أفضل نتائج لإزالة الخلفية؟', 'How can I get the best background removal results?'),
      answer: txt('استخدم صوراً بخلفية موحدة اللون. اضبط شريط "الحساسية" حسب الحاجة (40-60% مثالي). انقر على لون الخلفية في الصورة لتحديده يدوياً إذا لزم الأمر.', 'Use images with uniform background. Adjust the tolerance slider as needed (40-60% is ideal). Click on the background color in the image to select it manually if needed.'),
    },
    {
      question: txt('ماذا أفعل إذا لم تكن الإزالة دقيقة؟', 'What if the removal is not accurate?'),
      answer: txt('1) انقر مباشرة على لون الخلفية في الصورة لتحديده بدقة. 2) اضبط "الحساسية" - زد النسبة إذا لم تُزال الخلفية، أو قللها إذا أُزيل جزء من الصورة. 3) اضبط "تنعيم الحواف" لتحسين المظهر.', '1) Click directly on the background color in the image to select it accurately. 2) Adjust tolerance - increase if background not removed, decrease if parts of image are removed. 3) Adjust edge smoothing for better appearance.'),
    },
    {
      question: txt('هل يمكن إزالة خلفية الصور للهاتف؟', 'Can I remove background from mobile photos?'),
      answer: txt('نعم! موقعنا يعمل على جميع الهواتف (أندرويد وآيفون) بدون تطبيقات. فقط افتح المتصفح وارفع الصورة.', 'Yes! Our site works on all phones (Android & iPhone) without apps. Just open the browser and upload the image.'),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <canvas ref={canvasRef} className="hidden" />

      {/* زر تبديل اللغة */}
      <div className="flex justify-end">
        <LanguageSwitcher currentLang={currentLang} />
      </div>

      {/* Banner Hostinger */}
      <a 
        href="https://www.hostinger.com?REFERRALCODE=DUWSAIF91G7J"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-gradient-to-r from-purple-900 via-purple-700 to-blue-600 rounded-2xl p-6 md:p-8 text-white shadow-2xl"
      >
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

      {/* العنوان الرئيسي */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-gray-900">{txt('إزالة خلفية الصور بالذكاء الاصطناعي 2026', 'AI Background Remover 2026')}</h1>
        <p className="text-lg text-gray-600">{txt('دقة عالية - نتائج احترافية في ثوانٍ', 'High Accuracy - Professional Results in Seconds')}</p>
      </div>

      {/* الخطوة 1: رفع */}
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

      {/* الخطوة 2: معالجة */}
      {step === 'processing' && (
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center space-y-6">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-2xl font-bold text-gray-800">{t('processing')}</h3>
        </div>
      )}

      {/* الخطوة 3: نتيجة مع أدوات التحكم */}
      {step === 'result' && (
        <div className="space-y-6">
          {/* أدوات التحكم المتقدمة */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-blue-600" />
              {txt('أدوات التحسين المتقدمة', 'Advanced Optimization Tools')}
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* الحساسية */}
              <div className="bg-white rounded-xl p-4">
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

              {/* تنعيم الحواف */}
              <div className="bg-white rounded-xl p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {txt('تنعيم الحواف', 'Edge Smoothing')}: {smoothness}px
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={smoothness} 
                  onChange={(e) => {
                    setSmoothness(Number(e.target.value));
                    if (originalImage) processImageAutomatically(originalImage);
                  }}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {txt('لجعل الحواف أكثر نعومة وطبيعية', 'To make edges smoother and more natural')}
                </p>
              </div>
            </div>

            {/* زر اختيار اللون */}
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => {
                  setUseSmartDetection(!useSmartDetection);
                  if (originalImage) processImageAutomatically(originalImage);
                }}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                  useSmartDetection ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Target className="w-5 h-5" />
                {txt('الكشف التلقائي', 'Auto Detect')}
              </button>
              
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
            </div>

            <p className="text-sm text-blue-700 mt-4 flex items-center gap-2">
              <Target className="w-4 h-4" />
              {txt('💡 انقر على أي مكان في الصورة لاختيار لون الخلفية يدوياً', '💡 Click anywhere on the image to select background color manually')}
            </p>
          </div>

          {/* عرض الصور */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">{t('original')}</h3>
              <img src={originalImage!} alt="Original" className="w-full rounded-xl" />
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

      {/* الأسئلة الشائعة */}
      <section className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          <HelpCircle className="w-10 h-10 text-blue-600 inline mr-2" />
          {txt('الأسئلة الشائعة', 'FAQ')}
        </h2>
        <div className="space-y-3 max-w-4xl mx-auto">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-right hover:bg-gray-50"
              >
                <span className="font-bold text-gray-800 text-lg">{faq.question}</span>
                <span className={`text-2xl text-blue-600 transition-transform ${openFaq === idx ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-gray-600 border-t border-gray-100 pt-4">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 rounded-2xl p-8 text-center text-gray-600">
        <p>© {new Date().getFullYear()} Free Background Remover</p>
      </footer>
    </div>
  );
}
