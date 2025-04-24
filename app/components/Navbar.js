'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  
  // 현재 경로가 /teacher로 시작하는지 확인
  const isTeacherRoute = pathname.startsWith('/teacher');
  
  // 로그인 페이지나 메인 페이지에서는 네비게이션 바를 표시하지 않음
  if (pathname === '/' || pathname === '/teacher/login') {
    return null;
  }

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