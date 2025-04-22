import { NextResponse } from 'next/server';
import getStudentModel from '@/lib/models/Student';
import getOpinionModel from '@/lib/models/Opinion';

export async function POST(request) {
  try {
    const { studentName, accessCode } = await request.json();

    // 입력값 검증
    if (!studentName || !accessCode) {
      return NextResponse.json(
        { success: false, message: '이름과 고유번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    // 학생 모델 가져오기
    const Student = await getStudentModel();
    
    // 학생 정보 확인
    const student = await Student.findOne({
      name: studentName,
      accessCode: accessCode,
      isActive: true
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: '학생 정보를 찾을 수 없습니다. 이름과 고유번호를 확인해주세요.' },
        { status: 401 }
      );
    }

    // 로그인 성공 시 학생 ID 반환 (의견 조회에 사용)
    return NextResponse.json({
      success: true,
      message: '로그인 성공',
      studentId: student._id,
      studentName: student.name,
      className: student.className
    });
    
  } catch (error) {
    console.error('학생 로그인 오류:', error);
    return NextResponse.json(
      { success: false, message: '로그인 중 오류가 발생했습니다.', error: error.message },
      { status: 500 }
    );
  }
} 