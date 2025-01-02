// src/app/page.js
'use client';

import { useState, useEffect } from 'react';

export default function StyledQuestionGenerator() {
  const [currentQuestion, setCurrentQuestion] = useState('Question Loading...');
  const [newQuestion, setNewQuestion] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [isLoading, setIsLoading] = useState(true);
  const [questionBank, setQuestionBank] = useState([]);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    fetchQuestions();
    // Initialize and update time
    setCurrentTime(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (questionBank.length > 0 && currentQuestion === 'Question Loading...') {
      getRandomQuestion();
    }
  }, [questionBank]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/question_route');
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      console.log('Fetched questions:', data); // For debugging
      setQuestionBank(data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
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
      const response = await fetch('/api/feedback_route', {
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
          // Update current question if GPT generated a simpler one
          setCurrentQuestion(data.newQuestion);
          showNotification('Here\'s a simpler version of the question!');
        } else {
          // If the question was "just right", get a new random question
          getRandomQuestion();
          showNotification('Thanks for the feedback! Here\'s a new question.');
        }
      }
    } catch (error) {
      console.error('Feedback Error:', error);
      showNotification('Failed to process feedback', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim() || isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/question_route', {
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
    <main className="min-h-screen bg-gray-50 p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12 border-b border-red-400 pb-4">
          <div className="flex justify-between items-center text-red-500 mb-2">
            <div>HELLO SESSION GENERATOR [BETA]</div>
            <div>{currentTime}</div>
          </div>
          <h1 className="text-6xl font-light tracking-tight text-red-500">
            HELLO, FRIEND
          </h1>
        </header>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Question Display */}
          <section className="bg-white p-8 border border-red-200">
            <h2 className="text-3xl mb-8 font-light text-red-500">
              {isLoading ? 'LOADING...' : currentQuestion}
            </h2>
            <button 
              onClick={getRandomQuestion}
              disabled={isLoading || questionBank.length === 0}
              className="border border-red-500 text-red-500 px-6 py-3 hover:bg-red-500 
                       hover:text-white transition-colors disabled:opacity-50"
            >
              GENERATE NEW QUESTION
            </button>
          </section>

          {/* Feedback Section */}
          <section className="bg-white p-8 border border-red-200">
            <h3 className="text-xl mb-6 font-light text-red-500">FEEDBACK</h3>
            <div className="flex gap-4">
              <button 
                onClick={() => handleFeedback('dislike')}
                disabled={isLoading || currentQuestion === 'Question Loading...'}
                className="border border-red-500 text-red-500 px-6 py-3 hover:bg-red-500 
                         hover:text-white transition-colors disabled:opacity-50 flex-1"
              >
                TOO COMPLEX
              </button>
              <button 
                onClick={() => handleFeedback('like')}
                disabled={isLoading || currentQuestion === 'Question Loading...'}
                className="border border-red-500 text-red-500 px-6 py-3 hover:bg-red-500 
                         hover:text-white transition-colors disabled:opacity-50 flex-1"
              >
                JUST RIGHT
              </button>
            </div>
          </section>

          {/* Submit Question Section */}
          <section className="bg-white p-8 border border-red-200">
            <h3 className="text-xl mb-6 font-light text-red-500">SUGGEST A QUESTION</h3>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="TYPE YOUR QUESTION HERE..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-red-200 focus:border-red-500 
                         outline-none disabled:opacity-50 disabled:bg-gray-100 
                         placeholder:text-red-200"
              />
              <button 
                onClick={handleSubmitQuestion}
                disabled={!newQuestion.trim() || isLoading}
                className="border border-red-500 text-red-500 px-6 py-3 hover:bg-red-500 
                         hover:text-white transition-colors disabled:opacity-50"
              >
                SUBMIT
              </button>
            </div>
          </section>
        </div>

        {/* Alert */}
        {showAlert && (
          <div className={`fixed bottom-4 right-4 p-4 border ${
            alertType === 'error' 
              ? 'border-red-500 bg-white text-red-500' 
              : 'border-green-500 bg-white text-green-500'
          }`}>
            {alertMessage}
          </div>
        )}
      </div>
    </main>
  );
}