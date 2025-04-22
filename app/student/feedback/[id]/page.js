'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import styles from './page.module.css';

export default function FeedbackDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id || '';
  
  const [opinion, setOpinion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // 인증 확인 및 의견 데이터 로드
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('studentAuth') === 'true';
    
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    
    if (!id) {
      setError('의견 ID가 제공되지 않았습니다.');
      setIsLoading(false);
      return;
    }
    
    fetchOpinion();
  }, [id, router, retryCount]);

  // 의견 조회
  const fetchOpinion = async () => {
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
      
      // 학생 인증 - 현재 로그인한 학생의 의견인지 확인
      const studentName = localStorage.getItem('studentName');
      if (data.data.studentName !== studentName) {
        throw new Error('이 피드백에 접근할 권한이 없습니다.');
      }
      
      setOpinion(data.data);
    } catch (err) {
      console.error('피드백 상세 조회 오류:', err);
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
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
            <Link href="/student/feedback" className={styles.secondaryButton}>
              피드백 목록으로 돌아가기
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
          <p>요청하신 의견이 존재하지 않습니다.</p>
          <Link href="/student/feedback" className={styles.button}>
            피드백 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>토론 피드백</h1>
          <Link href="/student/feedback" className={styles.backButton}>
            목록으로 돌아가기
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>토론 주제</h2>
          </div>
          <div className={styles.cardBody}>
            <p className={styles.topic}>{opinion.topic}</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>나의 의견</h2>
            <div className={styles.meta}>
              <span>제출일: {formatDate(opinion.submittedAt)}</span>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.content}>
              {opinion.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        {opinion.status === 'reviewed' ? (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>선생님 피드백</h2>
              <div className={styles.statusBadge}>
                <span>검토 완료</span>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.feedback}>
                {opinion.feedback ? (
                  opinion.feedback.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <p className={styles.noFeedback}>아직 구체적인 피드백이 작성되지 않았습니다.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.pendingCard}>
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