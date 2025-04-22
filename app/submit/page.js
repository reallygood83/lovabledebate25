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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
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
                className={styles.input}
                placeholder="예: 초등학교에서 휴대폰 사용을 허용해야 할까요?"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="content" className={styles.label}>내 의견</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                className={styles.textarea}
                placeholder="자신의 의견을 자유롭게 작성해주세요..."
                rows="6"
                required
              ></textarea>
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
                  className={styles.input}
                  placeholder="홍길동"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="studentClass" className={styles.label}>학급</label>
                <input
                  type="text"
                  id="studentClass"
                  name="studentClass"
                  value={formData.studentClass}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="5학년 2반"
                  required
                />
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