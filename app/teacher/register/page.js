'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function TeacherRegister() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return '이름을 입력해주세요.';
    }
    
    if (!formData.email.trim()) {
      return '이메일을 입력해주세요.';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return '유효한 이메일 주소를 입력해주세요.';
    }
    
    if (!formData.password) {
      return '비밀번호를 입력해주세요.';
    }
    
    if (formData.password.length < 6) {
      return '비밀번호는 최소 6자 이상이어야 합니다.';
    }
    
    if (formData.password !== formData.confirmPassword) {
      return '비밀번호가 일치하지 않습니다.';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 이메일 정규화 (소문자 변환 및 공백 제거)
      const normalizedEmail = formData.email.toLowerCase().trim();
      
      const response = await fetch('/api/teacher/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: normalizedEmail,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      // 응답 확인용 디버깅
      console.log('회원가입 응답:', data);
      
      if (!response.ok) {
        throw new Error(data.message || '회원가입 중 오류가 발생했습니다.');
      }
      
      // 교사 정보 저장
      localStorage.setItem('teacherInfo', JSON.stringify({
        id: data.teacher.id,
        name: data.teacher.name,
        email: data.teacher.email
      }));
      
      setSuccess('회원가입이 완료되었습니다. 첫 학급을 생성하러 이동합니다.');
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      
      // 브라우저 콘솔에 가입 성공 정보 기록
      console.log('회원가입 성공:', data.teacher);
      
      // 로컬 스토리지에 회원가입 성공 정보 임시 저장 (개발 목적)
      localStorage.setItem('lastRegisteredEmail', normalizedEmail);
      
      // 3초 후 학급 생성 페이지로 이동
      setTimeout(() => {
        router.push('/teacher/class/create');
      }, 3000);
    } catch (err) {
      console.error('회원가입 오류:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>교사 회원가입</h1>
        <p className={styles.description}>
          AI 기반 토론 교육 피드백 시스템에 교사로 가입하세요.
        </p>
      </header>

      <main className={styles.main}>
        <div className={styles.registerCard}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>이름</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                placeholder="이름을 입력하세요"
                disabled={isLoading}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>이메일</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                placeholder="이메일을 입력하세요"
                disabled={isLoading}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>비밀번호</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
                placeholder="6자 이상의 비밀번호"
                disabled={isLoading}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>비밀번호 확인</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={styles.input}
                placeholder="비밀번호를 다시 입력하세요"
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <div className={styles.error}>
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className={styles.success}>
                <p>{success}</p>
              </div>
            )}

            <div className={styles.buttonContainer}>
              <button 
                type="submit" 
                className={styles.button}
                disabled={isLoading}
              >
                {isLoading ? '처리 중...' : '회원가입'}
              </button>
              <Link href="/teacher/login" className={styles.secondaryButton}>
                이미 계정이 있으신가요? 로그인
              </Link>
            </div>
          </form>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>AI 기반 토론 교육 피드백 시스템 &copy; 2025 안양 박달초 김문정</p>
      </footer>
    </div>
  );
} 