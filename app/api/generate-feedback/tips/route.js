import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

// Gemini 클라이언트 초기화 (환경 변수 사용)
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * 학생 토론 의견에 대한 맞춤형 피드백 팁을 생성하는 프롬프트
 * @param {string} topic - 토론 주제
 * @param {string} opinion - 학생 의견
 * @return {string} - Gemini API에 전달할 프롬프트 텍스트
 */
function createFeedbackTipsPrompt(topic, opinion) {
  return `
당신은 초등학교 교사를 도와주는 교육 전문 AI 보조입니다. 학생의 토론 의견을 분석하고 교사에게 도움이 될 맞춤형 피드백 팁을 제공해야 합니다.

**토론 주제:**
${topic}

**학생 의견:**
"${opinion}"

**요청:**
위 학생 의견을 분석하고, 교사가 피드백을 작성할 때 참고할 수 있는 구체적인 팁 3개를 제시해주세요. 
각 팁은 한 문장으로 간결하게 작성하되, 다음 카테고리에 맞춰 작성해주세요:

1. 이 학생의 논리/근거 관련 피드백 팁
2. 이 학생의 창의성/관점 관련 피드백 팁
3. 이 학생의 발전 방향 관련 피드백 팁

결과를 명확하게 리스트 형식으로 작성해주세요. 팁은 교사가 직접 사용할 수 있도록 간결하고 구체적으로 작성해주세요.
`;
}

/**
 * 학생 토론 의견에 대한 맞춤형 피드백 팁을 생성하는 API
 * POST /api/generate-feedback/tips
 */
export async function POST(request) {
  // API 키 존재 여부 확인
  if (!API_KEY) {
    console.error("Gemini API Key is not set.");
    return NextResponse.json({ 
      message: '서버 설정 오류: API 키가 설정되지 않았습니다. 환경 변수 GEMINI_API_KEY를 설정해주세요.' 
    }, { status: 500 });
  }

  try {
    // 요청 본문(JSON) 파싱
    const requestData = await request.json();
    const { topic, opinion } = requestData;

    // 필수 데이터 확인
    if (!topic || !opinion) {
      return NextResponse.json({ 
        message: '토론 주제와 학생 의견은 필수입니다.' 
      }, { status: 400 });
    }

    // Gemini 모델 선택
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // 프롬프트 생성
    const prompt = createFeedbackTipsPrompt(topic, opinion);

    // Gemini API 호출
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const tipsText = response.text();

    // 텍스트 응답을 리스트로 파싱
    const tipsList = tipsText
      .split(/\d+\./) // 번호로 구분
      .filter(tip => tip.trim()) // 빈 문자열 제거
      .map(tip => tip.trim()); // 공백 제거

    // 성공 응답
    return NextResponse.json({ 
      tips: tipsList 
    }, { status: 200 });

  } catch (error) {
    console.error('피드백 팁 생성 오류:', error);
    // 실패 응답
    return NextResponse.json({ 
      message: '피드백 팁 생성 중 오류 발생', 
      error: error.message || 'Unknown error' 
    }, { status: 500 });
  }
} 