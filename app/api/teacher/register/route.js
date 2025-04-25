import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import getTeacherModel from '@/lib/models/Teacher';

/**
 * 교사 회원가입 API 핸들러
 * POST /api/teacher/register
 */
export async function POST(request) {
  try {
    const { email, name, password } = await request.json();
    
    // 필수 필드 검증
    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, message: '모든 필수 정보를 입력해주세요.' },
        { status: 400 }
      );
    }
    
    // 이메일 정규화 (소문자 변환 및 공백 제거)
    const normalizedEmail = email.toLowerCase().trim();
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: '유효한 이메일 주소를 입력해주세요.' },
        { status: 400 }
      );
    }
    
    // 비밀번호 길이 검증
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: '비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }
    
    // 교사 모델 가져오기
    const TeacherModel = await getTeacherModel();
    
    // 이메일 중복 확인
    const existingTeacher = await TeacherModel.findOne({ email: normalizedEmail });
    if (existingTeacher) {
      return NextResponse.json(
        { success: false, message: '이미 등록된 이메일입니다.' },
        { status: 409 }
      );
    }
    
    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 교사 계정 생성
    const newTeacher = new TeacherModel({
      email: normalizedEmail,
      name,
      password: hashedPassword,
    });
    
    await newTeacher.save();
    
    // 성공 응답 (비밀번호 제외)
    return NextResponse.json(
      {
        success: true,
        message: '회원가입이 완료되었습니다.',
        teacher: {
          id: newTeacher._id.toString(),
          email: newTeacher.email,
          name: newTeacher.name,
          createdAt: newTeacher.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('교사 회원가입 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.', error: error.message },
      { status: 500 }
    );
  }
} 