/** @type {import('next').NextConfig} */
const nextConfig = {
  // 서버 측 환경 변수 검증
  serverRuntimeConfig: {
    // 런타임에 필요한 환경 변수를 확인합니다.
    onInit: () => {
      const requiredEnvVars = ['MONGODB_URI', 'GEMINI_API_KEY', 'NAVER_CLIENT_ID', 'NAVER_CLIENT_SECRET', 'NAVER_CALLBACK_URL'];
      const missingEnvVars = requiredEnvVars.filter(
        (envVar) => !process.env[envVar]
      );

      if (missingEnvVars.length > 0) {
        console.error(`다음 환경 변수가 설정되지 않았습니다: ${missingEnvVars.join(', ')}`);
        console.error('프로덕션 환경에서는 이러한 환경 변수가 필요합니다.');
        
        if (process.env.NODE_ENV === 'production') {
          process.exit(1);
        }
      }
    }
  },
  // 빌드 최적화 설정
  output: 'standalone',
  
  // 환경 변수 설정
  // 참고: 아래 환경 변수들은 개발 환경에서만 사용하고
  // 프로덕션 환경에서는 Vercel 대시보드에서 설정해야 합니다.
  // env: {
  //   NAVER_CLIENT_ID: '...',
  //   NAVER_CLIENT_SECRET: '...',
  //   NAVER_CALLBACK_URL: 'https://your-domain.vercel.app/api/auth/naver/callback'
  // },
  
  // Next.js 15.3.1에 맞게 업데이트된 설정
  // 실험적 기능 대신 루트 레벨 설정 사용
  serverExternalPackages: ['bcrypt'],
  outputFileTracingIncludes: {
    '/**/*': ['./node_modules/**/*']
  }
};

export default nextConfig;
