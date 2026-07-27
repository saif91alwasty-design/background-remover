'use client';

import { useState } from 'react';
import { languages, Language } from '@/lib/languages';
import { Globe, ChevronDown } from 'lucide-react';

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLangInfo = languages.find(l => l.code === currentLang) || languages[0];

  const handleLangChange = (newLang: Language) => {
    setIsOpen(false);
    // الحصول على المسار الحالي
    const currentPath = window.location.pathname;
    
    // إذا كنا في الصفحة الرئيسية (/)
    if (currentPath === '/' || currentPath === '') {
      window.location.href = `/${newLang}`;
    } else {
      // استبدال اللغة في المسار (مثال: /ar -> /en)
      const newPath = currentPath.replace(/^\/(ar|en|fr|es|de|pt|tr|ru|zh|ja|ko|hi|id|vi|th)(\/|$)/, `/${newLang}$2`);
      window.location.href = newPath;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all"
      >
        <Globe className="w-5 h-5 text-blue-600" />
        <span className="font-medium text-gray-700">{currentLangInfo.name}</span>
        <span className="text-xl">{currentLangInfo.flag}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto w-72">
            <div className="p-2 border-b border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-600 font-semibold text-center">Select Language / اختر اللغة</p>
            </div>
            <div className="p-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLangChange(language.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 transition-all text-left ${
                    language.code === currentLang ? 'bg-blue-100 border border-blue-200' : ''
                  }`}
                >
                  <span className="text-2xl">{language.flag}</span>
                  <span className="font-medium text-gray-700 flex-1">{language.name}</span>
                  {language.code === currentLang && (
                    <span className="text-blue-600 font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
