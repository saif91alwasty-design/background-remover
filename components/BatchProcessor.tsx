'use client';

import { useState } from 'react';
import { removeBackground } from '@imgly/background-removal';
import { Loader2, Download, RotateCcw, CheckCircle } from 'lucide-react';
import ImageUploader from './ImageUploader';

interface ProcessedImage {
  original: File;
  processed: string;
  status: 'pending' | 'processing' | 'done' | 'error';
}

export default function BatchProcessor() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState({
    current: 0,
    total: 0,
  });

  const handleImageSelect = (file: File) => {
    setImages((prev) => [...prev, { original: file, processed: '', status: 'pending' }]);
  };

  const handleMultipleFiles = (files: FileList) => {
    const newImages = Array.from(files).map((file) => ({
      original: file,
      processed: '',
      status: 'pending' as const,
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const processAllImages = async () => {
    setIsProcessing(true);
    setCurrentProgress({ current: 0, total: images.length });

    for (let i = 0; i < images.length; i++) {
      if (images[i].status === 'done') continue;

      setImages((prev) =>
        prev.map((img, idx) =>
          idx === i ? { ...img, status: 'processing' } : img
        )
      );

      try {
        const blob = await images[i].original.arrayBuffer();
        const result = await removeBackground(blob);

        const resultBlob = new Blob([result]);
        const resultUrl = URL.createObjectURL(resultBlob);

        setImages((prev) =>
          prev.map((img, idx) =>
            idx === i ? { ...img, processed: resultUrl, status: 'done' } : img
          )
        );
      } catch (error) {
        console.error(`Error processing image ${i}:`, error);
        setImages((prev) =>
          prev.map((img, idx) =>
            idx === i ? { ...img, status: 'error' } : img
          )
        );
      }

      setCurrentProgress({ current: i + 1, total: images.length });
    }

    setIsProcessing(false);
  };

  const downloadAll = () => {
    images.forEach((img, index) => {
      if (img.status === 'done' && img.processed) {
        const link = document.createElement('a');
        link.href = img.processed;
        link.download = `processed-${index + 1}-${img.original.name}`;
        link.click();
      }
    });
  };

  const reset = () => {
    setImages([]);
    setCurrentProgress({ current: 0, total: 0 });
  };

  if (images.length === 0) {
    return (
      <div>
        <ImageUploader
          onImageSelect={handleImageSelect}
          accept="image/*"
          maxSize={10 * 1024 * 1024}
        />
        <div className="mt-4 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleMultipleFiles(e.target.files)}
            className="hidden"
            id="batch-upload"
          />
          <label
            htmlFor="batch-upload"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 cursor-pointer"
          >
            أو اختر عدة صور
          </label>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">
          الصور المحددة ({images.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(img.original)}
                alt={`Image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              {img.status === 'done' && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
              {img.status === 'processing' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isProcessing && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              جاري المعالجة: {currentProgress.current} / {currentProgress.total}
            </span>
            <span>
              {Math.round((currentProgress.current / currentProgress.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-500 h-3 rounded-full transition-all"
              style={{
                width: `${(currentProgress.current / currentProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-center">
        {!isProcessing && images.some((img) => img.status === 'pending') && (
          <button
            onClick={processAllImages}
            className="px-8 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
          >
            معالجة جميع الصور
          </button>
        )}

        {images.every((img) => img.status === 'done') && (
          <button
            onClick={downloadAll}
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            تحميل جميع الصور
          </button>
        )}

        <button
          onClick={reset}
          className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          مسح الكل
        </button>
      </div>
    </div>
  );
}
