import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini 클라이언트 초기화
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * 주어진 토론 주제에 대한 학생 의견 작성 도우미 프롬프트를 생성합니다.
 * @param {string} topic - 토론 주제
 * @return {string} - Gemini에 전달할 프롬프트
 */
function createWritingPrompt(topic) {
  return `
당신은 초등학교 학생들이 토론 의견을 작성하는 것을 돕는 보조 교사입니다.
아래 토론 주제에 대한 학생이 작성할 수 있는 의견의 예시를 만들어주세요.

**토론 주제:** ${topic}

다음 지침을 따라 작성해 주세요:
1. 초등학생 수준(10-12세)에 맞는 단어와 문장 구조를 사용하세요.
2. 200-300자 내외로 간결하게 작성하세요.
3. 분명한 주장으로 시작하고, 2-3개의 이유나 예시를 들어 뒷받침하세요.
4. 첫 문장에서는 "저는 ~라고 생각합니다" 형식으로 의견을 명확히 밝혀주세요.
5. 존중적이고 교육적인 내용만 포함해주세요.
6. 학생들이 실제로 작성할 법한 자연스러운 표현을 사용하세요.
7. 초등학생이 참고할 수 있는 예시이므로, 너무 완벽하지 않고 학생들이 발전시킬 여지가 있는 글을 작성해 주세요.

학생의 의견 예시만 제공해 주세요. 다른 설명이나 안내는 포함하지 마세요.
`;
}

/**
 * 토론 의견 작성 도우미 API 
 * POST /api/generate-help
 */
export async function POST(request) {
  // API 키 확인
  if (!API_KEY) {
    console.error("Gemini API Key is not set.");
    return NextResponse.json({ 
      message: '서버 설정 오류: API 키가 설정되지 않았습니다.' 
    }, { status: 500 });
  }

  try {
    // 요청 본문 파싱
    const requestData = await request.json();
    const { topic } = requestData;

    // 토론 주제 확인
    if (!topic || topic.trim() === '') {
      return NextResponse.json({ 
        message: '토론 주제를 입력해주세요.' 
      }, { status: 400 });
    }

    // Gemini 모델 설정
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // 프롬프트 생성 및 API 호출
    const prompt = createWritingPrompt(topic);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();

    // 응답 데이터
    return NextResponse.json({ 
      content 
    }, { status: 200 });

  } catch (error) {
    console.error('AI 작성 도우미 오류:', error);
    return NextResponse.json({ 
      message: 'AI 작성 도우미 생성 중 오류가 발생했습니다.', 
      error: error.message || 'Unknown error' 
    }, { status: 500 });
  }
} 