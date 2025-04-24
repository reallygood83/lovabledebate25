import { NextResponse } from 'next/server';
import getStudentModel from '@/lib/models/Student';
import mongoose from 'mongoose';

// 유효한 MongoDB ObjectID인지 확인하는 함수
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// 특정 학생 정보 조회
export async function GET(request, context) {
  try {
    const { params } = context;
    const id = params.id;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 학생 ID입니다.' },
        { status: 400 }
      );
    }
    
    const Student = await getStudentModel();
    const student = await Student.findById(id);
    
    if (!student) {
      return NextResponse.json(
        { success: false, message: '학생을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 응답에서 accessCode는 일부만 표시 (보안)
    const response = student.toObject();
    response.accessCode = response.accessCode.substring(0, 2) + '*'.repeat(response.accessCode.length - 2);
    
    return NextResponse.json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error('학생 정보 조회 에러:', error);
    return NextResponse.json(
      { success: false, message: '학생 정보 조회 중 오류가 발생했습니다.', error: error.message },
      { status: 500 }
    );
  }
}

// 학생 정보 수정
export async function PATCH(request, context) {
  try {
    const { params } = context;
    const id = params.id;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 학생 ID입니다.' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { isActive, className } = body;
    
    // 수정할 필드만 포함하는 업데이트 객체 생성
    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (className) updateData.className = className;
    
    // 수정할 내용이 없으면 에러 반환
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: '수정할 내용이 없습니다.' },
        { status: 400 }
      );
    }
    
    const Student = await getStudentModel();
    
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!updatedStudent) {
      return NextResponse.json(
        { success: false, message: '학생을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 응답에서 accessCode는 일부만 표시 (보안)
    const response = updatedStudent.toObject();
    response.accessCode = response.accessCode.substring(0, 2) + '*'.repeat(response.accessCode.length - 2);
    
    return NextResponse.json({
      success: true,
      message: '학생 정보가 성공적으로 수정되었습니다.',
      data: response
    });
    
  } catch (error) {
    console.error('학생 정보 수정 에러:', error);
    return NextResponse.json(
      { success: false, message: '학생 정보 수정 중 오류가 발생했습니다.', error: error.message },
      { status: 500 }
    );
  }
}

// 학생 삭제
export async function DELETE(request, context) {
  try {
    const { params } = context;
    const id = params.id;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 학생 ID입니다.' },
        { status: 400 }
      );
    }
    
    const Student = await getStudentModel();
    const deletedStudent = await Student.findByIdAndDelete(id);
    
    if (!deletedStudent) {
      return NextResponse.json(
        { success: false, message: '학생을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '학생 계정이 성공적으로 삭제되었습니다.'
    });
    
  } catch (error) {
    console.error('학생 삭제 에러:', error);
    return NextResponse.json(
      { success: false, message: '학생 삭제 중 오류가 발생했습니다.', error: error.message },
      { status: 500 }
    );
  }
} 