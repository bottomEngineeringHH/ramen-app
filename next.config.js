/** @type {import('next').NextConfig} */
const config = {
  // ... (既存の experimental.turbopack などの設定)
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/u/**', // GitHubアバターのパス形式
      },
    ],
  },
};

module.exports = config;