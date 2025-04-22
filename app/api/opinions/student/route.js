import { NextResponse } from 'next/server';
import getOpinionModel from '@/lib/models/Opinion';

export async function GET(request) {
  try {
    // URL 쿼리 파라미터 가져오기
    const { searchParams } = new URL(request.url);
    const studentName = searchParams.get('name');
    
    if (!studentName) {
      return NextResponse.json(
        { success: false, message: '학생 이름은 필수 파라미터입니다.' },
        { status: 400 }
      );
    }
    
    const Opinion = await getOpinionModel();
    
    // 해당 학생의 의견 조회
    const opinions = await Opinion.find({ studentName: studentName })
      .sort({ submittedAt: -1 }); // 최신순 정렬
    
    return NextResponse.json({
      success: true,
      data: opinions,
      count: opinions.length
    });
    
  } catch (error) {
    console.error('학생 의견 조회 오류:', error);
    return NextResponse.json(
      { success: false, message: '의견 조회 중 오류가 발생했습니다.', error: error.message },
      { status: 500 }
    );
  }
} 