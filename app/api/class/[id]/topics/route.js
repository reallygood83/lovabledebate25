import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import getClassModel from '@/lib/models/Class';

/**
 * 특정 반의 토론 주제 목록을 조회하는 API
 * GET /api/class/:id/topics
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
    const classDoc = await ClassModel.findById(id).select('topics');
    
    if (!classDoc) {
      return NextResponse.json({ 
        success: false, 
        message: '해당 반을 찾을 수 없습니다.' 
      }, { status: 404 });
    }
    
    // 토론 주제 정렬: 최신순
    const topics = [...classDoc.topics].sort((a, b) => b.createdAt - a.createdAt);
    
    return NextResponse.json({ 
      success: true, 
      data: topics 
    }, { status: 200 });
  } catch (error) {
    console.error('토론 주제 목록 조회 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '토론 주제 목록을 불러오는데 실패했습니다.',
      error: error.message 
    }, { status: 500 });
  }
}

/**
 * 특정 반에 새로운 토론 주제를 추가하는 API
 * POST /api/class/:id/topics
 */
export async function POST(request, { params }) {
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
    const { title, description, deadline, status = 'active' } = data;
    
    // 필수 필드 검증
    if (!title) {
      return NextResponse.json({ 
        success: false, 
        message: '토론 주제 제목은 필수입니다.' 
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
    
    // 새 토론 주제 생성
    const newTopic = {
      _id: new ObjectId(),
      title,
      description,
      deadline: deadline ? new Date(deadline) : undefined,
      status,
      createdAt: new Date()
    };
    
    // 반에 토론 주제 추가
    classDoc.topics.push(newTopic);
    
    // 저장
    await classDoc.save();
    
    return NextResponse.json({ 
      success: true, 
      message: '토론 주제가 성공적으로 추가되었습니다.',
      data: newTopic
    }, { status: 201 });
  } catch (error) {
    console.error('토론 주제 추가 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '토론 주제 추가에 실패했습니다.',
      error: error.message 
    }, { status: 500 });
  }
} 