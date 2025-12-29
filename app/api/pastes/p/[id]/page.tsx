'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';

interface Props {
  params: { id: string };
}

export default function PastePage({ params }: Props) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaste = async () => {
      try {
        const response = await fetch(`/api/pastes?id=${params.id}`);
        if (!response.ok) {
          setError('Paste not found or expired');
          setLoading(false);
          return;
        }
        const data = await response.json();
        setContent(data.content);
        setLoading(false);
      } catch (err) {
        setError('Failed to load paste');
        setLoading(false);
      }
    };

    fetchPaste();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-300 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading paste...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">404 - Paste Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href="/" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Create New Paste
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Shared Paste</h1>
          </div>
          <pre className="p-8 overflow-auto bg-gray-50 text-gray-800 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </pre>
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <a href="/" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Create Another Paste
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
