'use client';

import { useState, useCallback } from 'react';
import { pipeline } from '@huggingface/transformers';
import { Loader2, Download, RotateCcw, Upload } from 'lucide-react';

export default function BackgroundRemover() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pipe, setPipe] = useState<any>(null);

  const loadModel = useCallback(async () => {
    if (pipe) return pipe;
    setIsLoadingModel(true);
    try {
      const classifier = await pipeline('image-segmentation', 'briaai/RMBG-1.4', {
        progress_callback: (progressData: any) => {
          if (progressData.status === 'progress') {
            setProgress(Math.round((progressData.loaded / progressData.total) * 100));
          }
        },
      });
      setPipe(classifier);
      return classifier;
    } catch (error) {
      console.error('Error loading model:', error);
      throw error;
    } finally {
      setIsLoadingModel(false);
    }
  }, [pipe]);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setProcessedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!originalImage || !selectedFile) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const classifier = await loadModel();
      const imageBitmap = await createImageBitmap(selectedFile);
      
      const output = await classifier(imageBitmap, { return_mask: true });
      
      const canvas = document.createElement('canvas');
      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx && output && output[0]?.mask) {
        ctx.drawImage(imageBitmap, 0, 0);
        const maskData = output[0].mask;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < maskData.length; i++) {
          data[i * 4 + 3] = maskData[i];
        }
        ctx.putImageData(imageData, 0, 0);
      }

      setProcessedImage(canvas.toDataURL('image/png'));
    } catch (error: any) {
      alert(`حدث خطأ: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

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
    setProgress(0);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إزالة خلفية الصور</h1>
        <p className="text-gray-600">تعمل مباشرة في متصفحك بدون رفع الصور للخادم</p>
      </div>

      {isLoadingModel && (
        <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-blue-800 font-semibold">جاري تحميل نموذج الذكاء الاصطناعي...</p>
          <p className="text-sm text-blue-600 mb-3">(~44MB) سيتم حفظه في المتصفح للاستخدام المستقبلي</p>
          <div className="w-full bg-blue-200 rounded-full h-3 max-w-xs mx-auto">
            <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-blue-600 mt-2">{progress}%</p>
        </div>
      )}

      {!originalImage ? (
        <div onClick={() => document.getElementById('file-input')?.click()} className="border-4 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-gray-700">اضغط لرفع صورة</h3>
          <p className="text-gray-500 text-sm mt-1">PNG, JPG, WEBP (أقل من 10MB)</p>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
      ) : (
        <div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">الصورة الأصلية</h3>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <img src={originalImage} alt="Original" className="w-full h-auto" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">بعد إزالة الخلفية</h3>
              <div className="relative checkerboard rounded-lg overflow-hidden">
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center h-96">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-600">جاري المعالجة...</p>
                  </div>
                ) : processedImage ? (
                  <img src={processedImage} alt="Processed" className="w-full h-auto" />
                ) : (
                  <div className="flex items-center justify-center h-96 bg-gray-50">
                    <p className="text-gray-400">اضغط "إزالة الخلفية" للبدء</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            {!processedImage && !isProcessing && (
              <button
                onClick={processImage}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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
      )}
    </div>
  );
}
