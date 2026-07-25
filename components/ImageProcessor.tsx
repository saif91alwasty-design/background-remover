'use client';

import { useState } from 'react';
import { Loader2, Download, RotateCcw, AlertCircle } from 'lucide-react';
import ImageUploader from './ImageUploader';

interface DebugInfo {
  step: string;
  timestamp: string;
  fileInfo?: {
    name: string;
    type: string;
    size: number;
    exists: boolean;
  };
  hasToken?: boolean;
  tokenLength?: number;
  responseStatus?: number;
  responseStatusText?: string;
  errorMessage?: string;
  errorResponse?: string;
}

export default function ImageProcessor() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<{message: string; debug?: DebugInfo} | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setShowDebug(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setProcessedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setShowDebug(false);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError({
          message: data.error || 'فشل في معالجة الصورة',
          debug: data.debug,
        });
        setShowDebug(true);
        throw new Error(data.error);
      }

      const blob = await response.blob();
      const resultUrl = URL.createObjectURL(blob);
      setProcessedImage(resultUrl);

    } catch (error: any) {
      console.error('Processing error:', error);
      // الخطأ تم التعامل معه بالفعل في bloc try-catch الداخلي
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
    setError(null);
    setShowDebug(false);
  };

  const getStepDescription = (step: string) => {
    const steps: Record<string, string> = {
      'initializing': 'جاري التهيئة...',
      'receiving-form-data': 'استلام البيانات...',
      'validating-file': 'التحقق من الملف...',
      'checking-api-token': 'التحقق من مفتاح API...',
      'sending-to-huggingface': 'الإرسال إلى الخادم...',
      'api-request': 'معالجة الطلب...',
      'api-response': 'استلام الاستجابة...',
      'processing-success': 'تمت المعالجة بنجاح!',
      'error-caught': 'حدث خطأ',
    };
    return steps[step] || step;
  };

  if (!originalImage) {
    return <ImageUploader onImageSelect={handleImageSelect} />;
  }

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">الصورة الأصلية</h3>
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <img src={originalImage} alt="Original" className="w-full h-auto" />
            {selectedFile && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2">
                <p>الاسم: {selectedFile.name}</p>
                <p>الحجم: {(selectedFile.size / 1024).toFixed(2)} KB</p>
                <p>النوع: {selectedFile.type}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">بعد إزالة الخلفية</h3>
          <div className="relative checkerboard rounded-lg overflow-hidden">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center h-96">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600">جاري المعالجة بالذكاء الاصطناعي...</p>
                <p className="text-sm text-gray-400 mt-2">قد يستغرق ذلك بضع ثوانٍ</p>
              </div>
            ) : processedImage ? (
              <img src={processedImage} alt="Processed" className="w-full h-auto" />
            ) : (
              <div className="flex items-center justify-center h-96 bg-gray-50">
                <p className="text-gray-400">اضغط على "إزالة الخلفية" للبدء</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* رسالة الخطأ مع التفاصيل */}
      {error && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-800 mb-2">حدث خطأ أثناء المعالجة</h4>
              <p className="text-red-700 mb-3">{error.message}</p>
              
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="text-sm text-red-600 hover:text-red-800 underline mb-3"
              >
                {showDebug ? 'إخفاء التفاصيل التقنية' : 'عرض التفاصيل التقنية'}
              </button>

              {showDebug && error.debug && (
                <div className="bg-white rounded p-3 text-xs font-mono overflow-auto max-h-96 border border-red-200">
                  <div className="space-y-2">
                    <div>
                      <strong className="text-red-800">المرحلة:</strong> {getStepDescription(error.debug.step)}
                    </div>
                    <div>
                      <strong className="text-red-800">الوقت:</strong> {new Date(error.debug.timestamp).toLocaleString('ar-IQ')}
                    </div>
                    
                    {error.debug.fileInfo && (
                      <div className="border-t pt-2 mt-2">
                        <strong className="text-red-800">معلومات الملف:</strong>
                        <pre className="mt-1 bg-gray-50 p-2 rounded">
                          {JSON.stringify(error.debug.fileInfo, null, 2)}
                        </pre>
                      </div>
                    )}

                    {error.debug.hasToken !== undefined && (
                      <div>
                        <strong className="text-red-800">مفتاح API:</strong> {error.debug.hasToken ? 'موجود ✅' : 'غير موجود ❌'}
                        {error.debug.tokenLength && ` (الطول: ${error.debug.tokenLength})`}
                      </div>
                    )}

                    {error.debug.responseStatus && (
                      <div>
                        <strong className="text-red-800">استجابة الخادم:</strong> {error.debug.responseStatus} {error.debug.responseStatusText}
                      </div>
                    )}

                    {error.debug.errorResponse && (
                      <div>
                        <strong className="text-red-800">تفاصيل الخطأ:</strong>
                        <pre className="mt-1 bg-gray-50 p-2 rounded text-red-700">
                          {error.debug.errorResponse}
                        </pre>
                      </div>
                    )}

                    {error.debug.errorMessage && (
                      <div>
                        <strong className="text-red-800">الخطأ:</strong> {error.debug.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-center">
        {!processedImage && !isProcessing && (
          <button
            onClick={processImage}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
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

      {/* نصائح عند الخطأ */}
      {error && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">💡 نصائح للحل:</h4>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>تأكد أن الصورة بصيغة PNG أو JPG أو WEBP</li>
            <li>تأكد أن حجم الصورة أقل من 10MB</li>
            <li>تحقق من وجود مفتاح HF_TOKEN في إعدادات Vercel</li>
            <li>إذا ظهر خطأ 401 أو 403، تحقق من صلاحية المفتاح</li>
            <li>إذا ظهر خطأ 503، النموذج قد يكون في طور التحميل - انتظر دقيقة وحاول مجدداً</li>
          </ul>
        </div>
      )}
    </div>
  );
}
