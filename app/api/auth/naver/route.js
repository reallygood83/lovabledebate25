import { NextResponse } from 'next/server';

/**
 * 네이버 로그인 인증 요청 처리
 * GET /api/auth/naver
 */
export async function GET() {
  try {
    const clientId = process.env.NAVER_CLIENT_ID;
    const redirectURI = encodeURIComponent(process.env.NAVER_CALLBACK_URL);
    const state = encodeURIComponent(Math.random().toString(36).substring(2, 15));
    
    // 브라우저 세션에 state 값 저장을 위한 쿠키 설정
    const response = NextResponse.redirect(
      `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectURI}&state=${state}`
    );
    
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
    return NextResponse.json(
      { success: false, message: '인증 요청 중 오류가 발생했습니다.', error: error.message },
      { status: 500 }
    );
  }
} 