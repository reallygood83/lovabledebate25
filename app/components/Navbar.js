'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  
  // 현재 경로가 /teacher로 시작하는지 확인
  const isTeacherRoute = pathname.startsWith('/teacher');
  
  // 로그인 페이지나 메인 페이지에서는 네비게이션 바를 표시하지 않음
  if (pathname === '/' || pathname === '/teacher/login') {
    return null;
  }

  // 교사 로그인 세션 갱신
  useEffect(() => {
    if (isTeacherRoute) {
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
          <Link href="/">토론 튜터</Link>
        </h1>
        <nav className={styles.nav}>
          <ul>
            <li>
              <Link href="/" className={pathname === '/' ? styles.active : ''}>
                홈
              </Link>
            </li>
            <li>
              <a 
                href="https://debate25.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                토론 수업 지원 도구 이동
              </a>
            </li>
            {isTeacherRoute && (
              <li>
                <Link 
                  href="/teacher/dashboard" 
                  className={pathname === '/teacher/dashboard' ? styles.active : ''}
                >
                  교사 대시보드
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
} 