import { NextResponse } from 'next/server';
import getClassModel from '@/lib/models/Class';
import { generateUniqueJoinCode } from '@/lib/utils/codeGenerator';

/**
 * 클래스(반) 생성 API 핸들러
 * POST /api/class
 */
export async function POST(request) {
  try {
    const { name, teacherId, description = '' } = await request.json();
    
    // 필수 필드 검증
    if (!name || !teacherId) {
      return NextResponse.json(
        { success: false, message: '반 이름과 교사 ID는 필수입니다.' },
        { status: 400 }
      );
    }
    
    // 클래스 모델 가져오기
    const ClassModel = await getClassModel();
    
    // 고유한 참여 코드 생성
    const joinCode = await generateUniqueJoinCode(ClassModel);
    
    // 새 클래스 생성
    const newClass = new ClassModel({
      name,
      teacherId,
      description,
      joinCode,
    });
    
    await newClass.save();
    
    // 성공 응답
    return NextResponse.json(
      {
        success: true,
        message: '새로운 반이 생성되었습니다.',
        class: {
          id: newClass._id,
          name: newClass.name,
          joinCode: newClass.joinCode,
          description: newClass.description,
          teacherId: newClass.teacherId,
          createdAt: newClass.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('반 생성 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * 반(클래스) 목록을 조회하는 API
 * GET /api/class
 */
export async function GET() {
  try {
    // 클래스 모델 가져오기
    const ClassModel = await getClassModel();
    
    // 활성화된 반(클래스) 목록 조회
    const classes = await ClassModel.find({ isActive: true })
      .sort({ createdAt: -1 }) // 최신순 정렬
      .select('-__v'); // __v 필드 제외
    
    return NextResponse.json({ success: true, data: classes }, { status: 200 });
  } catch (error) {
    console.error('반 목록 조회 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '반 목록을 불러오는데 실패했습니다.',
      error: error.message 
    }, { status: 500 });
  }
} 