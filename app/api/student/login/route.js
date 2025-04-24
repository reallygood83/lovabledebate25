import { NextResponse } from 'next/server';
import getStudentModel from '@/lib/models/Student';
import getClassModel from '@/lib/models/Class';
import { validateJoinCode } from '@/lib/utils/codeGenerator';

export async function POST(request) {
  try {
    const { studentName, accessCode, joinCode } = await request.json();

    // 입력값 검증 (기존 방식: 이름 + 고유번호)
    if (studentName && accessCode) {
      // 학생 모델 가져오기
      const StudentModel = await getStudentModel();
      
      // 학생 정보 확인
      const student = await StudentModel.findOne({
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

      // 로그인 성공 시 학생 정보 반환
      return NextResponse.json({
        success: true,
        message: '로그인 성공',
        studentId: student._id,
        studentName: student.name,
        className: student.className,
        classId: student.classId
      });
    } 
    // 새로운 방식: 이름 + 참여 코드
    else if (studentName && joinCode) {
      // 참여 코드 유효성 확인
      if (!validateJoinCode(joinCode)) {
        return NextResponse.json(
          { success: false, message: '유효하지 않은 참여 코드입니다.' },
          { status: 400 }
        );
      }
      
      // 클래스 모델 가져오기
      const ClassModel = await getClassModel();
      
      // 참여 코드로 클래스 찾기
      const classData = await ClassModel.findOne({ 
        joinCode,
        isActive: true
      });
      
      if (!classData) {
        return NextResponse.json(
          { success: false, message: '존재하지 않는 반 참여 코드입니다.' },
          { status: 404 }
        );
      }
      
      // 학생 모델 가져오기
      const StudentModel = await getStudentModel();
      
      // 이름과 클래스 ID로 학생 찾기
      const student = await StudentModel.findOne({
        name: studentName,
        classId: classData._id,
        isActive: true
      });
      
      if (!student) {
        return NextResponse.json(
          { success: false, message: '해당 반에 등록된 학생을 찾을 수 없습니다.' },
          { status: 401 }
        );
      }
      
      // 로그인 성공 시 학생 정보 반환
      return NextResponse.json({
        success: true,
        message: '반 참여 코드로 로그인 성공',
        studentId: student._id,
        studentName: student.name,
        className: student.className,
        classId: student.classId,
        accessCode: student.accessCode // 학생이 자신의 고유번호를 알 수 있도록 제공
      });
    }
    else {
      return NextResponse.json(
        { success: false, message: '이름과 고유번호 또는 참여 코드를 입력해주세요.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('학생 로그인 오류:', error);
    return NextResponse.json(
      { success: false, message: '로그인 중 오류가 발생했습니다.', error: error.message },
      { status: 500 }
    );
  }
} 