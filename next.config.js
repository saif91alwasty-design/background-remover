/** @type {import('next').NextConfig} */
const nextConfig = {
  // تمكين معالجة الملفات الكبيرة
  experimental: {
    serverComponentsExternalPackages: ['@imgly/background-removal'],
  },
  // زيادة حد حجم الصور
  images: {
    unoptimized: true,
  },
  // إعدادات الأداء
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

module.exports = nextConfig;
