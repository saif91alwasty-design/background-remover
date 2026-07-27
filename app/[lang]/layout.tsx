import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { languages, getLanguageInfo, Language } from '@/lib/languages';
import { translations } from '@/lib/translations';
import '../globals.css';

const tajawal = Tajawal({ 
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'] 
});

interface LayoutProps {
  children: React.ReactNode;
  params: { lang: string };
}

export async function generateStaticParams() {
  return languages.map((lang) => ({
    lang: lang.code,
  }));
}

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const lang = params.lang as Language;
  const langInfo = getLanguageInfo(lang);
  const t = translations[lang] || translations['en'];

  const baseUrl = 'https://bg-remover99.vercel.app';
  const alternateLanguages: Record<string, string> = {};
  
  languages.forEach((l) => {
    alternateLanguages[l.code] = `${baseUrl}/${l.code}`;
  });

  return {
    title: t.seoTitle,
    description: t.seoDesc,
    keywords: ['background remover', 'image resizer', 'free tool', 'png', 'webp', lang],
    alternates: {
      languages: alternateLanguages,
      canonical: `${baseUrl}/${lang}`,
    },
    openGraph: {
      title: t.seoTitle,
      description: t.seoDesc,
      locale: lang === 'ar' ? 'ar_AR' : lang === 'en' ? 'en_US' : lang,
      type: 'website',
    },
  };
}

export default function RootLayout({ children, params }: LayoutProps) {
  const lang = params.lang as Language;
  const langInfo = getLanguageInfo(lang);

  return (
    <html lang={lang} dir={langInfo.dir} suppressHydrationWarning>
      <body className={tajawal.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
