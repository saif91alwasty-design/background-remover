import { MetadataRoute } from 'next';
import { languages } from '@/lib/languages';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bg-remover99.vercel.app';
  
  return languages.map((lang) => ({
    url: `${baseUrl}/${lang.code}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: lang.code === 'ar' ? 1 : 0.9,
    alternates: {
      languages: Object.fromEntries(
        languages.map((l) => [l.code, `${baseUrl}/${l.code}`])
      ),
    },
  }));
}
