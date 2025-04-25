import { NextResponse } from 'next/server';

/**
 * 네이버 로그인 인증 요청 처리
 * GET /api/auth/naver
 */
export async function GET() {
  try {
    // 네이버 앱 정보
    const clientId = process.env.NAVER_CLIENT_ID || 'missing_client_id';
    // 콜백 URL은 애플리케이션에 등록된 URL과 정확히 일치해야 함
    const redirectURI = 'https://lovabledebate25.vercel.app/api/auth/naver/callback';
    const state = Math.random().toString(36).substring(2, 15);
    
    // 디버깅 로그
    console.log('네이버 로그인 시도:', {
      clientId: clientId.substring(0, 5) + '...',  // 보안상 일부만 로그
      redirectURI,
      state
    });
    
    // 네이버 로그인 URL 생성
    const naverLoginUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectURI)}&state=${encodeURIComponent(state)}`;
    
    console.log('생성된 네이버 로그인 URL:', naverLoginUrl);
    
    // 브라우저 세션에 state 값 저장을 위한 쿠키 설정
    const response = NextResponse.redirect(naverLoginUrl);
    
    // state 값을 쿠키에 저장 (보안을 위해)
    response.cookies.set({
      name: 'naver_oauth_state',
      value: state,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 5 // 5분 동안 유효
    });
    
    return response;
  } catch (error) {
    console.error('네이버 로그인 요청 오류:', error);
    return NextResponse.redirect('/teacher/login?error=naver_request_failed');
  }
} 