export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // هذا الملف الآن مجرد ممرر، لأن التخطيط الفعلي (HTML, Body, Metadata) 
  // أصبح موجوداً داخل مجلد app/[lang]/layout.tsx
  return <>{children}</>;
}
