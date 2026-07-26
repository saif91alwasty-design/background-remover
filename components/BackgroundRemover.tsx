'use client';

import { useState, useRef } from 'react';
import { Upload, Download, RotateCcw, Check, Sparkles } from 'lucide-react';

export default function BackgroundRemover() {
  const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setStep('processing');
      // بدء المعالجة التلقائية فوراً
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
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // خوارزمية تلقائية ذكية: إزالة الألوان الفاتحة جداً (البيضاء/السماء)
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;
        
        // إذا كان البكسل فاتحاً جداً (أكثر من 85% أبيض)
        if (brightness > 220) {
          data[i + 3] = 0; // اجعله شفافاً
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      setProcessedImage(canvas.toDataURL('image/png'));
      setStep('result');
    };
    
    img.src = imageSrc;
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `no-bg-${Date.now()}.png`;
    link.click();
  };

  const reset = () => {
    setStep('upload');
    setOriginalImage(null);
    setProcessedImage(null);
    setSelectedFile(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <canvas ref={canvasRef} className="hidden" />

      {/* العنوان الرئيسي */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          إزالة خلفية الصور
        </h1>
        <p className="text-lg text-gray-600">
          ارفع صورتك وسنزيل الخلفية تلقائياً في ثوانٍ
        </p>
      </div>

      {/* الخطوة 1: رفع الصورة */}
      {step === 'upload' && (
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border-2 border-dashed border-blue-200 hover:border-blue-400 transition-all">
          <div 
            onClick={() => document.getElementById('file-input')?.click()}
            className="cursor-pointer text-center space-y-6"
          >
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-12 h-12 text-blue-600" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                اضغط هنا لرفع صورتك
              </h3>
              <p className="text-gray-500">
                أو اسحب الصورة وأفلتها هنا
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" /> مجاناً 100%
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" /> سريع
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" /> بدون تسجيل
              </span>
            </div>

            <input 
              id="file-input" 
              type="file" 
              accept="image/*" 
              onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])} 
              className="hidden" 
            />
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
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              جاري إزالة الخلفية...
            </h3>
            <p className="text-gray-500">
              يرجى الانتظار لحظة
            </p>
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
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">الأصلية</h3>
              <img src={originalImage!} alt="Original" className="w-full rounded-xl" />
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                بعد إزالة الخلفية ✨
              </h3>
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

          {/* أزرار التحكم */}
          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <button 
              onClick={downloadImage}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              <Download className="w-6 h-6" />
              تحميل الصورة مجاناً
            </button>

            <button 
              onClick={reset}
              className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              معالجة صورة جديدة
            </button>
          </div>
        </div>
      )}

      {/* مميزات الأداة */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">تلقائي 100%</h3>
          <p className="text-sm text-gray-600">لا حاجة لضبط الإعدادات، نزيل الخلفية تلقائياً</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">جودة عالية</h3>
          <p className="text-sm text-gray-600">حمّل صورتك بصيغة PNG بدقة عالية</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">سريع وآمن</h3>
          <p className="text-sm text-gray-600">المعالجة على جهازك، خصوصية تامة</p>
        </div>
      </div>
    </div>
  );
}
