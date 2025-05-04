import { NextResponse } from 'next/server';
import getStudentModel from '@/lib/models/Student';

// 학생 계정 일괄 생성 API
export async function POST(request) {
  try {
    const body = await request.json();
    const { students, createdBy } = body;
    
    // 학생 데이터 검증
    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { success: false, message: '유효한 학생 데이터가 필요합니다.' },
        { status: 400 }
      );
    }
    
    if (!createdBy) {
      return NextResponse.json(
        { success: false, message: '생성자 정보가 필요합니다.' },
        { status: 400 }
      );
    }
    
    const Student = await getStudentModel();
    const results = {
      success: [],
      failed: []
    };
    
    // 각 학생마다 데이터 유효성 검사 및 저장
    for (const student of students) {
      const { name, className, accessCode } = student;
      
      // 필수 데이터 검증
      if (!name || !className || !accessCode) {
        results.failed.push({
          ...student,
          reason: '필수 정보가 누락되었습니다.'
        });
        continue;
      }
      
      // 고유번호 길이 검증
      if (accessCode.length < 4) {
        results.failed.push({
          ...student,
          reason: '고유번호는 최소 4자 이상이어야 합니다.'
        });
        continue;
      }
      
      try {
        // 중복 체크
        const existingStudent = await Student.findOne({ name, accessCode });
        
        if (existingStudent) {
          results.failed.push({
            ...student,
            reason: '동일한 이름과 고유번호를 가진 학생이 이미 존재합니다.'
          });
          continue;
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
        
        // 성공 결과에 추가
        results.success.push({
          id: newStudent._id,
          name: newStudent.name,
          className: newStudent.className,
          accessCode: accessCode.substring(0, 2) + '*'.repeat(accessCode.length - 2)
        });
      } catch (err) {
        results.failed.push({
          ...student,
          reason: err.message || '저장 중 오류가 발생했습니다.'
        });
      }
    }
    
    // 최종 결과 반환
    return NextResponse.json({
      success: true,
      message: `${results.success.length}명의 학생 계정이 생성되었습니다. ${results.failed.length}명은 생성 실패했습니다.`,
      data: results
    }, { status: 201 });
    
  } catch (error) {
    console.error('학생 계정 일괄 생성 에러:', error);
    return NextResponse.json(
      { success: false, message: '학생 계정 일괄 생성 중 오류가 발생했습니다', error: error.message },
      { status: 500 }
    );
  }
} 