import { customAlphabet } from 'nanoid';

// 대문자와 숫자로 구성된 알파벳 정의
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * 4자리 참여 코드 생성 함수
 * 문자와 숫자를 조합하여 가독성 좋은 코드 생성
 * @returns {string} 생성된 4자리 참여 코드
 */
export function generateJoinCode() {
  // 4자리 랜덤 문자열 생성
  const nanoid = customAlphabet(ALPHABET, 4);
  return nanoid();
}

/**
 * 참여 코드 유효성 검사 함수
 * @param {string} code - 검사할 참여 코드
 * @returns {boolean} 유효성 검사 결과
 */
export function validateJoinCode(code) {
  if (!code || typeof code !== 'string') return false;
  if (code.length !== 4) return false;
  
  // 모든 문자가 알파벳에 포함되는지 확인
  return code.split('').every(char => ALPHABET.includes(char));
}

/**
 * 현재 사용 중인 코드인지 확인하는 함수
 * @param {string} code - 확인할 참여 코드
 * @param {object} ClassModel - 클래스 모델
 * @returns {Promise<boolean>} 사용 중인 코드인지 여부
 */
export async function isCodeInUse(code, ClassModel) {
  try {
    const existingClass = await ClassModel.findOne({ joinCode: code });
    return !!existingClass; // 클래스가 존재하면 true, 아니면 false
  } catch (error) {
    console.error('코드 확인 오류:', error);
    throw error;
  }
}

/**
 * 고유한 참여 코드 생성 함수
 * 이미 사용 중인 코드와 충돌하지 않는 코드를 생성
 * @param {object} ClassModel - 클래스 모델
 * @param {number} maxAttempts - 최대 시도 횟수 (기본값: 10)
 * @returns {Promise<string>} 고유한 참여 코드
 */
export async function generateUniqueJoinCode(ClassModel, maxAttempts = 10) {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const code = generateJoinCode();
    const inUse = await isCodeInUse(code, ClassModel);
    
    if (!inUse) {
      return code; // 사용 중이지 않은 코드를 찾았으면 반환
    }
    
    attempts++;
  }
  
  throw new Error('고유한 참여 코드를 생성할 수 없습니다. 나중에 다시 시도해주세요.');
} 