'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function StudentManagement() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    className: '',
    accessCode: ''
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 인증 확인
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('teacherAuth') === 'true';
    if (!isAuthenticated) {
      router.push('/teacher/login');
    }
  }, [router]);

  // 학생 목록 가져오기
  useEffect(() => {
    fetchStudents();
  }, []);

  // 폼 유효성 검사
  useEffect(() => {
    const { name, className, accessCode } = formData;
    setIsFormValid(
      name.trim() !== '' && 
      className.trim() !== '' && 
      accessCode.trim().length >= 4
    );
  }, [formData]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/students');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '학생 목록을 불러오는데 실패했습니다.');
      }
      
      setStudents(data.data || []);
    } catch (err) {
      console.error('학생 목록 조회 오류:', err);
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 성공 메시지 초기화
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createdBy: 'teacher' // 추후 로그인한 교사 정보로 대체
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '학생 계정 생성에 실패했습니다.');
      }
      
      // 성공 시 폼 초기화
      setFormData({
        name: '',
        className: '',
        accessCode: ''
      });
      
      setSuccessMessage('학생 계정이 성공적으로 생성되었습니다!');
      
      // 목록 새로고침
      fetchStudents();
      
    } catch (err) {
      console.error('학생 계정 생성 오류:', err);
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (studentId) => {
    if (!window.confirm('정말 이 학생 계정을 비활성화하시겠습니까?')) {
      return;
    }
    
    try {
      setError('');
      
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: false
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '학생 계정 비활성화에 실패했습니다.');
      }
      
      // 목록 새로고침
      fetchStudents();
      
    } catch (err) {
      console.error('학생 계정 비활성화 오류:', err);
      setError(err.message || '오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>학생 계정 관리</h1>
            <p className={styles.description}>학생 계정을 생성하고 관리합니다.</p>
          </div>
          <Link href="/teacher/dashboard" className={styles.backButton}>
            대시보드로 돌아가기
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>
          {/* 학생 계정 생성 폼 */}
          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>새 학생 계정 생성</h2>
            </div>
            <div className={styles.cardBody}>
              {successMessage && (
                <div className={styles.successMessage}>
                  <p>{successMessage}</p>
                </div>
              )}
              
              {error && (
                <div className={styles.errorMessage}>
                  <p>{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>학생 이름</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="학생 이름"
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="className" className={styles.label}>학급</label>
                  <input
                    type="text"
                    id="className"
                    name="className"
                    value={formData.className}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="예: 5학년 2반"
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="accessCode" className={styles.label}>고유번호 (최소 4자)</label>
                  <input
                    type="text"
                    id="accessCode"
                    name="accessCode"
                    value={formData.accessCode}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="학생이 로그인할 고유번호"
                    required
                    minLength={4}
                  />
                  <p className={styles.hint}>학생이 로그인할 때 사용할 고유번호입니다. 숫자나 문자 조합으로 설정하세요.</p>
                </div>
                
                <button 
                  type="submit" 
                  className={styles.button}
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? '생성 중...' : '계정 생성하기'}
                </button>
              </form>
            </div>
          </div>
          
          {/* 학생 계정 목록 */}
          <div className={styles.listCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>학생 계정 목록</h2>
            </div>
            <div className={styles.cardBody}>
              {isLoading ? (
                <div className={styles.loading}>
                  <p>학생 목록을 불러오는 중입니다...</p>
                </div>
              ) : students.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>등록된 학생이 없습니다. 새 학생 계정을 생성해보세요.</p>
                </div>
              ) : (
                <div className={styles.table}>
                  <div className={styles.tableHeader}>
                    <div className={styles.tableCell}>학생 정보</div>
                    <div className={styles.tableCell}>고유번호</div>
                    <div className={styles.tableCell}>생성일</div>
                    <div className={styles.tableCell}>상태</div>
                    <div className={styles.tableCell}>관리</div>
                  </div>
                  
                  {students.map((student) => (
                    <div key={student._id} className={styles.tableRow}>
                      <div className={styles.tableCell}>
                        <div className={styles.studentInfo}>
                          <div className={styles.studentName}>{student.name}</div>
                          <div className={styles.studentClass}>{student.className}</div>
                        </div>
                      </div>
                      <div className={styles.tableCell}>
                        <code className={styles.accessCode}>{student.accessCode}</code>
                      </div>
                      <div className={styles.tableCell}>
                        {new Date(student.createdAt).toLocaleDateString()}
                      </div>
                      <div className={styles.tableCell}>
                        <span className={student.isActive ? styles.activeBadge : styles.inactiveBadge}>
                          {student.isActive ? '활성' : '비활성'}
                        </span>
                      </div>
                      <div className={styles.tableCell}>
                        <button
                          onClick={() => handleDeactivate(student._id)}
                          className={styles.deactivateButton}
                          disabled={!student.isActive}
                        >
                          비활성화
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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