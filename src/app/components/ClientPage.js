'use client';

import dynamic from 'next/dynamic';

const QuestionGenerator = dynamic(() => import('./QuestionGenerator'), {
  ssr: false,
});

export default function ClientPage() {
  return <QuestionGenerator />;
}