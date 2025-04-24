import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import getClassModel from '@/lib/models/Class';

/**
 * 특정 반의 정보를 조회하는 API
 * GET /api/class/:id
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: '유효하지 않은 반 ID입니다.' 
      }, { status: 400 });
    }
    
    // 클래스 모델 가져오기
    const ClassModel = await getClassModel();
    
    // 반 조회
    const classDoc = await ClassModel.findById(id).select('-__v');
    
    if (!classDoc) {
      return NextResponse.json({ 
        success: false, 
        message: '해당 반을 찾을 수 없습니다.' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: classDoc 
    }, { status: 200 });
  } catch (error) {
    console.error('반 정보 조회 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '반 정보를 불러오는데 실패했습니다.',
      error: error.message 
    }, { status: 500 });
  }
}

/**
 * 특정 반의 정보를 수정하는 API
 * PATCH /api/class/:id
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: '유효하지 않은 반 ID입니다.' 
      }, { status: 400 });
    }
    
    // 요청 본문 파싱
    const data = await request.json();
    const { name, joinCode, description, isActive } = data;
    
    // 클래스 모델 가져오기
    const ClassModel = await getClassModel();
    
    // 반 조회
    const classDoc = await ClassModel.findById(id);
    
    if (!classDoc) {
      return NextResponse.json({ 
        success: false, 
        message: '해당 반을 찾을 수 없습니다.' 
      }, { status: 404 });
    }
    
    // 참여 코드 변경 시 중복 검사
    if (joinCode && joinCode !== classDoc.joinCode) {
      const existingClass = await ClassModel.findOne({ joinCode });
      if (existingClass) {
        return NextResponse.json({ 
          success: false, 
          message: '이미 사용 중인 참여 코드입니다. 다른 코드를 사용해주세요.' 
        }, { status: 409 });
      }
    }
    
    // 반 정보 수정
    if (name) classDoc.name = name;
    if (joinCode) classDoc.joinCode = joinCode;
    if (description !== undefined) classDoc.description = description;
    if (isActive !== undefined) classDoc.isActive = isActive;
    
    // 저장
    await classDoc.save();
    
    return NextResponse.json({ 
      success: true, 
      message: '반 정보가 성공적으로 수정되었습니다.',
      data: classDoc
    }, { status: 200 });
  } catch (error) {
    console.error('반 정보 수정 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '반 정보 수정에 실패했습니다.',
      error: error.message 
    }, { status: 500 });
  }
}

/**
 * 특정 반을 삭제하는 API
 * DELETE /api/class/:id
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: '유효하지 않은 반 ID입니다.' 
      }, { status: 400 });
    }
    
    // 클래스 모델 가져오기
    const ClassModel = await getClassModel();
    
    // 반 삭제 (실제로는 비활성화)
    const result = await ClassModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!result) {
      return NextResponse.json({ 
        success: false, 
        message: '해당 반을 찾을 수 없습니다.' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '반이 성공적으로 삭제되었습니다.' 
    }, { status: 200 });
  } catch (error) {
    console.error('반 삭제 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '반 삭제에 실패했습니다.',
      error: error.message 
    }, { status: 500 });
  }
} 