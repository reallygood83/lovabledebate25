import { NextResponse } from 'next/server';
import getOpinionModel from '@/lib/models/Opinion';

// 모든 의견 조회 API (교사용)
export async function GET(request) {
  try {
    // URL 쿼리 파라미터 추출
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const status = searchParams.get('status'); // pending 또는 reviewed 상태 필터링
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;
    
    // 모델 가져오기
    const Opinion = await getOpinionModel();
    
    // 쿼리 조건 설정
    let query = {};
    
    // 교사 ID가 있으면 추가
    if (teacherId) {
      query.teacherId = teacherId;
    }
    
    // 상태 필터링 (pending 또는 reviewed)
    if (status) {
      query.status = status;
    }
    
    // 전체 문서 수 계산
    const total = await Opinion.countDocuments(query);
    
    // 의견을 제출 날짜 기준으로 내림차순 정렬하고 페이지네이션 적용
    const opinions = await Opinion.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // 페이지네이션 정보 계산
    const pages = Math.ceil(total / limit) || 1;
    
    return NextResponse.json({ 
      success: true,
      data: opinions,
      pagination: {
        total,
        page,
        limit,
        pages
      }
    });
  } catch (error) {
    console.error('의견 조회 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '의견을 불러오는데 실패했습니다.' 
    }, { status: 500 });
  }
} 