import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import './globals.css';

const tajawal = Tajawal({ 
  subsets: ['arabic'],
  weight: ['400', '500', '700', '800'] 
});

export const metadata: Metadata = {
  title: 'إزالة خلفية الصور بالذكاء الاصطناعي - مجاناً',
  description: 'أداة مجانية لإزالة خلفيات الصور بدقة عالية باستخدام الذكاء الاصطناعي.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={tajawal.className}>{children}</body>
    </html>
  );
}
