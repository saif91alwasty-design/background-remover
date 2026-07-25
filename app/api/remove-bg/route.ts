import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    step: 'initializing',
  };

  try {
    debugInfo.step = 'receiving-form-data';
    const formData = await request.formData();
    const file = formData.get('image') as File;

    debugInfo.step = 'validating-file';
    debugInfo.fileInfo = {
      name: file?.name,
      type: file?.type,
      size: file?.size,
      exists: !!file,
    };

    if (!file) {
      return NextResponse.json(
        { 
          error: 'لم يتم رفع أي صورة',
          debug: debugInfo 
        }, 
        { status: 400 }
      );
    }

    // التحقق من حجم الملف
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { 
          error: `حجم الصورة كبير جداً (${(file.size / 1024 / 1024).toFixed(2)}MB). الحد الأقصى هو 10MB`,
          debug: debugInfo 
        }, 
        { status: 400 }
      );
    }

    // التحقق من نوع الملف
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          error: `نوع الملف غير مدعوم (${file.type}). الأنواع المدعومة: PNG, JPG, WEBP`,
          debug: debugInfo 
        }, 
        { status: 400 }
      );
    }

    debugInfo.step = 'checking-api-token';
    const apiToken = process.env.HF_TOKEN;
    debugInfo.hasToken = !!apiToken;
    debugInfo.tokenLength = apiToken?.length || 0;

    if (!apiToken) {
      return NextResponse.json(
        { 
          error: 'لم يتم العثور على مفتاح API. يرجى التحقق من إعدادات Vercel',
          debug: debugInfo 
        }, 
        { status: 500 }
      );
    }

    debugInfo.step = 'sending-to-huggingface';
    debugInfo.apiEndpoint = 'https://api-inference.huggingface.co/models/briaai/RMBG-1.4';

    // تحويل الملف إلى Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    debugInfo.step = 'api-request';
    debugInfo.requestSize = `${(buffer.length / 1024).toFixed(2)}KB`;

    const response = await fetch('https://api-inference.huggingface.co/models/briaai/RMBG-1.4', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
    });

    debugInfo.step = 'api-response';
    debugInfo.responseStatus = response.status;
    debugInfo.responseStatusText = response.statusText;
    debugInfo.responseHeaders = Object.fromEntries(response.headers.entries());

    if (!response.ok) {
      const errorText = await response.text();
      debugInfo.errorResponse = errorText;
      
      let errorMessage = 'فشل في معالجة الصورة';
      
      if (response.status === 401) {
        errorMessage = 'مفتاح API غير صالح. يرجى التحقق من HF_TOKEN';
      } else if (response.status === 403) {
        errorMessage = 'ليس لديك صلاحية الوصول إلى هذا النموذج';
      } else if (response.status === 429) {
        errorMessage = 'تم تجاوز حد الاستخدام. يرجى الانتظار قليلاً';
      } else if (response.status === 503) {
        errorMessage = 'النموذج غير متاح حالياً. يرجى المحاولة لاحقاً';
      } else if (errorText) {
        errorMessage = `خطأ من الخادم: ${errorText}`;
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          debug: debugInfo 
        }, 
        { status: response.status }
      );
    }

    debugInfo.step = 'processing-success';
    const imageBuffer = await response.arrayBuffer();
    debugInfo.resultSize = `${(imageBuffer.byteLength / 1024).toFixed(2)}KB`;

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'X-Debug-Info': encodeURIComponent(JSON.stringify(debugInfo)),
      },
    });

  } catch (error: any) {
    debugInfo.step = 'error-caught';
    debugInfo.errorMessage = error?.message;
    debugInfo.errorStack = error?.stack;
    debugInfo.errorType = error?.name;

    console.error('Background Removal Error:', {
      error: error?.message,
      stack: error?.stack,
      debug: debugInfo,
    });

    return NextResponse.json(
      { 
        error: error?.message || 'حدث خطأ غير متوقع أثناء المعالجة',
        debug: debugInfo 
      }, 
      { status: 500 }
    );
  }
}
