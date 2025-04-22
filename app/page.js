'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const [loginData, setLoginData] = useState({
    studentName: '',
    accessCode: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateLogin = () => {
    if (!loginData.studentName.trim()) {
      return '이름을 입력해주세요.';
    }
    
    if (!loginData.accessCode.trim()) {
      return '고유번호를 입력해주세요.';
    }
    
    return null; // 유효한 경우
  };

  const handleStudentLogin = (e) => {
    e.preventDefault();
    
    const validationError = validateLogin();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsLoading(true);
    
    // 학생 로그인 확인
    fetch('/api/student/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentName: loginData.studentName,
        accessCode: loginData.accessCode
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // 로그인 성공 시 로컬 스토리지에 학생 정보 저장
          localStorage.setItem('studentAuth', 'true');
          localStorage.setItem('studentName', loginData.studentName);
          localStorage.setItem('studentId', data.studentId);
          
          // 학생 피드백 페이지로 이동
          window.location.href = '/student/feedback';
        } else {
          setError(data.message || '로그인에 실패했습니다. 이름과 고유번호를 확인해주세요.');
        }
      })
      .catch(err => {
        setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
        console.error('로그인 오류:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>경기초등토론교육모형 AI 피드백 시스템</h1>
        <p className={styles.description}>
          초등학생 토론 의견에 대한 맞춤형 피드백을 AI를 통해 자동으로 생성합니다.
        </p>
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>학생 영역</h2>
            <p>토론 의견을 제출하거나 선생님의 피드백을 확인하세요.</p>
            
            <div className={styles.buttonContainer}>
              <Link href="/submit" className={styles.button}>
                토론 의견 제출하기
              </Link>
              <Link href="/examples" className={styles.secondaryButton}>
                좋은 예시 보기
              </Link>
            </div>
            
            <div className={styles.checkFeedback}>
              <h3>피드백 확인하기</h3>
              <p>이름과 고유번호를 입력하여 선생님의 피드백을 확인하세요.</p>
              
              <form onSubmit={handleStudentLogin} className={styles.codeForm}>
                <input
                  type="text"
                  name="studentName"
                  value={loginData.studentName}
                  onChange={handleChange}
                  placeholder="이름"
                  className={error ? `${styles.input} ${styles.inputError}` : styles.input}
                  disabled={isLoading}
                />
                <input
                  type="password"
                  name="accessCode"
                  value={loginData.accessCode}
                  onChange={handleChange}
                  placeholder="고유번호"
                  className={error ? `${styles.input} ${styles.inputError}` : styles.input}
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  className={styles.button}
                  disabled={isLoading}
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                </button>
              </form>
              
              {error && <p className={styles.error}>{error}</p>}
            </div>
          </div>
          
          <div className={styles.card}>
            <h2>교사 영역</h2>
            <p>학생 의견을 검토하고 AI 피드백을 생성하세요.</p>
            
            <div className={styles.buttonContainer}>
              <Link href="/teacher" className={styles.button}>
                교사용 페이지 접속
              </Link>
            </div>
            
            <div className={styles.info}>
              <h3>시스템 소개</h3>
              <p>
                이 시스템은 경기초등토론교육모형을 기반으로 학생들의 토론 의견에 대한 맞춤형 피드백을 생성합니다.
                학생들은 자신의 의견을 제출하고, 교사는 Google의 Gemini AI를 활용하여 자동으로 피드백을 생성할 수 있습니다.
              </p>
              <p>
                학생들은 교사가 발급한 이름과 고유번호로 로그인하여 자신의 피드백을 확인할 수 있으며, 교사가 특별히 선정한 우수 사례는 모든 학생들에게 공개됩니다.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>경기초등토론교육모형 AI 피드백 시스템 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
