import BackgroundRemover from '@/components/BackgroundRemover';
import { languages, getLanguageInfo, Language } from '@/lib/languages';
import { translations } from '@/lib/translations';

interface PageProps {
  params: { lang: string };
}

export async function generateStaticParams() {
  return languages.map((lang) => ({
    lang: lang.code,
  }));
}

export default function LangPage({ params }: PageProps) {
  const lang = params.lang as Language;
  const langInfo = getLanguageInfo(lang);
  const t = translations[lang] || translations['en'];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <BackgroundRemover lang={lang} />
    </main>
  );
}
