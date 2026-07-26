'use client';

import { useState, useRef } from 'react';
import { Upload, Download, RotateCcw, Check, Sparkles, Star, Zap, Shield, Image as ImageIcon, Crop, HelpCircle } from 'lucide-react';
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
      question: lang === 'ar' ? 'هل الأداة مجانية تماماً؟' : 'Is the tool completely free?',
      answer: lang === 'ar' 
        ? 'نعم، الأداة مجانية 100% بدون أي رسوم مخفية أو قيود على عدد الصور. يمكنك استخدامها كما تشاء.'
        : 'Yes, the tool is 100% free with no hidden fees or limits on the number of images. You can use it as much as you want.',
    },
    {
      question: lang === 'ar' ? 'هل صوري آمنة ومحمية؟' : 'Are my images safe and secure?',
      answer: lang === 'ar'
        ? 'بالتأكيد! جميع المعالجة تتم مباشرة على متصفحك (Client-Side)، ولا يتم رفع أي صورة إلى خوادمنا. خصوصيتك مضمونة 100%.'
        : 'Absolutely! All processing happens directly in your browser (Client-Side), and no images are uploaded to our servers. Your privacy is 100% guaranteed.',
    },
    {
      question: lang === 'ar' ? 'ما هي الصيغة الأفضل للتحميل؟' : 'What is the best format for download?',
      answer: lang === 'ar'
        ? 'إذا كنت تحتاج جودة عالية للطباعة أو التصاميم، استخدم PNG. إذا كنت تستخدم الصورة لموقع إلكتروني وتريد سرعة تحميل أعلى، استخدم WebP.'
        : 'If you need high quality for printing or designs, use PNG. If you use the image for a website and want faster loading, use WebP.',
    },
    {
      question: lang === 'ar' ? 'هل يمكنني تغيير أبعاد الصورة بعد إزالة الخلفية؟' : 'Can I resize the image after removing the background?',
      answer: lang === 'ar'
        ? 'نعم! يمكنك تحديد العرض والارتفاع بالبكسل، مع خيار الحفاظ التلقائي على نسبة الأبعاد الأصلية لمنع تشوه الصورة.'
        : 'Yes! You can specify the width and height in pixels, with an option to automatically maintain the original aspect ratio to prevent image distortion.',
    },
    {
      question: lang === 'ar' ? 'ما هي أنواع الصور المدعومة؟' : 'What image types are supported?',
      answer: lang === 'ar'
        ? 'ندعم جميع الصيغ الشائعة: PNG، JPG، JPEG، WEBP. الحد الأقصى لحجم الصورة 10 ميجابايت.'
        : 'We support all common formats: PNG, JPG, JPEG, WEBP. Maximum image size is 10MB.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <canvas ref={canvasRef} className="hidden" />

      {/* زر تبديل اللغة */}
      <div className="flex justify-end">
        <LanguageSwitcher />
      </div>

      {/* Banner Hostinger بالعربية */}
      <a 
        href="https://www.hostinger.com?REFERRALCODE=DUWSAIF91G7J"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-gradient-to-r from-purple-900 via-purple-700 to-blue-600 rounded-2xl p-6 md:p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 font-bold text-sm">
                {lang === 'ar' ? 'استضافة موثوقة عالمياً' : 'Trusted Worldwide Hosting'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
               {lang === 'ar' ? 'ابدأ موقعك مع Hostinger' : 'Start Your Website with Hostinger'}
            </h2>
            <p className="text-purple-100 text-sm md:text-base mb-3">
              {lang === 'ar' 
                ? 'استضافة سريعة وآمنة تبدأ من $2.99/شهر مع ضمان استعادة الأموال خلال 30 يوماً'
                : 'Fast and secure hosting from $2.99/month with 30-day money-back guarantee'}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs">
              <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> {lang === 'ar' ? 'سرعة فائقة' : 'Super Fast'}</span>
              <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> {lang === 'ar' ? 'SSL مجاني' : 'Free SSL'}</span>
              <span className="flex items-center gap-1"><ImageIcon className="w-4 h-4" /> {lang === 'ar' ? 'نطاق مجاني' : 'Free Domain'}</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-transform text-center">
              <div className="text-lg">{lang === 'ar' ? 'خصم 90%' : 'Get 90% OFF'}</div>
              <div className="text-sm opacity-90">{lang === 'ar' ? 'سجل الآن ←' : 'Sign Up Now →'}</div>
            </div>
          </div>
        </div>
      </a>

      {/* العنوان الرئيسي */}
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

      {/* مميزات سريعة */}
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

      {/* ========================================== */}
      {/* محتوى SEO الغني - يبدأ من هنا */}
      {/* ========================================== */}

      {/* كيفية الاستخدام */}
      <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
          {lang === 'ar' ? '📝 كيفية الاستخدام في 4 خطوات' : ' How to Use in 4 Steps'}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { num: 1, title: lang === 'ar' ? 'ارفع صورتك' : 'Upload Your Image', desc: lang === 'ar' ? 'اضغط على زر الرفع أو اسحب الصورة وأفلتها' : 'Click upload or drag and drop your image' },
            { num: 2, title: lang === 'ar' ? 'انتظر المعالجة' : 'Wait for Processing', desc: lang === 'ar' ? 'ستتم إزالة الخلفية تلقائياً في ثوانٍ' : 'Background removed automatically in seconds' },
            { num: 3, title: lang === 'ar' ? 'عدّل الأبعاد' : 'Resize (Optional)', desc: lang === 'ar' ? 'غيّر العرض والارتفاع حسب احتياجك' : 'Adjust width and height as needed' },
            { num: 4, title: lang === 'ar' ? 'حمّل النتيجة' : 'Download Result', desc: lang === 'ar' ? 'اختر PNG أو WebP وحمّل صورتك' : 'Choose PNG or WebP and download' },
          ].map((item) => (
            <div key={item.num} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-3">
                {item.num}
              </div>
              <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* المميزات التفصيلية */}
      <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
          {lang === 'ar' ? '⭐ لماذا تختار أداتنا؟' : '⭐ Why Choose Our Tool?'}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: Zap, color: 'green', title: lang === 'ar' ? 'معالجة فورية' : 'Instant Processing', desc: lang === 'ar' ? 'إزالة الخلفية وتغيير الحجم في أقل من 5 ثوانٍ' : 'Remove background and resize in less than 5 seconds' },
            { icon: Shield, color: 'blue', title: lang === 'ar' ? 'خصوصية 100%' : '100% Privacy', desc: lang === 'ar' ? 'لا يتم رفع صورك لأي خادم خارجي' : 'Your images are never uploaded to any server' },
            { icon: Crop, color: 'purple', title: lang === 'ar' ? 'تغيير أبعاد مرن' : 'Flexible Resizing', desc: lang === 'ar' ? 'تحكم كامل في الأبعاد مع الحفاظ على النسب' : 'Full control over dimensions with ratio preservation' },
            { icon: ImageIcon, color: 'yellow', title: lang === 'ar' ? 'صيغ متعددة' : 'Multiple Formats', desc: lang === 'ar' ? 'حمّل بصيغة PNG أو WebP حسب احتياجك' : 'Download in PNG or WebP format as needed' },
            { icon: Star, color: 'red', title: lang === 'ar' ? 'مجانية بدون حدود' : 'Unlimited & Free', desc: lang === 'ar' ? 'استخدم الأداة مجاناً بدون أي قيود' : 'Use the tool for free with no restrictions' },
            { icon: Check, color: 'indigo', title: lang === 'ar' ? 'بدون تسجيل' : 'No Signup Required', desc: lang === 'ar' ? 'ابدأ الاستخدام فوراً بدون حساب' : 'Start using immediately without an account' },
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* الفرق بين PNG و WebP */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 md:p-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
          {lang === 'ar' ? '📁 الفرق بين PNG و WebP' : '📁 PNG vs WebP: What\'s the Difference?'}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-blue-900 mb-4 text-xl flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              {lang === 'ar' ? 'صيغة PNG' : 'PNG Format'}
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {[
                lang === 'ar' ? 'جودة عالية بدون فقدان البيانات' : 'High quality without data loss',
                lang === 'ar' ? 'مثالية للخلفيات الشفافة' : 'Perfect for transparent backgrounds',
                lang === 'ar' ? 'مدعومة من جميع البرامج' : 'Supported by all software',
                lang === 'ar' ? 'الأفضل للطباعة والتصاميم' : 'Best for printing and designs',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-green-900 mb-4 text-xl flex items-center gap-2">
              <Zap className="w-6 h-6" />
              {lang === 'ar' ? 'صيغة WebP' : 'WebP Format'}
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {[
                lang === 'ar' ? 'حجم أصغر بنسبة 25-35% من PNG' : '25-35% smaller than PNG',
                lang === 'ar' ? 'مثالية لمواقع الويب' : 'Perfect for websites',
                lang === 'ar' ? 'تدعم الشفافية مثل PNG' : 'Supports transparency like PNG',
                lang === 'ar' ? 'موصى بها من Google' : 'Recommended by Google',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* الاستخدامات */}
      <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
          {lang === 'ar' ? ' استخدامات إزالة الخلفية' : '🎯 Uses for Background Removal'}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '📸', title: lang === 'ar' ? 'التصوير الفوتوغرافي' : 'Photography', desc: lang === 'ar' ? 'صور شخصية وعائلية احترافية' : 'Professional personal and family photos' },
            { icon: '🛒', title: lang === 'ar' ? 'المتاجر الإلكترونية' : 'E-commerce', desc: lang === 'ar' ? 'صور منتجات بخلفيات شفافة' : 'Product images with transparent backgrounds' },
            { icon: '🎨', title: lang === 'ar' ? 'التصميم الجرافيكي' : 'Graphic Design', desc: lang === 'ar' ? 'عزل العناصر للتصاميم' : 'Isolate elements for designs' },
            { icon: '📱', title: lang === 'ar' ? 'السوشيال ميديا' : 'Social Media', desc: lang === 'ar' ? 'منشورات جذابة لإنستغرام وتيك توك' : 'Attractive posts for Instagram & TikTok' },
            { icon: '🎓', title: lang === 'ar' ? 'السيرة الذاتية' : 'Resume/CV', desc: lang === 'ar' ? 'صور احترافية للسيرة الذاتية' : 'Professional photos for your CV' },
            { icon: '🖼️', title: lang === 'ar' ? 'الملصقات واللافتات' : 'Posters & Banners', desc: lang === 'ar' ? 'تصاميم إعلانية جذابة' : 'Attractive advertising designs' },
          ].map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-blue-300 transition-all">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* الأسئلة الشائعة (FAQ) - مهم جداً للـ SEO */}
      <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
          <HelpCircle className="w-10 h-10 text-blue-600" />
          {lang === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        </h2>
        <div className="space-y-3 max-w-4xl mx-auto">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-right hover:bg-gray-50 transition-colors"
              >
                <span className="font-bold text-gray-800 text-lg">{faq.question}</span>
                <span className={`text-2xl text-blue-600 transition-transform ${openFaq === idx ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-gray-600 border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA نهائي */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {lang === 'ar' ? 'جاهز لإزالة خلفية صورتك؟' : 'Ready to Remove Your Image Background?'}
        </h2>
        <p className="text-lg mb-6 opacity-90">
          {lang === 'ar' 
            ? 'ابدأ الآن مجاناً - بدون تسجيل، بدون حدود، بدون انتظار'
            : 'Start now for free - no signup, no limits, no waiting'}
        </p>
        <button
          onClick={() => {
            reset();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:scale-105 transition-transform shadow-lg"
        >
          {lang === 'ar' ? '🚀 ابدأ الآن مجاناً' : '🚀 Start Free Now'}
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 rounded-2xl p-8 text-center text-gray-600">
        <p className="mb-2 font-semibold">
          {lang === 'ar' 
            ? 'أداة إزالة خلفية الصور - مجانية 100% وآمنة'
            : 'Background Remover Tool - 100% Free & Secure'}
        </p>
        <p className="text-sm mb-4">
          {lang === 'ar'
            ? 'جميع المعالجة تتم على متصفحك مباشرة. صورك آمنة ومحمية.'
            : 'All processing happens directly in your browser. Your images are safe and secure.'}
        </p>
        <p className="text-xs">
          © {new Date().getFullYear()} Free Background Remover - All rights reserved
        </p>
      </footer>
    </div>
  );
}
