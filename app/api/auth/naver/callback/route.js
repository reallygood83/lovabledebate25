import { NextResponse } from 'next/server';
import getTeacherModel from '@/lib/models/Teacher';

/**
 * 네이버 로그인 콜백 처리
 * GET /api/auth/naver/callback
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    // 요청 쿠키에서 저장된 state 값 확인
    const savedState = request.cookies.get('naver_oauth_state')?.value;
    
    // state 값 검증 (CSRF 방지)
    if (!savedState || savedState !== state) {
      return NextResponse.redirect('/teacher/login?error=invalid_state');
    }
    
    // 네이버 API로 액세스 토큰 요청
    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.NAVER_CLIENT_ID,
        client_secret: process.env.NAVER_CLIENT_SECRET,
        code,
        state
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('네이버 토큰 오류:', tokenData);
      return NextResponse.redirect('/teacher/login?error=token_error');
    }
    
    // 네이버 API로 사용자 정보 요청
    const profileResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { 
        Authorization: `Bearer ${tokenData.access_token}` 
      }
    });
    
    const profileData = await profileResponse.json();
    
    if (profileData.resultcode !== '00') {
      console.error('네이버 프로필 오류:', profileData);
      return NextResponse.redirect('/teacher/login?error=profile_error');
    }
    
    const naverUserInfo = profileData.response;
    const naverOAuthId = naverUserInfo.id;
    const email = naverUserInfo.email;
    const name = naverUserInfo.name;
    
    // 교사 모델 가져오기
    const TeacherModel = await getTeacherModel();
    
    // 네이버 ID로 교사 찾기
    let teacher = await TeacherModel.findOne({ naverOAuthId });
    
    // 교사가 없으면 이메일로 한번 더 검색
    if (!teacher && email) {
      teacher = await TeacherModel.findOne({ email });
    }
    
    if (teacher) {
      // 기존 교사 계정에 네이버 ID 연결
      if (!teacher.naverOAuthId) {
        teacher.naverOAuthId = naverOAuthId;
        await teacher.save();
      }
    } else {
      // 새 교사 계정 생성
      teacher = new TeacherModel({
        email,
        name,
        naverOAuthId,
        // 임의의 패스워드 설정 (로그인에 사용되지 않음)
        password: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      });
      
      await teacher.save();
    }
    
    // 로그인 처리 (여기서는 쿠키에 기본 정보만 저장, 실제로는 JWT 등 사용 권장)
    const response = NextResponse.redirect('/teacher/dashboard');
    
    // 사용자 정보를 쿠키에 저장
    response.cookies.set({
      name: 'teacher_session',
      value: JSON.stringify({
        id: teacher._id.toString(),
        name: teacher.name,
        email: teacher.email
      }),
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 7일
    });
    
    return response;
  } catch (error) {
    console.error('네이버 로그인 콜백 오류:', error);
    return NextResponse.redirect(`/teacher/login?error=${encodeURIComponent(error.message)}`);
  }
} 