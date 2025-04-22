'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function SubmitOpinion() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    topic: '',
    content: '',
    studentName: '',
    studentClass: '',
  });
  const [formErrors, setFormErrors] = useState({
    topic: '',
    content: '',
    studentName: '',
    studentClass: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 입력 시 해당 필드 오류 초기화
    setFormErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  // 폼 유효성 검사 함수
  const validateForm = () => {
    let isValid = true;
    const errors = {
      topic: '',
      content: '',
      studentName: '',
      studentClass: '',
    };
    
    // 토론 주제 검증
    if (!formData.topic.trim()) {
      errors.topic = '토론 주제를 입력해주세요.';
      isValid = false;
    } else if (formData.topic.length > 100) {
      errors.topic = '토론 주제는 100자 이내로 입력해주세요.';
      isValid = false;
    }
    
    // 의견 내용 검증
    if (!formData.content.trim()) {
      errors.content = '의견 내용을 입력해주세요.';
      isValid = false;
    } else if (formData.content.length > 5000) {
      errors.content = '의견은 5000자 이내로 입력해주세요.';
      isValid = false;
    } else if (formData.content.length < 10) {
      errors.content = '의견은 최소 10자 이상 입력해주세요.';
      isValid = false;
    }
    
    // 학생 이름 검증
    if (!formData.studentName.trim()) {
      errors.studentName = '이름을 입력해주세요.';
      isValid = false;
    } else if (formData.studentName.length > 50) {
      errors.studentName = '이름은 50자 이내로 입력해주세요.';
      isValid = false;
    }
    
    // 학급 정보 검증
    if (!formData.studentClass.trim()) {
      errors.studentClass = '학급 정보를 입력해주세요.';
      isValid = false;
    } else if (formData.studentClass.length > 50) {
      errors.studentClass = '학급 정보는 50자 이내로 입력해주세요.';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // 폼 유효성 검사
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/opinions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '의견 제출에 실패했습니다.');
      }
      
      setSuccess({
        message: data.message,
        referenceCode: data.referenceCode,
      });
      
      // 폼 초기화
      setFormData({
        topic: '',
        content: '',
        studentName: '',
        studentClass: '',
      });
      
    } catch (err) {
      setError(err.message || '오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>토론 의견 제출</h1>
        <p className={styles.description}>
          토론 주제에 대한 의견을 작성하고 제출해주세요. 선생님이 검토 후 피드백을 제공해 드립니다.
        </p>
      </header>

      <main className={styles.main}>
        {success ? (
          <div className={styles.success}>
            <h2>의견이 성공적으로 제출되었습니다!</h2>
            <p>
              피드백을 확인하려면 아래의 참조 코드를 기억해두세요:
            </p>
            <div className={styles.referenceCode}>
              {success.referenceCode}
            </div>
            <p>
              이 코드를 사용하여 나중에 피드백을 확인할 수 있습니다:
            </p>
            <div className={styles.buttonContainer}>
              <Link href={`/feedback/${success.referenceCode}`} className={styles.button}>
                피드백 확인하기
              </Link>
              <button
                className={styles.secondaryButton}
                onClick={() => setSuccess(null)}
              >
                다른 의견 작성하기
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="topic" className={styles.label}>토론 주제</label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                className={formErrors.topic ? `${styles.input} ${styles.inputError}` : styles.input}
                placeholder="예: 초등학교에서 휴대폰 사용을 허용해야 할까요?"
                required
              />
              {formErrors.topic && <p className={styles.errorText}>{formErrors.topic}</p>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="content" className={styles.label}>내 의견</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                className={formErrors.content ? `${styles.textarea} ${styles.inputError}` : styles.textarea}
                placeholder="자신의 의견을 자유롭게 작성해주세요..."
                rows="6"
                required
              ></textarea>
              {formErrors.content && <p className={styles.errorText}>{formErrors.content}</p>}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="studentName" className={styles.label}>이름</label>
                <input
                  type="text"
                  id="studentName"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  className={formErrors.studentName ? `${styles.input} ${styles.inputError}` : styles.input}
                  placeholder="홍길동"
                  required
                />
                {formErrors.studentName && <p className={styles.errorText}>{formErrors.studentName}</p>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="studentClass" className={styles.label}>학급</label>
                <input
                  type="text"
                  id="studentClass"
                  name="studentClass"
                  value={formData.studentClass}
                  onChange={handleChange}
                  className={formErrors.studentClass ? `${styles.input} ${styles.inputError}` : styles.input}
                  placeholder="5학년 2반"
                  required
                />
                {formErrors.studentClass && <p className={styles.errorText}>{formErrors.studentClass}</p>}
              </div>
            </div>

            {error && (
              <div className={styles.error}>
                <p>{error}</p>
              </div>
            )}

            <div className={styles.buttonContainer}>
              <button 
                type="submit" 
                className={styles.button}
                disabled={isLoading}
              >
                {isLoading ? '제출 중...' : '의견 제출하기'}
              </button>
              <Link href="/" className={styles.secondaryButton}>
                돌아가기
              </Link>
            </div>
          </form>
        )}
      </main>

      <footer className={styles.footer}>
        <p>경기초등토론교육모형 AI 피드백 시스템 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
} 