import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'لم يتم رفع أي صورة' }, { status: 400 });
    }

    const apiToken = process.env.HF_TOKEN;
    if (!apiToken) {
      return NextResponse.json({ error: 'مفتاح API غير موجود في إعدادات Vercel' }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // استخدام نموذج Xenova/rembg لأنه مجاني ولا يحتاج موافقة يدوية
    const response = await fetch('https://api-inference.huggingface.co/models/Xenova/rembg', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `فشل المعالجة: ${response.status} - ${errorText}` }, { status: 500 });
    }

    const imageBuffer = await response.arrayBuffer();
    return new NextResponse(imageBuffer, {
      headers: { 'Content-Type': 'image/png' },
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'حدث خطأ غير متوقع' }, { status: 500 });
  }
}
