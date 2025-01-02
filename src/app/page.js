'use client';

import { useState, useEffect } from 'react';

export default function HelloSession() {
  const [currentQuestion, setCurrentQuestion] = useState('Loading...');
  const [feedback, setFeedback] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [isLoading, setIsLoading] = useState(true);
  const [questionBank, setQuestionBank] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (questionBank.length > 0 && currentQuestion === 'Loading...') {
      getRandomQuestion();
    }
  }, [questionBank]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      const data = await response.json();
      setQuestionBank(data.questions);
    } catch (error) {
      showNotification('Failed to load questions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const getRandomQuestion = () => {
    if (questionBank.length === 0) return;
    const randomIndex = Math.floor(Math.random() * questionBank.length);
    setCurrentQuestion(questionBank[randomIndex]);
  };

  const handleFeedback = async (feedbackType) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          feedback: feedbackType
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.newQuestion) {
          setCurrentQuestion(data.newQuestion);
          showNotification('Thanks for the feedback! Here\'s a new question.');
        }
      }
    } catch (error) {
      showNotification('Failed to process feedback', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion })
      });

      if (response.ok) {
        showNotification('Thank you for your suggestion!');
        setNewQuestion('');
        await fetchQuestions();
      }
    } catch (error) {
      showNotification('Failed to submit question', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-center mb-8">
              Hello Session Question Generator
            </h1>
            
            <div className="text-center p-8 bg-gray-50 rounded-lg mb-6">
              <h2 className="text-xl mb-4">
                {isLoading ? 'Loading...' : currentQuestion}
              </h2>
              <button 
                onClick={getRandomQuestion}
                disabled={isLoading || questionBank.length === 0}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 
                         transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Get New Question'}
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold">How was this question?</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleFeedback('dislike')}
                  disabled={isLoading || currentQuestion === 'Loading...'}
                  className="px-4 py-2 border rounded hover:bg-gray-100 
                           transition-colors disabled:opacity-50"
                >
                  Too Complex
                </button>
                <button 
                  onClick={() => handleFeedback('like')}
                  disabled={isLoading || currentQuestion === 'Loading...'}
                  className="px-4 py-2 border rounded hover:bg-gray-100 
                           transition-colors disabled:opacity-50"
                >
                  Just Right
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Suggest a New Question</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your question here..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border rounded focus:ring-2 
                           focus:ring-blue-500 focus:border-blue-500 outline-none
                           disabled:opacity-50 disabled:bg-gray-100"
                />
                <button 
                  onClick={handleSubmitQuestion}
                  disabled={!newQuestion.trim() || isLoading}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 
                           transition-colors disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>

        {showAlert && (
          <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg
            ${alertType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
          >
            {alertMessage}
          </div>
        )}
      </div>
    </main>
  );
}