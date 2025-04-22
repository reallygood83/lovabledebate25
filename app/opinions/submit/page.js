'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SubmitOpinionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    topic: '',
    content: '',
    studentName: '',
    studentClass: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/opinions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccess(result.message || '의견이 성공적으로 제출되었습니다');
        setFormData({
          topic: '',
          content: '',
          studentName: '',
          studentClass: ''
        });
        
        // 성공 후 코드를 보여주기
        if (result.data?.referenceCode) {
          setSuccess(`의견이 성공적으로 제출되었습니다. 참조 코드: ${result.data.referenceCode}`);
        }
        
        // 3초 후 목록 페이지로 이동
        setTimeout(() => {
          router.push('/opinions');
        }, 3000);
      } else {
        setError(result.error || '의견 제출에 실패했습니다');
      }
    } catch (err) {
      setError('서버 연결에 문제가 발생했습니다');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Link href="/opinions" className="text-blue-600 hover:underline mb-4 inline-block">
        ← 목록으로 돌아가기
      </Link>
      
      <h1 className="text-2xl font-bold mb-6">새 의견 제출</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{success}</div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="topic" className="block mb-1 font-medium">
            토론 주제
          </label>
          <input
            type="text"
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
            placeholder="토론 주제를 입력하세요"
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block mb-1 font-medium">
            의견 내용
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={6}
            className="w-full p-2 border rounded-md"
            placeholder="의견 내용을 자세히 작성해주세요"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="studentName" className="block mb-1 font-medium">
              이름
            </label>
            <input
              type="text"
              id="studentName"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
              placeholder="이름을 입력하세요"
            />
          </div>
          
          <div>
            <label htmlFor="studentClass" className="block mb-1 font-medium">
              학급
            </label>
            <input
              type="text"
              id="studentClass"
              name="studentClass"
              value={formData.studentClass}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md"
              placeholder="학급을 입력하세요 (예: 3학년 2반)"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? '제출 중...' : '의견 제출하기'}
        </button>
      </form>
    </div>
  );
} 