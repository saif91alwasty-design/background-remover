import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://bg-remover99.vercel.app';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // منع فهرسة بعض المسارات غير المهمة (اختياري)
      disallow: ['/api/', '/_next/', '/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
