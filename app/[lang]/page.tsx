import BackgroundRemover from '@/components/BackgroundRemover';
import { languages, Language } from '@/lib/languages';

interface PageProps {
  params: { lang: string };
}

export async function generateStaticParams() {
  return languages.map((lang) => ({
    lang: lang.code,
  }));
}

export default function LangPage({ params }: PageProps) {
  const validLang = languages.some(l => l.code === params.lang) ? (params.lang as Language) : 'ar';

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <BackgroundRemover lang={validLang} />
    </main>
  );
}
