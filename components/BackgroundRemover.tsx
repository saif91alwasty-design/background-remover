'use client';

import { useState, useRef } from 'react';
import { Upload, Download, RotateCcw, Eraser } from 'lucide-react';

export default function BackgroundRemover() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tolerance, setTolerance] = useState(30); // حساسية اكتشاف اللون (0-100)
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setProcessedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const removeBackgroundFromScratch = () => {
    if (!originalImage || !canvasRef.current) return;
    setIsProcessing(true);

    // نستخدم setTimeout للسماح للمتصفح بتحديث واجهة المستخدم قبل بدء المعالجة الثقيلة
    setTimeout(() => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      const img = new Image();
      
      img.onload = () => {
        // ضبط أبعاد الـ Canvas لتطابق الصورة
        canvas.width = img.width;
        canvas.height = img.height;
        
        // رسم الصورة الأصلية
        ctx.drawImage(img, 0, 0);
        
        // استخراج بيانات البكسل
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // الخوارزمية من الصفر: اكتشاف اللون الأبيض/الفاتح وجعله شفافاً
        // يمكنك تعديل هذا المنطق لاحقاً للسماح للمستخدم بالنقر على لون معين
        const threshold = tolerance * 2.55; // تحويل النسبة إلى قيمة 0-255

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // حساب سطوع البكسل (Brightness)
          const brightness = (r + g + b) / 3;
          
          // إذا كان البكسل فاتحاً جداً (أقرب للأبيض)، اجعله شفافاً
          if (brightness > (255 - threshold)) {
            data[i + 3] = 0; // قناة الشفافية Alpha = 0 (شفاف تماماً)
          }
        }
        
        // إعادة رسم البيانات المعدلة
        ctx.putImageData(imageData, 0, 0);
        
        // تصدير النتيجة كصورة PNG
        setProcessedImage(canvas.toDataURL('image/png'));
        setIsProcessing(false);
      };
      
      img.src = originalImage;
    }, 100);
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `no-bg-scratch-${Date.now()}.png`;
    link.click();
  };

  const reset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setTolerance(30);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Canvas مخفي للمعالجة */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إزالة الخلفية (من الصفر)</h1>
        <p className="text-gray-600">خوارزمية معالجة بكسلات أصلية باستخدام Canvas API. بدون مكتبات، بدون خوادم، بدون ذكاء اصطناعي.</p>
      </div>

      {!originalImage ? (
        <div onClick={() => document.getElementById('file-input')?.click()} className="border-4 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 transition-colors bg-white">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-gray-700">اضغط لرفع صورة</h3>
          <p className="text-gray-500 text-sm mt-1">يفضل الصور ذات الخلفية الفاتحة أو البيضاء</p>
          <input id="file-input" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])} className="hidden" />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">الصورة الأصلية</h3>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img src={originalImage} alt="Original" className="w-full h-auto" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">النتيجة النهائية</h3>
              <div className="relative rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center border border-gray-200"
                style={{
                  backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}
              >
                {isProcessing ? (
                  <div className="text-center">
                    <Eraser className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-3" />
                    <p className="text-gray-700 font-medium">جاري معالجة البكسلات...</p>
                  </div>
                ) : processedImage ? (
                  <img src={processedImage} alt="Processed" className="w-full h-auto" />
                ) : (
                  <p className="text-gray-400 p-4 text-center">اضغط "إزالة الخلفية" للبدء</p>
                )}
              </div>
            </div>
          </div>

          {/* أدوات التحكم */}
          {!processedImage && !isProcessing && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-sm font-semibold text-blue-800 mb-2">
                حساسية إزالة اللون الفاتح: {tolerance}%
              </label>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={tolerance} 
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-blue-600 mt-2">
                💡 زيادة النسبة تزيل ألواناً أغمق. جرب القيم بين 20-50 للحصول على أفضل نتيجة للخلفيات البيضاء.
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-center flex-wrap">
            {!processedImage && !isProcessing && (
              <button onClick={removeBackgroundFromScratch} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Eraser className="w-5 h-5" /> إزالة الخلفية
              </button>
            )}
            {processedImage && (
              <button onClick={downloadImage} className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2">
                <Download className="w-5 h-5" /> تحميل الصورة
              </button>
            )}
            <button onClick={reset} className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2">
              <RotateCcw className="w-5 h-5" /> صورة جديدة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
