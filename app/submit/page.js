'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { FaLightbulb, FaUser, FaSchool } from 'react-icons/fa';

// 자동 완성용 토론 주제 목록
const SUGGESTED_TOPICS = [
  '초등학교에서 휴대폰 사용을 허용해야 할까요?',
  '학교 급식에서 채식 옵션을 의무화해야 할까요?',
  '학생 자치회가 더 많은 권한을 가져야 할까요?',
  '초등학생들에게 교복이 필요한가요?',
  '숙제의 양을 줄여야 할까요?',
  '실내 쉬는 시간을 늘려야 할까요?',
  '온라인 수업은 교실 수업을 대체할 수 있을까요?',
  '모든 학생이 악기 연주를 배워야 할까요?',
  '반려동물을 학교에 데려오는 것을 허용해야 할까요?',
  '초등학교에서 영어 교육이 필요한가요?',
];

// AI 작성 도우미 예시 팁
const WRITING_TIPS = [
  {
    title: '주장 명확하게',
    content: '첫 문장에서 자신의 의견을 분명하게 밝히세요. "저는 ~라고 생각합니다."'
  },
  {
    title: '근거 제시하기',
    content: '주장을 뒷받침하는 이유나 예시를 2-3가지 들어보세요.'
  },
  {
    title: '반대 의견 고려',
    content: '다른 의견을 가진 사람들의 생각도 존중하며 왜 자신의 의견이 더 나은지 설명해보세요.'
  },
  {
    title: '개인 경험 활용',
    content: '자신의 경험이나 관찰한 일을 예시로 들면 설득력이 높아집니다.'
  },
  {
    title: '결론 강조하기',
    content: '마지막에 자신의 주장을 다시 한번, 조금 다른 말로 강조하세요.'
  }
];

export default function SubmitOpinion() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    topic: '',
    content: '',
    studentName: '',
    studentClass: '',
    classCode: '',
  });
  const [formErrors, setFormErrors] = useState({
    topic: '',
    content: '',
    studentName: '',
    studentClass: '',
    classCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  
  // 새로 추가된 상태들
  const [showTopicSuggestions, setShowTopicSuggestions] = useState(false);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [isWritingTipsVisible, setIsWritingTipsVisible] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);
  const [currentCharCount, setCurrentCharCount] = useState(0);

  // 로컬 스토리지에서 학생 정보 불러오기
  useEffect(() => {
    const savedName = localStorage.getItem('studentName');
    const savedClass = localStorage.getItem('studentClass');
    const savedClassCode = localStorage.getItem('classCode');
    
    if (savedName || savedClass || savedClassCode) {
      setFormData(prev => ({
        ...prev,
        studentName: savedName || '',
        studentClass: savedClass || '',
        classCode: savedClassCode || '',
      }));
    }
  }, []);

  // 내용 글자수 업데이트
  useEffect(() => {
    setCurrentCharCount(formData.content.length);
  }, [formData.content]);

  // 토론 주제 필터링
  useEffect(() => {
    if (formData.topic.trim() === '') {
      setFilteredTopics(SUGGESTED_TOPICS);
    } else {
      const filtered = SUGGESTED_TOPICS.filter(topic => 
        topic.toLowerCase().includes(formData.topic.toLowerCase())
      );
      setFilteredTopics(filtered);
    }
  }, [formData.topic]);

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

    // 토론 주제 입력 시 자동완성 보여주기
    if (name === 'topic') {
      setShowTopicSuggestions(true);
    }
  };

  const handleSelectTopic = (topic) => {
    setFormData(prev => ({
      ...prev,
      topic
    }));
    setShowTopicSuggestions(false);
  };

  const handleSelectTip = (tip) => {
    setSelectedTip(tip);
  };

  const handleApplyTip = () => {
    if (selectedTip) {
      const tipText = selectedTip.content;
      setFormData(prev => ({
        ...prev,
        content: prev.content ? `${prev.content}\n\n${tipText}` : tipText
      }));
      setSelectedTip(null);
    }
  };

  // 폼 유효성 검사 함수
  const validateForm = () => {
    let isValid = true;
    const errors = {
      topic: '',
      content: '',
      studentName: '',
      studentClass: '',
      classCode: '',
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
    
    // 학급 코드 검증
    if (!formData.classCode.trim()) {
      errors.classCode = '학급 코드를 입력해주세요.';
      isValid = false;
    } else if (formData.classCode.length !== 4) {
      errors.classCode = '학급 코드는 4자리여야 합니다.';
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
      // 학생 정보 및 학급 코드 로컬 스토리지에 저장
      localStorage.setItem('studentName', formData.studentName);
      localStorage.setItem('studentClass', formData.studentClass);
      localStorage.setItem('classCode', formData.classCode);
      
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
      
      // 폼 초기화 (학생 정보는 유지)
      setFormData(prev => ({
        ...prev,
        topic: '',
        content: '',
        classCode: '',
      }));
      
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
              <div className={styles.labelContainer}>
                <label htmlFor="topic" className={styles.label}>토론 주제</label>
                <span className={styles.suggestedTopicsToggle} onClick={() => setShowTopicSuggestions(!showTopicSuggestions)}>
                  {showTopicSuggestions ? '주제 숨기기' : '주제 제안 보기'}
                </span>
              </div>
              <div className={styles.inputWithSuggestions}>
                <textarea
                  id="topic"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  className={formErrors.topic ? `${styles.topicInput} ${styles.inputError}` : styles.topicInput}
                  placeholder="예: 초등학교에서 휴대폰 사용을 허용해야 할까요?"
                  required
                  rows={2}
                />
                {showTopicSuggestions && formData.topic.length > 0 && (
                  <ul className={styles.suggestionsList}>
                    {filteredTopics.map((topic, index) => (
                      <li 
                        key={index} 
                        className={styles.suggestionItem}
                        onClick={() => handleSelectTopic(topic)}
                      >
                        {topic}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {formErrors.topic && <p className={styles.errorText}>{formErrors.topic}</p>}
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelContainer}>
                <label htmlFor="content" className={styles.label}>내 의견</label>
                <div className={styles.labelActions}>
                  <span className={styles.charCount} style={{ color: currentCharCount > 4500 ? '#e53e3e' : '#666' }}>
                    {currentCharCount}/5000자
                  </span>
                  <button
                    type="button"
                    className={styles.tipButton}
                    onClick={() => setIsWritingTipsVisible(!isWritingTipsVisible)}
                  >
                    <FaLightbulb /> 작성 팁
                  </button>
                </div>
              </div>
              {isWritingTipsVisible && (
                <div className={styles.tipPanel}>
                  <div className={styles.tipsList}>
                    {WRITING_TIPS.map((tip, index) => (
                      <div 
                        key={index} 
                        className={`${styles.tipCard} ${selectedTip === tip ? styles.selectedTip : ''}`}
                        onClick={() => handleSelectTip(tip)}
                      >
                        <h4 className={styles.tipTitle}>{tip.title}</h4>
                        <p className={styles.tipContent}>{tip.content}</p>
                      </div>
                    ))}
                  </div>
                  {selectedTip && (
                    <button 
                      type="button" 
                      className={styles.applyTipButton} 
                      onClick={handleApplyTip}
                    >
                      이 팁 적용하기
                    </button>
                  )}
                </div>
              )}
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                className={formErrors.content ? `${styles.textarea} ${styles.inputError}` : styles.textarea}
                placeholder="자신의 의견을 자유롭게 작성해주세요..."
                rows="8"
                required
              ></textarea>
              {formErrors.content && <p className={styles.errorText}>{formErrors.content}</p>}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <div className={styles.iconLabel}>
                  <FaUser className={styles.inputIcon} />
                  <label htmlFor="studentName" className={styles.label}>이름</label>
                </div>
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
                <div className={styles.iconLabel}>
                  <FaSchool className={styles.inputIcon} />
                  <label htmlFor="studentClass" className={styles.label}>학급</label>
                </div>
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

            <div className={styles.formGroup}>
              <label htmlFor="classCode" className={styles.label}>
                <FaSchool className={styles.labelIcon} /> 학급 코드
              </label>
              <input
                type="text"
                id="classCode"
                name="classCode"
                value={formData.classCode}
                onChange={handleChange}
                placeholder="교사가 제공한 4자리 학급 코드"
                className={styles.input}
                maxLength={4}
              />
              {formErrors.classCode && (
                <p className={styles.errorText}>{formErrors.classCode}</p>
              )}
              <p className={styles.helpText}>
                교사가 제공한 4자리 학급 코드를 입력하세요.
              </p>
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