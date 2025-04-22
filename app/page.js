'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const [referenceCode, setReferenceCode] = useState('');
  const [error, setError] = useState('');

  const handleCheckFeedback = (e) => {
    e.preventDefault();
    if (!referenceCode) {
      setError('참조 코드를 입력해주세요.');
      return;
    }
    
    // 피드백 확인 페이지로 이동
    window.location.href = `/feedback/${referenceCode}`;
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
              <p>참조 코드를 입력하여 선생님의 피드백을 확인하세요.</p>
              
              <form onSubmit={handleCheckFeedback} className={styles.codeForm}>
                <input
                  type="text"
                  value={referenceCode}
                  onChange={(e) => {
                    setReferenceCode(e.target.value);
                    setError('');
                  }}
                  placeholder="참조 코드 입력 (예: ABC123)"
                  className={styles.input}
                />
                <button type="submit" className={styles.button}>확인</button>
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
                학생들은 참조 코드를 통해 자신의 피드백을 확인할 수 있으며, 교사가 특별히 선정한 우수 사례는 모든 학생들에게 공개됩니다.
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
