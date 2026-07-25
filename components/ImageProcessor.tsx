'use client';

import { useState } from 'react';
import { removeBackground } from '@imgly/background-removal';
import { Loader2, Download, RotateCcw } from 'lucide-react';
import ImageUploader from './ImageUploader';

export default function ImageProcessor() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setProcessedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const response = await fetch(originalImage);
      const blob = await response.blob();

      const result = await removeBackground(blob, {
        progress: (key: string, current: number, total: number) => {
          const percent = Math.round((current / total) * 100);
          setProgress(percent);
        },
      });

      const resultBlob = new Blob([result]);
      const resultUrl = URL.createObjectURL(resultBlob);
      setProcessedImage(resultUrl);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('حدث خطأ أثناء معالجة الصورة');
    } finally {
      setIsProcessing(false);
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
    setOriginalImage(null);
    setProcessedImage(null);
    setProgress(0);
  };

  if (!originalImage) {
    return <ImageUploader onImageSelect={handleImageSelect} />;
  }

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Original Image */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            الصورة الأصلية
          </h3>
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={originalImage}
              alt="Original"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Processed Image */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            بعد إزالة الخلفية
          </h3>
          <div className="relative checkerboard rounded-lg overflow-hidden">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center h-96">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                <p className="text-gray-600 mb-2">جاري المعالجة...</p>
                <div className="w-64 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-500 h-3 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">{progress}%</p>
              </div>
            ) : processedImage ? (
              <img
                src={processedImage}
                alt="Processed"
                className="w-full h-auto"
              />
            ) : (
              <div className="flex items-center justify-center h-96 bg-gray-50">
                <p className="text-gray-400">اضغط على "إزالة الخلفية" للبدء</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        {!processedImage && !isProcessing && (
          <button
            onClick={processImage}
            className="px-8 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            إزالة الخلفية
          </button>
        )}

        {processedImage && (
          <button
            onClick={downloadImage}
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            تحميل الصورة
          </button>
        )}

        <button
          onClick={reset}
          className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          صورة جديدة
        </button>
      </div>
    </div>
  );
}
