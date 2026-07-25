import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'لم يتم رفع أي صورة' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'حجم الصورة كبير جداً. يرجى استخدام صورة أقل من 5MB' }, { status: 400 });
    }

    const token = process.env.HF_TOKEN;
    if (!token || !token.startsWith('hf_')) {
      return NextResponse.json({ error: 'مفتاح API غير صحيح أو غير موجود في Vercel' }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // إرسال الطلب مع مهلة انتظار 50 ثانية (لتجنب قطع Vercel المبكر)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 50000);

    const response = await fetch('https://api-inference.huggingface.co/models/Xenova/rembg', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      // إذا كان النموذج لا يزال يحمل، نعيد المحاولة تلقائياً مرة واحدة
      if (response.status === 503 && errText.includes('loading')) {
        await new Promise(res => setTimeout(res, 15000)); // انتظر 15 ثانية
        
        const retryResponse = await fetch('https://api-inference.huggingface.co/models/Xenova/rembg', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/octet-stream',
          },
          body: buffer,
        });

        if (retryResponse.ok) {
          const imageBuffer = await retryResponse.arrayBuffer();
          return new NextResponse(imageBuffer, { headers: { 'Content-Type': 'image/png' } });
        }
      }
      
      return NextResponse.json({ error: `فشل الخادم: ${response.status}` }, { status: 500 });
    }

    const imageBuffer = await response.arrayBuffer();
    return new NextResponse(imageBuffer, {
      headers: { 'Content-Type': 'image/png' },
    });

  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'انتهت مهلة المعالجة. النموذج يستغرق وقتاً طويلاً للاستيقاظ، يرجى المحاولة مرة أخرى.' }, { status: 504 });
    }
    return NextResponse.json({ error: 'فشل في الاتصال بالخادم. تأكد من الإنترنت وحجم الصورة.' }, { status: 500 });
  }
}
