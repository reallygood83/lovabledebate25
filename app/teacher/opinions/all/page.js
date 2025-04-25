'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function AllOpinions() {
  const router = useRouter();
  const [opinions, setOpinions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState('');
  
  // 인증 확인
  useEffect(() => {
    const teacherInfo = localStorage.getItem('teacherInfo');
    
    if (!teacherInfo) {
      console.log('교사 정보가 없어 로그인 페이지로 이동합니다.');
      router.push('/teacher/login');
      return;
    }
    
    try {
      // 교사 정보가 유효한 JSON인지 확인
      const teacherData = JSON.parse(teacherInfo);
      if (!teacherData || !teacherData.id) {
        console.log('유효하지 않은 교사 정보:', teacherData);
        localStorage.removeItem('teacherInfo');
        router.push('/teacher/login');
        return;
      }
      
      // 의견 목록 가져오기
      fetchOpinions();
    } catch (error) {
      console.error('교사 정보 파싱 오류:', error);
      localStorage.removeItem('teacherInfo');
      router.push('/teacher/login');
    }
  }, [router]);

  // 의견 목록 가져오기 함수
  const fetchOpinions = async () => {
    try {
      setIsLoading(true);
      // 모든 의견 가져오기 API 엔드포인트 필요
      const response = await fetch(`/api/opinions/all?page=${currentPage}&limit=10`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '의견을 불러오는데 실패했습니다.');
      }

      setOpinions(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 변경 시 의견 다시 가져오기
  useEffect(() => {
    if (localStorage.getItem('teacherInfo')) {
      fetchOpinions();
    }
  }, [currentPage]);

  // 의견 삭제 처리 함수
  const handleDeleteOpinion = async (id, studentName) => {
    if (!window.confirm(`${studentName} 학생의 의견을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/opinions/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '의견 삭제에 실패했습니다.');
      }
      
      // 성공 메시지 설정
      setDeleteSuccess('의견이 성공적으로 삭제되었습니다.');
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setDeleteSuccess('');
      }, 3000);
      
      // 의견 목록 새로고침
      fetchOpinions();
      
    } catch (err) {
      console.error('의견 삭제 오류:', err);
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>모든 의견</h1>
          <div className={styles.headerActions}>
            <Link href="/teacher/dashboard" className={styles.backButton}>
              대시보드로 돌아가기
            </Link>
          </div>
        </div>
        <p className={styles.description}>
          제출된 모든 토론 의견 목록입니다.
        </p>
      </header>

      <main className={styles.main}>
        <div className={styles.filters}>
          <div className={styles.search}>
            <input 
              type="text" 
              placeholder="학생 이름 또는 토론 주제 검색..." 
              className={styles.searchInput}
              // 검색 기능 구현 가능
            />
          </div>
          <div className={styles.filterButtons}>
            <Link href="/teacher/opinions/all" className={`${styles.filterButton} ${styles.active}`}>
              모든 의견
            </Link>
            <Link href="/teacher/opinions/pending" className={styles.filterButton}>
              검토 대기중
            </Link>
            <Link href="/teacher/opinions/completed" className={styles.filterButton}>
              검토 완료
            </Link>
          </div>
        </div>

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
          <>
            {deleteSuccess && (
              <div className={styles.successMessage}>
                <p>{deleteSuccess}</p>
              </div>
            )}
            
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <div className={styles.tableCell}>학생 정보</div>
                <div className={styles.tableCell}>토론 주제</div>
                <div className={styles.tableCell}>제출일</div>
                <div className={styles.tableCell}>상태</div>
                <div className={styles.tableCell}>작업</div>
              </div>
              
              {opinions.map((opinion) => (
                <div key={opinion._id} className={styles.tableRow}>
                  <div className={styles.tableCell}>
                    <div>
                      <div className={styles.studentName}>{opinion.studentName}</div>
                      <div className={styles.studentClass}>{opinion.studentClass}</div>
                    </div>
                  </div>
                  <div className={styles.tableCell}>
                    <div className={styles.opinionTopic}>{opinion.topic}</div>
                  </div>
                  <div className={styles.tableCell}>
                    <div className={styles.date}>
                      {new Date(opinion.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={styles.tableCell}>
                    <span className={`${styles.statusBadge} ${opinion.status === 'pending' ? styles.pending : styles.reviewed}`}>
                      {opinion.status === 'pending' ? '검토 대기' : '검토 완료'}
                    </span>
                  </div>
                  <div className={styles.tableCell}>
                    <div className={styles.actionButtons}>
                      <Link 
                        href={`/teacher/opinions/review/${opinion._id}`}
                        className={styles.reviewButton}
                      >
                        {opinion.status === 'pending' ? '검토하기' : '상세보기'}
                      </Link>
                      <button 
                        onClick={() => handleDeleteOpinion(opinion._id, opinion.studentName)}
                        className={styles.deleteButton}
                        disabled={isDeleting}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button 
                  className={styles.pageButton}
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  이전
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={`${styles.pageButton} ${currentPage === index + 1 ? styles.activePage : ''}`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button 
                  className={styles.pageButton}
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className={styles.footer}>
        <p>경기초등토론교육모형 AI 피드백 시스템 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
} 