'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './styles.module.css';
import clsx from "clsx";
import Spinner from "@/components/Spinner";
import FeedbackCriteriaModal from "./components/FeedbackModal";
import axios from "axios";
import StudentInfoBox from "./components/StudentInfoBox";
import { FaChevronDown, FaChevronUp, FaLightbulb, FaClipboard, FaMagic } from "react-icons/fa";

// 템플릿 선택 컴포넌트
const TemplateSelection = ({ setFeedback, currentFeedback }) => {
  const templates = [
    {
      title: '긍정적 피드백',
      content: '이 생각은 매우 흥미롭습니다. 특히 [장점]에 대한 부분이 인상적이었습니다. 더 깊이 탐구해 보시면 어떨까요?'
    },
    {
      title: '개선 제안',
      content: '의견이 잘 전달되었습니다. 다만 [개선점]에 대해 더 구체적인 예시를 들면 주장이 더 설득력을 가질 것 같습니다.'
    },
    {
      title: '근거 요청',
      content: '흥미로운 관점입니다. 이 주장을 뒷받침할 수 있는 구체적인 근거나 자료를 추가하면 더욱 설득력 있는 의견이 될 것입니다.'
    },
    {
      title: '질문 제시',
      content: '좋은 의견입니다. 추가로 생각해볼 질문은: [질문]입니다. 이 부분에 대해 어떻게 생각하시나요?'
    }
  ];

  const handleApplyTemplate = (template) => {
    if (currentFeedback) {
      setFeedback(`${currentFeedback}\n\n${template}`);
    } else {
      setFeedback(template);
    }
  };

  return (
    <div className={styles.feedbackTip}>
      <h4 className={styles.tipTitle}>피드백 템플릿</h4>
      <ul className={styles.templateList}>
        {templates.map((template, index) => (
          <li key={index} className={styles.templateItem}>
            <div className={styles.templateHeader}>
              <span className={styles.templateTitle}>{template.title}</span>
              <button
                onClick={() => handleApplyTemplate(template.content)}
                className={styles.applyButton}
              >
                적용
              </button>
            </div>
            <p className={styles.templateContent}>{template.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function ReviewOpinion() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  const [opinion, setOpinion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [teacherNote, setTeacherNote] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [generatedFeedback, setGeneratedFeedback] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedbackTips, setFeedbackTips] = useState([]);
  const [showTips, setShowTips] = useState(false);
  const [isTemplateVisible, setIsTemplateVisible] = useState(false);

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
      
      // 의견 데이터 가져오기
      if (id) {
        fetchOpinion();
      }
    } catch (error) {
      console.error('교사 정보 파싱 오류:', error);
      localStorage.removeItem('teacherInfo');
      router.push('/teacher/login');
    }
  }, [router, id]);

  // 의견 데이터 가져오기 함수
  const fetchOpinion = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`/api/opinions/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || '의견을 불러오는데 실패했습니다.');
      }

      if (!data.data) {
        throw new Error('데이터 형식이 올바르지 않습니다.');
      }
      
      const opinionData = data.data;
      setOpinion(opinionData);
      setFeedback(opinionData.feedback || '');
      setTeacherNote(opinionData.teacherNote || '');
      setIsPublic(opinionData.isPublic || false);
    } catch (err) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // AI 피드백 생성
  const handleGenerateFeedback = async (type) => {
    try {
      setIsLoading(true);
      setSelectedTemplate(type);

      const apiEndpoint = '/api/generate-feedback';
      
      if (!opinion) {
        alert('의견 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      // 피드백 팁 가져오기
      await fetchFeedbackTips();

      // 상세 지침 작성
      let instructions = '';
      
      // 선택한 템플릿 타입에 따라 다른 지침 제공
      switch (type) {
        case 'detailed':
          instructions = "상세하고 구체적인 피드백을 제공해주세요. 학생의 논리적 사고, 근거 제시, 창의성을 균형있게 평가해야 합니다.";
          break;
        case 'simple':
          instructions = "간결하고 핵심적인 피드백을 2-3문장으로 요약해주세요.";
          break;
        case 'encouraging':
          instructions = "격려와 긍정적인 측면을 강조하는 피드백을 작성해주세요. 학생의 자신감을 높이는 데 중점을 두세요.";
          break;
        case 'improvement':
          instructions = "개선이 필요한 부분에 초점을 맞춘 건설적인 피드백을 제공해주세요. 구체적인 개선 방향도 제시해주세요.";
          break;
        default:
          instructions = "균형 잡힌 피드백을 제공해주세요.";
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentOpinion: opinion.content,
          discussionTopic: opinion.topic,
          instructions: instructions
        }),
      });

      if (!response.ok) {
        throw new Error('피드백 생성에 실패했습니다.');
      }

      const data = await response.json();
      setGeneratedFeedback(data.feedback);
    } catch (error) {
      console.error('피드백 생성 오류:', error);
      alert('피드백 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 템플릿 선택 핸들러
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    handleGenerateFeedback(template);
  };

  // 생성된 피드백 적용
  const handleApplyGeneratedFeedback = () => {
    if (generatedFeedback) {
      setFeedback(generatedFeedback);
    }
  };

  // 피드백 저장
  const handleSaveFeedback = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccessMessage('');
      
      // 로컬 스토리지에서 교사 정보 가져오기
      const teacherInfoStr = localStorage.getItem('teacherInfo');
      let teacherId = '';
      
      if (teacherInfoStr) {
        try {
          const teacherInfo = JSON.parse(teacherInfoStr);
          teacherId = teacherInfo.id || '';
        } catch (e) {
          console.error('교사 정보 파싱 오류:', e);
        }
      }
      
      const response = await fetch(`/api/opinions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback,
          teacherNote,
          isPublic,
          status: 'reviewed',
          teacherId // 교사 ID 추가
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '피드백 저장에 실패했습니다.');
      }
      
      setSuccessMessage('피드백이 성공적으로 저장되었습니다!');
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(`저장 오류: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 피드백 팁 가져오기 함수
  const fetchFeedbackTips = async () => {
    try {
      setShowTips(true);
      
      if (!opinion) {
        return;
      }
      
      const response = await fetch('/api/generate-feedback/tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: opinion.topic,
          opinion: opinion.content
        }),
      });

      if (!response.ok) {
        throw new Error('피드백 팁 가져오기 실패');
      }

      const data = await response.json();
      setFeedbackTips(data.tips || getDefaultTips());
    } catch (error) {
      console.error('피드백 팁 오류:', error);
      setFeedbackTips(getDefaultTips());
    }
  };

  // 기본 피드백 팁 제공
  const getDefaultTips = () => {
    return [
      '학생의 관점을 존중하는 표현을 사용하세요.',
      '구체적인 개선점과 함께 실행 가능한 제안을 제시하세요.',
      '긍정적인 측면과 개선이 필요한 부분을 균형있게 언급하세요.',
      '논리적 사고와 비판적 분석 능력에 대해 코멘트하세요.',
      '참고할 수 있는 추가 자료나 예시를 제공하면 더 효과적입니다.'
    ];
  };

  // 템플릿 토글 핸들러 추가
  const handleTemplateToggle = () => {
    setIsTemplateVisible(!isTemplateVisible);
  };

  // 피드백 팁 적용 핸들러
  const handleApplyTip = (tip) => {
    if (feedback) {
      setFeedback(`${feedback}\n\n${tip}`);
    } else {
      setFeedback(tip);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p>의견을 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>오류가 발생했습니다</h2>
          <p>{error}</p>
          <Link href="/teacher/opinions/all" className={styles.button}>
            의견 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (!opinion) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h2>의견을 찾을 수 없습니다</h2>
          <p>요청하신 의견이 존재하지 않습니다.</p>
          <Link href="/teacher/opinions/all" className={styles.button}>
            의견 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>의견 검토</h1>
            <p className={styles.description}>학생 의견을 평가하고 피드백을 작성하세요.</p>
          </div>
          <Link href="/teacher/opinions/pending" className={styles.backButton}>
            목록으로 돌아가기
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        {isLoading ? (
          <div className={styles.loading}>
            <p>로딩 중...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <p>{error}</p>
            <Link href="/teacher/opinions/pending" className={styles.button}>
              돌아가기
            </Link>
          </div>
        ) : !opinion ? (
          <div className={styles.notFound}>
            <p>의견을 찾을 수 없습니다.</p>
            <Link href="/teacher/opinions/pending" className={styles.button}>
              돌아가기
            </Link>
          </div>
        ) : (
          <>
            {successMessage && (
              <div className={styles.successMessage}>
                <p>{successMessage}</p>
              </div>
            )}

            <div className={styles.twoColumn}>
              <div className={styles.leftColumn}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>학생 정보</h2>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>이름</span>
                      <span className={styles.infoValue}>{opinion.studentName}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>학급</span>
                      <span className={styles.infoValue}>{opinion.studentClass}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>제출일</span>
                      <span className={styles.infoValue}>{new Date(opinion.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>참조 코드</span>
                      <span className={styles.infoValue}>{opinion.referenceCode}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>토론 주제</h2>
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.topicText}>{opinion.topic}</p>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>제출된 의견</h2>
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.opinionText}>{opinion.content}</p>
                  </div>
                </div>
              </div>

              <div className={styles.rightColumn}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>피드백 생성</h2>
                    <div className={styles.headerButtons}>
                      <button 
                        onClick={handleTemplateToggle} 
                        className={styles.expandButton}
                      >
                        <FaClipboard className="mr-1" />
                        {isTemplateVisible ? '템플릿 닫기' : '템플릿 보기'}
                      </button>
                      <button
                        onClick={fetchFeedbackTips}
                        className={styles.tipButton}
                        disabled={isGenerating}
                      >
                        <FaLightbulb className="mr-1" />
                        {feedbackTips.length > 0 ? '새 피드백 팁' : '피드백 팁'}
                      </button>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    {isTemplateVisible && (
                      <TemplateSelection 
                        setFeedback={setFeedback}
                        currentFeedback={feedback}
                      />
                    )}

                    {feedbackTips.length > 0 && (
                      <div className={styles.suggestedTips}>
                        <div className={styles.suggestedHeader}>
                          <p className={styles.suggestedTitle}>이 의견에 대한 맞춤 피드백 제안:</p>
                          <span className={styles.tipCount}>{feedbackTips.length}개 제안</span>
                        </div>
                        <ul className={styles.tipCards}>
                          {feedbackTips.map((tip, index) => (
                            <li key={index} className={styles.tipCard}>
                              <div className={styles.tipCardContent}>
                                <span className={styles.tipNumber}>{index + 1}</span>
                                <p>{tip}</p>
                              </div>
                              <button 
                                className={styles.applyTipButton}
                                onClick={() => handleApplyTip(tip)}
                              >
                                적용
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <label htmlFor="feedback" className={styles.textareaLabel}>
                      피드백 내용
                    </label>
                    <textarea
                      id="feedback"
                      className={styles.textarea}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="학생에게 제공할 피드백을 작성하세요."
                    ></textarea>

                    <label htmlFor="teacherNote" className={styles.textareaLabel}>
                      교사 메모 (선택 사항, 학생에게 공개되지 않음)
                    </label>
                    <textarea
                      id="teacherNote"
                      className={`${styles.textarea} ${styles.teacherNoteTextarea}`}
                      value={teacherNote}
                      onChange={(e) => setTeacherNote(e.target.value)}
                      placeholder="나중에 참고할 메모를 작성하세요."
                    ></textarea>

                    <div className={styles.checkboxContainer}>
                      <input
                        type="checkbox"
                        id="isExemplary"
                        className={styles.checkbox}
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                      />
                      <label htmlFor="isExemplary" className={styles.checkboxLabel}>
                        모범 사례로 표시 (다른 학생들에게 익명으로 공유)
                      </label>
                    </div>

                    <div className={styles.buttonsContainer}>
                      <button
                        onClick={() => handleGenerateFeedback('standard')}
                        disabled={isGenerating}
                        className={styles.generateButton}
                      >
                        <FaMagic className="mr-2" />
                        {isGenerating ? "생성 중..." : "AI 피드백 생성"}
                      </button>
                      
                      <button
                        onClick={handleSaveFeedback}
                        disabled={!feedback.trim() || isSaving}
                        className={styles.saveButton}
                      >
                        {isSaving ? "저장 중..." : "피드백 저장"}
                      </button>
                    </div>

                    {generatedFeedback && (
                      <div className={styles.generatedFeedbackContainer}>
                        <h3 className={styles.generatedTitle}>AI 생성 피드백:</h3>
                        <div className={styles.generatedFeedback}>
                          {generatedFeedback.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                          ))}
                        </div>
                        <button
                          onClick={handleApplyGeneratedFeedback}
                          className={styles.applyButton}
                        >
                          이 피드백 적용하기
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className={styles.footer}>
        <p>경기초등토론교육모형 AI 피드백 시스템 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
} 