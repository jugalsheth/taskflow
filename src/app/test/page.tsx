'use client';

import { useState } from 'react';

export default function TestPage() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    console.log('Button clicked!');
    alert('Button works!');
    setCount(count + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        <p className="mb-4">Count: {count}</p>
        <button
          onClick={handleClick}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Button
        </button>
        <p className="mt-4 text-sm text-gray-600">
          If this button works, JavaScript is functioning properly.
        </p>
      </div>
    </div>
  );
} 