'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function TeacherLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // 임시 인증 - 실제로는 API 호출 필요
    // 임시 계정: teacher / password123
    if (formData.username === 'teacher' && formData.password === 'password123') {
      // 세션 정보 저장 (실제로는 서버 측 인증 필요)
      localStorage.setItem('teacherAuth', 'true');
      router.push('/teacher/dashboard');
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
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
              <label htmlFor="username" className={styles.label}>아이디</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={styles.input}
                placeholder="교사 아이디"
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
              <Link href="/" className={styles.secondaryButton}>
                홈으로 돌아가기
              </Link>
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