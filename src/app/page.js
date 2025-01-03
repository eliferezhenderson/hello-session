import dynamic from 'next/dynamic'

const QuestionGenerator = dynamic(() => import('./components/QuestionGenerator'), {
  ssr: false,
});

export default function Page() {
  return <QuestionGenerator />;
}