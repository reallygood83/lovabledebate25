# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**LovableDebate**는 경기초등토론교육모형에 기반한 AI 토론 교육 플랫폼입니다. Google Gemini AI를 활용하여 학생들에게 맞춤형 토론 피드백을 제공하고, 교사들이 효율적으로 토론 수업을 운영할 수 있도록 지원합니다.

## 개발 환경 설정

### 필수 환경 변수
```bash
MONGODB_URI=mongodb://...
GEMINI_API_KEY=...
NAVER_CLIENT_ID=...
NAVER_CLIENT_SECRET=...
NAVER_CALLBACK_URL=...
```

### 개발 명령어
```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행 (standalone 모드)
npm start

# 코드 린팅
npm run lint
```

### 핵심 기술 스택
- **Next.js 15.3.1** (App Router, Standalone 출력)
- **MongoDB + Mongoose** (ODM, 스키마 검증)
- **Google Gemini AI** (1.5 Flash Latest)
- **Naver OAuth** (네이버 로그인)
- **Vercel 배포** (서버리스 함수)

## 아키텍처 및 코드 구조

### 인증 아키텍처
- **교사**: bcrypt 해시 + 자체 인증 시스템, Naver OAuth 지원
- **학생**: 이름 + 고유번호 기반 단순 인증
- 인증 상태는 localStorage에 저장 (서버사이드 세션 없음)

### 데이터베이스 연결 패턴
모든 MongoDB 모델은 동적 연결 패턴을 사용:
```javascript
// lib/models/*.js 파일들의 공통 패턴
export default async function getModelName() {
  await connectDB();
  return mongoose.models.ModelName || mongoose.model('ModelName', schema);
}
```

### API Route 구조
```
app/api/
├── auth/naver/          # Naver OAuth 콜백
├── class/               # 학급 관리 (생성, 조회, 수정, 삭제)
├── generate-feedback/   # AI 피드백 생성
├── generate-help/       # AI 토론 도우미
├── opinions/            # 의견 관리 (제출, 조회, 수정)
├── student/             # 학생 인증 및 관리
├── students/            # 학생 CRUD
└── teacher/            # 교사 인증 (로그인, 회원가입)
```

### 중요한 설정 파일

#### next.config.mjs
- **Standalone 출력**: Vercel 최적화
- **환경 변수 검증**: 5개 필수 변수 체크
- **번들 크기 최적화**: react-icons 불필요 패키지 제외
- **서버 외부 패키지**: bcrypt 외부화

#### vercel.json
- **메모리**: API 함수 1024MB
- **최대 실행 시간**: 10초
- **캐시 정책**: API 캐시 비활성화 (`s-maxage=0`)

## 핵심 데이터 모델

### 관계형 구조
```
Teacher (1) ←→ (N) Class (1) ←→ (N) Student (1) ←→ (N) Opinion
```

### 주요 모델 필드
- **Teacher**: email (unique), name, password (bcrypt), naverOAuthId
- **Class**: name, code (4자리), teacher, topics[]
- **Student**: name, accessCode, class
- **Opinion**: student, topic, content, aiFeedback, teacherFeedback, isPublic

## AI 통합 정보

### Google Gemini API 사용
```javascript
// 사용 모델: gemini-1.5-flash-latest
// 구현 위치: app/api/generate-feedback/route.js, app/api/generate-help/route.js
```

### 프롬프트 엔지니어링
- **피드백 생성**: 토론 의견 분석 → 건설적 피드백 + 개선 제안
- **토론 도우미**: 주제별 토론 가이드 + 논리적 사고 도구

## 개발 시 주의사항

### 환경 변수 검증
next.config.mjs에서 프로덕션 빌드 시 5개 필수 환경 변수를 검증합니다:
```javascript
// 누락 시 프로덕션에서 빌드 실패
const requiredEnvVars = ['MONGODB_URI', 'GEMINI_API_KEY', 'NAVER_CLIENT_ID', 'NAVER_CLIENT_SECRET', 'NAVER_CALLBACK_URL'];
```

### MongoDB 연결 패턴
서버리스 환경에서 연결 재사용을 위해 모든 모델은 다음 패턴을 따릅니다:
```javascript
export default async function getModel() {
  await connectDB();
  return mongoose.models.ModelName || mongoose.model('ModelName', schema);
}
```

### 성능 최적화
- **번들 크기**: react-icons에서 FontAwesome만 사용, 나머지 제외
- **메모리**: Vercel Functions 1024MB (대용량 AI 요청 처리)
- **캐시**: API 응답 캐시 비활성화 (`s-maxage=0`)

### AI API 사용 시 주의사항
```javascript
// Gemini API 호출 시 에러 핸들링 필수
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
try {
  const result = await model.generateContent(prompt);
  // 응답 처리
} catch (error) {
  // 에러 처리 - AI 서비스 장애 대비
}
```

## 프로젝트 특별 고려사항

### 교육용 특화 기능
- **초등학생 대상**: 친근하고 이해하기 쉬운 UI/UX
- **토론 교육**: 경기초등토론교육모형 철학 반영
- **안전한 환경**: 익명 의견 제출, 교사 검토 시스템

### 핵심 데이터 모델

#### Teacher 모델
```javascript
{
  email: String (unique, required),
  name: String (required),
  password: String (required, min 6 chars),
  naverOAuthId: String (sparse),
  createdAt: Date,
  isActive: Boolean
}
```

#### Student 모델
```javascript
{
  name: String (required),
  classId: ObjectId (ref: Class),
  accessCode: String (unique),
  // 기타 필드들
}
```

#### Opinion 모델
```javascript
{
  topic: String (required),
  topicId: ObjectId,
  content: String (required, max 5000 chars),
  studentName: String (required),
  studentId: ObjectId (ref: Student),
  studentClass: String,
  classId: ObjectId (ref: Class),
  submittedAt: Date,
  status: enum ['pending', 'reviewed'],
  feedback: String,
  teacherNote: String,
  teacherId: ObjectId (ref: Teacher),
  isPublic: Boolean,
  referenceCode: String (unique, required)
}
```

## 핵심 기능 및 API

### 인증 시스템
- **Naver OAuth**: `/api/auth/naver/` - 교사 로그인
- **로컬 세션**: localStorage 기반 세션 관리
- **학생 로그인**: 이름 + 고유번호 방식

### AI 피드백 시스템 (Gemini)
- **엔드포인트**: `/api/generate-feedback`
- **모델**: gemini-1.5-flash-latest
- **기능**: 경기초등토론교육모형 기반 맞춤형 피드백 생성
- **프롬프트**: 학생 직접 대상, 존중/공감 중심, 성장 제안 포함

### 주요 API 엔드포인트
```
POST /api/generate-feedback     # AI 피드백 생성
POST /api/generate-help         # AI 도움말
POST /api/opinions             # 의견 제출
GET  /api/opinions/all         # 전체 의견 조회
POST /api/student/login        # 학생 로그인
POST /api/teacher/login        # 교사 로그인
POST /api/teacher/register     # 교사 회원가입
```

## 개발 환경 설정

### 필수 스크립트
```bash
npm run dev        # 개발 서버 실행
npm run build      # 프로덕션 빌드
npm run start      # 프로덕션 서버 실행 (standalone)
npm run lint       # ESLint 검사
```

### 개발 환경 요구사항
- Node.js 18+
- MongoDB 연결
- Gemini API 키
- Naver Developer 앱 등록

## 배포 설정

### Next.js 설정 (next.config.mjs)
- **Output**: standalone (서버리스 최적화)
- **서버 외부 패키지**: bcrypt
- **번들 최적화**: react-icons에서 FontAwesome만 포함
- **환경 변수 검증**: 프로덕션에서 필수 변수 체크

### Vercel 설정 (vercel.json)
- **메모리**: 1024MB
- **타임아웃**: 10초
- **캐시 제어**: API 응답 캐시 비활성화
- **Clean URLs**: 활성화

## 주요 제약사항 및 고려사항

### 성능 최적화
1. **번들 크기**: react-icons 패키지 중 미사용 아이콘 제외
2. **서버리스 함수**: 메모리 1024MB, 타임아웃 10초
3. **DB 연결**: 개발환경에서 전역 변수로 연결 재사용

### 보안 고려사항
1. **환경 변수**: 민감 정보는 Vercel 환경 변수로 관리
2. **API 검증**: 필수 파라미터 검증 및 에러 처리
3. **MongoDB**: Mongoose를 통한 스키마 검증

### AI 사용 가이드라인
1. **교육적 목적**: 초등학생 대상 친절하고 격려하는 톤
2. **경기교육모형**: 다름 존중, 공존 가치 반영
3. **피드백 구조**: 칭찬 → 분석 → 성장 제안 순서

## 문제 해결 가이드

### 일반적인 이슈
1. **MongoDB 연결 오류**: MONGODB_URI 환경 변수 확인
2. **Gemini API 오류**: GEMINI_API_KEY 확인 및 할당량 체크
3. **Naver OAuth 오류**: 콜백 URL 정확성 확인
4. **빌드 오류**: bcrypt 네이티브 모듈 관련 - serverExternalPackages 설정 확인

### 디버깅 팁
1. **API 로그**: 콘솔에서 상세 에러 메시지 확인
2. **DB 연결**: mongoose 연결 상태 체크
3. **환경 변수**: next.config.mjs의 검증 로직 활용

## 확장 및 개선 방향

### 단기 개선사항
1. **테스트 코드**: Jest/Testing Library 도입
2. **TypeScript**: 점진적 TS 마이그레이션
3. **에러 모니터링**: Sentry 등 도구 연동

### 장기 확장성
1. **실시간 기능**: Socket.io 또는 Server-Sent Events
2. **고급 AI**: RAG 시스템, 개인화된 학습 분석
3. **모바일 앱**: React Native 또는 PWA

## 코드 스타일 및 규칙

### ESLint 설정
- **설정 파일**: eslint.config.mjs
- **기본 규칙**: Next.js core-web-vitals 확장
- **호환성**: ES modules 기반 flat config

### 명명 규칙
- **파일명**: camelCase (컴포넌트는 PascalCase)
- **API 라우트**: 소문자, 하이픈 구분
- **CSS 클래스**: camelCase (CSS Modules)

### 폴더 구조 원칙
- **App Router**: 기능별 폴더 구성
- **API**: RESTful 리소스 기반 구조
- **컴포넌트**: 재사용성 고려한 분리

## 운영 및 모니터링

### 로그 관리
- **콘솔 로그**: 개발/운영 환경 구분
- **에러 트래킹**: try-catch 블록과 상세 에러 메시지
- **API 로그**: 요청/응답 상태 기록

### 성능 모니터링
- **Vercel Analytics**: 기본 제공 성능 지표
- **Database**: MongoDB Atlas 모니터링
- **AI API**: Gemini API 사용량 추적

---

**개발자 노트**: 이 프로젝트는 교육용 목적으로 개발되었으며, 초등학교 토론 교육에 특화된 AI 피드백 시스템입니다. 코드 수정 시 교육적 가치와 학생 안전을 최우선으로 고려해주세요.