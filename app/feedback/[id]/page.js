'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './page.module.css';

export default function FeedbackPage() {
  const params = useParams();
  const id = params.id;
  
  const [opinion, setOpinion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchOpinion = async () => {
      if (!id) {
        setError('참조 코드가 제공되지 않았습니다.');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError('');
        
        const response = await fetch(`/api/opinions/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || data.error || '의견을 불러오는데 실패했습니다.');
        }
        
        if (!data.data) {
          throw new Error('데이터 형식이 올바르지 않습니다.');
        }
        
        setOpinion(data.data);
      } catch (err) {
        console.error('피드백 조회 오류:', err);
        setError(err.message || '오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOpinion();
  }, [id, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p>피드백을 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
          <div className={styles.buttonContainer}>
            <button 
              onClick={handleRetry} 
              className={styles.button}
            >
              다시 시도
            </button>
            <Link href="/submit" className={styles.secondaryButton}>
              의견 제출 페이지로 이동
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!opinion) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h2>의견을 찾을 수 없습니다</h2>
          <p>입력하신 참조 코드에 해당하는 의견이 없습니다.</p>
          <Link href="/submit" className={styles.button}>의견 제출 페이지로 이동</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>토론 피드백</h1>
        <p className={styles.description}>
          제출하신 의견에 대한 피드백입니다.
        </p>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>토론 주제</h2>
          </div>
          <div className={styles.cardBody}>
            <p>{opinion.topic}</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>나의 의견</h2>
            <div className={styles.meta}>
              <span>{opinion.studentName} ({opinion.studentClass})</span>
              <span>{new Date(opinion.submittedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className={styles.cardBody}>
            <p>{opinion.content}</p>
          </div>
        </div>

        {opinion.status === 'reviewed' ? (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>선생님 피드백</h2>
              <div className={styles.meta}>
                <span>검토 완료</span>
              </div>
            </div>
            <div className={styles.cardBody}>
              {opinion.feedback ? (
                opinion.feedback.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              ) : (
                <p className={styles.noFeedback}>아직 구체적인 피드백이 작성되지 않았습니다.</p>
              )}
              
              {opinion.teacherNote && (
                <div className={styles.teacherNote}>
                  <h3>선생님의 추가 노트</h3>
                  <p>{opinion.teacherNote}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.pendingFeedback}>
            <h2>피드백 준비 중</h2>
            <p>
              선생님이 아직 의견을 검토 중입니다. 조금만 기다려주세요!
            </p>
            <p className={styles.small}>
              나중에 다시 방문하여 피드백을 확인하세요.
            </p>
          </div>
        )}

        <div className={styles.buttonContainer}>
          <Link href="/submit" className={styles.button}>
            새로운 의견 작성하기
          </Link>
          <Link href="/examples" className={styles.secondaryButton}>
            다른 예시 보기
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>경기초등토론교육모형 AI 피드백 시스템 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
} 