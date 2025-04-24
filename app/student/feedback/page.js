'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function StudentFeedback() {
  const router = useRouter();
  const [opinions, setOpinions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    id: '',
    className: ''
  });

  // 인증 확인 및 학생 정보 로드
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('studentAuth') === 'true';
    
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    
    // 로컬 스토리지에서 학생 정보 가져오기
    const name = localStorage.getItem('studentName');
    const id = localStorage.getItem('studentId');
    
    if (!name || !id) {
      router.push('/');
      return;
    }
    
    setStudentInfo({
      name,
      id,
      className: localStorage.getItem('className') || ''
    });
    
    // 학생의 의견 목록 가져오기
    fetchStudentOpinions(name);
  }, [router]);

  // 학생 의견 조회
  const fetchStudentOpinions = async (studentName) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/opinions/student?name=${encodeURIComponent(studentName)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '의견을 불러오는데 실패했습니다.');
      }
      
      // 최신순으로 정렬
      const sortedOpinions = data.data.sort((a, b) => 
        new Date(b.submittedAt) - new Date(a.submittedAt)
      );
      
      setOpinions(sortedOpinions);
    } catch (err) {
      console.error('의견 조회 오류:', err);
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studentAuth');
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentId');
    localStorage.removeItem('className');
    router.push('/');
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>내 피드백 목록</h1>
          <div className={styles.studentInfo}>
            <p>{studentInfo.name}님의 토론 의견 피드백</p>
            <button onClick={handleLogout} className={styles.logoutButton}>
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {isLoading ? (
          <div className={styles.loading}>
            <p>의견을 불러오는 중입니다...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={() => fetchStudentOpinions(studentInfo.name)} className={styles.button}>
              다시 시도
            </button>
          </div>
        ) : opinions.length === 0 ? (
          <div className={styles.emptyState}>
            <p>제출한 의견이 없습니다.</p>
            <Link href="/submit" className={styles.button}>
              의견 제출하기
            </Link>
          </div>
        ) : (
          <div className={styles.opinionsList}>
            {opinions.map((opinion) => (
              <div key={opinion._id} className={styles.opinionCard}>
                <div className={styles.opinionHeader}>
                  <h2>{opinion.topic}</h2>
                  <span className={opinion.status === 'reviewed' ? styles.reviewedBadge : styles.pendingBadge}>
                    {opinion.status === 'reviewed' ? '검토 완료' : '검토 중'}
                  </span>
                </div>
                <div className={styles.opinionMeta}>
                  <span>제출일: {formatDate(opinion.submittedAt)}</span>
                </div>
                <div className={styles.opinionPreview}>
                  <p>{opinion.content.substring(0, 100)}...</p>
                </div>
                
                {opinion.status === 'reviewed' ? (
                  <div className={styles.feedbackPreview}>
                    <h3>선생님 피드백</h3>
                    <p>{opinion.feedback ? opinion.feedback.substring(0, 150) + '...' : '피드백이 없습니다.'}</p>
                    <Link href={`/student/feedback/${opinion._id}`} className={styles.viewButton}>
                      자세히 보기
                    </Link>
                  </div>
                ) : (
                  <div className={styles.pendingMessage}>
                    <p>선생님이 검토 중입니다. 조금만 기다려주세요!</p>
                  </div>
                )}
              </div>
            ))}
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