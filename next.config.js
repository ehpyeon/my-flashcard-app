/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-domain.com'], // 필요한 경우 이미지 도메인 추가
  },
  // Supabase 관련 설정
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ]
  }
}

module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
}