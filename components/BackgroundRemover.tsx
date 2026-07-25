'use client';

import { useState, useCallback } from 'react';
import { Loader2, Download, RotateCcw, Upload } from 'lucide-react';

export default function BackgroundRemover() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setProcessedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const processImage = useCallback(async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      // الاستيراد هنا يضمن أن الكود يعمل في المتصفح فقط ويتجنب أخطاء البناء
      const { removeBackground } = await import('@imgly/background-removal');
      
      const blob = await removeBackground(selectedFile, {
        progress: (key: string, current: number, total: number) => {
          setProgress(Math.round((current / total) * 100));
        },
      });

      const url = URL.createObjectURL(blob);
      setProcessedImage(url);
    } catch (err: any) {
      console.error(err);
      setError('حدث خطأ أثناء المعالجة. يرجى التأكد من أن الصورة بصغة PNG أو JPG وأقل من 10MB.');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile]);

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `no-bg-${Date.now()}.png`;
    link.click();
  };

  const reset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setSelectedFile(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إزالة خلفية الصور</h1>
        <p className="text-gray-600">تتم المعالجة داخل متصفحك مباشرة. خصوصية تامة وبدون رفع الصور لأي خادم.</p>
      </div>

      {!originalImage ? (
        <div onClick={() => document.getElementById('file-input')?.click()} className="border-4 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 transition-colors bg-white">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-gray-700">اضغط لرفع صورة</h3>
          <p className="text-gray-500 text-sm mt-1">PNG, JPG (أقل من 10MB)</p>
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
                  <div className="text-center p-4 bg-white/90 rounded-lg w-full">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-3" />
                    <p className="text-gray-700 font-medium">جاري المعالجة...</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3 max-w-xs mx-auto">
                      <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{progress}%</p>
                  </div>
                ) : processedImage ? (
                  <img src={processedImage} alt="Processed" className="w-full h-auto" />
                ) : (
                  <p className="text-gray-400 p-4 text-center">اضغط "إزالة الخلفية" للبدء</p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-4 justify-center flex-wrap">
            {!processedImage && !isProcessing && (
              <button onClick={processImage} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
                إزالة الخلفية
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
