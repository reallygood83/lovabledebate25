'use client';
import React from 'react';

const Spinner = ({ size = 'md', color = 'blue' }) => {
  // 크기에 따른 클래스 설정
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  // 색상에 따른 클래스 설정
  const colorClasses = {
    blue: 'border-blue-500',
    indigo: 'border-indigo-500',
    green: 'border-green-500',
    red: 'border-red-500',
    gray: 'border-gray-500',
  };

  const spinnerSize = sizeClasses[size] || sizeClasses.md;
  const spinnerColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${spinnerSize} border-4 border-t-transparent ${spinnerColor} rounded-full animate-spin`}
      ></div>
    </div>
  );
};

export default Spinner; 