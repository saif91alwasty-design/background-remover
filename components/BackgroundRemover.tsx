'use client';

import { useState, useRef } from 'react';
import { Upload, Download, RotateCcw, Check, Sparkles, Star, Zap, Shield, Image as ImageIcon } from 'lucide-react';

export default function BackgroundRemover() {
  const [step, setStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'webp'>('png');
  const [downloadQuality, setDownloadQuality] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
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
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;
        
        if (brightness > 220) {
          data[i + 3] = 0;
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      setProcessedImage(canvas.toDataURL('image/png'));
      setStep('result');
    };
    
    img.src = imageSrc;
  };

  const downloadImage = () => {
    if (!processedImage || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    
    if (downloadFormat === 'webp') {
      link.href = canvas.toDataURL('image/webp', downloadQuality / 100);
      link.download = `no-bg-${Date.now()}.webp`;
    } else {
      link.href = processedImage;
      link.download = `no-bg-${Date.now()}.png`;
    }
    
    link.click();
  };

  const reset = () => {
    setStep('upload');
    setOriginalImage(null);
    setProcessedImage(null);
    setSelectedFile(null);
    setDownloadFormat('png');
    setDownloadQuality(100);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <canvas ref={canvasRef} className="hidden" />

      {/* Banner Hostinger الاحترافي */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-700 to-blue-600 rounded-2xl p-6 md:p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 font-bold text-sm">استضافة موثوقة عالمياً</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              🚀 ابدأ موقعك الإلكتروني مع Hostinger
            </h2>
            <p className="text-purple-100 text-sm md:text-base mb-3">
              استضافة سريعة، آمنة، وبأسعار تبدأ من $2.99/شهر مع ضمان استعادة الأموال 30 يوماً
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs">
              <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> سرعة فائقة</span>
              <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> حماية SSL مجانية</span>
              <span className="flex items-center gap-1"><ImageIcon className="w-4 h-4" /> نطاق مجاني</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <a 
              href="https://www.hostinger.com?REFERRALCODE=DUWSAIF91G7J"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-center"
            >
              <div className="text-lg">احصل على خصم 90%</div>
              <div className="text-sm opacity-90">سجل الآن →</div>
            </a>
          </div>
        </div>
      </div>

      {/* العنوان الرئيسي */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          إزالة خلفية الصور مجاناً
        </h1>
        <p className="text-lg text-gray-600">
          ارفع صورتك وسنزيل الخلفية تلقائياً في ثوانٍ - بدقة عالية PNG أو WebP
        </p>
      </div>

      {/* الخطوة 1: رفع الصورة */}
      {step === 'upload' && (
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border-2 border-dashed border-blue-200 hover:border-blue-400 transition-all">
          <div 
            onClick={() => document.getElementById('file-input')?.click()}
            className="cursor-pointer text-center space-y-6"
          >
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-12 h-12 text-blue-600" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                اضغط هنا لرفع صورتك
              </h3>
              <p className="text-gray-500">
                أو اسحب الصورة وأفلتها هنا
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" /> مجاناً 100%
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" /> سريع
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" /> بدون تسجيل
              </span>
            </div>

            <input 
              id="file-input" 
              type="file" 
              accept="image/*" 
              onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])} 
              className="hidden" 
            />
          </div>
        </div>
      )}

      {/* الخطوة 2: جاري المعالجة */}
      {step === 'processing' && (
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
            <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-blue-600 animate-pulse" />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              جاري إزالة الخلفية...
            </h3>
            <p className="text-gray-500">
              يرجى الانتظار لحظة
            </p>
          </div>

          <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}

      {/* الخطوة 3: النتيجة */}
      {step === 'result' && (
        <div className="space-y-6">
          {/* عرض الصور */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">الصورة الأصلية</h3>
              <img src={originalImage!} alt="Original" className="w-full rounded-xl" />
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                بعد إزالة الخلفية ✨
              </h3>
              <div 
                className="rounded-xl overflow-hidden border-2 border-gray-200"
                style={{
                  backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                  backgroundSize: '20px 20px'
                }}
              >
                <img src={processedImage!} alt="Processed" className="w-full" />
              </div>
            </div>
          </div>

          {/* خيارات التحميل المتقدمة */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-lg p-6 border-2 border-green-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Download className="w-6 h-6" />
              خيارات التحميل المتقدمة
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الصيغة
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDownloadFormat('png')}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                      downloadFormat === 'png'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    PNG (بدون فقدان)
                  </button>
                  <button
                    onClick={() => setDownloadFormat('webp')}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                      downloadFormat === 'webp'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    WebP (أصغر حجماً)
                  </button>
                </div>
              </div>

              {downloadFormat === 'webp' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الجودة: {downloadQuality}%
                  </label>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={downloadQuality} 
                    onChange={(e) => setDownloadQuality(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
              <button 
                onClick={downloadImage} 
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-3 shadow-lg"
              >
                <Download className="w-6 h-6" />
                تحميل بصيغة {downloadFormat.toUpperCase()}
              </button>
              <button 
                onClick={reset} 
                className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all flex items-center gap-3"
              >
                <RotateCcw className="w-6 h-6" />
                صورة جديدة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مميزات الأداة */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">تلقائي 100%</h3>
          <p className="text-sm text-gray-600">لا حاجة لضبط الإعدادات، نزيل الخلفية تلقائياً</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">جودة عالية</h3>
          <p className="text-sm text-gray-600">حمّل صورتك بصيغة PNG أو WebP بدقة عالية</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-800 mb-2">سريع وآمن</h3>
          <p className="text-sm text-gray-600">المعالجة على جهازك، خصوصية تامة</p>
        </div>
      </div>

      {/* محتوى SEO الغني */}
      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 mt-12">
        <h2 className="text-3xl font-bold text-gray-900">
          أداة إزالة خلفية الصور المجانية والاحترافية
        </h2>
        
        <div className="prose prose-lg max-w-none text-gray-600 space-y-4">
          <p>
            مرحباً بك في أفضل أداة <strong>إزالة خلفية الصور</strong> المجانية على الإنترنت. 
            تتيح لك أداتنا المتقدمة إزالة الخلفية من أي صورة بسهولة وسرعة فائقة باستخدام 
            تقنيات الذكاء الاصطناعي الحديثة.
          </p>

          <h3 className="text-2xl font-bold text-gray-800">
            لماذا تختار أداة إزالة الخلفية لدينا؟
          </h3>
          
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <span><strong>معالجة فورية:</strong> احصل على نتائجك في ثوانٍ معدودة دون انتظار</span>
            </li>
            <li className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <span><strong>خصوصية تامة:</strong> جميع المعالجة تتم على جهازك، لا نرفع صورك لأي خادم</span>
            </li>
            <li className="flex items-start gap-3">
              <ImageIcon className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <span><strong>دقة عالية:</strong> حمّل صورك بجودة عالية بصيغة PNG أو WebP</span>
            </li>
            <li className="flex items-start gap-3">
              <Star className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <span><strong>مجانية 100%:</strong> استخدم الأداة مجاناً بدون حدود أو تسجيل</span>
            </li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-800">
            كيفية استخدام أداة إزالة الخلفية
          </h3>
          
          <ol className="space-y-3 list-decimal list-inside">
            <li>ارفع صورتك بالنقر على زر "رفع صورة" أو اسحب الصورة وأفلتها</li>
            <li>انتظر ثوانٍ معدودة حتى تتم المعالجة تلقائياً</li>
            <li>اختر صيغة التحميل (PNG أو WebP)</li>
            <li>حمّل صورتك النهائية مجاناً</li>
          </ol>

          <h3 className="text-2xl font-bold text-gray-800">
            صيغ التحميل المتاحة
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-bold text-blue-900 mb-2">PNG (Portable Network Graphics)</h4>
              <p className="text-sm">
                الصيغة المثالية للصور ذات الخلفيات الشفافة. تحافظ على الجودة الأصلية 
                بدون أي فقدان في البيانات. مثالية للاستخدام في التصاميم والمواقع الإلكترونية.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-bold text-green-900 mb-2">WebP (Web Picture)</h4>
              <p className="text-sm">
                صيغة حديثة من Google توفر حجماً أصغر بنسبة 25-35% من PNG مع الحفاظ 
                على جودة عالية. مثالية لتحسين سرعة تحميل المواقع والتطبيقات.
              </p>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-800">
            استخدامات إزالة خلفية الصور
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2">📸 التصوير الفوتوغرافي</h4>
              <p className="text-sm text-gray-600">
                إزالة الخلفيات من الصور الشخصية والعائلية للحصول على صور احترافية
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2">🛒 المتاجر الإلكترونية</h4>
              <p className="text-sm text-gray-600">
                تحضير صور المنتجات بخلفيات بيضاء أو شفافة لعرضها بشكل احترافي
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2">🎨 التصميم الجرافيكي</h4>
              <p className="text-sm text-gray-600">
                عزل العناصر من الصور لاستخدامها في التصاميم والإعلانات
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-l-4 border-purple-500">
            <h4 className="font-bold text-purple-900 mb-2">💡 نصيحة احترافية</h4>
            <p className="text-sm text-purple-800">
              للحصول على أفضل النتائج، استخدم صوراً ذات خلفية متجانسة اللون (أبيض، 
              أزرق، أخضر). كلما زاد التباين بين الخلفية والعنصر الرئيسي، كانت النتيجة أفضل!
            </p>
          </div>
        </div>
      </div>

      {/* Footer SEO */}
      <div className="bg-gray-100 rounded-2xl p-8 text-center text-gray-600">
        <p className="mb-4">
          <strong>الكلمات المفتاحية:</strong> إزالة خلفية الصور، background remover، 
          إزالة الخلفية مجاناً، png transparent، webp converter، عزل الصور، 
          background removal tool، free background remover
        </p>
        <p className="text-sm">
          © {new Date().getFullYear()} أداة إزالة خلفية الصور - جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
