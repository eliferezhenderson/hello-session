'use client';

import { useState, useEffect } from 'react';

export default function QuestionGenerator() {
  const [currentQuestion, setCurrentQuestion] = useState('Question Loading...');
  const [newQuestion, setNewQuestion] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [isLoading, setIsLoading] = useState(true);
  const [questionBank, setQuestionBank] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const [recentQuestions, setRecentQuestions] = useState([]);

  useEffect(() => {
    fetchQuestions();
    setCurrentTime(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (questionBank.length > 0 && currentQuestion === 'Question Loading...') {
      getRandomQuestionLocal();
    }
  }, [questionBank]);

  const stripQuotes = (text) =>
    text.replace(/^["']|["']$/g, '').trim();

  const getRandomQuestionLocal = () => {
    if (questionBank.length === 0) return;
    const randomIndex = Math.floor(Math.random() * questionBank.length);
    const clean = stripQuotes(questionBank[randomIndex]);
    setCurrentQuestion(clean);
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/question_route');
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestionBank(data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      showNotification('Failed to load questions', 'error');
      setQuestionBank([]);
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

  const handleClick = async (type) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const shouldUseLocal = type === 'random' ? Math.random() < 0.5 : false;

      if (type === 'random' && shouldUseLocal && questionBank.length > 0) {
        getRandomQuestionLocal();
        showNotification("Here's a RANDOM question from the local bank!");
      } else {
        const response = await fetch('/api/feedback_route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: type === 'random' ? 'random' : type,
            excludedQuestions: recentQuestions,
          }),
        });

        if (!response.ok) throw new Error('Failed to get new question');
        const data = await response.json();

        if (data.newQuestion) {
          const clean = stripQuotes(data.newQuestion);
          setCurrentQuestion(clean);
          showNotification(`Here's a ${type.toUpperCase()} question!`);
          setRecentQuestions((prev) => {
            const updated = [clean, ...prev];
            return updated.length > 10 ? updated.slice(0, 10) : updated;
          });
        }
      }
    } catch (error) {
      console.error('Error getting question:', error);
      showNotification('Failed to get question', 'error');
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
        body: JSON.stringify({ question: newQuestion }),
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
    <main className="min-h-screen bg-vwBg bg-grain bg-repeat text-vwRed font-caslon p-8 tracking-tight">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <div className="flex justify-between items-center text-sm text-vwRed font-mono mb-2">
            <div>HELLO SESSION GENERATOR [BETA]</div>
            <div>{currentTime}</div>
          </div>
          <div className="flex items-start gap-4 mb-4">
            <img
              src="/QMARK.svg"
              alt="Pixel Question Mark"
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-6xl font-semibold mt-0">HELLO, FRIEND</h1>
          </div>
          <p className="text-base max-w-4xl leading-snug text-vwRed">
            This tool offers icebreaker questions for classrooms, teams, or groups of friends. You can press the buttons down below to get a new question.{' '}
            <span className="underline font-medium">Go Random</span> to get a surprise, or try{' '}
            <span className="underline font-medium">Go Easier</span> for something light, or{' '}
            <span className="underline font-medium">Go Deeper</span> for a thoughtful conversation.
          </p>
        </header>

        {/* Question Display */}
        <section className="bg-white p-8 border border-vwAccent shadow rounded mb-10">
          <h2 className="text-2xl leading-relaxed font-semibold font-mono">
            {isLoading ? 'LOADING...' : currentQuestion}
          </h2>
        </section>

        {/* Question Controls */}
        <section className="bg-white p-6 border border-vwAccent shadow rounded mb-10">
          <p className="mb-4 text-sm font-mono uppercase text-vwRed tracking-wider">
            Click to generate a new question:
          </p>
          <div className="flex gap-4 flex-wrap">
            {['random', 'easier', 'deeper'].map((label) => (
              <button
                key={label}
                onClick={() => handleClick(label)}
                disabled={isLoading}
                className="border-2 border-vwRed text-vwRed px-6 py-3 
                  hover:bg-vwRed hover:text-vwBg font-bold text-sm 
                  transition-colors disabled:opacity-50 uppercase"
              >
                GO {label.toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        {/* Suggest a Question */}
        <section className="bg-white p-6 border border-vwAccent shadow rounded mb-10">
          <h3 className="text-xl font-semibold mb-4">SUGGEST A NEW QUESTION</h3>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Type your question here..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-vwAccent focus:border-vwRed 
                outline-none disabled:opacity-50 disabled:bg-gray-100 placeholder:text-vwAccent"
            />
            <button
              onClick={handleSubmitQuestion}
              disabled={!newQuestion.trim() || isLoading}
              className="border-2 border-vwRed text-vwRed px-6 py-3 
                hover:bg-vwRed hover:text-white transition-colors 
                disabled:opacity-50 font-bold text-sm uppercase"
            >
              Submit
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center font-mono text-xs text-vwRed">
          Built with care by{' '}
          <a
            href="https://eliferezhenderson.cardd.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-vwRed"
          >
            Elif Erez-Henderson
          </a>
        </footer>

        {/* Alerts */}
        {showAlert && (
          <div
            className={`fixed bottom-4 right-4 p-4 border font-mono ${
              alertType === 'error'
                ? 'border-red-500 bg-white text-red-500'
                : 'border-green-500 bg-white text-green-500'
            }`}
          >
            {alertMessage}
          </div>
        )}
      </div>
    </main>
  );
}
