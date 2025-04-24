/** @type {import('next').NextConfig} */
const nextConfig = {
  // 서버 측 환경 변수 검증
  serverRuntimeConfig: {
    // 런타임에 필요한 환경 변수를 확인합니다.
    onInit: () => {
      const requiredEnvVars = ['MONGODB_URI', 'GEMINI_API_KEY'];
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
  }
};

export default nextConfig;
