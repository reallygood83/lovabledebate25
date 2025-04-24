'use client';
import styles from '../styles.module.css';

const StudentInfoBox = ({ student }) => {
  if (!student) return null;
  
  return (
    <div className={styles.studentInfoBox}>
      <div className={styles.infoItem}>
        <span className={styles.infoLabel}>이름</span>
        <span className={styles.infoValue}>{student.name}</span>
      </div>
      <div className={styles.infoItem}>
        <span className={styles.infoLabel}>학급</span>
        <span className={styles.infoValue}>{student.className}</span>
      </div>
      {student.submittedAt && (
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>제출일</span>
          <span className={styles.infoValue}>
            {new Date(student.submittedAt).toLocaleDateString()}
          </span>
        </div>
      )}
      {student.referenceCode && (
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>참조 코드</span>
          <span className={styles.infoValue}>{student.referenceCode}</span>
        </div>
      )}
    </div>
  );
};

export default StudentInfoBox; 