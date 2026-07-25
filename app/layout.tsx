import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['arabic', 'latin'] });

export const metadata: Metadata = {
  title: 'إزالة خلفية الصور بالذكاء الاصطناعي - مجاناً',
  description: 'أداة مجانية لإزالة خلفيات الصور بدقة عالية باستخدام الذكاء الاصطناعي. سريع، آمن، وبدون تسجيل.',
  keywords: ['إزالة خلفية', 'خلفية الصور', 'ذكاء اصطناعي', 'أدوات مجانية'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
