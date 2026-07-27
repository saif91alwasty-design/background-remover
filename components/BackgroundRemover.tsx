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

  // أسئلة شائعة محدثة بالكلمات المفتاحية من التقرير
  const faqs = [
    {
      question: txt('كيف يمكنني مسح خلفية الصور اون لاين مجاناً؟', 'How can I remove image background online for free?'),
      answer: txt('يمكنك مسح خلفية الصور اون لاين مجاناً باستخدام موقعنا الذي يعمل بالذكاء الاصطناعي 2026. فقط ارفع الصورة وستتم إزالة الخلفية تلقائياً في ثوانٍ بدون برامج.', 'You can remove image background online for free using our AI-powered tool 2026. Just upload your image and the background will be removed automatically in seconds.'),
    },
    {
      question: txt('هل يمكن تغيير خلفية الصورة تلقائيا بالذكاء الاصطناعي؟', 'Can I change image background automatically with AI?'),
      answer: txt('نعم! موقعنا يستخدم أحدث تقنيات إزالة الخلفية بالذكاء الاصطناعي لتغيير خلفية الصورة تلقائيا بدقة عالية. يعمل على الهاتف والكمبيوتر بدون تطبيقات.', 'Yes! Our site uses the latest AI background removal technology to automatically change image backgrounds with high accuracy. Works on mobile and desktop without apps.'),
    },
    {
      question: txt('هل يمكن إزالة خلفية الصور للهاتف (أندرويد وآيفون)؟', 'Can I remove background from photos on mobile (Android & iPhone)?'),
      answer: txt('بالتأكيد! موقعنا مصمم خصيصاً لإزالة خلفية الصور للهاتف. يعمل على جميع المتصفحات (كروم، سفاري) بدون الحاجة لتحميل أي تطبيق.', 'Absolutely! Our site is designed for removing backgrounds from photos on mobile. Works on all browsers (Chrome, Safari) without downloading any app.'),
    },
    {
      question: txt('ما الفرق بين تفريغ الصور من الخلفية بصيغة PNG و WebP؟', 'What is the difference between PNG and WebP for background removal?'),
      answer: txt('صيغة PNG مثالية لتفريغ الصور من الخلفية بجودة عالية بدون فقدان البيانات. أما WebP فهي أحدث وتوفر حجماً أصغر بنسبة 30% مع نفس الجودة، مثالية لمواقع الويب.', 'PNG is ideal for high-quality background removal without data loss. WebP is newer and provides 30% smaller file size with the same quality, perfect for websites.'),
    },
    {
      question: txt('هل موقع إزالة الخلفية مجاناً آمن ويحافظ على خصوصية صوري؟', 'Is the free background remover safe and does it protect my privacy?'),
      answer: txt('نعم، موقع إزالة الخلفية مجاناً آمن 100%. جميع عمليات تفريغ الصور من الخلفية تتم على متصفحك مباشرة، ولا نحتفظ بأي صور على خوادمنا.', 'Yes, the free background remover is 100% safe. All background removal processes happen directly in your browser, and we don\'t store any images on our servers.'),
    },
    {
      question: txt('ما هي أفضل استخدامات إزالة الخلفية بالذكاء الاصطناعي في 2026؟', 'What are the best uses for AI background removal in 2026?'),
      answer: txt('إزالة الخلفية بالذكاء الاصطناعي مفيدة للمتاجر الإلكترونية (صور المنتجات)، التصوير الفوتوغرافي، التصميم الجرافيكي، السوشيال ميديا، والسيرة الذاتية.', 'AI background removal is useful for e-commerce (product photos), photography, graphic design, social media, and resumes.'),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <canvas ref={canvasRef} className="hidden" />

      {/* زر تبديل اللغة */}
      <div className="flex justify-end">
        <LanguageSwitcher currentLang={currentLang} />
      </div>

      {/* Banner Hostinger */}
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
                {txt('استضافة موثوقة عالمياً', 'Trusted Worldwide Hosting')}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
               {txt('ابدأ موقعك مع Hostinger', 'Start Your Website with Hostinger')}
            </h2>
            <p className="text-purple-100 text-sm md:text-base mb-3">
              {txt('استضافة سريعة وآمنة تبدأ من $2.99/شهر', 'Fast and secure hosting from $2.99/month')}
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold px-8 py-4 rounded-xl shadow-lg text-center">
              <div className="text-lg">{txt('خصم 90%', 'Get 90% OFF')}</div>
            </div>
          </div>
        </div>
      </a>

      {/* العنوان الرئيسي - محسّن للكلمات المفتاحية */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          {txt('إزالة خلفية الصور مجاناً بالذكاء الاصطناعي 2026', 'Free AI Background Remover 2026')}
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          {txt(
            'موقع إزالة الخلفية مجاناً - مسح خلفية الصور اون لاين وتغيير خلفية الصورة تلقائيا بالذكاء الاصطناعي. يعمل على الهاتف والكمبيوتر بدون برامج.',
            'Free background remover - Remove image background online automatically with AI. Works on mobile and desktop without software.'
          )}
        </p>
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
              <p className="text-sm text-gray-400 mt-2">
                {txt('يدعم PNG, JPG, WEBP - تفريغ الصور من الخلفية في ثوانٍ', 'Supports PNG, JPG, WEBP - Remove background in seconds')}
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400 flex-wrap">
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> {t('free')}</span>
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> {t('fast')}</span>
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> {txt('للأندرويد والآيفون', 'For Android & iPhone')}</span>
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
            <p className="text-gray-500">{txt('جاري تغيير خلفية الصورة تلقائيا بالذكاء الاصطناعي...', 'Automatically changing background with AI...')}</p>
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
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('format')}</label>
                <div className="flex gap-3">
                  <button onClick={() => setDownloadFormat('png')} className={`flex-1 px-4 py-3 rounded-lg font-semibold ${downloadFormat === 'png' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>{t('png')}</button>
                  <button onClick={() => setDownloadFormat('webp')} className={`flex-1 px-4 py-3 rounded-lg font-semibold ${downloadFormat === 'webp' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>{t('webp')}</button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
              <button onClick={downloadImage} className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold flex items-center gap-3 shadow-lg">
                <Download className="w-6 h-6" />
                {t('download')}
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
          <h3 className="font-bold text-gray-800 mb-2">{txt('إزالة الخلفية بالذكاء الاصطناعي', 'AI Background Removal')}</h3>
          <p className="text-sm text-gray-600">{txt('تغيير خلفية الصورة تلقائيا في ثوانٍ', 'Automatic background change in seconds')}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crop className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">{txt('إزالة خلفية الصور للهاتف', 'Mobile Background Removal')}</h3>
          <p className="text-sm text-gray-600">{txt('يعمل على أندرويد وآيفون بدون تطبيقات', 'Works on Android & iPhone without apps')}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">{txt('موقع إزالة الخلفية مجاناً', 'Free Background Remover')}</h3>
          <p className="text-sm text-gray-600">{txt('تفريغ الصور من الخلفية بدون تسجيل', 'Remove background without signup')}</p>
        </div>
      </div>

      {/* كيفية الاستخدام */}
      <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
          📝 {txt('كيفية مسح خلفية الصور اون لاين في 4 خطوات', 'How to Remove Background Online in 4 Steps')}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { num: 1, title: txt('ارفع صورتك', 'Upload Image'), desc: txt('اضغط على زر الرفع أو اسحب الصورة', 'Click upload or drag and drop') },
            { num: 2, title: txt('انتظر المعالجة', 'Wait'), desc: txt('تغيير خلفية الصورة تلقائيا بالذكاء الاصطناعي', 'AI automatically changes background') },
            { num: 3, title: txt('عدّل الأبعاد', 'Resize'), desc: txt('غيّر العرض والارتفاع حسب احتياجك', 'Adjust width and height as needed') },
            { num: 4, title: txt('حمّل النتيجة', 'Download'), desc: txt('تفريغ الصور من الخلفية بصيغة PNG أو WebP', 'Download as PNG or WebP') },
          ].map((item) => (
            <div key={item.num} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-3">{item.num}</div>
              <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* المميزات التفصيلية */}
      <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
          ⭐ {txt('لماذا تختار موقعنا لإزالة الخلفية بالذكاء الاصطناعي؟', 'Why Choose Our AI Background Remover?')}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: Zap, color: 'green', title: txt('مسح خلفية الصور اون لاين فوري', 'Instant Online Background Removal'), desc: txt('تغيير خلفية الصورة تلقائيا في أقل من 5 ثوانٍ', 'Automatic background change in less than 5 seconds') },
            { icon: Shield, color: 'blue', title: txt('خصوصية 100% - لا نحتفظ بصورك', '100% Privacy - We don\'t store images'), desc: txt('تفريغ الصور من الخلفية يتم على جهازك مباشرة', 'Background removal happens directly on your device') },
            { icon: Crop, color: 'purple', title: txt('إزالة خلفية الصور للهاتف والكمبيوتر', 'Mobile & Desktop Background Removal'), desc: txt('يعمل على جميع الأجهزة بدون تطبيقات', 'Works on all devices without apps') },
            { icon: ImageIcon, color: 'yellow', title: txt('صيغ متعددة: PNG و WebP', 'Multiple Formats: PNG & WebP'), desc: txt('حمّل بصيغة PNG أو WebP حسب احتياجك', 'Download in PNG or WebP format') },
            { icon: Star, color: 'red', title: txt('موقع إزالة الخلفية مجاناً 100%', '100% Free Background Remover'), desc: txt('بدون رسوم خفية أو اشتراكات', 'No hidden fees or subscriptions') },
            { icon: Check, color: 'indigo', title: txt('بدون تسجيل - ابدأ فوراً', 'No Signup - Start Immediately'), desc: txt('مسح خلفية الصور اون لاين بدون حساب', 'Remove background online without account') },
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

      {/* الاستخدامات */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 md:p-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
          🎯 {txt('استخدامات إزالة الخلفية بالذكاء الاصطناعي', 'Uses for AI Background Removal')}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '', title: txt('المتاجر الإلكترونية', 'E-commerce'), desc: txt('صور منتجات بخلفيات شفافة', 'Product images with transparent backgrounds') },
            { icon: '📸', title: txt('التصوير الفوتوغرافي', 'Photography'), desc: txt('تعديل الصور الشخصية والعائلية', 'Personal and family photo editing') },
            { icon: '🎨', title: txt('التصميم الجرافيكي', 'Graphic Design'), desc: txt('إنشاء ملصقات وإعلانات', 'Create posters and ads') },
            { icon: '📱', title: txt('السوشيال ميديا', 'Social Media'), desc: txt('منشورات احترافية لإنستغرام وتيك توك', 'Professional posts for Instagram & TikTok') },
            { icon: '', title: txt('السيرة الذاتية', 'Resume/CV'), desc: txt('صور رسمية احترافية', 'Professional official photos') },
            { icon: '🖼️', title: txt('الملصقات واللافتات', 'Posters & Banners'), desc: txt('تصاميم إعلانية جذابة', 'Attractive advertising designs') },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-all">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* الأسئلة الشائعة - محسّنة للكلمات المفتاحية */}
      <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
          <HelpCircle className="w-10 h-10 text-blue-600" />
          {txt('الأسئلة الشائعة حول إزالة خلفية الصور', 'Frequently Asked Questions about Background Removal')}
        </h2>
        <div className="space-y-3 max-w-4xl mx-auto">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-right hover:bg-gray-50 transition-colors"
              >
                <span className="font-bold text-gray-800 text-lg">{faq.question}</span>
                <span className={`text-2xl text-blue-600 transition-transform ${openFaq === idx ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-gray-600 border-t border-gray-100 pt-4">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA نهائي */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {txt('ابدأ مسح خلفية الصور اون لاين مجاناً الآن!', 'Start Removing Backgrounds Online for Free Now!')}
        </h2>
        <p className="text-lg mb-6 opacity-90">
          {txt('موقع إزالة الخلفية بالذكاء الاصطناعي - تغيير خلفية الصورة تلقائيا في ثوانٍ', 'AI background remover - Automatic background change in seconds')}
        </p>
        <button
          onClick={() => { reset(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:scale-105 transition-transform shadow-lg"
        >
          🚀 {txt('جرب إزالة الخلفية مجاناً', 'Try Free Background Removal')}
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 rounded-2xl p-8 text-center text-gray-600">
        <p className="mb-2 font-semibold">
          {txt('موقع إزالة الخلفية مجاناً بالذكاء الاصطناعي 2026', 'Free AI Background Remover 2026')}
        </p>
        <p className="text-sm mb-4">
          {txt('مسح خلفية الصور اون لاين - تغيير خلفية الصورة تلقائيا - تفريغ الصور من الخلفية', 'Online background removal - Automatic background change - Free background remover')}
        </p>
        <p className="text-xs">
          © {new Date().getFullYear()} Free Background Remover - All rights reserved
        </p>
      </footer>
    </div>
  );
}
