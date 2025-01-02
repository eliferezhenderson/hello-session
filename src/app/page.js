'use client';

import { useState } from 'react';

export default function HelloSession() {
  const [currentQuestion, setCurrentQuestion] = useState('What motivates you?');
  const [feedback, setFeedback] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  // Question bank from your PDF
  const questionBank = [
    'What are you listening to these days?',
    'What do you do to destress?',
    'What is the ideal stress party for you?',
    'What are you looking forward to?',
    'What is a brave classroom?',
    'What is your favorite karaoke song?',
    'What motivates you?',
    'What do you do for rest?',
    'What book genre would your life be?',
    'Share something fun you did this last week',
    'What genre tv show would your life story be in?'
  ];

  const getRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * questionBank.length);
    setCurrentQuestion(questionBank[randomIndex]);
  };

  const handleSubmitQuestion = () => {
    if (newQuestion.trim()) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      setNewQuestion('');
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-center mb-8">
              Hello Session Question Generator
            </h1>
            
            {/* Question Display */}
            <div className="text-center p-8 bg-gray-50 rounded-lg mb-6">
              <h2 className="text-xl mb-4">{currentQuestion}</h2>
              <button 
                onClick={getRandomQuestion}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Get New Question
              </button>
            </div>

            {/* Feedback Section */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold">Provide Feedback</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setFeedback('easier')}
                  className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
                >
                  Too Complex
                </button>
                <button 
                  onClick={() => setFeedback('good')}
                  className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
                >
                  Just Right
                </button>
              </div>
            </div>

            {/* Submit Question Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Suggest a New Question</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your question here..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded"
                />
                <button 
                  onClick={handleSubmitQuestion}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alert */}
        {showAlert && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            Thank you for your suggestion! It will be reviewed and added to our question bank.
          </div>
        )}
      </div>
    </main>
  );
}