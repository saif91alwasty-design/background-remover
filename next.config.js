/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // إخبار Webpack بتجاهل ملفات onnxruntime-node الخاصة بالخادم
    config.resolve.alias = {
      ...config.resolve.alias,
      'onnxruntime-node': false,
    };
    return config;
  },
};

module.exports = nextConfig;
