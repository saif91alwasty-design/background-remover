'use client';

import { useState, useRef } from 'react';
import { Upload, Download, RotateCcw, Check, Sparkles, Star, Zap, Shield, Image as ImageIcon, Crop, HelpCircle } from 'lucide-react';
import { getTranslation } from '@/lib/translations';
import { Language } from '@/lib/languages';
import LanguageSwitcher from './LanguageSwitcher';

export default function BackgroundRemover({ lang }: { lang: string }) {
  const currentLang = lang as Language;
  const t = (key: string) => getTranslation(currentLang, key);
  const txt = (ar: string, en: string) => (currentLang === 'ar' ? ar : en);

  const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'webp'>('png');
  const [downloadQuality, setDownloadQuality] = useState(100);
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [maintainRatio, setMaintainRatio] = useState<boolean>(true);
  const [originalDimensions, setOriginalDimensions] = useState({ w: 0, h: 0 });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageSelect = (file: File) => {
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
      setOriginalDimensions({ w: img.width, h: img.height });
      setTargetWidth(img.width);
      setTargetHeight(img.height);
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (brightness > 220) data[i + 3] = 0;
      }
      
      ctx.putImageData(imageData, 0, 0);
      setProcessedImage(canvas.toDataURL('image/png'));
      setStep('result');
    };
    img.src = imageSrc;
  };

  const handleWidthChange = (value: number) => {
    setTargetWidth(value);
    if (maintainRatio && originalDimensions.w > 0) {
      setTargetHeight(Math.round(value * (originalDimensions.h / originalDimensions.w)));
    }
  };

  const handleHeightChange = (value: number) => {
    setTargetHeight(value);
    if (maintainRatio && originalDimensions.h > 0) {
      setTargetWidth(Math.round(value * (originalDimensions.w / originalDimensions.h)));
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const resizeCanvas = document.createElement('canvas');
    resizeCanvas.width = targetWidth;
    resizeCanvas.height = targetHeight;
    const ctx = resizeCanvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      const link = document.createElement('a');
      if (downloadFormat === 'webp') {
        link.href = resizeCanvas.toDataURL('image/webp', downloadQuality / 100);
        link.download = `resized-${targetWidth}x${targetHeight}-${Date.now()}.webp`;
      } else {
        link.href = resizeCanvas.toDataURL('image/png');
        link.download = `resized-${targetWidth}x${targetHeight}-${Date.now()}.png`;
      }
      link.click();
    };
    img.src = processedImage;
  };

  const reset = () => {
    setStep('upload');
    setOriginalImage(null);
    setProcessedImage(null);
  };

  const faqs = [
    {
      question: txt('هل الأداة مجانية تماماً؟', 'Is the tool completely free?'),
      answer: txt('نعم، الأداة مجانية 100% بدون أي رسوم مخفية.', 'Yes, the tool is 100% free with no hidden fees.'),
    },
    {
      question: txt('هل صوري آمنة ومحمية؟', 'Are my images safe?'),
      answer: txt('بالتأكيد! جميع المعالجة تتم على متصفحك مباشرة.', 'Absolutely! All processing happens in your browser.'),
    },
    {
      question: txt('ما هي الصيغة الأفضل؟', 'What is the best format?'),
      answer: txt('لجودة عالية استخدم PNG. لسرعة المواقع استخدم WebP.', 'For high quality use PNG. For speed use WebP.'),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex justify-end">
        <LanguageSwitcher currentLang={currentLang} />
      </div>

      <a href="https://www.hostinger.com?REFERRALCODE=DUWSAIF91G7J" target="_blank" rel="noopener noreferrer" className="block bg-gradient-to-r from-purple-900 via-purple-700 to-blue-600 rounded-2xl p-6 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-right">
            <h2 className="text-2xl font-bold mb-2">🚀 {txt('ابدأ موقعك مع Hostinger', 'Start Your Website with Hostinger')}</h2>
            <p className="text-purple-100 text-sm">{txt('استضافة من $2.99/شهر', 'Hosting from $2.99/month')}</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold px-6 py-3 rounded-xl text-center">
            {txt('خصم 90%', 'Get 90% OFF')}
          </div>
        </div>
      </a>

      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-lg text-gray-600">{t('subtitle')}</p>
      </div>

      {step === 'upload' && (
        <div className="bg-white rounded-3xl shadow-xl p-12 border-2 border-dashed border-blue-200">
          <div onClick={() => document.getElementById('file-input')?.click()} className="cursor-pointer text-center space-y-6">
            <Upload className="w-16 h-16 text-blue-600 mx-auto" />
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('uploadTitle')}</h3>
              <p className="text-gray-500">{t('uploadSubtitle')}</p>
            </div>
            <input id="file-input" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])} className="hidden" />
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800">{t('processing')}</h3>
        </div>
      )}

      {step === 'result' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">{t('original')}</h3>
              <img src={originalImage!} alt="Original" className="w-full rounded-xl" />
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">{t('result')}</h3>
              <div className="rounded-xl overflow-hidden border-2 border-gray-200 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZGRkIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNkZGQiLz48L3N2Zz4=')]">
                <img src={processedImage!} alt="Processed" className="w-full" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{t('resizeOptions')}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('width')}</label>
                <input type="number" min="10" value={targetWidth} onChange={(e) => handleWidthChange(Number(e.target.value))} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('height')}</label>
                <input type="number" min="10" value={targetHeight} onChange={(e) => handleHeightChange(Number(e.target.value))} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={downloadImage} className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-bold">
                {t('download')}
              </button>
              <button onClick={reset} className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold">
                {t('newImage')}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center"> {t('howToUse')}</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { num: 1, title: txt('ارفع صورتك', 'Upload'), desc: txt('اضغط على زر الرفع', 'Click upload') },
            { num: 2, title: txt('انتظر المعالجة', 'Wait'), desc: txt('ستتم المعالجة تلقائياً', 'Auto processing') },
            { num: 3, title: txt('عدّل الأبعاد', 'Resize'), desc: txt('غيّر العرض والارتفاع', 'Adjust size') },
            { num: 4, title: txt('حمّل النتيجة', 'Download'), desc: txt('اختر الصيغة وحمّل', 'Choose format') },
          ].map((item) => (
            <div key={item.num} className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-2 mx-auto">{item.num}</div>
              <h4 className="font-bold text-gray-800 mb-1">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-gray-100 rounded-2xl p-8 text-center text-gray-600">
        <p>© {new Date().getFullYear()} Free Background Remover</p>
      </footer>
    </div>
  );
}
