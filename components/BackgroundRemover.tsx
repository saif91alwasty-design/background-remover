'use client';

import { useState, useRef } from 'react';
import { Upload, Download, RotateCcw, Check, Sparkles, Star, Zap, Shield, Image as ImageIcon, Crop } from 'lucide-react';

export default function BackgroundRemover() {
  const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'webp'>('png');
  const [downloadQuality, setDownloadQuality] = useState(100);
  
  // متغيرات تغيير الأبعاد
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [maintainRatio, setMaintainRatio] = useState<boolean>(true);
  const [originalDimensions, setOriginalDimensions] = useState({ w: 0, h: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setStep('processing');
      setTimeout(() => processImageAutomatically(e.target?.result as string), 100);
    };
    reader.readAsDataURL(file);
  };

  const processImageAutomatically = (imageSrc: string) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // حفظ الأبعاد الأصلية
      setOriginalDimensions({ w: img.width, h: img.height });
      setTargetWidth(img.width);
      setTargetHeight(img.height);

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // خوارزمية إزالة الخلفية
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;
        
        if (brightness > 220) {
          data[i + 3] = 0;
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      setProcessedImage(canvas.toDataURL('image/png'));
      setStep('result');
    };
    
    img.src = imageSrc;
  };

  // منطق تغيير الأبعاد مع الحفاظ على النسبة
  const handleWidthChange = (value: number) => {
    setTargetWidth(value);
    if (maintainRatio && originalDimensions.w > 0) {
      const ratio = originalDimensions.h / originalDimensions.w;
      setTargetHeight(Math.round(value * ratio));
    }
  };

  const handleHeightChange = (value: number) => {
    setTargetHeight(value);
    if (maintainRatio && originalDimensions.h > 0) {
      const ratio = originalDimensions.w / originalDimensions.h;
      setTargetWidth(Math.round(value * ratio));
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;

    // إنشاء كانفاس جديد للأبعاد المطلوبة
    const resizeCanvas = document.createElement('canvas');
    resizeCanvas.width = targetWidth;
    resizeCanvas.height = targetHeight;
    const ctx = resizeCanvas.getContext('2d')!;

    const img = new Image();
    img.onload = () => {
      // رسم الصورة المعالجة بالأبعاد الجديدة
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      const link = document.createElement('a');
      if (downloadFormat === 'webp') {
        link.href = resizeCanvas.toDataURL('image/webp', downloadQuality / 100);
        link.download = `resized-no-bg-${targetWidth}x${targetHeight}-${Date.now()}.webp`;
      } else {
        link.href = resizeCanvas.toDataURL('image/png');
        link.download = `resized-no-bg-${targetWidth}x${targetHeight}-${Date.now()}.png`;
      }
      link.click();
    };
    img.src = processedImage;
  };

  const reset = () => {
    setStep('upload');
    setOriginalImage(null);
    setProcessedImage(null);
    setSelectedFile(null);
    setDownloadFormat('png');
    setDownloadQuality(100);
    setTargetWidth(0);
    setTargetHeight(0);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <canvas ref={canvasRef} className="hidden" />

      {/* Banner Hostinger الاحترافي */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-700 to-blue-600 rounded-2xl p-6 md:p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 font-bold text-sm">استضافة موثوقة عالمياً</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">🚀 ابدأ موقعك الإلكتروني مع Hostinger</h2>
            <p className="text-purple-100 text-sm md:text-base mb-3">استضافة سريعة، آمنة، وبأسعار تبدأ من $2.99/شهر مع ضمان استعادة الأموال 30 يوماً</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs">
              <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> سرعة فائقة</span>
              <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> حماية SSL مجانية</span>
              <span className="flex items-center gap-1"><ImageIcon className="w-4 h-4" /> نطاق مجاني</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <a href="https://www.hostinger.com?REFERRALCODE=DUWSAIF91G7J" target="_blank" rel="noopener noreferrer" className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-center">
              <div className="text-lg">احصل على خصم 90%</div>
              <div className="text-sm opacity-90">سجل الآن →</div>
            </a>
          </div>
        </div>
      </div>

      {/* العنوان الرئيسي */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">إزالة خلفية الصور مجاناً</h1>
        <p className="text-lg text-gray-600">ارفع صورتك وسنزيل الخلفية تلقائياً في ثوانٍ - مع إمكانية تغيير الأبعاد</p>
      </div>

      {/* الخطوة 1: رفع الصورة */}
      {step === 'upload' && (
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border-2 border-dashed border-blue-200 hover:border-blue-400 transition-all">
          <div onClick={() => document.getElementById('file-input')?.click()} className="cursor-pointer text-center space-y-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">اضغط هنا لرفع صورتك</h3>
              <p className="text-gray-500">أو اسحب الصورة وأفلتها هنا</p>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> مجاناً 100%</span>
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> سريع</span>
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> بدون تسجيل</span>
            </div>
            <input id="file-input" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])} className="hidden" />
          </div>
        </div>
      )}

      {/* الخطوة 2: جاري المعالجة */}
      {step === 'processing' && (
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
            <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-blue-600 animate-pulse" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">جاري إزالة الخلفية...</h3>
            <p className="text-gray-500">يرجى الانتظار لحظة</p>
          </div>
          <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}

      {/* الخطوة 3: النتيجة */}
      {step === 'result' && (
        <div className="space-y-6">
          {/* عرض الصور */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">الصورة الأصلية</h3>
              <img src={originalImage!} alt="Original" className="w-full rounded-xl" />
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">بعد إزالة الخلفية ✨</h3>
              <div className="rounded-xl overflow-hidden border-2 border-gray-200" style={{ backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)', backgroundSize: '20px 20px' }}>
                <img src={processedImage!} alt="Processed" className="w-full" />
              </div>
            </div>
          </div>

          {/* خيارات تغيير الأبعاد والتحميل */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-lg p-6 border-2 border-green-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Crop className="w-6 h-6" />
              خيارات التحميل وتغيير الأبعاد
            </h3>
            
            {/* قسم تغيير الأبعاد */}
            <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <input 
                  type="checkbox" 
                  id="maintainRatio" 
                  checked={maintainRatio} 
                  onChange={(e) => setMaintainRatio(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="maintainRatio" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  الحفاظ على نسبة الأبعاد الأصلية (موصى به)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">العرض (بكسل)</label>
                  <input 
                    type="number" 
                    min="10"
                    value={targetWidth} 
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الارتفاع (بكسل)</label>
                  <input 
                    type="number" 
                    min="10"
                    value={targetHeight} 
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">الأبعاد الأصلية: {originalDimensions.w} × {originalDimensions.h} بكسل</p>
            </div>

            {/* خيارات الصيغة والجودة */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">صيغة الملف</label>
                <div className="flex gap-3">
                  <button onClick={() => setDownloadFormat('png')} className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${downloadFormat === 'png' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>PNG (جودة عالية)</button>
                  <button onClick={() => setDownloadFormat('webp')} className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${downloadFormat === 'webp' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>WebP (حجم أصغر)</button>
                </div>
              </div>
              {downloadFormat === 'webp' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">الجودة: {downloadQuality}%</label>
                  <input type="range" min="10" max="100" value={downloadQuality} onChange={(e) => setDownloadQuality(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
              )}
            </div>

            {/* أزرار التحكم */}
            <div className="flex gap-4 justify-center flex-wrap">
              <button onClick={downloadImage} className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-3 shadow-lg">
                <Download className="w-6 h-6" />
                تحميل الصورة ({targetWidth}×{targetHeight})
              </button>
              <button onClick={reset} className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all flex items-center gap-3">
                <RotateCcw className="w-6 h-6" />
                صورة جديدة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* محتوى SEO الغني (مختصر للحفاظ على الأداء) */}
      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 mt-12">
        <h2 className="text-3xl font-bold text-gray-900">أداة إزالة خلفية الصور وتغيير الأبعاد مجاناً</h2>
        <div className="prose prose-lg max-w-none text-gray-600 space-y-4">
          <p>أداة متكاملة تتيح لك <strong>إزالة خلفية الصور</strong> وتغيير أبعادها (Resize) بدقة عالية مجاناً. مثالية لأصحاب المتاجر الإلكترونية، المصممين، ومنشئي المحتوى.</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2">⚡ معالجة فورية</h4>
              <p className="text-sm text-gray-600">إزالة الخلفية وتغيير الحجم في ثوانٍ مباشرة على متصفحك.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2">📐 أبعاد مخصصة</h4>
              <p className="text-sm text-gray-600">تحكم كامل في عرض وارتفاع الصورة مع الحفاظ على النسب.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2">🔒 خصوصية تامة</h4>
              <p className="text-sm text-gray-600">لا يتم رفع صورك إلى أي خادم، كل شيء يحدث على جهازك.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer SEO */}
      <div className="bg-gray-100 rounded-2xl p-8 text-center text-gray-600">
        <p className="mb-4 text-sm">
          <strong>الكلمات المفتاحية:</strong> إزالة خلفية الصور، تغيير حجم الصور، background remover, image resizer, png transparent, webp converter
        </p>
        <p className="text-xs">© {new Date().getFullYear()} أداة إزالة خلفية الصور - جميع الحقوق محفوظة</p>
      </div>
    </div>
  );
}
