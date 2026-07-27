import type { Metadata } from 'next';
import { languages, getLanguageInfo, Language } from '@/lib/languages';
import { translations } from '@/lib/translations';

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
  const t = translations[lang] || translations['en'];
  const baseUrl = 'https://bg-remover99.vercel.app';

  return {
    title: t.seoTitle,
    description: t.seoDesc,
    keywords: ['background remover', 'image resizer', 'free tool', lang],
    alternates: {
      canonical: `${baseUrl}/${lang}`,
    },
  };
}

export default function LangLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
