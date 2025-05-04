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
  
  // 일괄 생성 관련 상태
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkResults, setBulkResults] = useState(null);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');
  const [bulkStudents, setBulkStudents] = useState([]);
  const [csvFile, setCsvFile] = useState(null);

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
      
      // 학생 목록 가져오기
      fetchStudents();
    } catch (error) {
      console.error('교사 정보 파싱 오류:', error);
      localStorage.removeItem('teacherInfo');
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

  // 학생 계정 활성화 처리
  const handleActivate = async (studentId) => {
    if (!window.confirm('이 학생 계정을 다시 활성화하시겠습니까?')) {
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
          isActive: true
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '학생 계정 활성화에 실패했습니다.');
      }
      
      // 목록 새로고침
      fetchStudents();
      
    } catch (err) {
      console.error('학생 계정 활성화 오류:', err);
      setError(err.message || '오류가 발생했습니다.');
    }
  };

  // 일괄 생성 모달 토글
  const toggleBulkModal = () => {
    setShowBulkModal(!showBulkModal);
    // 모달이 닫힐 때 상태 초기화
    if (showBulkModal) {
      setBulkText('');
      setBulkResults(null);
      setBulkError('');
      setBulkSuccess('');
      setBulkStudents([]);
      setCsvFile(null);
    }
  };

  // CSV 파일 처리
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setCsvFile(file);
    setBulkError('');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target.result;
        setBulkText(csvText);
        parseStudentData(csvText);
      } catch (err) {
        setBulkError('파일을 읽는 도중 오류가 발생했습니다.');
        console.error('CSV 파일 읽기 오류:', err);
      }
    };
    
    reader.onerror = () => {
      setBulkError('파일을 읽는 도중 오류가 발생했습니다.');
    };
    
    reader.readAsText(file);
  };

  // 학생 데이터 파싱
  const parseStudentData = (text) => {
    try {
      // 빈 줄 제거 및 줄 단위로 분리
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        setBulkError('파일에 유효한 데이터가 없습니다.');
        setBulkStudents([]);
        return;
      }
      
      const parsedStudents = [];
      
      // 각 줄 처리
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // 쉼표 또는 탭으로 구분된 데이터 처리
        const parts = line.includes(',') ? line.split(',') : line.split('\t');
        
        // 이름, 학급, 고유번호를 추출
        if (parts.length >= 3) {
          const name = parts[0].trim();
          const className = parts[1].trim();
          const accessCode = parts[2].trim();
          
          if (name && className && accessCode) {
            parsedStudents.push({ name, className, accessCode });
          }
        }
      }
      
      if (parsedStudents.length === 0) {
        setBulkError('유효한 학생 데이터를 찾을 수 없습니다. 데이터는 "이름,학급,고유번호" 형식이어야 합니다.');
        setBulkStudents([]);
      } else {
        setBulkStudents(parsedStudents);
        setBulkError('');
      }
    } catch (err) {
      setBulkError('데이터 파싱 중 오류가 발생했습니다.');
      console.error('데이터 파싱 오류:', err);
      setBulkStudents([]);
    }
  };

  // 수동으로 입력한 텍스트 변경 처리
  const handleBulkTextChange = (e) => {
    const text = e.target.value;
    setBulkText(text);
    if (text.trim()) {
      parseStudentData(text);
    } else {
      setBulkStudents([]);
    }
  };

  // 일괄 생성 처리
  const handleBulkCreate = async () => {
    if (bulkStudents.length === 0 || isBulkSubmitting) return;
    
    try {
      setIsBulkSubmitting(true);
      setBulkError('');
      setBulkSuccess('');
      setBulkResults(null);
      
      // 로컬 스토리지에서 교사 정보 가져오기
      const teacherInfoStr = localStorage.getItem('teacherInfo');
      let teacherId = 'teacher'; // 기본값
      
      if (teacherInfoStr) {
        try {
          const teacherInfo = JSON.parse(teacherInfoStr);
          teacherId = teacherInfo.id || 'teacher';
        } catch (e) {
          console.error('교사 정보 파싱 오류:', e);
        }
      }
      
      const response = await fetch('/api/students/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          students: bulkStudents,
          createdBy: teacherId
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '일괄 생성에 실패했습니다.');
      }
      
      setBulkResults(data.data);
      setBulkSuccess(data.message);
      
      // 성공 시 학생 목록 새로고침
      if (data.data.success.length > 0) {
        fetchStudents();
      }
      
    } catch (err) {
      console.error('일괄 생성 오류:', err);
      setBulkError(err.message || '오류가 발생했습니다.');
    } finally {
      setIsBulkSubmitting(false);
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
              <h2 className={styles.cardTitle}>학생 계정 생성</h2>
              <button 
                type="button"
                onClick={toggleBulkModal}
                className={styles.bulkButton}
              >
                일괄 생성
              </button>
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
                        {student.isActive ? (
                          <button
                            onClick={() => handleDeactivate(student._id)}
                            className={styles.deactivateButton}
                          >
                            비활성화
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(student._id)}
                            className={styles.activateButton}
                          >
                            활성화
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 일괄 생성 모달 */}
        {showBulkModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>학생 계정 일괄 생성</h2>
                <button 
                  type="button"
                  onClick={toggleBulkModal}
                  className={styles.closeButton}
                >
                  ×
                </button>
              </div>
              <div className={styles.modalBody}>
                {bulkSuccess && (
                  <div className={styles.successMessage}>
                    <p>{bulkSuccess}</p>
                  </div>
                )}
                
                {bulkError && (
                  <div className={styles.errorMessage}>
                    <p>{bulkError}</p>
                  </div>
                )}
                
                <div className={styles.uploadSection}>
                  <h3>CSV 파일 업로드</h3>
                  <p className={styles.uploadHelp}>
                    CSV 파일 형식: 이름,학급,고유번호 (한 줄에 한 학생)
                  </p>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCsvUpload}
                    className={styles.fileInput}
                  />
                  <div className={styles.divider}>또는</div>
                  <h3>직접 입력</h3>
                  <p className={styles.uploadHelp}>
                    형식: 이름,학급,고유번호 (한 줄에 한 학생)
                  </p>
                  <textarea
                    value={bulkText}
                    onChange={handleBulkTextChange}
                    className={styles.bulkTextarea}
                    placeholder="예시:
홍길동,5학년 2반,1234
김철수,5학년 2반,5678
이영희,6학년 1반,9012"
                    rows={10}
                  ></textarea>
                </div>
                
                {bulkStudents.length > 0 && (
                  <div className={styles.previewSection}>
                    <h3>미리보기 ({bulkStudents.length}명)</h3>
                    <div className={styles.previewTable}>
                      <table>
                        <thead>
                          <tr>
                            <th>이름</th>
                            <th>학급</th>
                            <th>고유번호</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkStudents.map((student, index) => (
                            <tr key={index}>
                              <td>{student.name}</td>
                              <td>{student.className}</td>
                              <td>{student.accessCode}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {bulkResults && (
                  <div className={styles.resultsSection}>
                    <h3>생성 결과</h3>
                    <div className={styles.resultsSummary}>
                      <p>
                        성공: <span className={styles.successCount}>{bulkResults.success.length}</span> 명 | 
                        실패: <span className={styles.failedCount}>{bulkResults.failed.length}</span> 명
                      </p>
                    </div>
                    
                    {bulkResults.failed.length > 0 && (
                      <div className={styles.failedList}>
                        <h4>실패한 항목</h4>
                        <div className={styles.previewTable}>
                          <table>
                            <thead>
                              <tr>
                                <th>이름</th>
                                <th>학급</th>
                                <th>고유번호</th>
                                <th>실패 사유</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bulkResults.failed.map((item, index) => (
                                <tr key={index}>
                                  <td>{item.name}</td>
                                  <td>{item.className}</td>
                                  <td>{item.accessCode}</td>
                                  <td>{item.reason}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={toggleBulkModal}
                  className={styles.cancelButton}
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={handleBulkCreate}
                  disabled={bulkStudents.length === 0 || isBulkSubmitting}
                  className={styles.confirmButton}
                >
                  {isBulkSubmitting ? '생성 중...' : `${bulkStudents.length}명 일괄 생성`}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>경기초등토론교육모형 AI 피드백 시스템 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
} 