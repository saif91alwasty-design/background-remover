'use client';

import { useState, useRef, useEffect } from 'react';
import Script from 'next/script';
import { Upload, Download, RotateCcw, Sparkles, Zap, Crosshair, ShieldCheck, Gauge, HelpCircle, Smartphone, Cpu, Search } from 'lucide-react';
import { getTranslation } from '@/lib/translations';
import { Language, getLanguageInfo } from '@/lib/languages';
import LanguageSwitcher from './LanguageSwitcher';

interface RGB { r: number; g: number; b: number; }

/* ===== وحدة إعلانية محتواة (لا تكسر التصميم عند فشل الإعلان) ===== */
function AdUnit({ slot }: { slot: number }) {
  return (
    <div className="w-full flex justify-center my-2">
      <div className="w-full max-w-[320px] text-center">
        <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-widest">Advertisement</p>
        <div className="relative min-h-[250px] w-[300px] max-w-full mx-auto rounded-xl overflow-hidden bg-slate-50/60 ring-1 ring-slate-100 flex flex-col items-center justify-center">
          <Script
            id={`ad-script-${slot}`}
            src="https://poetrywishing.com/db7c9ea9c7974c304a1ad8c9847614d5/invoke.js"
            strategy="afterInteractive"
            data-cfasync="false"
          />
          <div id="container-db7c9ea9c7974c304a1ad8c9847614d5" />
        </div>
      </div>
    </div>
  );
}

/* ===== المكون الرئيسي ===== */
export default function BackgroundRemover({ lang }: { lang: string }) {
  const currentLang = lang as Language;
  const t = (key: string) => getTranslation(currentLang, key);
  const txt = (ar: string, en: string) => (currentLang === 'ar' ? ar : en);

  // 👇 إصلاح الاتجاه واللغة ديناميكياً لكل صفحة
  useEffect(() => {
    const info = getLanguageInfo(currentLang);
    document.documentElement.lang = currentLang;
    document.documentElement.dir = info.dir;
  }, [currentLang]);

  const [step, setStep] = useState<'upload' | 'result'>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState(45);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  const [pickedColor, setPickedColor] = useState<RGB | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const processCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const median = (arr: number[]) => {
    const s = [...arr].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
  };

  const detectEdgeColor = (ctx: CanvasRenderingContext2D, w: number, h: number): RGB => {
    const rs: number[] = [], gs: number[] = [], bs: number[] = [];
    const stepPx = 12;
    const push = (x: number, y: number) => {
      const p = ctx.getImageData(x, y, 1, 1).data;
      rs.push(p[0]); gs.push(p[1]); bs.push(p[2]);
    };
    for (let x = 0; x < w; x += stepPx) { push(x, 0); push(x, h - 1); }
    for (let y = 0; y < h; y += stepPx) { push(0, y); push(w - 1, y); }
    return { r: median(rs), g: median(gs), b: median(bs) };
  };

  const paintOriginal = (src: string): Promise<void> =>
    new Promise((resolve) => {
      const cv = originalCanvasRef.current!;
      const ctx = cv.getContext('2d')!;
      const img = new Image();
      img.onload = () => {
        cv.width = img.width;
        cv.height = img.height;
        ctx.drawImage(img, 0, 0);
        setDimensions({ w: img.width, h: img.height });
        resolve();
      };
      img.src = src;
    });

  const runRemoval = (src: string, tol: number, target: RGB | null) => {
    const cv = processCanvasRef.current!;
    const ctx = cv.getContext('2d', { willReadFrequently: true })!;
    const img = new Image();
    img.onload = () => {
      cv.width = img.width;
      cv.height = img.height;
      ctx.drawImage(img, 0, 0);
      const bg = target ?? detectEdgeColor(ctx, cv.width, cv.height);
      const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
      const thr = tol * 2.55;
      const feather = 45;
      for (let i = 0; i < data.length; i += 4) {
        const dr = data[i] - bg.r, dg = data[i + 1] - bg.g, db = data[i + 2] - bg.b;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);
        if (dist < thr) data[i + 3] = 0;
        else if (dist < thr + feather) data[i + 3] = Math.round(255 * (dist - thr) / feather);
      }
      ctx.putImageData(new ImageData(data, cv.width, cv.height), 0, 0);
      setProcessedImage(cv.toDataURL('image/png'));
      setIsProcessing(false);
    };
    img.src = src;
  };

  const handleImageSelect = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const src = e.target?.result as string;
      setOriginalImage(src);
      setPickedColor(null);
      setStep('result');
      setIsProcessing(true);
      await paintOriginal(src);
      runRemoval(src, tolerance, null);
    };
    reader.readAsDataURL(file);
  };

  const handleOriginalClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!originalCanvasRef.current || !originalImage) return;
    const cv = originalCanvasRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (cv.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (cv.height / rect.height));
    const p = cv.getContext('2d')!.getImageData(x, y, 1, 1).data;
    const color = { r: p[0], g: p[1], b: p[2] };
    setPickedColor(color);
    setIsProcessing(true);
    runRemoval(originalImage, tolerance, color);
  };

  const handleTolerance = (v: number) => {
    setTolerance(v);
    if (originalImage) { setIsProcessing(true); runRemoval(originalImage, v, pickedColor); }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const a = document.createElement('a');
    a.href = processedImage;
    a.download = `no-bg-${Date.now()}.png`;
    a.click();
  };

  const reset = () => {
    setStep('upload');
    setOriginalImage(null);
    setProcessedImage(null);
    setPickedColor(null);
    setTolerance(45);
  };

  const faqs = [
    {
      q: txt('كيف يمكنني مسح خلفية الصور اون لاين مجاناً؟', 'How can I remove image background online for free?'),
      a: txt('يمكنك مسح خلفية الصور اون لاين مجاناً عبر رفع الصورة في أداتنا، وستتم إزالة الخلفية تلقائياً في ثوانٍ. لا حاجة لتحميل برامج أو إنشاء حساب، والأداة تعمل مباشرة في المتصفح على الهاتف والكمبيوتر.', 'You can remove image background online for free by uploading your image to our tool. The background is removed automatically in seconds. No software or account needed, and it works directly in the browser on mobile and desktop.'),
    },
    {
      q: txt('هل يمكن تغيير خلفية الصورة تلقائيا بدون برامج؟', 'Can I change image background automatically without software?'),
      a: txt('نعم! أداتنا تتيح لك تغيير خلفية الصورة تلقائيا باستخدام خوارزمية كشف الحواف الذكية. ارفع الصورة فقط وستُزال الخلفية فوراً، ويمكنك النقر على أي لون لتحديده يدوياً لدقة أعلى.', 'Yes! Our tool changes image background automatically using smart edge detection. Just upload and the background is removed instantly, and you can click any color to pick it manually for higher accuracy.'),
    },
    {
      q: txt('هل تعمل أداة إزالة خلفية الصور للهاتف (أندرويد وآيفون)؟', 'Does the background remover work on mobile (Android & iPhone)?'),
      a: txt('بالتأكيد! أداة إزالة خلفية الصور للهاتف تعمل على جميع الأجهزة: أندرويد، آيفون، آيباد، والكمبيوتر، بدون تطبيقات إضافية. المعالجة تتم محلياً على جهازك مما يضمن السرعة والخصوصية.', 'Absolutely! The mobile background remover works on all devices — Android, iPhone, iPad, and desktop — with no extra apps. Processing happens locally on your device for speed and privacy.'),
    },
    {
      q: txt('ما الفرق بين إزالة الخلفية بالذكاء الاصطناعي والطرق التقليدية؟', 'What is the difference between AI background removal and traditional methods?'),
      a: txt('إزالة الخلفية بالذكاء الاصطناعي تستخدم خوارزميات متقدمة لتحديد حدود العنصر الرئيسي بدقة، بينما الطرق التقليدية تتطلب تحديداً يدوياً. أداتنا تجمع بين الكشف التلقائي الذكي والتحكم اليدوي للحصول على أفضل النتائج.', 'AI background removal uses advanced algorithms to detect subject edges accurately, while traditional methods need manual selection. Our tool combines smart auto-detection with manual control for the best results.'),
    },
    {
      q: txt('كيف أفرّغ الصور من الخلفية بجودة عالية؟', 'How do I remove background from images with high quality?'),
      a: txt('لتفريغ الصور من الخلفية بجودة عالية: استخدم صوراً بدقة عالية، اضبط الحساسية بين 40-60%، انقر على لون الخلفية يدوياً إن كان متدرجاً، ثم حمّل النتيجة بصيغة PNG للحفاظ على الشفافية.', 'For high-quality removal: use high-resolution images, set tolerance between 40-60%, click the background color manually if gradient, then download as PNG to preserve transparency.'),
    },
    {
      q: txt('هل موقع إزالة الخلفية مجاناً آمن على خصوصيتي؟', 'Is the free background remover safe for my privacy?'),
      a: txt('نعم، موقع إزالة الخلفية مجاناً آمن 100%. جميع عمليات المعالجة تتم محلياً في متصفحك، ولا تُرفع أي صورة إلى خوادمنا، ولا نحتفظ بأي بيانات. صورك تبقى على جهازك فقط.', 'Yes, the free background remover is 100% safe. All processing happens locally in your browser, no images are uploaded to our servers, and we store no data. Your images stay on your device only.'),
    },
  ];

  return (
    <div className="relative max-w-5xl mx-auto p-4 sm:p-6 space-y-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(99,102,241,0.12),transparent),radial-gradient(40%_40%_at_90%_90%,rgba(16,185,129,0.10),transparent)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.04] [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:32px_32px]" />

      <canvas ref={originalCanvasRef} className="hidden" />
      <canvas ref={processCanvasRef} className="hidden" />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-indigo-600 uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          {txt('يعمل محلياً · 2026', 'Client-side · 2026')}
        </div>
        <LanguageSwitcher currentLang={currentLang} />
      </div>

      <header className="space-y-3">
        <p className="text-sm font-semibold text-indigo-600 tracking-wide">
          {txt('مسح خلفية الصور اون لاين · بدون رفع للخادم', 'Remove background online · Zero upload')}
        </p>
        <h1 className="text-4xl sm:text-6xl font-black leading-[1.05] text-slate-900">
          {txt('إزالة خلفية الصورة', 'Remove Image')}{' '}
          <span className="relative inline-block text-indigo-600">
            {txt('بالذكاء الاصطناعي', 'Background with AI')}
            <svg className="absolute -bottom-2 start-0 w-full" height="8" viewBox="0 0 200 8" preserveAspectRatio="none">
              <path d="M0 5 Q50 0 100 4 T200 3" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
            </svg>
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-500 max-w-2xl">
          {txt('موقع إزالة الخلفية مجاناً — تفريغ الصور من الخلفية وتغيير خلفية الصورة تلقائيا في ثوانٍ. يعمل على الهاتف والكمبيوتر بدون برامج.', 'Free background remover site — remove background from images and change background automatically in seconds. Works on mobile and desktop without software.')}
        </p>
      </header>

      <AdUnit slot={1} />

      {step === 'upload' ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="group w-full rounded-3xl border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white/70 backdrop-blur p-10 sm:p-16 transition-all hover:shadow-xl hover:shadow-indigo-100"
        >
          <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])} className="hidden" />
          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-20 w-20 rounded-2xl bg-indigo-50 grid place-items-center group-hover:scale-110 group-hover:bg-indigo-100 transition-all">
              <Upload className="w-9 h-9 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{t('uploadTitle')}</h3>
              <p className="text-slate-500 mt-1">{t('uploadSubtitle')}</p>
            </div>
            <div className="flex gap-2 text-xs font-mono text-slate-400">
              <span className="px-2 py-1 rounded bg-slate-100">PNG</span>
              <span className="px-2 py-1 rounded bg-slate-100">JPG</span>
              <span className="px-2 py-1 rounded bg-slate-100">WEBP</span>
            </div>
          </div>
        </button>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Gauge className="w-5 h-5 text-indigo-600" />
                {txt('حساسية الإزالة', 'Removal Tolerance')}
              </div>
              <span className="font-mono text-lg font-black text-indigo-600 tabular-nums">{tolerance}%</span>
            </div>
            <input type="range" min="5" max="100" value={tolerance} onChange={(e) => handleTolerance(Number(e.target.value))} className="w-full h-2 rounded-full bg-slate-200 appearance-none cursor-pointer accent-indigo-600" />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {pickedColor ? (
                <div className="flex items-center gap-2 rounded-full bg-indigo-50 ps-3 pe-1 py-1 text-sm">
                  <Crosshair className="w-4 h-4 text-indigo-600" />
                  <span className="text-slate-700">{txt('لون محدد يدوياً', 'Manually picked')}</span>
                  <span className="h-6 w-6 rounded-full ring-2 ring-white shadow" style={{ background: `rgb(${pickedColor.r},${pickedColor.g},${pickedColor.b})` }} />
                  <button onClick={() => { setPickedColor(null); if (originalImage) { setIsProcessing(true); runRemoval(originalImage, tolerance, null); } }} className="text-xs text-indigo-600 hover:underline px-2">
                    {txt('إلغاء', 'Clear')}
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-400">{txt('الكشف التلقائي مفعّل — انقر على الصورة للتحديد اليدوي', 'Auto-detect on — click image for manual pick')}</span>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <figure className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <figcaption className="flex items-center justify-between mb-3 px-1">
                <span className="font-bold text-slate-800">{t('original')}</span>
                <span className="font-mono text-xs text-slate-400">{dimensions.w}×{dimensions.h}</span>
              </figcaption>
              <div className="relative rounded-xl overflow-hidden ring-1 ring-slate-200">
                <img src={originalImage!} alt="original" onClick={handleOriginalClick} className="w-full h-auto block cursor-crosshair select-none" />
                <span className="absolute top-2 end-2 inline-flex items-center gap-1 bg-slate-900/80 text-white text-[11px] px-2 py-1 rounded-full backdrop-blur">
                  <Crosshair className="w-3 h-3" /> {txt('انقر لالتقاط اللون', 'Click to pick')}
                </span>
              </div>
            </figure>

            <figure className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <figcaption className="flex items-center gap-2 mb-3 px-1 font-bold text-slate-800">
                <Sparkles className="w-5 h-5 text-amber-500" /> {t('result')}
              </figcaption>
              <div className="relative rounded-xl overflow-hidden ring-1 ring-slate-200 min-h-[180px] grid place-items-center" style={{ backgroundImage: 'conic-gradient(#e2e8f0 90deg, #fff 0 180deg, #e2e8f0 0 270deg, #fff 0)', backgroundSize: '24px 24px' }}>
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-3 py-10">
                    <div className="h-10 w-10 rounded-full border-[3px] border-indigo-200 border-t-indigo-600 animate-spin" />
                    <span className="text-sm text-slate-500">{t('processing')}</span>
                  </div>
                ) : processedImage ? (
                  <img src={processedImage} alt="result" className="w-full h-auto block" />
                ) : null}
              </div>
            </figure>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={downloadImage} disabled={!processedImage || isProcessing} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 transition-colors shadow-lg shadow-emerald-200">
              <Download className="w-5 h-5" /> {t('download')}
            </button>
            <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white ring-1 ring-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-4 px-6 transition-colors">
              <RotateCcw className="w-5 h-5" /> {t('newImage')}
            </button>
          </div>
        </div>
      )}

      {/* ===== محتوى SEO ===== */}
      <section className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-slate-100 space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">{txt('لماذا تختار موقعنا لإزالة خلفية الصورة؟', 'Why Choose Our Background Remover?')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Cpu, title: txt('إزالة الخلفية بالذكاء الاصطناعي', 'AI Background Removal'), desc: txt('خوارزمية كشف الحواف الذكية تحدد العنصر الرئيسي بدقة وتغير خلفية الصورة تلقائيا', 'Smart edge detection identifies the main subject accurately and changes background automatically') },
              { icon: Smartphone, title: txt('إزالة خلفية الصور للهاتف', 'Mobile Background Removal'), desc: txt('تعمل على أندرويد وآيفون بدون تطبيقات — افتح المتصفح وابدأ فوراً', 'Works on Android & iPhone without apps — open the browser and start') },
              { icon: ShieldCheck, title: txt('موقع إزالة الخلفية مجاناً وآمن', 'Free & Safe Background Remover'), desc: txt('معالجة محلية 100% — لا تُرفع صورك لأي خادم وخصوصيتك محمية', '100% local processing — images never uploaded, privacy protected') },
              { icon: Zap, title: txt('مسح خلفية الصور اون لاين فوري', 'Instant Online Background Removal'), desc: txt('تفريغ الصور من الخلفية في أقل من 3 ثوانٍ بدون انتظار', 'Remove background in under 3 seconds without waiting') },
              { icon: Crosshair, title: txt('تحكم يدوي دقيق', 'Precise Manual Control'), desc: txt('انقر على أي لون لتحديده كخلفية — مثالي للصور المتدرجة', 'Click any color to select as background — ideal for gradients') },
              { icon: Search, title: txt('بدون تسجيل أو برامج', 'No Signup or Software'), desc: txt('لا حساب ولا تحميل — أداة ويب تعمل مباشرة في المتصفح', 'No account or download — a web tool that runs in the browser') },
            ].map((f, i) => (
              <div key={i} className="rounded-xl bg-slate-50 p-5 hover:bg-indigo-50 transition-colors group">
                <f.icon className="w-6 h-6 text-indigo-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-slate-800 mb-1">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">{txt('كيفية مسح خلفية الصور اون لاين في 4 خطوات', 'How to Remove Background Online in 4 Steps')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n: '01', title: txt('ارفع صورتك', 'Upload Image'), desc: txt('اضغط منطقة الرفع أو اسحب الصورة. ندعم PNG وJPG وWEBP', 'Click the upload area or drag your image. PNG, JPG, WEBP supported') },
              { n: '02', title: txt('كشف تلقائي ذكي', 'Smart Auto-Detect'), desc: txt('خوارزمية وسيط الحواف تحدد لون الخلفية وتبدأ الإزالة فوراً', 'Edge-median algorithm detects background and starts removal') },
              { n: '03', title: txt('تحكّم يدوي', 'Manual Control'), desc: txt('انقر على أي لون أو اضبط الحساسية للنتيجة المثالية', 'Click any color or adjust tolerance for the perfect result') },
              { n: '04', title: txt('حمّل النتيجة', 'Download Result'), desc: txt('احفظ الصورة بخلفية شفافة بصيغة PNG مجاناً', 'Save with transparent background in PNG for free') },
            ].map((s, i) => (
              <div key={i} className="relative rounded-xl border border-slate-200 p-5 hover:border-indigo-300 transition-colors">
                <span className="text-4xl font-black text-indigo-100">{s.n}</span>
                <h3 className="font-bold text-slate-800 mt-2 mb-1">{s.title}</h3>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">{txt('استخدامات تفريغ الصور من الخلفية', 'Uses for Background Removal')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: '🛒', title: txt('المتاجر الإلكترونية', 'E-commerce'), desc: txt('صور منتجات بخلفية بيضاء أو شفافة', 'Product images with white or transparent background') },
              { icon: '📸', title: txt('التصوير الفوتوغرافي', 'Photography'), desc: txt('تعديل الصور الشخصية وإزالة الخلفيات المشتتة', 'Edit personal photos, remove distracting backgrounds') },
              { icon: '🎨', title: txt('التصميم الجرافيكي', 'Graphic Design'), desc: txt('عزل العناصر للملصقات والإعلانات', 'Isolate elements for posters and ads') },
              { icon: '📱', title: txt('السوشيال ميديا', 'Social Media'), desc: txt('منشورات احترافية لإنستغرام وتيك توك', 'Professional posts for Instagram & TikTok') },
              { icon: '📄', title: txt('السيرة الذاتية', 'Resume / CV'), desc: txt('صور رسمية للسيرة الذاتية وLinkedIn', 'Official photos for CV and LinkedIn') },
              { icon: '🖼️', title: txt('الطباعة واللافتات', 'Print & Banners'), desc: txt('تصاميم جاهزة للطباعة بخلفيات شفافة', 'Print-ready designs with transparent backgrounds') },
            ].map((u, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <span className="text-2xl">{u.icon}</span>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{u.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{u.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-indigo-600" />
            {txt('الأسئلة الشائعة', 'Frequently Asked Questions')}
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-start hover:bg-slate-50 transition-colors">
                  <span className="font-bold text-slate-800 text-sm sm:text-base">{faq.q}</span>
                  <span className={`text-xl text-indigo-600 transition-transform shrink-0 ${openFaq === idx ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === idx && (
                  <div className="px-4 sm:px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-emerald-50 p-6 border-s-4 border-indigo-500">
          <h3 className="font-black text-slate-900 text-lg mb-3">💡 {txt('نصائح للحصول على أفضل نتائج إزالة الخلفية', 'Tips for Best Background Removal Results')}</h3>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>• {txt('استخدم صوراً بدقة عالية (HD أو أعلى) لحواف نظيفة', 'Use high-resolution images (HD or higher) for clean edges')}</li>
            <li>• {txt('الخلفيات موحدة اللون (أبيض، أزرق، أخضر) تعطي أفضل النتائج', 'Uniform backgrounds (white, blue, green) give the best results')}</li>
            <li>• {txt('اضبط الحساسية بين 40-60% وزدها للخلفيات المعقدة', 'Set tolerance 40-60%, increase for complex backgrounds')}</li>
            <li>• {txt('انقر على لون الخلفية يدوياً إن كان متدرجاً', 'Click the background color manually if gradient')}</li>
            <li>• {txt('حمّل PNG للشفافية أو WebP للمواقع (أصغر حجماً)', 'Download PNG for transparency or WebP for web (smaller)')}</li>
          </ul>
        </div>
      </section>

      <AdUnit slot={2} />

      <footer className="text-center text-xs text-slate-400 pt-4 space-y-1">
        <p className="font-semibold text-slate-500">{txt('موقع إزالة الخلفية مجاناً · مسح خلفية الصور اون لاين · تفريغ الصور من الخلفية', 'Free Background Remover · Remove Background Online · Image Background Removal')}</p>
        <p>© {new Date().getFullYear()} · {txt('جميع الحقوق محفوظة', 'All rights reserved')}</p>
      </footer>
    </div>
  );
}
