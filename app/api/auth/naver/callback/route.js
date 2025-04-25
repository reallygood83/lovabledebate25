import { NextResponse } from 'next/server';
import getTeacherModel from '@/lib/models/Teacher';

/**
 * 네이버 로그인 콜백 처리
 * GET /api/auth/naver/callback
 */
export async function GET(request) {
  try {
    // URL 파라미터 추출
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    console.log('네이버 콜백 호출됨:', { code: !!code, state: !!state, error });
    
    // 에러 파라미터 확인
    if (error) {
      console.error('네이버 인증 에러:', error);
      return NextResponse.redirect('/teacher/login?error=' + encodeURIComponent(error));
    }
    
    // code와 state 필수 확인
    if (!code || !state) {
      console.error('필수 파라미터 누락:', { code: !!code, state: !!state });
      return NextResponse.redirect('/teacher/login?error=missing_params');
    }
    
    // 네이버 API 설정
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error('네이버 API 환경 변수 누락');
      return NextResponse.redirect('/teacher/login?error=missing_env_vars');
    }
    
    // 네이버 API로 액세스 토큰 요청
    console.log('토큰 요청 시작...');
    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        state
      })
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('토큰 요청 실패:', tokenResponse.status, errorText);
      return NextResponse.redirect('/teacher/login?error=token_request_failed');
    }
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('네이버 토큰 없음:', tokenData);
      return NextResponse.redirect('/teacher/login?error=no_access_token');
    }
    
    // 네이버 API로 사용자 정보 요청
    console.log('프로필 요청 시작...');
    const profileResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { 
        Authorization: `Bearer ${tokenData.access_token}` 
      }
    });
    
    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('프로필 요청 실패:', profileResponse.status, errorText);
      return NextResponse.redirect('/teacher/login?error=profile_request_failed');
    }
    
    const profileData = await profileResponse.json();
    
    if (profileData.resultcode !== '00' || !profileData.response) {
      console.error('네이버 프로필 오류:', profileData);
      return NextResponse.redirect('/teacher/login?error=profile_error');
    }
    
    // 간단한 리다이렉트로 대체
    return NextResponse.redirect('/teacher/login?message=naver_login_success');
    
  } catch (error) {
    console.error('네이버 로그인 콜백 오류:', error);
    return NextResponse.redirect(`/teacher/login?error=callback_error&message=${encodeURIComponent(error.message)}`);
  }
} 