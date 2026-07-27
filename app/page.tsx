import { redirect } from 'next/navigation';

export default function Home() {
  // إعادة توجيه الزائر تلقائياً إلى النسخة العربية
  redirect('/ar');
}
