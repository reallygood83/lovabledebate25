'use client';
import styles from '../styles.module.css';

const Message = ({ type, children }) => {
  // 메시지 타입에 따른 스타일 적용
  const messageClasses = {
    error: styles.errorMessage,
    success: styles.successMessage,
    info: styles.infoMessage,
    warning: styles.warningMessage
  };
  
  const messageClass = messageClasses[type] || messageClasses.info;
  
  return (
    <div className={messageClass}>
      {children}
    </div>
  );
};

export default Message; 