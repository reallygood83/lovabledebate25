'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function ExamplesPage() {
  const [examples, setExamples] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExamples = async () => {
      try {
        const response = await fetch('/api/opinions/public');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || '예시를 불러오는데 실패했습니다.');
        }
        
        setExamples(data.data);
      } catch (err) {
        setError(err.message || '오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExamples();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>우수 토론 예시</h1>
        <p className={styles.description}>
          선생님이 선정한 우수 토론 의견과 피드백입니다. 이 예시들을 참고하여 더 좋은 토론 의견을 작성해보세요.
        </p>
      </header>

      <main className={styles.main}>
        {isLoading ? (
          <div className={styles.loading}>
            <p>예시를 불러오는 중입니다...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <h2>오류가 발생했습니다</h2>
            <p>{error}</p>
          </div>
        ) : examples.length === 0 ? (
          <div className={styles.empty}>
            <h2>아직 공개된 예시가 없습니다</h2>
            <p>선생님이 우수 사례를 선정하면 이 곳에 표시됩니다.</p>
            <Link href="/submit" className={styles.button}>의견 제출하러 가기</Link>
          </div>
        ) : (
          <div className={styles.examples}>
            {examples.map((example) => (
              <div key={example._id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>{example.topic}</h2>
                  <div className={styles.meta}>
                    <span>{example.studentName} ({example.studentClass})</span>
                    <span>{new Date(example.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className={styles.cardBody}>
                  <div className={styles.section}>
                    <h3>학생 의견</h3>
                    <p>{example.content}</p>
                  </div>
                  
                  <div className={styles.divider}></div>
                  
                  <div className={styles.section}>
                    <h3>선생님 피드백</h3>
                    {example.feedback.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                    
                    {example.teacherNote && (
                      <div className={styles.teacherNote}>
                        <h4>선생님의 추가 노트</h4>
                        <p>{example.teacherNote}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className={styles.buttonContainer}>
          <Link href="/" className={styles.button}>
            홈으로 돌아가기
          </Link>
          <Link href="/submit" className={styles.secondaryButton}>
            의견 제출하기
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>경기초등토론교육모형 AI 피드백 시스템 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
} 