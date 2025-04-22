import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

// Gemini 클라이언트 초기화 (환경 변수 사용)
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * 경기초등토론교육모형 기반 피드백 프롬프트를 생성합니다.
 * @param {string} topic - 토론 주제
 * @param {string} opinion - 학생 의견
 * @return {string} - Gemini API에 전달할 프롬프트 텍스트
 */
function createFeedbackPrompt(topic, opinion) {
  // 프롬프트 시작
  return `
당신은 초등학교 선생님을 돕는 친절하고 교육적인 AI 보조입니다. '다름과 공존하는 경기초등토론교육모형'의 관점에서 학생의 토론 의견에 대한 맞춤형 피드백 초안을 작성해야 합니다. 이 모델은 단순히 논리적 우수성뿐만 아니라, 다른 의견을 존중하고 함께 해결책을 찾아가는 과정을 중요하게 생각합니다.

**토론 주제:**
${topic}

**학생 의견:**
"${opinion}"

**피드백 작성 가이드라인 (경기초등토론교육모형 참고):**
1.  **칭찬과 격려:** 학생 의견의 긍정적인 부분(예: 자신의 생각 명확히 표현, 새로운 관점 제시 등)을 먼저 찾아 구체적으로 칭찬해주세요.
2.  **내용 분석 (논리/근거 중심):**
    * 주장이 명확하게 드러나는지 살펴보세요.
    * 주장을 뒷받침하는 이유나 근거가 제시되었는지, 제시되었다면 적절하고 타당한지 평가해주세요. (초등학생 수준 고려)
3.  **태도 및 관점 (존중/공감 중심):**
    * 다른 사람의 의견을 존중하는 태도가 보이는지 간접적으로 언급해주세요. (직접적 비판 지양)
    * 혹시 다른 관점이나 친구들의 의견을 고려한 부분이 있다면 긍정적으로 언급해주세요.
4.  **성장 제안:** 딱딱한 지적보다는, 생각을 더 발전시킬 수 있는 질문이나 구체적인 제안(예: "만약 ~한 상황이라면 어떨까요?", "다른 친구의 의견과 비교해서 ~점을 더 생각해볼 수도 있겠네요.")을 부드럽게 제시해주세요.
5.  **어조 및 수준:** 초등학생이 이해하기 쉽도록 쉽고 간결한 단어를 사용하고, 매우 친절하고 격려하는 말투를 유지해주세요. 비판적이거나 부정적인 표현은 최소화하고, 긍정적인 성장을 유도하는 데 초점을 맞춰주세요.

**요청:** 위 가이드라인에 따라 학생에게 전달할 피드백 초안을 3~5문장 정도로 작성해주세요.
`; // 프롬프트 끝
}

/**
 * POST 요청을 처리하는 핸들러 함수 (App Router 방식)
 * @param {Request} request - Next.js 요청 객체
 */
export async function POST(request) {
  // API 키 존재 여부 확인
  if (!API_KEY) {
    console.error("Gemini API Key is not set.");
    // NextResponse를 사용하여 JSON 응답 및 상태 코드 반환
    return NextResponse.json({ message: '서버 설정 오류: API 키가 설정되지 않았습니다. 환경 변수 GEMINI_API_KEY를 설정해주세요.' }, { status: 500 });
  }

  try {
    // 요청 본문(JSON) 파싱
    const requestData = await request.json();
    const { discussionTopic, studentOpinion } = requestData;

    // 필수 데이터 확인
    if (!discussionTopic || !studentOpinion) {
      return NextResponse.json({ message: '토론 주제와 학생 의견은 필수입니다.' }, { status: 400 });
    }

    // Gemini 모델 선택 (Flash 모델 권장)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // 최적화된 프롬프트 생성
    const prompt = createFeedbackPrompt(discussionTopic, studentOpinion);

    // Gemini API 호출
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const feedbackText = response.text();

    // 성공 응답 (피드백 초안 반환)
    return NextResponse.json({ feedback: feedbackText }, { status: 200 });

  } catch (error) {
    console.error('Gemini API 호출 또는 요청 처리 오류:', error);
    // 실패 응답
    return NextResponse.json({ message: '피드백 생성 중 오류 발생', error: error.message || 'Unknown error' }, { status: 500 });
  }
}