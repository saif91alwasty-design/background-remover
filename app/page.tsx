'use client';

import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import ImageProcessor from '@/components/ImageProcessor';
import BatchProcessor from '@/components/BatchProcessor';

export default function Home() {
  const [mode, setMode] = useState<'single' | 'batch'>('single');

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            إزالة خلفية الصور بالذكاء الاصطناعي
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            مجاناً • سريع • عالي الجودة • بدون تسجيل
          </p>

          {/* Mode Selector */}
          <div className="inline-flex bg-white rounded-lg shadow-md p-1 mb-8">
            <button
              onClick={() => setMode('single')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                mode === 'single'
                  ? 'bg-primary-500 text-white shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              صورة واحدة
            </button>
            <button
              onClick={() => setMode('batch')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                mode === 'batch'
                  ? 'bg-primary-500 text-white shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              معالجة دفعات
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {mode === 'single' ? <ImageProcessor /> : <BatchProcessor />}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">سريع جداً</h3>
            <p className="text-gray-600">
              معالجة الصور في ثوانٍ معدودة باستخدام الذكاء الاصطناعي
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">دقة عالية</h3>
            <p className="text-gray-600">
              إزالة الخلفية بدقة متناهية مع الحفاظ على تفاصيل الصورة
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">آمن وخاص</h3>
            <p className="text-gray-600">
              جميع المعالجة تتم في متصفحك، لا نرفع صورك لأي خادم
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p>© 2024 أداة إزالة الخلفية. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </main>
  );
}
