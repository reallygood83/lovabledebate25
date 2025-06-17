'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(null);
  const [loginData, setLoginData] = useState({
    studentName: '',
    accessCode: ''
  });
  const [teacherData, setTeacherData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleTeacherChange = (e) => {
    const { name, value } = e.target;
    setTeacherData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateLogin = () => {
    if (!loginData.studentName.trim()) {
      return '이름을 입력해주세요.';
    }
    
    if (!loginData.accessCode.trim()) {
      return '고유번호를 입력해주세요.';
    }
    
    return null; // 유효한 경우
  };

  const handleStudentLogin = (e) => {
    e.preventDefault();
    
    const validationError = validateLogin();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsLoading(true);
    
    // 학생 로그인 확인
    fetch('/api/student/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentName: loginData.studentName,
        accessCode: loginData.accessCode
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // 클라이언트 사이드에서만 localStorage 접근
          if (typeof window !== 'undefined') {
            localStorage.setItem('studentAuth', 'true');
            localStorage.setItem('studentName', loginData.studentName);
            localStorage.setItem('studentId', data.studentId);
          }
          
          // 학생 피드백 페이지로 이동
          window.location.href = '/student/feedback';
        } else {
          setError(data.message || '로그인에 실패했습니다. 이름과 고유번호를 확인해주세요.');
        }
      })
      .catch(err => {
        setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
        console.error('로그인 오류:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleTeacherLogin = (e) => {
    e.preventDefault();
    setError('');
    
    if (!teacherData.username.trim() || !teacherData.password.trim()) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }
    
    setIsLoading(true);

    // 임시 인증 - 실제로는 API 호출 필요
    // 임시 계정: teacher / password123
    if (teacherData.username === 'teacher' && teacherData.password === 'password123') {
      // 클라이언트 사이드에서만 localStorage 접근
      if (typeof window !== 'undefined') {
        localStorage.setItem('teacherAuth', 'true');
      }
      router.push('/teacher/dashboard');
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      setIsLoading(false);
    }
  };

  // 교사로 접속하기 핸들러 함수
  const handleTeacherAccess = () => {
    // 클라이언트 사이드에서만 localStorage 접근 (hydration 에러 방지)
    if (typeof window !== 'undefined') {
      try {
        const teacherInfo = localStorage.getItem('teacherInfo');
        
        if (teacherInfo) {
          // 교사 정보가 있으면 JSON 파싱
          const teacherData = JSON.parse(teacherInfo);
          
          // 유효한 정보인지 및 만료되지 않았는지 확인
          if (teacherData && teacherData.id) {
            const expiresAt = teacherData.expiresAt;
            
            // 만료 시간 확인
            if (!expiresAt || Date.now() < expiresAt) {
              // 유효한 세션이면 바로 대시보드로 이동
              console.log('유효한 교사 세션이 있어 대시보드로 이동합니다.');
              router.push('/teacher/dashboard');
              return;
            }
          }
        }
        
        // 유효한 세션이 없으면 로그인 페이지로 이동
        router.push('/teacher/login');
      } catch (error) {
        console.error('교사 세션 확인 오류:', error);
        router.push('/teacher/login');
      }
    } else {
      // 서버 사이드에서는 로그인 페이지로 이동
      router.push('/teacher/login');
    }
  };

  return (
    <div className={styles.mainContainer}>
      <main className={styles.mainContent}>
        <div className={styles.heroSection}>
          <h1 className={styles.heroTitle}>AI 기반 토론 교육 피드백 시스템</h1>
          <p className={styles.heroText}>
            &lsquo;다름과 공존하는 경기초등토론교육모형&rsquo;에 기반하여 토론 수업을 효과적으로 준비하고 진행할 수 있도록 도와주는 AI 토론 가이드입니다.
          </p>
          
          <div className={styles.buttonContainer}>
            <button 
              className={styles.primaryButton}
              onClick={() => setActiveSection('student')}
            >
              학생으로 접속하기
            </button>
            <button 
              className={styles.secondaryButton}
              onClick={handleTeacherAccess}
            >
              교사로 접속하기
            </button>
          </div>
        </div>

        {activeSection === 'student' && (
          <div className={styles.accessSection}>
            <h2 className={styles.accessTitle}>학생 접속</h2>
            <div className={styles.studentOptions}>
              <div className={styles.optionCard}>
                <h3>토론 의견 제출</h3>
                <p>토론 주제에 대한 의견을 작성하고 제출합니다.</p>
                <Link href="/submit" className={styles.optionButton}>
                  의견 작성하기
                </Link>
              </div>
              <div className={styles.optionCard}>
                <h3>우수 의견 살펴보기</h3>
                <p>다른 학생들의 우수한 의견을 확인합니다.</p>
                <Link href="/examples" className={styles.optionButton}>
                  의견 보기
                </Link>
              </div>
              <div className={styles.optionCard}>
                <h3>피드백 확인</h3>
                <p>내 의견에 대한 선생님의 피드백을 확인합니다.</p>
                <div className={styles.checkFeedback}>
                  <form onSubmit={handleStudentLogin} className={styles.loginForm}>
                    <input
                      type="text"
                      name="studentName"
                      value={loginData.studentName}
                      onChange={handleStudentChange}
                      placeholder="이름"
                      className={error ? `${styles.formInput} ${styles.inputError}` : styles.formInput}
                      disabled={isLoading}
                    />
                    <input
                      type="password"
                      name="accessCode"
                      value={loginData.accessCode}
                      onChange={handleStudentChange}
                      placeholder="고유번호"
                      className={error ? `${styles.formInput} ${styles.inputError}` : styles.formInput}
                      disabled={isLoading}
                    />
                    {error && <p className={styles.errorText}>{error}</p>}
                    <button 
                      type="submit" 
                      className="lovable-btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? '로딩 중...' : '피드백 확인하기'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
            
            <button 
              className="lovable-link-more"
              onClick={() => setActiveSection(null)}
            >
              뒤로 가기
            </button>
          </div>
        )}

        {activeSection === 'teacher' && (
          <div className={styles.accessSection}>
            <h2 className={styles.accessTitle}>교사 접속</h2>
            <div className={styles.teacherAccess}>
              <div className="lovable-card">
                <h3>교사 로그인</h3>
                <p>교사 계정으로 로그인하여 대시보드에 접속합니다.</p>
                <form onSubmit={handleTeacherLogin} className={styles.loginForm}>
                  <input
                    type="text"
                    name="username"
                    value={teacherData.username}
                    onChange={handleTeacherChange}
                    placeholder="교사 아이디"
                    className={styles.formInput}
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    value={teacherData.password}
                    onChange={handleTeacherChange}
                    placeholder="비밀번호"
                    className={styles.formInput}
                    required
                  />
                  {error && <p className={styles.errorText}>{error}</p>}
                  <button 
                    type="submit" 
                    className="lovable-btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? '로그인 중...' : '대시보드 접속하기'}
                  </button>
                  <button 
                    type="button" 
                    className={styles.naverLoginButton}
                    onClick={() => window.alert('네이버 로그인 기능은 추후 제공됩니다.')}
                  >
                    네이버 아이디로 로그인
                  </button>
                </form>
              </div>
            </div>
            
            <button 
              className="lovable-link-more"
              onClick={() => setActiveSection(null)}
            >
              뒤로 가기
            </button>
          </div>
        )}

        {!activeSection && (
          <div className={styles.featuresSection}>
            <h2>주요 기능</h2>
            <div className={styles.featuresList}>
              <div className="lovable-card">
                <div className={styles.featureContent}>
                  <div className={styles.featureIcon}>🔍</div>
                  <h3>토론 주제 탐색</h3>
                  <p>다양한 수준의 토론 주제를 제공합니다.</p>
                </div>
              </div>
              <div className="lovable-card">
                <div className={styles.featureContent}>
                  <div className={styles.featureIcon}>💡</div>
                  <h3>맞춤형 피드백</h3>
                  <p>AI가 학생 의견에 맞춤형 피드백을 제공합니다.</p>
                </div>
              </div>
              <div className="lovable-card">
                <div className={styles.featureContent}>
                  <div className={styles.featureIcon}>📊</div>
                  <h3>토론 관리</h3>
                  <p>토론 진행 상황을 쉽게 관리할 수 있습니다.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className={styles.mainFooter}>
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
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
