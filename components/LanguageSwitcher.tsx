'use client';

import { useState } from 'react';
import { languages, Language } from '@/lib/languages';
import { Globe, ChevronDown } from 'lucide-react';

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLangInfo = languages.find((l) => l.code === currentLang) || languages[0];

  const handleLangChange = (newLang: Language) => {
    setIsOpen(false);
    const path = window.location.pathname;
    if (path === '/' || path === '') {
      window.location.href = `/${newLang}`;
    } else {
      window.location.href = path.replace(
        /^\/(ar|en|fr|es|de|pt|tr|ru|zh|ja|ko|hi|id|vi|th)(\/|$)/,
        `/${newLang}$2`
      );
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm text-sm transition-colors"
      >
        <Globe className="w-4 h-4 text-indigo-600" />
        <span className="font-semibold text-slate-700">{currentLangInfo.name}</span>
        <span className="text-base leading-none">{currentLangInfo.flag}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          {/* end-0 = يحترم الاتجاه تلقائياً (يمين في العربية، يسار في اللاتينية) */}
          <div className="absolute top-full mt-2 end-0 z-50 w-60 max-w-[80vw] bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-2 border-b border-slate-100 bg-slate-50 text-center">
              <p className="text-[11px] text-slate-500 font-semibold">Select Language / اختر اللغة</p>
            </div>
            <div className="p-1 max-h-80 overflow-y-auto">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleLangChange(l.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-start transition-colors ${
                    l.code === currentLang ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl leading-none">{l.flag}</span>
                  <span className="font-medium text-sm flex-1">{l.name}</span>
                  {l.code === currentLang && <span className="text-indigo-600 text-xs font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
