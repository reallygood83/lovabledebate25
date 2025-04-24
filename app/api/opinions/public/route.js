import { NextResponse } from 'next/server';
import getOpinionModel from '@/lib/models/Opinion';

// 공개된 예시 목록 조회
export async function GET(request) {
  try {
    const Opinion = await getOpinionModel();
    
    // 공개 상태(isPublic=true)이고 검토 완료(status=reviewed)인 의견만 조회
    const publicExamples = await Opinion.find({
      isPublic: true,
      status: 'reviewed'
    }).sort({ submittedAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: publicExamples
    }, { status: 200 });
    
  } catch (error) {
    console.error('공개 예시 조회 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.', 
      error: error.message 
    }, { status: 500 });
  }
} 