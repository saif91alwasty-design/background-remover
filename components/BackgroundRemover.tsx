'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Download, RotateCcw, Eraser, Palette, ZoomIn } from 'lucide-react';

interface RGB {
  r: number;
  g: number;
  b: number;
}

export default function BackgroundRemover() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tolerance, setTolerance] = useState(30);
  const [feathering, setFeathering] = useState(5);
  const [selectedColor, setSelectedColor] = useState<RGB | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setProcessedImage(null);
      setSelectedColor(null);
    };
    reader.readAsDataURL(file);
  };

  // حساب المسافة بين لونين (Euclidean Distance)
  const colorDistance = (color1: RGB, color2: RGB): number => {
    return Math.sqrt(
      Math.pow(color1.r - color2.r, 2) +
      Math.pow(color1.g - color2.g, 2) +
      Math.pow(color1.b - color2.b, 2)
    );
  };

  // اختيار اللون بالنقر على الصورة
  const handleImageClick = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current || !originalImage) return;

    const img = imageRef.current;
    const rect = img.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (img.naturalWidth / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (img.naturalHeight / rect.height));

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const color: RGB = { r: pixel[0], g: pixel[1], b: pixel[2] };
    
    setSelectedColor(color);
    setShowColorPicker(true);
  }, [originalImage]);

  // الخوارزمية المحسّنة لإزالة الخلفية
  const removeBackgroundAdvanced = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;
    setIsProcessing(true);

    setTimeout(() => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // إذا لم يتم اختيار لون، استخدم اللون الأبيض/الفاتح كافتراضي
        const targetColor = selectedColor || { r: 255, g: 255, b: 255 };
        const maxDistance = tolerance * 2.55;
        const featherRange = feathering * 2.55;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          const currentColor: RGB = { r, g, b };
          const distance = colorDistance(currentColor, targetColor);
          
          if (distance <= maxDistance) {
            // إزالة كاملة
            data[i + 3] = 0;
          } else if (distance <= maxDistance + featherRange) {
            // تنعيم الحواف (Feathering)
            const featherAlpha = Math.round(
              255 * (1 - (distance - maxDistance) / featherRange)
            );
            data[i + 3] = featherAlpha;
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        setProcessedImage(canvas.toDataURL('image/png'));
        setIsProcessing(false);
      };
      
      img.src = originalImage;
    }, 100);
  }, [originalImage, selectedColor, tolerance, feathering]);

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `no-bg-advanced-${Date.now()}.png`;
    link.click();
  };

  const reset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setSelectedColor(null);
    setTolerance(30);
    setFeathering(5);
    setShowColorPicker(false);
  };

  const getColorPreview = () => {
    if (!selectedColor) return 'bg-gray-300';
    return `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})`;
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <canvas ref={canvasRef} className="hidden" />

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          إزالة الخلفية الاحترافية
        </h1>
        <p className="text-gray-600 text-lg">
          أداة متقدمة مع اختيار اللون بالنقر وتنعيم الحواف
        </p>
      </div>

      {!originalImage ? (
        <div 
          onClick={() => document.getElementById('file-input')?.click()} 
          className="border-4 border-dashed border-gray-300 rounded-2xl p-16 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all bg-white shadow-lg"
        >
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">
            اضغط لرفع صورة
          </h3>
          <p className="text-gray-500">PNG, JPG, WEBP</p>
          <input 
            id="file-input" 
            type="file" 
            accept="image/*" 
            onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])} 
            className="hidden" 
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* لوحة التحكم */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Palette className="w-6 h-6" />
              إعدادات المعالجة
            </h3>

            {/* اختيار اللون */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                لون الخلفية المستهدف
              </label>
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-inner"
                  style={{ backgroundColor: getColorPreview() }}
                />
                <div className="flex-1">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <ZoomIn className="w-4 h-4" />
                    {selectedColor ? 'تغيير اللون' : 'اختر لون من الصورة'}
                  </button>
                  {selectedColor && (
                    <p className="text-xs text-gray-500 mt-2">
                      RGB: ({selectedColor.r}, {selectedColor.g}, {selectedColor.b})
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* الحساسية */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                حساسية الإزالة: {tolerance}%
              </label>
              <input 
                type="range" 
                min="5" 
                max="100" 
                value={tolerance} 
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>دقيق (5%)</span>
                <span>واسع (100%)</span>
              </div>
            </div>

            {/* تنعيم الحواف */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                تنعيم الحواف: {feathering}%
              </label>
              <input 
                type="range" 
                min="0" 
                max="30" 
                value={feathering} 
                onChange={(e) => setFeathering(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>حواف حادة (0%)</span>
                <span>حواف ناعمة (30%)</span>
              </div>
            </div>

            <button
              onClick={removeBackgroundAdvanced}
              disabled={isProcessing}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
            >
              {isProcessing ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <Eraser className="w-6 h-6" />
                  إزالة الخلفية
                </>
              )}
            </button>
          </div>

          {/* عرض الصور */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">الصورة الأصلية</h3>
              <div className="relative bg-gray-100 rounded-xl overflow-hidden">
                <img 
                  ref={imageRef}
                  src={originalImage} 
                  alt="Original" 
                  className="w-full h-auto cursor-crosshair"
                  onClick={handleImageClick}
                />
                {showColorPicker && (
                  <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-3 py-1 rounded-full">
                     انقر لاختيار اللون
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">النتيجة النهائية</h3>
              <div 
                className="relative rounded-xl overflow-hidden min-h-[300px] flex items-center justify-center border-2 border-gray-200"
                style={{
                  backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}
              >
                {isProcessing ? (
                  <div className="text-center p-8">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-700 font-semibold">جاري المعالجة...</p>
                    <p className="text-sm text-gray-500 mt-2">يتم تحليل البكسلات</p>
                  </div>
                ) : processedImage ? (
                  <img src={processedImage} alt="Processed" className="w-full h-auto" />
                ) : (
                  <div className="text-center p-8">
                    <Eraser className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400">اضغط "إزالة الخلفية" لرؤية النتيجة</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* أزرار التحكم */}
          {processedImage && (
            <div className="flex gap-4 justify-center flex-wrap">
              <button 
                onClick={downloadImage} 
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-3 shadow-lg"
              >
                <Download className="w-6 h-6" />
                تحميل الصورة
              </button>
              <button 
                onClick={reset} 
                className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all flex items-center gap-3"
              >
                <RotateCcw className="w-6 h-6" />
                صورة جديدة
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
