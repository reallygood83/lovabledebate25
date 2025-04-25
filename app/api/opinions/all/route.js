import { connectToDatabase } from '@/lib/db';
import Opinion from '@/models/opinion';
import { NextResponse } from 'next/server';

// 모든 의견 조회 API (교사용)
export async function GET(request) {
  try {
    // URL 쿼리 파라미터에서 teacherId 추출
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    
    await connectToDatabase();
    
    // 쿼리 조건 설정
    const query = teacherId ? { teacherId } : {};
    
    // 의견을 생성된 날짜 기준으로 내림차순 정렬
    const opinions = await Opinion.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      success: true,
      data: opinions
    });
  } catch (error) {
    console.error('의견 조회 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '의견을 불러오는데 실패했습니다.' 
    }, { status: 500 });
  }
} 