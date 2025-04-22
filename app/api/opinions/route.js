import { NextResponse } from 'next/server';
import getOpinionModel from '@/lib/models/Opinion';
import { nanoid } from 'nanoid';

// 학생 의견 제출 API
export async function POST(request) {
  try {
    const body = await request.json();
    const { topic, content, studentName, studentClass } = body;
    
    // 필수 필드 확인
    if (!topic || !content || !studentName || !studentClass) {
      return NextResponse.json({ 
        success: false, 
        message: '모든 필수 필드를 입력해주세요.' 
      }, { status: 400 });
    }
    
    // 모델 가져오기
    const Opinion = await getOpinionModel();
    
    // 고유한 참조 코드 생성 (6자리 코드)
    const referenceCode = nanoid(6);
    
    // 데이터베이스에 저장
    const newOpinion = new Opinion({
      topic,
      content,
      studentName,
      studentClass,
      referenceCode,
      submittedAt: new Date(),
    });
    
    await newOpinion.save();
    
    return NextResponse.json({
      success: true,
      message: '의견이 성공적으로 제출되었습니다.',
      referenceCode,
      id: newOpinion._id
    }, { status: 201 });
    
  } catch (error) {
    console.error('의견 제출 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.', 
      error: error.message 
    }, { status: 500 });
  }
}

// 모든 의견 조회 API (교사용)
export async function GET() {
  try {
    const Opinion = await getOpinionModel();
    
    // 공개된 의견만 최신순으로 조회
    const opinions = await Opinion.find({ isPublic: true })
      .sort({ submittedAt: -1 })
      .limit(20);
    
    return NextResponse.json({ success: true, data: opinions });
  } catch (error) {
    console.error('의견 조회 에러:', error);
    return NextResponse.json(
      { success: false, error: '의견 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 