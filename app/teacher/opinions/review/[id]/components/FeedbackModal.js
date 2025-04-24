'use client';
import { useState } from 'react';
import styles from '../styles.module.css';

const FeedbackCriteriaModal = ({ isOpen, onClose, onSave }) => {
  const [criteria, setCriteria] = useState({
    logic: true,
    evidence: true,
    creativity: true,
    respect: true
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setCriteria(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSave = () => {
    onSave(criteria);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>피드백 기준 설정</h3>
          <button onClick={onClose} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.modalDescription}>
            학생 의견 평가를 위한 기준을 선택하세요. 선택된 기준은 AI 피드백 생성 시 참고됩니다.
          </p>
          
          <div className={styles.criteriaList}>
            <div className={styles.criteriaItem}>
              <input
                type="checkbox"
                id="logic"
                name="logic"
                checked={criteria.logic}
                onChange={handleChange}
              />
              <label htmlFor="logic">논리적 사고력</label>
              <p className={styles.criteriaDescription}>
                학생의 의견이 논리적으로 전개되었는지 평가
              </p>
            </div>
            
            <div className={styles.criteriaItem}>
              <input
                type="checkbox"
                id="evidence"
                name="evidence"
                checked={criteria.evidence}
                onChange={handleChange}
              />
              <label htmlFor="evidence">근거 활용</label>
              <p className={styles.criteriaDescription}>
                주장을 뒷받침하는 근거나 예시를 적절히 제시했는지 평가
              </p>
            </div>
            
            <div className={styles.criteriaItem}>
              <input
                type="checkbox"
                id="creativity"
                name="creativity"
                checked={criteria.creativity}
                onChange={handleChange}
              />
              <label htmlFor="creativity">창의적 사고</label>
              <p className={styles.criteriaDescription}>
                독창적인 관점이나 아이디어를 제시했는지 평가
              </p>
            </div>
            
            <div className={styles.criteriaItem}>
              <input
                type="checkbox"
                id="respect"
                name="respect"
                checked={criteria.respect}
                onChange={handleChange}
              />
              <label htmlFor="respect">다양성 존중</label>
              <p className={styles.criteriaDescription}>
                다른 의견을 존중하고 다양한 관점을 고려했는지 평가
              </p>
            </div>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>
            취소
          </button>
          <button onClick={handleSave} className={styles.saveButton}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackCriteriaModal; 