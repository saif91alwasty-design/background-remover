'use client';

import { useState } from 'react';
import { languages, getLanguageInfo, Language } from '@/lib/languages';
import { Globe, ChevronDown } from 'lucide-react';

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLangInfo = getLanguageInfo(currentLang);

  const handleLangChange = (newLang: Language) => {
    const newPath = window.location.pathname.replace(/^\/[a-z]{2}(\/|$)/, `/${newLang}$1`);
    window.location.href = newPath;
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
        <Globe className="w-5 h-5" />
        <span className="font-medium">{currentLangInfo.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto w-64">
            <div className="p-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => { handleLangChange(language.code); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 ${language.code === currentLang ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
                >
                  <span>{language.flag}</span>
                  <span className="font-medium">{language.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
