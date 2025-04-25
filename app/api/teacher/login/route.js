import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import getTeacherModel from '@/lib/models/Teacher';

/**
 * 교사 로그인 API 핸들러
 * POST /api/teacher/login
 */
export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // 필수 필드 검증
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: '이메일과 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }
    
    // 이메일 소문자 변환 (DB에서는 lowercase: true 옵션으로 저장됨)
    const normalizedEmail = email.toLowerCase().trim();
    
    // 교사 모델 가져오기
    const TeacherModel = await getTeacherModel();
    
    // 이메일로 교사 찾기
    const teacher = await TeacherModel.findOne({ email: normalizedEmail });
    if (!teacher) {
      return NextResponse.json(
        { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }
    
    // 비밀번호 확인
    const passwordMatch = await bcrypt.compare(password, teacher.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }
    
    // 비활성화된 계정 확인
    if (!teacher.isActive) {
      return NextResponse.json(
        { success: false, message: '비활성화된 계정입니다. 관리자에게 문의하세요.' },
        { status: 403 }
      );
    }
    
    // 로그인 성공 응답
    return NextResponse.json(
      {
        success: true,
        message: '로그인 성공',
        teacher: {
          id: teacher._id.toString(), // ObjectId를 문자열로 변환
          name: teacher.name,
          email: teacher.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('교사 로그인 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.', error: error.message },
      { status: 500 }
    );
  }
} 