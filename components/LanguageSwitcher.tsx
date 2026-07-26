'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { languages } from '@/lib/translations';
import { Globe, ChevronDown } from 'lucide-react';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const currentLang = languages.find(l => l.code === lang)!;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
      >
        <Globe className="w-5 h-5" />
        <span className="font-medium">{currentLang.flag} {currentLang.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto w-64">
            <div className="p-2 border-b border-gray-100">
              <p className="text-xs text-gray-500 font-semibold">Select Language / اختر اللغة</p>
            </div>
            <div className="p-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => {
                    setLang(language.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-left ${
                    language.code === lang ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <span className="text-xl">{language.flag}</span>
                  <span className="font-medium">{language.name}</span>
                  {language.code === lang && <span className="ml-auto text-blue-600">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
