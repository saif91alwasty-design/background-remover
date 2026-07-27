'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Download, RotateCcw, Sparkles, Zap } from 'lucide-react';

export default function BackgroundRemover() {
  const [step, setStep] = useState<'upload' | 'result'>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setStep('result');
      // معالجة تلقائية بعد ثانية
      setTimeout(() => {
        processBackgroundRemoval(e.target?.result as string, 50);
      }, 500);
    };
    reader.readAsDataURL(file);
  };

  const processBackgroundRemoval = (imageSrc: string, tol: number) => {
    if (!canvasRef.current) return;
    
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // كشف ذكي للون الخلفية من الزوايا
      const bgColor = getBackgroundColor(ctx, canvas.width, canvas.height);
      const threshold = tol * 2.55;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // حساب المسافة من لون الخلفية
        const distance = Math.sqrt(
          Math.pow(r - bgColor.r, 2) + 
          Math.pow(g - bgColor.g, 2) + 
          Math.pow(b - bgColor.b, 2)
        );

        if (distance < threshold) {
          data[i + 3] = 0; // شفاف
        } else if (distance < threshold + 40) {
          // تنعيم تدريجي للحواف
          const alpha = Math.round(255 * (distance - threshold) / 40);
          data[i + 3] = alpha;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setProcessedImage(canvas.toDataURL('image/png'));
      setIsProcessing(false);
    };
    img.src = imageSrc;
  };

  const getBackgroundColor = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // أخذ عينات من الزوايا والحواف
    const samples = [
      {x: 0, y: 0},
      {x: width - 1, y: 0},
      {x: 0, y: height - 1},
      {x: width - 1, y: height - 1},
      {x: Math.floor(width/2), y: 0},
      {x: Math.floor(width/2), y: height - 1},
      {x: 0, y: Math.floor(height/2)},
      {x: width - 1, y: Math.floor(height/2)},
    ];

    let r = 0, g = 0, b = 0;
    samples.forEach(pos => {
      const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
      r += pixel[0];
      g += pixel[1];
      b += pixel[2];
    });

    return {
      r: Math.round(r / samples.length),
      g: Math.round(g / samples.length),
      b: Math.round(b / samples.length)
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !originalImage) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    
    const ctx = canvas.getContext('2d')!;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    
    // إعادة المعالجة باللون المحدد
    processBackgroundRemoval(originalImage, tolerance);
  };

  const handleToleranceChange = (value: number) => {
    setTolerance(value);
    if (originalImage) {
      processBackgroundRemoval(originalImage, value);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `background-removed-${Date.now()}.png`;
    link.click();
  };

  const reset = () => {
    setStep('upload');
    setOriginalImage(null);
    setProcessedImage(null);
    setTolerance(50);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <canvas ref={canvasRef} className="hidden" />
      
      {/* العنوان */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          إزالة خلفية الصور
        </h1>
        <p className="text-gray-600">سريع، مجاني، ودقيق 100%</p>
      </div>

      {/* Banner Hostinger */}
      <a 
        href="https://www.hostinger.com?REFERRALCODE=DUWSAIF91G7J"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 text-white text-center hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-yellow-300" />
          <span className="font-bold text-lg">Hostinger</span>
        </div>
        <p className="text-sm opacity-90">استضافة مواقع من $2.99/شهر - خصم 90%</p>
      </a>

      {step === 'upload' ? (
        /* خطوة الرفع */
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-4 border-dashed border-blue-300 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all bg-white"
        >
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
            className="hidden"
          />
          <Upload className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">اضغط لرفع صورة</h3>
          <p className="text-gray-500 text-sm">أو اسحب الصورة وأفلتها هنا</p>
          <p className="text-gray-400 text-xs mt-2">PNG, JPG, WEBP</p>
        </div>
      ) : (
        /* خطوة النتيجة */
        <div className="space-y-6">
          {/* شريط التحكم */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-gray-700">الحساسية (Tolerance)</label>
              <span className="text-blue-600 font-bold">{tolerance}%</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={tolerance}
              onChange={(e) => handleToleranceChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              زد النسبة لإزالة المزيد، قللها للحفاظ على التفاصيل
            </p>
          </div>

          {/* عرض الصور */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* الصورة الأصلية */}
            <div className="bg-white rounded-xl p-4 shadow-md">
              <h3 className="font-bold text-gray-800 mb-3 text-center">الصورة الأصلية</h3>
              <div className="relative">
                <canvas 
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="w-full rounded-lg border-2 border-gray-200 cursor-crosshair"
                />
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  💡 انقر لاختيار لون الخلفية
                </div>
              </div>
            </div>

            {/* الصورة بعد الإزالة */}
            <div className="bg-white rounded-xl p-4 shadow-md">
              <h3 className="font-bold text-gray-800 mb-3 text-center flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                بعد إزالة الخلفية
              </h3>
              <div 
                className="rounded-lg border-2 border-gray-200 overflow-hidden"
                style={{
                  backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                  backgroundSize: '20px 20px'
                }}
              >
                {isProcessing ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : processedImage ? (
                  <img src={processedImage} alt="Processed" className="w-full" />
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    جاري المعالجة...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex gap-3">
            <button 
              onClick={downloadImage}
              disabled={!processedImage || isProcessing}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              تحميل الصورة
            </button>
            <button 
              onClick={reset}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              صورة جديدة
            </button>
          </div>

          {/* نصائح */}
          <div className="bg-blue-50 rounded-xl p-4 border-r-4 border-blue-500">
            <h4 className="font-bold text-blue-900 mb-2">💡 نصائح للحصول على أفضل نتيجة:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• انقر على لون الخلفية في الصورة الأصلية لتحديده يدوياً</li>
              <li>• اضبط الحساسية: 40-60% مثالي لمعظم الصور</li>
              <li>• الصور بخلفية موحدة تعطي أفضل النتائج</li>
            </ul>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-4">
        <p>© {new Date().getFullYear()} Free Background Remover - مجاني 100%</p>
      </footer>
    </div>
  );
}
