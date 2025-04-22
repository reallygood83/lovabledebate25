import { NextResponse } from 'next/server';
import getOpinionModel from '@/lib/models/Opinion';

// 모든 의견 조회 API (교사용)
export async function GET(request) {
  try {
    const Opinion = await getOpinionModel();
    
    // URL의 쿼리 파라미터 가져오기
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const status = searchParams.get('status');
    const searchTerm = searchParams.get('search');
    
    // 페이지네이션 설정
    const skip = (page - 1) * limit;
    
    // 최대 limit 제한
    const safeLimit = Math.min(limit, 50);
    
    // 쿼리 구성
    let query = {};
    
    // 상태 필터링
    if (status) {
      query.status = status;
    }
    
    // 검색어 필터링
    if (searchTerm) {
      query = {
        ...query,
        $or: [
          { studentName: { $regex: searchTerm, $options: 'i' } },
          { topic: { $regex: searchTerm, $options: 'i' } },
          { content: { $regex: searchTerm, $options: 'i' } },
          { studentClass: { $regex: searchTerm, $options: 'i' } },
        ]
      };
    }
    
    // 모든 의견 최신순으로 조회
    const opinions = await Opinion.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(safeLimit);
    
    // 전체 개수 조회
    const total = await Opinion.countDocuments(query);
    
    return NextResponse.json({ 
      success: true, 
      data: opinions,
      pagination: {
        total,
        page,
        limit: safeLimit,
        pages: Math.ceil(total / safeLimit)
      }
    });
  } catch (error) {
    console.error('의견 조회 에러:', error);
    return NextResponse.json(
      { success: false, error: '의견 조회 중 오류가 발생했습니다', details: error.message },
      { status: 500 }
    );
  }
} 