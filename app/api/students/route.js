import { NextResponse } from 'next/server';
import getStudentModel from '@/lib/models/Student';

// 학생 목록 조회
export async function GET(request) {
  try {
    const Student = await getStudentModel();
    
    // URL의 쿼리 파라미터 가져오기
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const className = searchParams.get('className');
    
    // 쿼리 구성
    let query = {};
    
    // 상태 필터링
    if (isActive === 'true') {
      query.isActive = true;
    } else if (isActive === 'false') {
      query.isActive = false;
    }
    
    // 학급 필터링
    if (className) {
      query.className = className;
    }
    
    // 모든 학생 조회 - 최신순으로 정렬
    const students = await Student.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      data: students,
      count: students.length
    });
  } catch (error) {
    console.error('학생 조회 에러:', error);
    return NextResponse.json(
      { success: false, message: '학생 목록 조회 중 오류가 발생했습니다', error: error.message },
      { status: 500 }
    );
  }
}

// 학생 계정 생성
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, className, accessCode, createdBy } = body;
    
    // 필수 필드 검증
    if (!name || !className || !accessCode || !createdBy) {
      return NextResponse.json(
        { success: false, message: '모든 필수 정보를 입력해주세요.' },
        { status: 400 }
      );
    }
    
    // 고유번호 최소 길이 검증
    if (accessCode.length < 4) {
      return NextResponse.json(
        { success: false, message: '고유번호는 최소 4자 이상이어야 합니다.' },
        { status: 400 }
      );
    }
    
    const Student = await getStudentModel();
    
    // 이름과 고유번호 중복 체크
    const existingStudent = await Student.findOne({
      name,
      accessCode
    });
    
    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: '동일한 이름과 고유번호를 가진 학생이 이미 존재합니다.' },
        { status: 409 }
      );
    }
    
    // 새 학생 계정 생성
    const newStudent = new Student({
      name,
      className,
      accessCode,
      createdBy,
      isActive: true
    });
    
    await newStudent.save();
    
    // 응답에서 accessCode는 일부만 표시 (보안)
    const maskedAccessCode = accessCode.substring(0, 2) + '*'.repeat(accessCode.length - 2);
    
    return NextResponse.json({
      success: true,
      message: '학생 계정이 성공적으로 생성되었습니다.',
      data: {
        id: newStudent._id,
        name: newStudent.name,
        className: newStudent.className,
        accessCode: maskedAccessCode
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('학생 계정 생성 에러:', error);
    return NextResponse.json(
      { success: false, message: '학생 계정 생성 중 오류가 발생했습니다', error: error.message },
      { status: 500 }
    );
  }
} 