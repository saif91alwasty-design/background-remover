export type Language = 'ar' | 'en' | 'fr' | 'es' | 'de' | 'pt' | 'tr' | 'ru' | 'zh' | 'ja' | 'ko' | 'hi' | 'id' | 'vi' | 'th';

export interface LanguageInfo {
  code: Language;
  name: string;
  flag: string;
  dir: 'rtl' | 'ltr';
}

export const languages: LanguageInfo[] = [
  { code: 'ar', name: 'العربية', flag: '🇸', dir: 'rtl' },
  { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', flag: '🇪', dir: 'ltr' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'ru', name: 'Русский', flag: '🇷', dir: 'ltr' },
  { code: 'zh', name: '中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ja', name: '日本語', flag: '🇯', dir: 'ltr' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩', dir: 'ltr' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', dir: 'ltr' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭', dir: 'ltr' },
];

export const defaultLanguage: Language = 'ar';

export function getLanguageInfo(code: string): LanguageInfo {
  return languages.find(l => l.code === code) || languages.find(l => l.code === defaultLanguage)!;
}

export function isValidLanguage(code: string): code is Language {
  return languages.some(l => l.code === code);
}
