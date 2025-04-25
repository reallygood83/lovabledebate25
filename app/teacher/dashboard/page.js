'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function TeacherDashboard() {
  const router = useRouter();
  const [opinions, setOpinions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
  });

  // 인증 확인
  useEffect(() => {
    const teacherInfo = localStorage.getItem('teacherInfo');
    
    // 개발용 디버깅 로그
    console.log('교사 정보 확인:', teacherInfo);
    
    if (!teacherInfo) {
      console.log('로그인 정보가 없어 로그인 페이지로 이동합니다.');
      router.push('/teacher/login');
      return;
    }
    
    try {
      // 유효한 JSON인지 확인
      const teacherData = JSON.parse(teacherInfo);
      if (!teacherData || !teacherData.id) {
        console.log('유효하지 않은 교사 정보:', teacherData);
        localStorage.removeItem('teacherInfo');
        router.push('/teacher/login');
      }
    } catch (error) {
      console.error('교사 정보 파싱 오류:', error);
      localStorage.removeItem('teacherInfo');
      router.push('/teacher/login');
    }
  }, [router]);

  // 의견 목록 가져오기
  useEffect(() => {
    const fetchOpinions = async () => {
      try {
        setIsLoading(true);
        
        // 로컬 스토리지에서 교사 정보 가져오기
        const teacherInfoStr = localStorage.getItem('teacherInfo');
        let teacherId = '';
        
        if (teacherInfoStr) {
          try {
            const teacherInfo = JSON.parse(teacherInfoStr);
            teacherId = teacherInfo.id || '';
          } catch (e) {
            console.error('교사 정보 파싱 오류:', e);
          }
        }
        
        // 교사 ID를 쿼리 파라미터로 추가하여 해당 교사의 의견만 가져옴
        const response = await fetch(`/api/opinions/all?teacherId=${teacherId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || '의견을 불러오는데 실패했습니다.');
        }

        setOpinions(data.data || []);
        
        // 통계 계산
        const total = data.data?.length || 0;
        const pending = data.data?.filter(item => item.status === 'pending').length || 0;
        const reviewed = data.data?.filter(item => item.status === 'reviewed').length || 0;
        
        setStats({
          total,
          pending,
          reviewed
        });
      } catch (err) {
        setError(err.message || '오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpinions();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('teacherInfo');
    router.push('/teacher/login');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>교사 대시보드</h1>
          <button onClick={handleLogout} className={styles.logoutButton}>
            로그아웃
          </button>
        </div>
        <p className={styles.description}>
          학생들의 토론 의견을 검토하고 피드백을 제공하세요.
        </p>
      </header>

      <main className={styles.main}>
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <h3>전체 의견</h3>
            <p className={styles.statNumber}>{stats.total}</p>
          </div>
          <div className={styles.statCard}>
            <h3>검토 대기</h3>
            <p className={styles.statNumber}>{stats.pending}</p>
          </div>
          <div className={styles.statCard}>
            <h3>검토 완료</h3>
            <p className={styles.statNumber}>{stats.reviewed}</p>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/teacher/opinions/pending" className={styles.button}>
            검토 대기중인 의견 보기
          </Link>
          <Link href="/teacher/opinions/all" className={styles.secondaryButton}>
            모든 의견 보기
          </Link>
          <Link href="/teacher/students" className={styles.button}>
            학생 계정 관리
          </Link>
          <div className={`${styles.button} ${styles.disabled}`}>
            토론 주제 관리 (준비중)
          </div>
        </div>

        <div className={styles.recentOpinions}>
          <h2 className={styles.sectionTitle}>최근 제출된 의견</h2>
          
          {isLoading ? (
            <div className={styles.loading}>
              <p>의견을 불러오는 중입니다...</p>
            </div>
          ) : error ? (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          ) : opinions.length === 0 ? (
            <div className={styles.emptyState}>
              <p>제출된 의견이 없습니다.</p>
            </div>
          ) : (
            <div className={styles.opinionsList}>
              {opinions.slice(0, 5).map((opinion) => (
                <div key={opinion._id} className={styles.opinionCard}>
                  <div className={styles.opinionHeader}>
                    <h3>{opinion.topic}</h3>
                    <span className={styles.badge}>
                      {opinion.status === 'pending' ? '검토 대기' : '검토 완료'}
                    </span>
                  </div>
                  <div className={styles.opinionMeta}>
                    <span>{opinion.studentName} ({opinion.studentClass})</span>
                    <span>{new Date(opinion.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <p className={styles.opinionPreview}>
                    {opinion.content.length > 100
                      ? `${opinion.content.substring(0, 100)}...`
                      : opinion.content}
                  </p>
                  <Link 
                    href={`/teacher/opinions/review/${opinion._id}`}
                    className={styles.reviewButton}
                  >
                    {opinion.status === 'pending' ? '검토하기' : '상세보기'}
                  </Link>
                </div>
              ))}
            </div>
          )}
          
          {opinions.length > 5 && (
            <div className={styles.viewMore}>
              <Link href="/teacher/opinions/all" className={styles.viewMoreButton}>
                더 보기
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>경기초등토론교육모형 AI 피드백 시스템 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
} 