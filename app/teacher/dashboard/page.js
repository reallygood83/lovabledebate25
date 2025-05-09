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
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
  });
  const [copiedCode, setCopiedCode] = useState('');

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
        return;
      }
      
      // 만료 시간 확인
      const expiresAt = teacherData.expiresAt;
      if (expiresAt && Date.now() > expiresAt) {
        console.log('로그인 세션이 만료되었습니다:', new Date(expiresAt));
        localStorage.removeItem('teacherInfo');
        router.push('/teacher/login');
        return;
      }
      
      // 세션 갱신 (만료 시간 추가 7일 연장)
      if (expiresAt) {
        const newExpiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
        const updatedTeacherData = {
          ...teacherData,
          expiresAt: newExpiresAt
        };
        localStorage.setItem('teacherInfo', JSON.stringify(updatedTeacherData));
        console.log('로그인 세션 갱신됨:', new Date(newExpiresAt));
      }
    } catch (error) {
      console.error('교사 정보 파싱 오류:', error);
      localStorage.removeItem('teacherInfo');
      router.push('/teacher/login');
    }
  }, [router]);

  // 학급 코드 복사 함수
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedCode(code);
        // 3초 후 복사 상태 초기화
        setTimeout(() => {
          setCopiedCode('');
        }, 3000);
      })
      .catch(err => {
        console.error('복사 실패:', err);
        alert('코드 복사에 실패했습니다. 직접 선택하여 복사해주세요.');
      });
  };

  // 교사의 학급 정보 가져오기
  useEffect(() => {
    const fetchClasses = async () => {
      try {
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
        
        if (!teacherId) return;
        
        // 교사 ID로 학급 정보 조회
        const response = await fetch(`/api/class/teacher?teacherId=${teacherId}`);
        const data = await response.json();
        
        if (response.ok) {
          setClasses(data.data || []);
        }
      } catch (err) {
        console.error('학급 정보 조회 오류:', err);
      }
    };
    
    fetchClasses();
  }, []);

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
        
        // 최근 의견 목록만 가져오기 (limit=5)
        const response = await fetch(`/api/opinions/all?teacherId=${teacherId}&limit=5`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || '의견을 불러오는데 실패했습니다.');
        }

        setOpinions(data.data || []);
        
        // 의견 통계 가져오기
        await fetchStats(teacherId);
      } catch (err) {
        setError(err.message || '오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    // 의견 통계 가져오기 함수
    const fetchStats = async (teacherId) => {
      try {
        // 전체 의견 수 가져오기
        const totalResponse = await fetch(`/api/opinions/all?teacherId=${teacherId}&limit=1`);
        const totalData = await totalResponse.json();
        
        // 검토 대기 중인 의견 수 가져오기
        const pendingResponse = await fetch(`/api/opinions/all?teacherId=${teacherId}&status=pending&limit=1`);
        const pendingData = await pendingResponse.json();
        
        // 검토 완료된 의견 수 가져오기
        const reviewedResponse = await fetch(`/api/opinions/all?teacherId=${teacherId}&status=reviewed&limit=1`);
        const reviewedData = await reviewedResponse.json();
        
        // 각 API 응답에서 pagination.total 값을 사용하여 총 개수 가져오기
        setStats({
          total: totalData.pagination?.total || 0,
          pending: pendingData.pagination?.total || 0,
          reviewed: reviewedData.pagination?.total || 0
        });
      } catch (err) {
        console.error('의견 통계 가져오기 오류:', err);
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

        {classes.length > 0 ? (
          <div className={styles.classesContainer}>
            <div className={styles.classesTitleRow}>
              <h2 className={styles.sectionTitle}>내 학급 정보</h2>
              <Link href="/teacher/class/create" className={styles.createClassButton}>
                + 새 학급 생성
              </Link>
            </div>
            <div className={styles.classesList}>
              {classes.map((classItem) => (
                <div key={classItem._id} className={styles.classCard}>
                  <h3 className={styles.className}>{classItem.name}</h3>
                  <div className={styles.classDetails}>
                    <div className={styles.classCodeContainer}>
                      <span className={styles.codeLabel}>학급 코드:</span>
                      <div className={styles.codeWrapper}>
                        <span className={styles.classCode}>{classItem.joinCode}</span>
                        <button
                          onClick={() => handleCopyCode(classItem.joinCode)}
                          className={styles.copyButton}
                          title="코드 복사"
                        >
                          {copiedCode === classItem.joinCode ? '복사됨!' : '복사'}
                        </button>
                      </div>
                    </div>
                    {classItem.description && (
                      <p className={styles.classDescription}>{classItem.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.classesContainer}>
            <div className={styles.classesTitleRow}>
              <h2 className={styles.sectionTitle}>내 학급 정보</h2>
            </div>
            <div className={styles.noClassesMessage}>
              <p>아직 생성된 학급이 없습니다. 학급을 생성하고 학생들에게 코드를 공유하세요.</p>
              <Link href="/teacher/class/create" className={styles.createClassButton}>
                첫 학급 생성하기
              </Link>
            </div>
          </div>
        )}

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
        <div className={styles.footerContainer}>
          <div className={styles.footerContent}>
            <div className={styles.footerLogo}>
              <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>❤️</span>
              <span>LovableDebate</span>
            </div>
            <p>AI 기반 토론 교육 피드백 시스템 &copy; 2025 안양 박달초 김문정</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 