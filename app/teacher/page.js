'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TeacherPage() {
  const router = useRouter();

  useEffect(() => {
    // 교사 인증 확인
    const isAuthenticated = localStorage.getItem('teacherAuth') === 'true';
    
    if (isAuthenticated) {
      // 인증된 경우 대시보드로 리디렉션
      router.push('/teacher/dashboard');
    } else {
      // 인증되지 않은 경우 로그인 페이지로 리디렉션
      router.push('/teacher/login');
    }
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>리디렉션 중...</p>
    </div>
  );
} 