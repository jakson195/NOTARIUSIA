/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb', // documentos/PDFs enviados podem ser grandes
    },
  },
};

module.exports = nextConfig;
