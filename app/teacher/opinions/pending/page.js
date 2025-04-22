'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function PendingOpinions() {
  const router = useRouter();
  const [opinions, setOpinions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // 로그인 확인 (로컬 스토리지에서 교사 토큰 확인)
    const token = localStorage.getItem("teacherToken");
    if (!token) {
      router.push("/teacher/login");
      return;
    }

    fetchOpinions();
  }, [currentPage]);

  const fetchOpinions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/opinions/all?page=${currentPage}&limit=10&status=pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("teacherToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("의견 데이터를 불러오는데 실패했습니다");
      }

      const data = await response.json();
      setOpinions(data.opinions);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // 여기에 검색 로직 추가 예정
    console.log("Searching for:", searchTerm);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("ko-KR", options);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>검토 대기 중인 의견</h1>
            <p className={styles.description}>학생들이 제출한 검토 대기 중인 의견 목록입니다.</p>
          </div>
          <Link href="/teacher/dashboard" className={styles.backButton}>
            대시보드로 돌아가기
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.filters}>
          <form onSubmit={handleSearch} className={styles.search}>
            <input
              type="text"
              placeholder="학생 이름 또는 의견 내용으로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </form>
          <div className={styles.filterButtons}>
            <button className={`${styles.filterButton} ${styles.active}`}>
              전체
            </button>
            <button className={styles.filterButton}>오늘 제출된 의견</button>
            <button className={styles.filterButton}>이번 주 제출된 의견</button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <p>로딩 중...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        ) : opinions.length === 0 ? (
          <div className={styles.emptyState}>
            <p>검토 대기 중인 의견이 없습니다.</p>
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div className={styles.tableCell}>학생 정보</div>
              <div className={styles.tableCell}>토론 주제</div>
              <div className={styles.tableCell}>제출일</div>
              <div className={styles.tableCell}>검토</div>
            </div>
            {opinions.map((opinion) => (
              <div key={opinion.id} className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <div>
                    <div className={styles.studentName}>{opinion.student.name}</div>
                    <div className={styles.studentClass}>
                      {opinion.student.grade}학년 {opinion.student.class}반
                    </div>
                  </div>
                </div>
                <div className={styles.tableCell}>
                  <div className={styles.opinionTopic}>{opinion.discussion.title}</div>
                </div>
                <div className={styles.tableCell}>
                  <div className={styles.date}>{formatDate(opinion.createdAt)}</div>
                </div>
                <div className={styles.tableCell}>
                  <Link
                    href={`/teacher/opinions/review/${opinion.id}`}
                    className={styles.reviewButton}
                  >
                    검토하기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && opinions.length > 0 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${styles.pageButton} ${
                  currentPage === page ? styles.activePage : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className={styles.pageButton}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              다음
            </button>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>© 2023 학교 토론 피드백 시스템</p>
      </footer>
    </div>
  );
} 