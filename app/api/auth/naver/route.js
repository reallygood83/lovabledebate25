import { NextResponse } from 'next/server';

/**
 * 네이버 로그인 인증 요청 처리
 * GET /api/auth/naver
 */
export async function GET() {
  try {
    // 네이버 앱 정보
    const clientId = process.env.NAVER_CLIENT_ID;
    
    if (!clientId) {
      console.error('네이버 클라이언트 ID가 설정되지 않았습니다');
      return NextResponse.redirect('/teacher/login?error=missing_client_id');
    }
    
    // 콜백 URL은 애플리케이션에 등록된 URL과 정확히 일치해야 함
    const redirectURI = 'https://lovabledebate25.vercel.app/api/auth/naver/callback';
    const state = Math.random().toString(36).substring(2, 15);
    
    console.log('네이버 로그인 시도:', { state });
    
    // 네이버 로그인 URL 생성
    const naverLoginUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectURI)}&state=${encodeURIComponent(state)}`;
    
    console.log('네이버 로그인 URL:', naverLoginUrl);
    
    // 바로 리다이렉트
    return NextResponse.redirect(naverLoginUrl);
  } catch (error) {
    console.error('네이버 로그인 요청 오류:', error);
    return NextResponse.redirect('/teacher/login?error=naver_request_failed');
  }
} 