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

  // محتوى SEO محسّن لكل لغة
  const seoContent: Record<string, { title: string; description: string; keywords: string[] }> = {
    ar: {
      title: 'إزالة خلفية الصور مجاناً 2026 | مسح خلفية الصور أونلاين بالذكاء الاصطناعي',
      description: 'موقع إزالة الخلفية مجاناً بالذكاء الاصطناعي 2026. تفريغ الصور من الخلفية تلقائياً، تغيير خلفية الصورة أونلاين للهاتف والكمبيوتر.',
      keywords: ['إزالة خلفية الصورة', 'مسح خلفية الصور اون لاين', 'تغيير خلفية الصورة تلقائيا', 'إزالة الخلفية بالذكاء الاصطناعي', 'إزالة خلفية الصور للهاتف', 'تفريغ الصور من الخلفية'],
    },
    en: {
      title: 'Free Background Remover 2026 | AI Background Removal Online',
      description: 'Best free AI background remover 2026. Remove image background automatically online for mobile and desktop. No signup required.',
      keywords: ['background remover', 'remove background online', 'AI background remover 2026', 'free background removal', 'remove background from photo'],
    },
    fr: {
      title: 'Supprimeur d\'arrière-plan gratuit 2026 | IA en ligne',
      description: 'Meilleur outil gratuit de suppression d\'arrière-plan par IA 2026. Supprimez le fond des images automatiquement.',
      keywords: ['supprimer arrière-plan', 'détourage photo IA', 'suppression fond gratuit 2026'],
    },
    es: {
      title: 'Eliminador de fondos gratis 2026 | IA en línea',
      description: 'Mejor eliminador de fondos gratuito con IA 2026. Elimina el fondo de las imágenes automáticamente.',
      keywords: ['eliminar fondo imagen', 'quitar fondo foto IA', 'eliminador fondos gratis 2026'],
    },
  };

  const content = seoContent[lang] || seoContent['en'];

  return {
    title: content.title,
    description: content.description,
    keywords: content.keywords,
    alternates: {
      canonical: `${baseUrl}/${lang}`,
      languages: Object.fromEntries(
        languages.map((l) => [l.code, `${baseUrl}/${l.code}`])
      ),
    },
    openGraph: {
      title: content.title,
      description: content.description,
      locale: lang === 'ar' ? 'ar_SA' : lang,
      type: 'website',
    },
  };
}

export default function LangLayout({ children }: LayoutProps) {
  return <>{children}</>;
}
