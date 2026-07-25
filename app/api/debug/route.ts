import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    hfToken: {
      exists: !!process.env.HF_TOKEN,
      length: process.env.HF_TOKEN?.length || 0,
      startsWith: process.env.HF_TOKEN?.substring(0, 3) || 'N/A',
    },
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };

  return NextResponse.json({
    status: 'ok',
    checks,
    message: checks.hfToken.exists 
      ? '✅ مفتاح API موجود'
      : '❌ مفتاح API غير موجود - أضفه في Vercel Settings > Environment Variables',
  });
}
