import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'لم يتم رفع أي صورة' }, { status: 400 });
    }

    // استخدام نموذج RMBG-1.4 المجاني من Hugging Face
    const response = await fetch('https://api-inference.huggingface.co/models/briaai/RMBG-1.4', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HF_TOKEN}`,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error('فشل في معالجة الصورة من الخادم');
    }

    const imageBuffer = await response.arrayBuffer();
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
      },
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء المعالجة' }, { status: 500 });
  }
}
