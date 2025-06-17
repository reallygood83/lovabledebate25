'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // 현재 경로가 /teacher로 시작하는지 확인
  const isTeacherRoute = pathname.startsWith('/teacher');
  
  // 로그인 페이지에서는 네비게이션 바를 표시하지 않음
  if (pathname === '/teacher/login') {
    return null;
  }

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 교사 로그인 세션 갱신 (클라이언트 사이드에서만)
  useEffect(() => {
    if (isTeacherRoute && typeof window !== 'undefined') {
      try {
        const teacherInfo = localStorage.getItem('teacherInfo');
        if (teacherInfo) {
          const teacherData = JSON.parse(teacherInfo);
          
          // 만료 시간 확인 및 갱신
          if (teacherData && teacherData.id) {
            // 만료 시간을 7일로 연장
            const newExpiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
            const updatedTeacherData = {
              ...teacherData,
              expiresAt: newExpiresAt
            };
            localStorage.setItem('teacherInfo', JSON.stringify(updatedTeacherData));
            console.log('네비게이션 바에서 교사 로그인 세션 갱신됨:', new Date(newExpiresAt));
          }
        }
      } catch (error) {
        console.error('교사 세션 갱신 오류:', error);
      }
    }
  }, [isTeacherRoute, pathname]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          <Link href="/">❤️ LovableDebate</Link>
        </h1>
        <nav className={styles.nav}>
          <ul>
            <li>
              <a 
                href="https://debate25.vercel.app/" 
                className={pathname === '/' ? styles.active : ''}
              >
                홈
              </a>
            </li>
            <li>
              <a 
                href="https://debate25.vercel.app/topics/ai-topics" 
                className={pathname.includes('/topics') ? styles.active : ''}
              >
                토론 주제 탐색
              </a>
            </li>
            <li>
              <a 
                href="https://debate25.vercel.app/scenarios" 
                className={pathname.includes('/scenarios') ? styles.active : ''}
              >
                토론 시나리오
              </a>
            </li>
            <li>
              <a 
                href="https://debate25.vercel.app/session" 
                className={pathname.includes('/session') ? styles.active : ''}
              >
                토론 진행하기
              </a>
            </li>
            <li 
              className={styles.dropdownContainer}
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
              ref={dropdownRef}
            >
              <a 
                href="https://lovabledebate25.vercel.app/" 
                className={pathname === '/' ? styles.active : ''}
              >
                학습 피드백
              </a>
              {showDropdown && (
                <div className={styles.dropdown}>
                  <a href="https://lovabledebate25.vercel.app/teacher/dashboard">
                    교사 대시보드
                  </a>
                </div>
              )}
            </li>
            <li>
              <a 
                href="https://debate25.vercel.app/resources" 
                className={pathname.includes('/resources') ? styles.active : ''}
              >
                교육 자료실
              </a>
            </li>
            <li>
              <a 
                href="https://debate25.vercel.app/about" 
                className={pathname.includes('/about') ? styles.active : ''}
              >
                소개
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
} 