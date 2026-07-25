import { NextRequest, NextResponse } from 'next/server';

// قائمة النماذج البديلة (إذا فشل الأول، نجرب الثاني)
const MODELS = [
  'briaai/RMBG-1.4',
  'Xenova/rembg',
  'skytowner/super-resolution', // fallback
];

async function tryRemoveBackground(
  buffer: Buffer,
  token: string,
  modelIndex: number = 0
): Promise<{ success: boolean; buffer?: Buffer; error?: string; model?: string }> {
  if (modelIndex >= MODELS.length) {
    return { success: false, error: 'فشلت جميع النماذج في معالجة الصورة' };
  }

  const model = MODELS[modelIndex];
  const url = `https://api-inference.huggingface.co/models/${model}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
      // timeout يدوي 50 ثانية
      signal: AbortSignal.timeout(50000),
    });

    // إذا كان النموذج في وضع التبريد (يحتاج تحميل)
    if (response.status === 503) {
      const errorData = await response.json().catch(() => ({}));
      const estimatedTime = errorData.estimated_time || 20;
      
      console.log(`Model ${model} is loading. Estimated time: ${estimatedTime}s. Retrying...`);
      
      // انتظر ثم أعد المحاولة (حتى 3 مرات)
      for (let attempt = 1; attempt <= 3; attempt++) {
        await new Promise(resolve => setTimeout(resolve, Math.min(estimatedTime * 1000, 15000)));
        
        const retryResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/octet-stream',
          },
          body: buffer,
          signal: AbortSignal.timeout(50000),
        });

        if (retryResponse.ok) {
          const resultBuffer = Buffer.from(await retryResponse.arrayBuffer());
          return { success: true, buffer: resultBuffer, model };
        }
      }
      
      return { success: false, error: `النموذج ${model} لم يستجب بعد عدة محاولات` };
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`Model ${model} failed:`, response.status, errorText);
      
      // جرب النموذج التالي
      return tryRemoveBackground(buffer, token, modelIndex + 1);
    }

    const resultBuffer = Buffer.from(await response.arrayBuffer());
    return { success: true, buffer: resultBuffer, model };

  } catch (error: any) {
    console.error(`Model ${model} error:`, error.message);
    
    // إذا كان خطأ network، جرب النموذج التالي
    if (error.name === 'TypeError' || error.message.includes('fetch')) {
      return tryRemoveBackground(buffer, token, modelIndex + 1);
    }
    
    return { success: false, error: error.message, model };
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'لم يتم رفع أي صورة' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: `حجم الصورة كبير جداً (${(file.size / 1024 / 1024).toFixed(2)}MB). الحد الأقصى 10MB` 
      }, { status: 400 });
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `نوع الملف غير مدعوم (${file.type})` 
      }, { status: 400 });
    }

    const apiToken = process.env.HF_TOKEN;
    if (!apiToken) {
      return NextResponse.json({ 
        error: 'مفتاح API غير موجود في إعدادات Vercel' 
      }, { status: 500 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('Starting background removal...', {
      fileSize: `${(buffer.length / 1024).toFixed(2)}KB`,
      fileName: file.name,
    });

    const result = await tryRemoveBackground(buffer, apiToken);

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'فشل في معالجة الصورة بعد عدة محاولات' 
      }, { status: 500 });
    }

    console.log('Success with model:', result.model);

    return new NextResponse(result.buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline',
      },
    });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: error.message || 'حدث خطأ غير متوقع' 
    }, { status: 500 });
  }
}
