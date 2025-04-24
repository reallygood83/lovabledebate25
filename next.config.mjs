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
  
  // 서버리스 함수 크기 최적화 설정
  outputFileTracingIncludes: {
    '/**/*': ['./node_modules/**/*']
  },
  
  // 불필요한 파일을 트레이싱에서 제외
  outputFileTracingExcludes: {
    '/**/*': [
      './node_modules/@next/swc-linux-x64-gnu/**/*',
      './node_modules/@next/swc-linux-x64-musl/**/*',
      // react-icons에서 사용하지 않는 모든 패키지 제외 (fa만 유지)
      './node_modules/react-icons/gi/**/*',
      './node_modules/react-icons/pi/**/*',
      './node_modules/react-icons/si/**/*',
      './node_modules/react-icons/tb/**/*',
      './node_modules/react-icons/md/**/*',
      './node_modules/react-icons/lia/**/*',
      './node_modules/react-icons/ri/**/*',
      './node_modules/react-icons/bs/**/*',
      './node_modules/react-icons/ai/**/*',
      './node_modules/react-icons/bi/**/*',
      './node_modules/react-icons/ci/**/*',
      './node_modules/react-icons/di/**/*',
      './node_modules/react-icons/fi/**/*',
      './node_modules/react-icons/fc/**/*',
      './node_modules/react-icons/go/**/*',
      './node_modules/react-icons/gr/**/*',
      './node_modules/react-icons/hi/**/*',
      './node_modules/react-icons/im/**/*',
      './node_modules/react-icons/io/**/*',
      './node_modules/react-icons/lu/**/*',
      './node_modules/react-icons/rx/**/*',
      './node_modules/react-icons/sl/**/*',
      './node_modules/react-icons/ti/**/*',
      './node_modules/react-icons/vsc/**/*',
      './node_modules/react-icons/wi/**/*',
      './node_modules/typescript/**/*',
      './node_modules/@img/sharp-libvips-linux*/**/*',
      './node_modules/@img/sharp-libvips-linuxmusl*/**/*',
      './node_modules/eslint/**/*'
    ]
  }
};

export default nextConfig;
