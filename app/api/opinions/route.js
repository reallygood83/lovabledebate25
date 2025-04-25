import { NextResponse } from 'next/server';
import getOpinionModel from '@/lib/models/Opinion';
import getClassModel from '@/lib/models/Class';
import { nanoid } from 'nanoid';

// 입력 데이터 검증 함수
function validateInput(data) {
  const { topic, content, studentName, studentClass, classCode } = data;
  const errors = {};

  // 필수 필드 확인
  if (!topic) errors.topic = '토론 주제는 필수입니다.';
  if (!content) errors.content = '학생 의견은 필수입니다.';
  if (!studentName) errors.studentName = '학생 이름은 필수입니다.';
  if (!studentClass) errors.studentClass = '학급 정보는 필수입니다.';
  if (!classCode) errors.classCode = '학급 코드는 필수입니다.';

  // 길이 제한 확인
  if (topic && topic.length > 100) errors.topic = '토론 주제는 100자를 초과할 수 없습니다.';
  if (content && content.length > 5000) errors.content = '의견은 5000자를 초과할 수 없습니다.';
  if (studentName && studentName.length > 50) errors.studentName = '이름은 50자를 초과할 수 없습니다.';
  if (studentClass && studentClass.length > 50) errors.studentClass = '학급 정보는 50자를 초과할 수 없습니다.';
  if (classCode && classCode.length !== 4) errors.classCode = '학급 코드는 4자리여야 합니다.';

  // 최소 길이 확인
  if (content && content.length < 10) errors.content = '의견은 최소 10자 이상이어야 합니다.';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// 학생 의견 제출 API
export async function POST(request) {
  try {
    const body = await request.json();
    
    // 입력 데이터 검증
    const validation = validateInput(body);
    if (!validation.isValid) {
      return NextResponse.json({ 
        success: false, 
        message: '입력 데이터가 유효하지 않습니다.', 
        errors: validation.errors 
      }, { status: 400 });
    }
    
    const { topic, content, studentName, studentClass, classCode } = body;
    
    // 학급 코드로 교사 ID 조회
    const Class = await getClassModel();
    const classInfo = await Class.findOne({ joinCode: classCode });
    
    if (!classInfo) {
      return NextResponse.json({ 
        success: false, 
        message: '유효하지 않은 학급 코드입니다. 교사에게 올바른 코드를 확인하세요.',
        errors: { classCode: '유효하지 않은 학급 코드입니다.' }
      }, { status: 400 });
    }
    
    // 모델 가져오기
    const Opinion = await getOpinionModel();
    
    // 고유한 참조 코드 생성 (6자리 코드)
    const referenceCode = nanoid(6);
    
    // 중복 코드 확인
    const existingOpinion = await Opinion.findOne({ referenceCode });
    if (existingOpinion) {
      // 드물게 발생할 수 있는 중복 코드의 경우, 재시도
      return NextResponse.json({ 
        success: false, 
        message: '일시적인 오류가 발생했습니다. 다시 시도해주세요.' 
      }, { status: 500 });
    }
    
    // 데이터 정제
    const sanitizedData = {
      topic: topic.trim(),
      content: content.trim(),
      studentName: studentName.trim(),
      studentClass: studentClass.trim(),
      referenceCode,
      submittedAt: new Date(),
      teacherId: classInfo.teacherId,
      classId: classInfo._id,
    };
    
    // 데이터베이스에 저장
    const newOpinion = new Opinion(sanitizedData);
    
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

// 모든 의견 조회 API (공개 의견용)
export async function GET(request) {
  try {
    const Opinion = await getOpinionModel();
    
    // URL의 쿼리 파라미터 가져오기
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    
    // 페이지네이션 설정
    const skip = (page - 1) * limit;
    
    // 최대 limit 제한
    const safeLimit = Math.min(limit, 50);
    
    // 공개된 의견만 최신순으로 조회
    const opinions = await Opinion.find({ isPublic: true })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(safeLimit);
    
    // 전체 개수 조회
    const total = await Opinion.countDocuments({ isPublic: true });
    
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