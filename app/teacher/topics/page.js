'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function TopicManagement() {
  const router = useRouter();
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    classId: ''
  });
  const [classes, setClasses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  // 인증 확인
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('teacherAuth') === 'true';
    if (!isAuthenticated) {
      router.push('/teacher/login');
    }
  }, [router]);

  // 반 목록 가져오기
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/class');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || '반 목록을 불러오는데 실패했습니다.');
        }
        
        setClasses(data.data || []);
        
        // 첫 번째 반을 기본값으로 설정
        if (data.data && data.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            classId: data.data[0]._id
          }));
          
          // 첫 번째 반의 토론 주제 목록 불러오기
          fetchTopics(data.data[0]._id);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        setError(err.message || '오류가 발생했습니다.');
        setIsLoading(false);
      }
    };
    
    fetchClasses();
  }, []);

  // 토론 주제 목록 가져오기
  const fetchTopics = async (classId) => {
    if (!classId) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`/api/class/${classId}/topics`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '토론 주제를 불러오는데 실패했습니다.');
      }
      
      setTopics(data.data || []);
    } catch (err) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 반 선택 시 해당 반의 토론 주제 가져오기
  const handleClassChange = (e) => {
    const classId = e.target.value;
    setFormData(prev => ({
      ...prev,
      classId
    }));
    
    fetchTopics(classId);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { title, description, deadline, classId } = formData;
    
    if (!title.trim() || !classId) {
      setError('제목과 반 선택은 필수입니다.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await fetch(`/api/class/${classId}/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          deadline: deadline || undefined
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '토론 주제 등록에 실패했습니다.');
      }
      
      // 폼 초기화
      setFormData(prev => ({
        ...prev,
        title: '',
        description: '',
        deadline: ''
      }));
      
      setSuccessMessage('토론 주제가 성공적으로 등록되었습니다!');
      setIsAddingTopic(false);
      
      // 목록 다시 불러오기
      fetchTopics(classId);
      
    } catch (err) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('정말 이 토론 주제를 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      setError('');
      
      const response = await fetch(`/api/class/${formData.classId}/topics/${topicId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '토론 주제 삭제에 실패했습니다.');
      }
      
      // 목록 다시 불러오기
      fetchTopics(formData.classId);
      
    } catch (err) {
      setError(err.message || '오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>토론 주제 관리</h1>
            <p className={styles.description}>토론 주제를 등록하고 관리합니다.</p>
          </div>
          <Link href="/teacher/dashboard" className={styles.backButton}>
            대시보드로 돌아가기
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.classSelection}>
          <label htmlFor="classSelector">반 선택:</label>
          <select 
            id="classSelector" 
            value={formData.classId}
            onChange={handleClassChange}
            className={styles.select}
          >
            {classes.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        
        {classes.length === 0 && !isLoading && (
          <div className={styles.alert}>
            <p>등록된 반이 없습니다. 먼저 반을 등록해주세요.</p>
            <Link href="/teacher/class/create" className={styles.button}>
              반 등록하기
            </Link>
          </div>
        )}
        
        {classes.length > 0 && (
          <>
            <div className={styles.topicHeader}>
              <h2>토론 주제 목록</h2>
              <button 
                onClick={() => setIsAddingTopic(!isAddingTopic)} 
                className={styles.addButton}
              >
                {isAddingTopic ? '취소' : '새 토론 주제 등록'}
              </button>
            </div>
            
            {isAddingTopic && (
              <div className={styles.formContainer}>
                <h3>새 토론 주제 등록</h3>
                
                {error && (
                  <div className={styles.errorMessage}>
                    <p>{error}</p>
                  </div>
                )}
                
                {successMessage && (
                  <div className={styles.successMessage}>
                    <p>{successMessage}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formGroup}>
                    <label htmlFor="title" className={styles.label}>주제 제목 *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="예) 급식에 천연 음료를 제공해야 할까?"
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="description" className={styles.label}>주제 설명</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className={styles.textarea}
                      placeholder="주제에 대한 설명을 입력하세요."
                      rows={4}
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="deadline" className={styles.label}>마감일</label>
                    <input
                      type="date"
                      id="deadline"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      className={styles.input}
                    />
                  </div>
                  
                  <div className={styles.buttonGroup}>
                    <button
                      type="submit"
                      className={styles.submitButton}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? '등록 중...' : '등록하기'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingTopic(false)}
                      className={styles.cancelButton}
                    >
                      취소
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {isLoading ? (
              <div className={styles.loading}>
                <p>로딩 중...</p>
              </div>
            ) : topics.length === 0 ? (
              <div className={styles.emptyState}>
                <p>등록된 토론 주제가 없습니다.</p>
              </div>
            ) : (
              <div className={styles.topicsList}>
                {topics.map((topic, index) => (
                  <div key={topic._id || index} className={styles.topicCard}>
                    <div className={styles.topicHeader}>
                      <h3>{topic.title}</h3>
                      <div className={styles.topicStatus}>
                        <span className={`${styles.badge} ${styles[topic.status]}`}>
                          {topic.status === 'active' ? '진행 중' : 
                           topic.status === 'completed' ? '완료됨' : '초안'}
                        </span>
                        {topic.deadline && (
                          <span className={styles.deadline}>
                            마감: {new Date(topic.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {topic.description && (
                      <p className={styles.topicDescription}>{topic.description}</p>
                    )}
                    
                    <div className={styles.topicActions}>
                      <button
                        onClick={() => handleDeleteTopic(topic._id)}
                        className={styles.deleteButton}
                      >
                        삭제
                      </button>
                      <Link 
                        href={`/teacher/topics/${topic._id}/edit`}
                        className={styles.editButton}
                      >
                        수정
                      </Link>
                      <Link 
                        href={`/teacher/topics/${topic._id}/opinions`}
                        className={styles.viewButton}
                      >
                        의견 보기
                      </Link>
                    </div>
                  </div>
                ))}
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