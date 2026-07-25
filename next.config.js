/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // منع تحميل ملفات الخادم (Node.js bindings) في المتصفح
      config.resolve.alias = {
        ...config.resolve.alias,
        'onnxruntime-node': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
