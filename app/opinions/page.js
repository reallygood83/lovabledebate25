'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OpinionsPage() {
  const [opinions, setOpinions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOpinions() {
      try {
        setLoading(true);
        const response = await fetch('/api/opinions');
        const result = await response.json();
        
        if (result.success) {
          setOpinions(result.data);
        } else {
          setError(result.error || '데이터를 불러오는데 실패했습니다');
        }
      } catch (err) {
        setError('서버 연결에 문제가 발생했습니다');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOpinions();
  }, []);

  if (loading) return <div className="p-8 text-center">데이터를 불러오는 중...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">학생 의견 목록</h1>
      
      {opinions.length === 0 ? (
        <p className="text-center py-8">아직 공개된 의견이 없습니다</p>
      ) : (
        <div className="grid gap-4">
          {opinions.map((opinion) => (
            <div key={opinion._id} className="border p-4 rounded-lg shadow-sm">
              <h2 className="font-semibold text-lg">{opinion.topic}</h2>
              <p className="mt-1 text-gray-600">{opinion.content.substring(0, 150)}...</p>
              <div className="mt-2 text-sm text-gray-500">
                <span>{opinion.studentName} | {opinion.studentClass}</span>
                <span className="ml-2">
                  {new Date(opinion.submittedAt).toLocaleDateString()}
                </span>
              </div>
              <Link href={`/opinions/${opinion.referenceCode}`} className="mt-3 inline-block text-blue-600 hover:underline">
                자세히 보기
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 