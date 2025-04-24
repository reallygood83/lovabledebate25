import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import getClassModel from '@/lib/models/Class';
import getStudentModel from '@/lib/models/Student';
import { validateJoinCode } from '@/lib/utils/codeGenerator';

/**
 * 학생 반 참여 API 핸들러
 * POST /api/student/join
 */
export async function POST(request) {
  try {
    const { name, joinCode } = await request.json();
    
    // 필수 필드 검증
    if (!name || !joinCode) {
      return NextResponse.json(
        { success: false, message: '이름과 참여 코드는 필수입니다.' },
        { status: 400 }
      );
    }
    
    // 이름 길이 제한
    if (name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { success: false, message: '이름은 2자 이상 50자 이하여야 합니다.' },
        { status: 400 }
      );
    }
    
    // 참여 코드 형식 검증
    if (!validateJoinCode(joinCode)) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 참여 코드입니다.' },
        { status: 400 }
      );
    }
    
    // 클래스 모델 가져오기
    const ClassModel = await getClassModel();
    
    // 참여 코드로 클래스 찾기
    const classData = await ClassModel.findOne({ joinCode });
    if (!classData) {
      return NextResponse.json(
        { success: false, message: '존재하지 않는 반 참여 코드입니다.' },
        { status: 404 }
      );
    }
    
    // 비활성화된 클래스 확인
    if (!classData.isActive) {
      return NextResponse.json(
        { success: false, message: '비활성화된 반입니다.' },
        { status: 403 }
      );
    }
    
    // 학생 모델 가져오기
    const StudentModel = await getStudentModel();
    
    // 고유 접근 코드 생성 (4자리)
    const accessCode = nanoid(4).toUpperCase();
    
    // 학생 생성 또는 이미 존재하는 경우 업데이트
    const existingStudent = await StudentModel.findOne({
      name,
      classId: classData._id
    });
    
    let student;
    
    if (existingStudent) {
      // 이미 존재하는 학생 업데이트
      student = existingStudent;
      student.isActive = true;
    } else {
      // 새 학생 생성
      student = new StudentModel({
        name,
        className: classData.name,
        classId: classData._id,
        accessCode,
        createdById: classData.teacherId
      });
    }
    
    await student.save();
    
    // 성공 응답
    return NextResponse.json(
      {
        success: true,
        message: '반 참여가 완료되었습니다.',
        student: {
          id: student._id,
          name: student.name,
          className: student.className,
          accessCode: student.accessCode,
          createdAt: student.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('학생 반 참여 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.', error: error.message },
      { status: 500 }
    );
  }
} 