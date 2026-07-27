import { MetadataRoute } from 'next';
import { languages } from '@/lib/languages';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://bg-remover99.vercel.app';
  
  const pages = [
    { url: '', priority: 1.0, changeFrequency: 'daily' as const },
    { url: '/features', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/faq', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/blog/how-to-remove-background', priority: 0.6, changeFrequency: 'weekly' as const },
  ];

  return languages.flatMap((lang) =>
    pages.map((page) => ({
      url: `${baseUrl}/${lang.code}${page.url}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: lang.code === 'ar' ? page.priority : page.priority * 0.9,
      alternates: {
        languages: Object.fromEntries(
          languages.map((l) => [l.code, `${baseUrl}/${l.code}${page.url}`])
        ),
      },
    }))
  );
}
