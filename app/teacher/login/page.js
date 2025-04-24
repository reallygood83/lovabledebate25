'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

// SearchParams를 사용하는 컴포넌트를 분리합니다
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // URL 파라미터에서 에러 메시지 확인
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      let errorMessage = '로그인 처리 중 오류가 발생했습니다.';
      
      switch(errorParam) {
        case 'invalid_state':
          errorMessage = '보안 검증에 실패했습니다. 다시 시도해주세요.';
          break;
        case 'token_error':
          errorMessage = '인증 토큰을 가져오는데 실패했습니다.';
          break;
        case 'profile_error':
          errorMessage = '프로필 정보를 가져오는데 실패했습니다.';
          break;
        default:
          errorMessage = `오류: ${errorParam}`;
      }
      
      setError(errorMessage);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/teacher/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '로그인에 실패했습니다.');
      }
      
      // 로그인 성공 시 교사 정보 세션 스토리지에 저장
      if (data.success) {
        sessionStorage.setItem('teacherInfo', JSON.stringify(data.teacher));
        router.push('/teacher/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNaverLogin = () => {
    router.push('/api/auth/naver');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>교사 로그인</h1>
        <p className={styles.description}>
          교사 계정으로 로그인하여 학생들의 토론 의견에 피드백을 제공하세요.
        </p>
      </header>

      <main className={styles.main}>
        <div className={styles.loginCard}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>이메일</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                placeholder="이메일 주소"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>비밀번호</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
                placeholder="비밀번호"
                required
              />
            </div>

            {error && (
              <div className={styles.error}>
                <p>{error}</p>
              </div>
            )}

            <div className={styles.buttonContainer}>
              <button 
                type="submit" 
                className={styles.button}
                disabled={isLoading}
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
              
              <button 
                type="button" 
                onClick={handleNaverLogin}
                className={styles.naverButton}
              >
                네이버 아이디로 로그인
              </button>
              
              <div className={styles.linkContainer}>
                <Link href="/teacher/register" className={styles.link}>
                  계정이 없으신가요? 회원가입
                </Link>
                <Link href="/" className={styles.link}>
                  홈으로 돌아가기
                </Link>
              </div>
            </div>
          </form>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>경기초등토론교육모형 AI 피드백 시스템 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

// 메인 페이지 컴포넌트에서는 Suspense로 감싸서 내보냅니다
export default function TeacherLogin() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <LoginContent />
    </Suspense>
  );
} 