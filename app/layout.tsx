import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { LanguageProvider } from '@/lib/language-context';
import './globals.css';

const tajawal = Tajawal({ 
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'] 
});

export const metadata: Metadata = {
  title: 'Free Background Remover & Image Resizer | إزالة خلفية الصور',
  description: 'Free online tool to remove image backgrounds and resize images. Supports 15+ languages. No signup required.',
  keywords: ['background remover', 'إزالة خلفية', 'image resizer', 'free tool', 'png', 'webp'],
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
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={tajawal.className}>
        <LanguageProvider>
          {children}
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  );
}
