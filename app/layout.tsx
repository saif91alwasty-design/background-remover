import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const tajawal = Tajawal({ 
  subsets: ['arabic'],
  weight: ['400', '500', '700', '800'] 
});

export const metadata: Metadata = {
  title: 'إزالة خلفية الصور مجاناً | أداة احترافية وسريعة',
  description: 'أداة مجانية لإزالة خلفية الصور بدقة عالية. حمّل صورك بصيغة PNG أو WebP فوراً.',
  
  // 👇 هذا هو كود إثبات الملكية الخاص بك 👇
  verification: {
    google: 'SDBhNAfdK3h5-4vVtq6lXb8Wk4L_pRFkl0XwYyGI6T8',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={tajawal.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
