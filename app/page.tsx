import BackgroundRemover from '@/components/BackgroundRemover';

export default function Home() {
  // عرض الصفحة الرئيسية مباشرة باللغة العربية بدون أي إعادة توجيه
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <BackgroundRemover lang="ar" />
    </main>
  );
}
