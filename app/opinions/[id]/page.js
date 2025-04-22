'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OpinionDetailPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const [opinion, setOpinion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOpinion() {
      try {
        setLoading(true);
        const response = await fetch(`/api/opinions/${id}`);
        const result = await response.json();
        
        if (result.success) {
          setOpinion(result.data);
        } else {
          setError(result.error || '의견을 불러오는데 실패했습니다');
        }
      } catch (err) {
        setError('서버 연결에 문제가 발생했습니다');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchOpinion();
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center">데이터를 불러오는 중...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!opinion) return <div className="p-8 text-center">의견을 찾을 수 없습니다</div>;
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Link href="/opinions" className="text-blue-600 hover:underline mb-4 inline-block">
        ← 목록으로 돌아가기
      </Link>
      
      <div className="border p-6 rounded-lg shadow-md mt-4">
        <h1 className="text-2xl font-bold mb-2">{opinion.topic}</h1>
        
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <div>
            <span>{opinion.studentName} | {opinion.studentClass}</span>
          </div>
          <div>
            {new Date(opinion.submittedAt).toLocaleString()}
          </div>
        </div>
        
        <div className="mt-4 whitespace-pre-wrap">{opinion.content}</div>
        
        {opinion.feedback && (
          <div className="mt-8 p-4 bg-blue-50 rounded-md border border-blue-100">
            <h2 className="font-semibold mb-2">교사 피드백</h2>
            <p className="whitespace-pre-wrap">{opinion.feedback}</p>
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-500">
          참조코드: {opinion.referenceCode}
        </div>
      </div>
    </div>
  );
} 