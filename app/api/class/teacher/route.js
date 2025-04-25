import { NextResponse } from 'next/server';
import getClassModel from '@/lib/models/Class';

// 교사 ID로 클래스 목록을 조회하는 API
export async function GET(request) {
  try {
    // URL 쿼리 파라미터에서 teacherId 추출
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    
    if (!teacherId) {
      return NextResponse.json({ 
        success: false, 
        message: '교사 ID는 필수입니다.' 
      }, { status: 400 });
    }
    
    // 클래스 모델 가져오기
    const ClassModel = await getClassModel();
    
    // 해당 교사의 클래스 목록 조회
    const classes = await ClassModel.find({ 
      teacherId,
      isActive: true
    }).sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      data: classes 
    });
  } catch (error) {
    console.error('교사 클래스 조회 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '클래스 목록을 불러오는데 실패했습니다.'
    }, { status: 500 });
  }
} 