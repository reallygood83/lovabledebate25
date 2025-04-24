'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function CreateClass() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    joinCode: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 인증 확인
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('teacherAuth') === 'true';
    if (!isAuthenticated) {
      router.push('/teacher/login');
    }
  }, [router]);

  // 랜덤 참여 코드 생성
  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setFormData(prev => ({
      ...prev,
      joinCode: result
    }));
  };

  useEffect(() => {
    // 페이지 로드 시 랜덤 코드 생성
    generateRandomCode();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 참여 코드는 대문자로 변환하고 4자로 제한
    if (name === 'joinCode') {
      const uppercaseValue = value.toUpperCase();
      setFormData(prev => ({
        ...prev,
        [name]: uppercaseValue.slice(0, 4)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { name, joinCode } = formData;
    
    // 필수 항목 검증
    if (!name.trim()) {
      setError('반 이름은 필수입니다.');
      return;
    }
    
    if (!joinCode || joinCode.length !== 4) {
      setError('참여 코드는 4자리로 입력해주세요.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // 교사 ID 가져오기 (임시)
      const teacherId = localStorage.getItem('teacherId') || '65e8f4b2c812700014d2e0b8'; // 임시 ID
      
      const response = await fetch('/api/class', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          teacherId
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '반 생성에 실패했습니다.');
      }
      
      // 성공 메시지 설정
      setSuccessMessage('반이 성공적으로 생성되었습니다!');
      
      // 폼 초기화
      setFormData({
        name: '',
        joinCode: '',
        description: ''
      });
      
      // 랜덤 코드 새로 생성
      generateRandomCode();
      
      // 3초 후 반 목록 페이지로 이동
      setTimeout(() => {
        router.push('/teacher/topics');
      }, 3000);
      
    } catch (err) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>새 반 생성</h1>
            <p className={styles.description}>
              새로운 반을 생성하고 토론 주제를 관리하세요.
            </p>
          </div>
          <Link href="/teacher/topics" className={styles.backButton}>
            목록으로 돌아가기
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.formContainer}>
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
              <label htmlFor="name" className={styles.label}>반 이름 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="예) 3학년 2반"
                className={styles.input}
                disabled={isLoading || successMessage}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="joinCode" className={styles.label}>
                참여 코드 *
                <button 
                  type="button" 
                  onClick={generateRandomCode}
                  className={styles.generateCodeButton}
                  disabled={isLoading || successMessage}
                >
                  새 코드 생성
                </button>
              </label>
              <input
                type="text"
                id="joinCode"
                name="joinCode"
                value={formData.joinCode}
                onChange={handleChange}
                placeholder="4자리 코드 (예: ABC1)"
                className={styles.input}
                maxLength={4}
                disabled={isLoading || successMessage}
                required
              />
              <p className={styles.helpText}>
                참여 코드는 학생들이 반에 가입할 때 사용됩니다.
              </p>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>반 설명</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="반에 대한 설명을 입력하세요."
                className={styles.textarea}
                rows={4}
                disabled={isLoading || successMessage}
              />
            </div>
            
            <div className={styles.buttonGroup}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading || successMessage}
              >
                {isLoading ? '생성 중...' : '반 생성하기'}
              </button>
              <Link href="/teacher/topics" className={styles.cancelButton}>
                취소
              </Link>
            </div>
          </form>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>경기초등토론교육모형 AI 피드백 시스템 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
} 