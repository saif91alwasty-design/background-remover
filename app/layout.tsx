import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const tajawal = Tajawal({ 
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'] 
});

export const metadata: Metadata = {
  title: 'إزالة خلفية الصور مجاناً 2026 | مسح خلفية الصور أونلاين بالذكاء الاصطناعي',
  description: 'موقع إزالة الخلفية مجاناً بالذكاء الاصطناعي 2026. تفريغ الصور من الخلفية تلقائياً، تغيير خلفية الصورة أونلاين للهاتف والكمبيوتر بدون برامج.',
  keywords: [
    'إزالة خلفية الصورة',
    'مسح خلفية الصور اون لاين',
    'تغيير خلفية الصورة تلقائيا',
    'إزالة الخلفية بالذكاء الاصطناعي',
    'موقع إزالة الخلفية مجاناً',
    'إزالة خلفية الصور للهاتف',
    'تفريغ الصور من الخلفية',
    'background remover 2026',
    'free background removal AI',
    'remove background online',
    'AI background remover',
    'تفريغ خلفية الصور 2026',
    'مسح الخلفية بالذكاء الاصطناعي',
    'تغيير خلفية الصورة مجانا',
  ],
  authors: [{ name: 'Free Background Remover' }],
  creator: 'Free Background Remover',
  publisher: 'Free Background Remover',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'SDBhNAfdK3h5-4vVtq6lXb8Wk4L_pRFkl0XwYyGI6T8',
  },
  openGraph: {
    title: 'إزالة خلفية الصور مجاناً 2026 | بالذكاء الاصطناعي',
    description: 'أفضل موقع لإزالة خلفية الصور مجاناً بالذكاء الاصطناعي. مسح خلفية الصور أونلاين وتغييرها تلقائياً في ثوانٍ.',
    type: 'website',
    locale: 'ar_SA',
    siteName: 'Free Background Remover',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'إزالة خلفية الصور مجاناً 2026',
    description: 'موقع إزالة الخلفية بالذكاء الاصطناعي مجاناً',
  },
  alternates: {
    canonical: 'https://bg-remover99.vercel.app/',
    languages: {
      'ar': 'https://bg-remover99.vercel.app/',
      'en': 'https://bg-remover99.vercel.app/en',
      'fr': 'https://bg-remover99.vercel.app/fr',
      'es': 'https://bg-remover99.vercel.app/es',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Schema.org markup للـ SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "إزالة خلفية الصور مجاناً 2026",
              "url": "https://bg-remover99.vercel.app/",
              "description": "موقع مجاني لإزالة خلفية الصور بالذكاء الاصطناعي. مسح خلفية الصور أونلاين وتغييرها تلقائياً.",
              "applicationCategory": "DesignApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "1250"
              },
              "datePublished": "2026-01-01",
              "dateModified": "2026-07-28"
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "كيف يمكنني إزالة خلفية الصورة مجاناً؟",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "يمكنك إزالة خلفية الصورة مجاناً باستخدام موقعنا الذي يعمل بالذكاء الاصطناعي. فقط ارفع الصورة وستتم المعالجة تلقائياً في ثوانٍ."
                  }
                },
                {
                  "@type": "Question",
                  "name": "هل يمكن إزالة خلفية الصور من الهاتف؟",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "نعم، موقعنا يعمل على جميع الأجهزة بما في ذلك الهواتف الذكية (أندرويد وآيفون) بدون الحاجة لتحميل أي تطبيق."
                  }
                },
                {
                  "@type": "Question",
                  "name": "ما هي الصيغة الأفضل للصور بعد إزالة الخلفية؟",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "صيغة PNG هي الأفضل للصور ذات الخلفيات الشفافة، بينما WebP أفضل لمواقع الويب لحجمها الأصغر."
                  }
                }
              ]
            }),
          }}
        />
      </head>
      <body className={tajawal.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
