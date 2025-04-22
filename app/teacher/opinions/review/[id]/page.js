'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

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

  // 인증 확인
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('teacherAuth') === 'true';
    if (!isAuthenticated) {
      router.push('/teacher/login');
    }
  }, [router]);

  // 의견 데이터 가져오기
  useEffect(() => {
    const fetchOpinion = async () => {
      if (!id) return;
      
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

    fetchOpinion();
  }, [id]);

  // AI 피드백 생성
  const handleGenerateFeedback = async () => {
    if (!opinion) return;
    
    try {
      setIsGenerating(true);
      setError('');
      
      const response = await fetch('/api/generate-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discussionTopic: opinion.topic,
          studentOpinion: opinion.content
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '피드백 생성에 실패했습니다.');
      }
      
      setGeneratedFeedback(data.feedback || '');
    } catch (err) {
      setError(`피드백 생성 오류: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
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
      
      const response = await fetch(`/api/opinions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback,
          teacherNote,
          isPublic,
          status: 'reviewed'
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
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.feedbackTip}>
                      <p className={styles.tipTitle}>피드백 작성 팁:</p>
                      <ul className={styles.tipList}>
                        <li className={styles.tipItem}>구체적인 칭찬과 개선점을 포함하세요.</li>
                        <li className={styles.tipItem}>논리적 구조와 주장의 타당성을 평가하세요.</li>
                        <li className={styles.tipItem}>발전 방향을 제시하고 격려하세요.</li>
                      </ul>
                    </div>

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
                        onClick={handleGenerateFeedback}
                        disabled={isGenerating}
                        className={styles.generateButton}
                      >
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
                      <>
                        <div className={styles.generatedFeedback}>
                          {generatedFeedback}
                        </div>
                        <button
                          onClick={handleApplyGeneratedFeedback}
                          className={styles.applyButton}
                        >
                          생성된 피드백 적용
                        </button>
                      </>
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