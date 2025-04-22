import { NextResponse } from 'next/server';
import getOpinionModel from '@/lib/models/Opinion';
import mongoose from 'mongoose';

// 유효한 MongoDB ObjectID인지 확인하는 함수
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// 특정 ID로 의견 조회
export async function GET(request, context) {
  try {
    const { params } = context;
    const id = params.id;
    const Opinion = await getOpinionModel();
    
    let query = { referenceCode: id };
    
    // 유효한 MongoDB ObjectID인 경우에만 _id 쿼리 추가
    if (isValidObjectId(id)) {
      query = { $or: [{ _id: id }, { referenceCode: id }] };
    }
    
    const opinion = await Opinion.findOne(query);
    
    if (!opinion) {
      return NextResponse.json(
        { success: false, error: '의견을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: opinion });
  } catch (error) {
    console.error('의견 상세 조회 에러:', error);
    return NextResponse.json(
      { success: false, error: '의견 조회 중 오류가 발생했습니다', details: error.message },
      { status: 500 }
    );
  }
}

// 의견에 피드백 추가 (교사용)
export async function PATCH(request, context) {
  try {
    const { params } = context;
    const id = params.id;
    const body = await request.json();
    const { feedback, teacherNote, isPublic, status } = body;
    
    // 추후 인증 검사 추가
    // TODO: 인증 및 권한 검사 필요
    
    const Opinion = await getOpinionModel();
    
    let query = { referenceCode: id };
    
    // 유효한 MongoDB ObjectID인 경우에만 _id 쿼리 추가
    if (isValidObjectId(id)) {
      query = { $or: [{ _id: id }, { referenceCode: id }] };
    }
    
    const opinion = await Opinion.findOne(query);
    
    if (!opinion) {
      return NextResponse.json({ 
        success: false, 
        message: '의견을 찾을 수 없습니다.' 
      }, { status: 404 });
    }
    
    // 업데이트할 필드만 업데이트
    if (feedback !== undefined) opinion.feedback = feedback;
    if (teacherNote !== undefined) opinion.teacherNote = teacherNote;
    if (isPublic !== undefined) opinion.isPublic = isPublic;
    if (status !== undefined) opinion.status = status;
    
    await opinion.save();
    
    return NextResponse.json({
      success: true,
      message: '의견이 업데이트되었습니다.',
      data: opinion
    }, { status: 200 });
    
  } catch (error) {
    console.error('의견 업데이트 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.', 
      error: error.message 
    }, { status: 500 });
  }
}

// 의견 삭제 (교사용)
export async function DELETE(request, context) {
  try {
    const { params } = context;
    const id = params.id;
    
    // 추후 인증 검사 추가
    // TODO: 인증 및 권한 검사 필요
    
    const Opinion = await getOpinionModel();
    
    let query = { referenceCode: id };
    
    // 유효한 MongoDB ObjectID인 경우에만 _id 쿼리 추가
    if (isValidObjectId(id)) {
      query = { $or: [{ _id: id }, { referenceCode: id }] };
    }
    
    const opinion = await Opinion.findOneAndDelete(query);
    
    if (!opinion) {
      return NextResponse.json({ 
        success: false, 
        message: '의견을 찾을 수 없습니다.' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: '의견이 삭제되었습니다.'
    }, { status: 200 });
    
  } catch (error) {
    console.error('의견 삭제 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.', 
      error: error.message 
    }, { status: 500 });
  }
}

// 의견 업데이트
export async function PUT(request, context) {
  try {
    const { params } = context;
    const id = params.id;
    const data = await request.json();
    const Opinion = await getOpinionModel();
    
    let query = { referenceCode: id };
    
    // 유효한 MongoDB ObjectID인 경우에만 _id 쿼리 추가
    if (isValidObjectId(id)) {
      query = { $or: [{ _id: id }, { referenceCode: id }] };
    }
    
    const opinion = await Opinion.findOneAndUpdate(
      query,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!opinion) {
      return NextResponse.json(
        { success: false, error: '의견을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: opinion,
      message: '의견이 업데이트되었습니다'
    });
  } catch (error) {
    console.error('의견 업데이트 에러:', error);
    return NextResponse.json(
      { success: false, error: '의견 업데이트 중 오류가 발생했습니다', details: error.message },
      { status: 500 }
    );
  }
} 