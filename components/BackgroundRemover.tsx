'use client';

import { useState, useRef } from 'react';
import { Upload, Download, RotateCcw, Check, Sparkles, Star, Zap, Shield, Image as ImageIcon, Crop } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import { getTranslation } from '@/lib/translations';
import LanguageSwitcher from './LanguageSwitcher';

export default function BackgroundRemover() {
  const { lang } = useLanguage();
  const t = (key: string) => getTranslation(lang, key);

  const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'webp'>('png');
  const [downloadQuality, setDownloadQuality] = useState(100);
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [maintainRatio, setMaintainRatio] = useState<boolean>(true);
  const [originalDimensions, setOriginalDimensions] = useState({ w: 0, h: 0 });
  
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

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <canvas ref={canvasRef} className="hidden" />

      {/* شريط اللغة في الأعلى */}
      <div className="flex justify-end">
        <LanguageSwitcher />
      </div>

      {/* Banner Hostinger */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-700 to-blue-600 rounded-2xl p-6 md:p-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 font-bold text-sm">Trusted Worldwide</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">🚀 Start Your Website with Hostinger</h2>
            <p className="text-purple-100 text-sm md:text-base mb-3">Fast, secure hosting from $2.99/month with 30-day money-back guarantee</p>
          </div>
          <a href="https://www.hostinger.com?REFERRALCODE=DUWSAIF91G7J" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-transform">
            <div className="text-lg">Get 90% OFF</div>
            <div className="text-sm opacity-90">Sign Up Now →</div>
          </a>
        </div>
      </div>

      {/* العنوان */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-lg text-gray-600">{t('subtitle')}</p>
      </div>

      {/* الخطوة 1: رفع */}
      {step === 'upload' && (
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border-2 border-dashed border-blue-200 hover:border-blue-400 transition-all">
          <div onClick={() => document.getElementById('file-input')?.click()} className="cursor-pointer text-center space-y-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('uploadTitle')}</h3>
              <p className="text-gray-500">{t('uploadSubtitle')}</p>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400 flex-wrap">
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> {t('free')}</span>
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> {t('fast')}</span>
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> {t('noSignup')}</span>
            </div>
            <input id="file-input" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])} className="hidden" />
          </div>
        </div>
      )}

      {/* الخطوة 2: معالجة */}
      {step === 'processing' && (
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
            <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-blue-600 animate-pulse" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('processing')}</h3>
            <p className="text-gray-500">{t('wait')}</p>
          </div>
        </div>
      )}

      {/* الخطوة 3: نتيجة */}
      {step === 'result' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">{t('original')}</h3>
              <img src={originalImage!} alt="Original" className="w-full rounded-xl" />
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">{t('result')}</h3>
              <div className="rounded-xl overflow-hidden border-2 border-gray-200" style={{ backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)', backgroundSize: '20px 20px' }}>
                <img src={processedImage!} alt="Processed" className="w-full" />
              </div>
            </div>
          </div>

          {/* خيارات التحميل */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-lg p-6 border-2 border-green-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Crop className="w-6 h-6" />
              {t('resizeOptions')}
            </h3>
            
            <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <input type="checkbox" id="ratio" checked={maintainRatio} onChange={(e) => setMaintainRatio(e.target.checked)} className="w-5 h-5" />
                <label htmlFor="ratio" className="text-sm font-semibold text-gray-700">{t('maintainRatio')}</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('width')}</label>
                  <input type="number" min="10" value={targetWidth} onChange={(e) => handleWidthChange(Number(e.target.value))} className="w-full px-4 py-3 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('height')}</label>
                  <input type="number" min="10" value={targetHeight} onChange={(e) => handleHeightChange(Number(e.target.value))} className="w-full px-4 py-3 border rounded-lg" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{t('originalDimensions')}: {originalDimensions.w} × {originalDimensions.h} px</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('format')}</label>
                <div className="flex gap-3">
                  <button onClick={() => setDownloadFormat('png')} className={`flex-1 px-4 py-3 rounded-lg font-semibold ${downloadFormat === 'png' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>{t('png')}</button>
                  <button onClick={() => setDownloadFormat('webp')} className={`flex-1 px-4 py-3 rounded-lg font-semibold ${downloadFormat === 'webp' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>{t('webp')}</button>
                </div>
              </div>
              {downloadFormat === 'webp' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('quality')}: {downloadQuality}%</label>
                  <input type="range" min="10" max="100" value={downloadQuality} onChange={(e) => setDownloadQuality(Number(e.target.value))} className="w-full" />
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
              <button onClick={downloadImage} className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold flex items-center gap-3 shadow-lg">
                <Download className="w-6 h-6" />
                {t('download')} ({targetWidth}×{targetHeight})
              </button>
              <button onClick={reset} className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold flex items-center gap-3">
                <RotateCcw className="w-6 h-6" />
                {t('newImage')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مميزات */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">{t('instant')}</h3>
          <p className="text-sm text-gray-600">{t('instantDesc')}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crop className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">{t('customSize')}</h3>
          <p className="text-sm text-gray-600">{t('customSizeDesc')}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">{t('privacy')}</h3>
          <p className="text-sm text-gray-600">{t('privacyDesc')}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 rounded-2xl p-8 text-center text-gray-600">
        <p className="text-sm">© {new Date().getFullYear()} Free Background Remover - All rights reserved</p>
      </div>
    </div>
  );
}
