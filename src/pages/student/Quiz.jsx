import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { GraduationCap, Award, ArrowRight, CheckCircle, XCircle, AlertCircle, Volume2 } from 'lucide-react';

export default function Quiz() {
  const navigate = useNavigate();

  // Setup state
  const [topic, setTopic] = useState('Conditional Sentences');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(10);
  const [screen, setScreen] = useState('setup'); // setup, active, results

  // Active quiz state
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [answersState, setAnswersState] = useState([]); // Array of { questionIdx, userAns, correctAns, isCorrect }
  const [checked, setChecked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [generating, setGenerating] = useState(false);
  const [skippedCount, setSkippedCount] = useState(0);

  const timerRef = useRef(null);

  // Timer logic for active quiz question
  useEffect(() => {
    if (screen === 'active' && !checked && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (screen === 'active' && timeLeft === 0 && !checked) {
      handleTimeOut();
    }
    return () => clearTimeout(timerRef.current);
  }, [screen, timeLeft, checked]);

  const handleTimeOut = () => {
    toast.error("Time's up!");
    setChecked(true);
    // Mark as wrong due to timeout
    const currentQ = questions[currentIdx];
    setAnswersState((prev) => [
      ...prev,
      {
        questionIdx: currentIdx,
        userAns: null,
        correctAns: currentQ.correct_answer,
        isCorrect: false,
        timedOut: true,
      },
    ]);
  };

  const startQuiz = async () => {
    setGenerating(true);
    try {
      const res = await quizAPI.generate(topic, difficulty, numQuestions);
      if (res.data && res.data.length > 0) {
        setQuestions(res.data);
        setCurrentIdx(0);
        setSelectedOpt(null);
        setAnswersState([]);
        setChecked(false);
        setTimeLeft(20);
        setSkippedCount(0);
        setScreen('active');
        toast.success('Quiz generated! Good luck!');
      } else {
        toast.error('Could not generate quiz. Try again.');
      }
    } catch (err) {
      toast.error('Error generating quiz from AI');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (optKey) => {
    if (checked) return;
    setSelectedOpt(optKey);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOpt) {
      toast.error('Select an answer option');
      return;
    }

    const currentQ = questions[currentIdx];
    // Option format could be "A. had had" or similar, extract the letter prefix
    const isAnswerCorrect = selectedOpt === currentQ.correct_answer;

    setAnswersState((prev) => [
      ...prev,
      {
        questionIdx: currentIdx,
        userAns: selectedOpt,
        correctAns: currentQ.correct_answer,
        isCorrect: isAnswerCorrect,
      },
    ]);
    setChecked(true);

    if (isAnswerCorrect) {
      toast.success('Correct!');
    } else {
      toast.error('Incorrect answer');
    }
  };

  const handleSkip = () => {
    if (checked) return;
    const currentQ = questions[currentIdx];
    setAnswersState((prev) => [
      ...prev,
      {
        questionIdx: currentIdx,
        userAns: 'skipped',
        correctAns: currentQ.correct_answer,
        isCorrect: false,
      },
    ]);
    setSkippedCount((prev) => prev + 1);
    setChecked(true);
    toast.dismiss();
    toast('Question skipped', { icon: '⏭️' });
  };

  const handleNextQuestion = async () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setChecked(false);
      setTimeLeft(20);
    } else {
      // End quiz
      const correctCount = answersState.filter((ans) => ans.isCorrect).length;
      try {
        await quizAPI.submit(correctCount, questions.length);
        toast.success(`Quiz completed! Earned ${correctCount * 5} points.`);
      } catch (err) {
        toast.error('Failed to submit results to database');
      }
      setScreen('results');
    }
  };

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const correctCount = answersState.filter((ans) => ans.isCorrect).length;
  const wrongCount = questions.length - correctCount - skippedCount;
  const scorePercent = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8 text-gray-900">
        {/* Setup Screen */}
        {screen === 'setup' && (
          <section className="stagger-up flex flex-col items-center justify-center min-h-[500px]">
            {generating ? (
              <div className="text-center space-y-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-bold text-gray-500">AI is crafting your quiz...</p>
              </div>
            ) : (
              <div className="w-full max-w-2xl bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <GraduationCap className="text-white" size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Grammar Mastery Quiz</h2>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">
                    Test your grammar skills and earn bonus XP.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block ml-1">Topic</label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/10 focus:border-primary text-body-md outline-none"
                    >
                      <option>Conditional Sentences</option>
                      <option>Passive Voice</option>
                      <option>Relative Clauses</option>
                      <option>Modal Verbs</option>
                      <option>Tenses</option>
                      <option>Prepositions</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block ml-1">Difficulty</label>
                    <div className="flex bg-gray-100 border border-gray-200 p-1 rounded-xl">
                      {['easy', 'medium', 'hard'].map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setDifficulty(diff)}
                          type="button"
                          className={`flex-1 py-2 px-3 rounded-lg text-body-md font-bold capitalize transition-all ${
                            difficulty === diff
                              ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block ml-1">Question Count</label>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-body-md font-bold text-primary">5</span>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        step="5"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-body-md font-bold text-gray-500">{numQuestions}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={startQuiz}
                  className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold transition-all shadow-sm flex items-center justify-center gap-2 group"
                >
                  Start Quiz
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* Active Quiz Screen */}
        {screen === 'active' && questions.length > 0 && (
          <section className="stagger-up w-full max-w-4xl mx-auto space-y-6 text-gray-900">
            {/* Header & Progress */}
            <div className="flex items-center justify-between gap-6">
              <div className="flex-grow">
                <div className="flex justify-between items-end mb-2 text-xs font-bold text-gray-500">
                  <span>Question {currentIdx + 1} of {questions.length}</span>
                  <span>TIME LEFT: {timeLeft}s</span>
                </div>
                <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Countdown circle */}
              <div className="relative w-16 h-16 flex items-center justify-center bg-white border border-gray-150 rounded-full shadow-sm">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="transparent" stroke="#F3F4F6" strokeWidth="4" />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="transparent"
                    stroke="#4F46E5"
                    strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - timeLeft / 20)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="absolute text-sm font-extrabold text-primary">{timeLeft}</span>
              </div>
            </div>

            {/* Question card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-10 shadow-sm">
              {/* Reference sentences (if question compares/references specific sentences) */}
              {questions[currentIdx].reference_sentences && questions[currentIdx].reference_sentences.length > 0 && (
                <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-1.5">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Reference Sentences</span>
                  {questions[currentIdx].reference_sentences.map((sentence, idx) => (
                    <p key={idx} className="text-sm text-indigo-900 font-medium leading-relaxed">
                      {sentence}
                    </p>
                  ))}
                </div>
              )}

              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
                {questions[currentIdx].question}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions[currentIdx].options.map((option) => {
                  const letter = option.charAt(0);
                  const isSelected = selectedOpt === letter;
                  const isCorrectAnswer = letter === questions[currentIdx].correct_answer;

                  let cardStyle = 'border-gray-200 hover:border-primary hover:bg-gray-50 text-gray-700';
                  if (checked) {
                    if (isCorrectAnswer) {
                      cardStyle = 'border-success bg-success/10 text-success';
                    } else if (isSelected) {
                      cardStyle = 'border-danger bg-danger/10 text-danger';
                    } else {
                      cardStyle = 'opacity-40 border-gray-200';
                    }
                  } else if (isSelected) {
                    cardStyle = 'border-primary bg-primary/10 text-primary';
                  }

                  return (
                    <button
                      key={option}
                      disabled={checked}
                      onClick={() => handleSelectOption(letter)}
                      className={`flex items-center justify-between p-6 rounded-2xl border transition-all text-left group ${cardStyle}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 text-primary font-bold">
                          {letter}
                        </span>
                        <span className="text-body-lg font-medium">{option.substring(3)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center flex-wrap gap-4">
              <button
                disabled={checked}
                onClick={handleSkip}
                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-650 font-bold hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                Skip Question
              </button>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => speakQuestion(questions[currentIdx].question)}
                  className="w-12 h-12 rounded-xl hover:bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-200 transition-all"
                >
                  <Volume2 size={20} />
                </button>

                {!checked ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOpt}
                    className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold shadow-sm disabled:opacity-50"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold shadow-sm transition-all"
                  >
                    Next Question
                  </button>
                )}
              </div>
            </div>

            {/* Explanation box */}
            {checked && (
              <div className="bg-gray-50 border border-gray-100 p-6 rounded-xl flex gap-3 animate-fade-in">
                <AlertCircle className="text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-primary mb-1">Explanation</h4>
                  <p className="text-sm text-gray-650 leading-relaxed">
                    {questions[currentIdx].explanation || 'Understand correct grammatical usage.'}
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Results Screen */}
        {screen === 'results' && (
          <section className="stagger-up flex flex-col items-center text-gray-900">
            <div className="w-full max-w-3xl bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
              <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center bg-white border border-gray-150 rounded-full shadow-sm">
                <svg className="w-44 h-44 transform -rotate-90">
                  <circle cx="88" cy="88" r="80" fill="transparent" stroke="#F3F4F6" strokeWidth="8" />
                  <circle
                    cx="88"
                    cy="88"
                    r="80"
                    fill="transparent"
                    stroke={scorePercent >= 70 ? '#10B981' : scorePercent >= 40 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 80}`}
                    strokeDashoffset={`${2 * Math.PI * 80 * (1 - scorePercent / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-5xl font-bold text-gray-900">{scorePercent}%</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                    Final Score
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {scorePercent >= 80
                  ? 'Superb performance!'
                  : scorePercent >= 50
                  ? 'Good effort!'
                  : 'Keep practicing!'}
              </h2>
              <p className="text-body-md text-gray-650 mb-10">
                You completed the {topic} module. Keep studying to reach fluency.
              </p>

              {/* Stats Bento Grid */}
              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-success/10 border border-success/20 rounded-2xl p-6 flex flex-col items-center">
                  <CheckCircle className="text-success text-3xl mb-2" />
                  <p className="text-2xl font-bold text-success">{correctCount}</p>
                  <p className="text-[9px] uppercase tracking-wider font-bold text-gray-500 mt-1">
                    Correct
                  </p>
                </div>
                <div className="bg-danger/10 border border-danger/20 rounded-2xl p-6 flex flex-col items-center">
                  <XCircle className="text-danger text-3xl mb-2" />
                  <p className="text-2xl font-bold text-danger">{wrongCount}</p>
                  <p className="text-[9px] uppercase tracking-wider font-bold text-gray-500 mt-1">
                    Wrong
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-150 rounded-2xl p-6 flex flex-col items-center">
                  <span className="text-gray-700 text-3xl mb-2">⏭️</span>
                  <p className="text-2xl font-bold text-gray-700">{skippedCount}</p>
                  <p className="text-[9px] uppercase tracking-wider font-bold text-gray-500 mt-1">
                    Skipped
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setScreen('setup')}
                  className="flex-1 py-4 px-6 rounded-2xl border border-primary text-primary font-bold hover:bg-primary/5 transition-all"
                >
                  Restart Quiz
                </button>
                <button
                  onClick={() => navigate('/student/home')}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white py-4 px-6 rounded-2xl font-bold transition-all shadow-sm"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
