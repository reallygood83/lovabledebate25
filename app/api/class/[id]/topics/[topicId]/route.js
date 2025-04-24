import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import getClassModel from '@/lib/models/Class';

/**
 * 특정 반의 특정 토론 주제를 삭제하는 API
 * DELETE /api/class/:id/topics/:topicId
 */
export async function DELETE(request, { params }) {
  try {
    const { id, topicId } = params;
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: '유효하지 않은 반 ID입니다.' 
      }, { status: 400 });
    }
    
    if (!topicId || !ObjectId.isValid(topicId)) {
      return NextResponse.json({ 
        success: false, 
        message: '유효하지 않은 토론 주제 ID입니다.' 
      }, { status: 400 });
    }
    
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
    
    // 해당 토론 주제 있는지 확인
    const topicIndex = classDoc.topics.findIndex(
      topic => topic._id.toString() === topicId
    );
    
    if (topicIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        message: '해당 토론 주제를 찾을 수 없습니다.' 
      }, { status: 404 });
    }
    
    // 토론 주제 삭제
    classDoc.topics.splice(topicIndex, 1);
    
    // 저장
    await classDoc.save();
    
    return NextResponse.json({ 
      success: true, 
      message: '토론 주제가 성공적으로 삭제되었습니다.' 
    }, { status: 200 });
  } catch (error) {
    console.error('토론 주제 삭제 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '토론 주제 삭제에 실패했습니다.',
      error: error.message 
    }, { status: 500 });
  }
}

/**
 * 특정 반의 특정 토론 주제를 수정하는 API
 * PATCH /api/class/:id/topics/:topicId
 */
export async function PATCH(request, { params }) {
  try {
    const { id, topicId } = params;
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: '유효하지 않은 반 ID입니다.' 
      }, { status: 400 });
    }
    
    if (!topicId || !ObjectId.isValid(topicId)) {
      return NextResponse.json({ 
        success: false, 
        message: '유효하지 않은 토론 주제 ID입니다.' 
      }, { status: 400 });
    }
    
    // 요청 본문 파싱
    const data = await request.json();
    const { title, description, deadline, status } = data;
    
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
    
    // 해당 토론 주제 있는지 확인
    const topicIndex = classDoc.topics.findIndex(
      topic => topic._id.toString() === topicId
    );
    
    if (topicIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        message: '해당 토론 주제를 찾을 수 없습니다.' 
      }, { status: 404 });
    }
    
    // 토론 주제 수정
    if (title) classDoc.topics[topicIndex].title = title;
    if (description !== undefined) classDoc.topics[topicIndex].description = description;
    if (deadline) classDoc.topics[topicIndex].deadline = new Date(deadline);
    if (status) classDoc.topics[topicIndex].status = status;
    
    // 저장
    await classDoc.save();
    
    return NextResponse.json({ 
      success: true, 
      message: '토론 주제가 성공적으로 수정되었습니다.',
      data: classDoc.topics[topicIndex]
    }, { status: 200 });
  } catch (error) {
    console.error('토론 주제 수정 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '토론 주제 수정에 실패했습니다.',
      error: error.message 
    }, { status: 500 });
  }
} 