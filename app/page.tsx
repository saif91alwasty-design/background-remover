import BackgroundRemover from '@/components/BackgroundRemover';

export default function Home() {
  // نعرض الأداة مباشرة باللغة العربية في الصفحة الرئيسية
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <BackgroundRemover lang="ar" />
    </main>
  );
}
