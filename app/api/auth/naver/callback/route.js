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
    
    // 디버깅 로그
    console.log('네이버 콜백 파라미터:', { code: code?.substring(0, 5) + '...', state, error });
    
    // 에러 파라미터 확인
    if (error) {
      console.error('네이버 인증 에러:', error);
      return NextResponse.redirect(`/teacher/login?error=${error}`);
    }
    
    // code와 state 필수 확인
    if (!code || !state) {
      console.error('필수 파라미터 누락:', { code: !!code, state: !!state });
      return NextResponse.redirect('/teacher/login?error=missing_params');
    }
    
    // 요청 쿠키에서 저장된 state 값 확인
    const savedState = request.cookies.get('naver_oauth_state')?.value;
    console.log('저장된 state vs 받은 state:', { savedState, receivedState: state });
    
    // state 값 검증 (CSRF 방지)
    if (!savedState || savedState !== state) {
      return NextResponse.redirect('/teacher/login?error=invalid_state');
    }
    
    // 네이버 API 설정
    const clientId = process.env.NAVER_CLIENT_ID || 'missing_client_id';
    const clientSecret = process.env.NAVER_CLIENT_SECRET || 'missing_client_secret';
    
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
    
    // 토큰 응답 처리
    if (!tokenResponse.ok) {
      console.error('토큰 요청 실패:', tokenResponse.status, tokenResponse.statusText);
      return NextResponse.redirect('/teacher/login?error=token_request_failed');
    }
    
    const tokenData = await tokenResponse.json();
    console.log('토큰 응답 수신:', { 
      access_token: tokenData.access_token ? '존재함' : '없음',
      token_type: tokenData.token_type,
      error: tokenData.error
    });
    
    if (!tokenData.access_token) {
      console.error('네이버 토큰 오류:', tokenData);
      return NextResponse.redirect('/teacher/login?error=token_error');
    }
    
    // 네이버 API로 사용자 정보 요청
    console.log('사용자 정보 요청 시작...');
    const profileResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { 
        Authorization: `Bearer ${tokenData.access_token}` 
      }
    });
    
    // 프로필 응답 처리
    if (!profileResponse.ok) {
      console.error('프로필 요청 실패:', profileResponse.status, profileResponse.statusText);
      return NextResponse.redirect('/teacher/login?error=profile_request_failed');
    }
    
    const profileData = await profileResponse.json();
    console.log('프로필 응답 수신:', { 
      resultcode: profileData.resultcode,
      message: profileData.message,
      hasResponse: !!profileData.response
    });
    
    if (profileData.resultcode !== '00') {
      console.error('네이버 프로필 오류:', profileData);
      return NextResponse.redirect('/teacher/login?error=profile_error');
    }
    
    const naverUserInfo = profileData.response;
    const naverOAuthId = naverUserInfo.id;
    const email = naverUserInfo.email;
    const name = naverUserInfo.name || '네이버 사용자';
    
    // 이메일 필수 확인
    if (!email) {
      console.error('이메일 정보 없음', naverUserInfo);
      return NextResponse.redirect('/teacher/login?error=email_missing');
    }
    
    console.log('네이버 사용자 정보 확인:', { 
      id: naverOAuthId?.substring(0, 5) + '...',
      email: email?.substring(0, 3) + '...',
      name
    });
    
    // 교사 모델 가져오기
    const TeacherModel = await getTeacherModel();
    
    // 네이버 ID로 교사 찾기
    let teacher = await TeacherModel.findOne({ naverOAuthId });
    
    // 교사가 없으면 이메일로 한번 더 검색
    if (!teacher && email) {
      teacher = await TeacherModel.findOne({ email });
    }
    
    if (teacher) {
      console.log('기존 교사 계정 찾음:', teacher._id);
      // 기존 교사 계정에 네이버 ID 연결
      if (!teacher.naverOAuthId) {
        teacher.naverOAuthId = naverOAuthId;
        await teacher.save();
        console.log('네이버 ID 업데이트 완료');
      }
    } else {
      console.log('새 교사 계정 생성 시작');
      // 새 교사 계정 생성
      teacher = new TeacherModel({
        email,
        name,
        naverOAuthId,
        // 임의의 패스워드 설정 (로그인에 사용되지 않음)
        password: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      });
      
      await teacher.save();
      console.log('새 교사 계정 생성 완료:', teacher._id);
    }
    
    // 로그인 성공 시 리다이렉트 준비
    // teacherInfo를 HTML에 인라인으로 삽입하는 페이지로 리다이렉트
    const teacherInfo = {
      id: teacher._id.toString(),
      name: teacher.name,
      email: teacher.email
    };
    
    console.log('네이버 로그인 성공, 리다이렉트 준비');
    
    // HTML 페이지를 반환하여 localStorage에 데이터 저장 후 리다이렉트
    // 이 방식은 Vercel Edge Functions에서 쿠키 제한을 우회합니다
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>로그인 처리 중...</title>
          <meta charset="utf-8">
        </head>
        <body>
          <script>
            // 로컬 스토리지에 로그인 정보 저장
            localStorage.setItem('teacherInfo', '${JSON.stringify(teacherInfo)}');
            // 대시보드로 리다이렉트
            window.location.href = '/teacher/dashboard';
          </script>
          <p>로그인 처리 중입니다...</p>
        </body>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      }
    );
  } catch (error) {
    console.error('네이버 로그인 콜백 오류:', error);
    return NextResponse.redirect(`/teacher/login?error=callback_error&message=${encodeURIComponent(error.message)}`);
  }
} 