import { useState, useEffect } from 'react';
import { tenseAPI, modalVerbsAPI, grammarLessonsAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { 
  BookOpen, Sparkles, AlertCircle, CheckCircle, ArrowRight, 
  Play, Award, Volume2, Info, CheckCircle2, ChevronRight 
} from 'lucide-react';

export default function Tenses() {
  const [activeSection, setActiveSection] = useState('tenses'); // 'tenses' | 'modals' | 'grammar'
  
  // Directory data lists
  const [tenses, setTenses] = useState([]);
  const [modals, setModals] = useState([]);
  const [grammarLessons, setGrammarLessons] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all'); // for grammar topics filter

  const [loading, setLoading] = useState(true);

  // Practice session states
  const [activeItem, setActiveItem] = useState(null);
  const [activeItemType, setActiveItemType] = useState(null); // 'tense' | 'modal' | 'grammar'
  const [exercises, setExercises] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [showFinished, setShowFinished] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const getPracticeStatus = (lastPracticedAt) => {
    if (!lastPracticedAt) return 'practice';
    const lastDate = new Date(lastPracticedAt);
    const now = new Date();
    const diffHours = (now - lastDate) / (1000 * 60 * 60);
    return diffHours < 24 ? 'complete' : 'practice';
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [resTenses, resModals, resModalProg, resGrammar, resGrammarProg] = await Promise.all([
        tenseAPI.getAll(),
        modalVerbsAPI.getAll(),
        modalVerbsAPI.getProgress(),
        grammarLessonsAPI.getAll(),
        grammarLessonsAPI.getProgress()
      ]);

      // Set Tenses
      setTenses(resTenses.data);

      // Merge Modals
      const mergedModals = resModals.data.map(m => {
        const prog = resModalProg.data.find(p => p.id === m.id);
        return {
          ...m,
          attempts: prog?.attempts || 0,
          correct_count: prog?.correct_count || 0,
          is_completed: prog?.is_completed || false,
          mastery_percent: prog?.mastery_percent || 0,
          last_practiced_at: prog?.last_practiced_at || null
        };
      });
      setModals(mergedModals);

      // Merge Grammar Lessons
      const progList = Object.values(resGrammarProg.data).flat();
      const mergedGrammar = resGrammar.data.map(g => {
        const prog = progList.find(p => p.id === g.id);
        return {
          ...g,
          is_completed: prog?.is_completed || false,
          mastery_percent: prog?.mastery_percent || 0,
          last_practiced_at: prog?.last_practiced_at || null
        };
      });
      setGrammarLessons(mergedGrammar);

    } catch (err) {
      toast.error('Failed to load grammar masterclass directory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = async (item, type) => {
    setActiveItem(item);
    setActiveItemType(type);
    setGenerating(true);
    setExercises([]);
    setCurrentIdx(0);
    setScore(0);
    setChecked(false);
    setShowFinished(false);
    setUserInput('');

    try {
      let res;
      if (type === 'tense') {
        res = await tenseAPI.generateExercise(item.id);
        setExercises(res.data.exercises || res.data);
      } else if (type === 'modal') {
        res = await modalVerbsAPI.generateExercise(item.id);
        setExercises(res.data.exercises || res.data);
      } else if (type === 'grammar') {
        res = await grammarLessonsAPI.generateExercise(item.id);
        if (res.data) {
          const { explanation, examples, exercises: exerciseList } = res.data;
          setActiveItem(prev => ({
            ...prev,
            explanation: explanation || prev?.explanation,
            examples: examples || prev?.examples
          }));
          setExercises(exerciseList || []);
        }
      }
    } catch (err) {
      toast.error('Failed to generate exercises from AI');
      setActiveItem(null);
      setActiveItemType(null);
    } finally {
      setGenerating(false);
    }
  };

  const handleCheckAnswer = () => {
    if (!userInput.trim()) {
      toast.error('Please type an answer first');
      return;
    }

    const currentEx = exercises[currentIdx];
    const user = userInput.trim().toLowerCase();
    const correct = currentEx.answer.trim().toLowerCase();

    const isAnsCorrect = user === correct;
    setIsCorrect(isAnsCorrect);
    setChecked(true);

    if (isAnsCorrect) {
      setScore((prev) => prev + 1);
      toast.success('Correct answer! Good job.');
    } else {
      toast.error('Incorrect. Let\'s review the explanation.');
    }
  };

  const speakSentence = (sentenceText, answerText) => {
    if ('speechSynthesis' in window) {
      const spokenText = checked 
        ? sentenceText.replace('___', answerText) 
        : sentenceText.replace('___', 'blank');
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = async () => {
    setChecked(false);
    setUserInput('');
    if (currentIdx + 1 < exercises.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setShowFinished(true);
      const finalScore = score;
      const total = exercises.length;
      const mastery = Math.round((finalScore / total) * 100);

      try {
        if (activeItemType === 'tense') {
          await tenseAPI.submitProgress(activeItem.id, mastery);
        } else if (activeItemType === 'modal') {
          await modalVerbsAPI.submitProgress(activeItem.id, finalScore, total);
        } else if (activeItemType === 'grammar') {
          await grammarLessonsAPI.submitProgress(activeItem.id, finalScore, total);
        }
        toast.success(`Progress saved! Mastery updated.`);
        loadData();
      } catch (err) {
        toast.error('Could not save progress to server');
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // Count mastered items
  const masteredTenses = tenses.filter(t => t.mastery_percent >= 80).length;
  const masteredModals = modals.filter(m => m.mastery_percent >= 70).length;
  const masteredGrammar = grammarLessons.filter(g => g.mastery_percent >= 70).length;

  // Filter grammar lessons by active category
  const categoriesList = ['all', 'voice', 'speech', 'articles', 'conditionals', 'comparison', 'prepositions'];
  const filteredGrammar = activeCategory === 'all' 
    ? grammarLessons 
    : grammarLessons.filter(g => g.category?.toLowerCase() === activeCategory.toLowerCase());

  // Exercise formatting helper — strip any bracket hints from sentence as safety net
  let cleanedSentence = '';

  if (exercises.length > 0 && exercises[currentIdx]) {
    const rawSentence = exercises[currentIdx].sentence;
    
    // Strip any parenthesized word from display sentence (safety net if AI still includes hints)
    cleanedSentence = rawSentence.replace(/\s*\([^)]+\)\s*/g, '').trim();
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 text-gray-900">
        
        {/* Header Section */}
        <section className="stagger-up flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Grammar & Conjugation masterclass</h2>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              Practice tenses, modal verbs, and core grammar topics powered by AI.
            </p>
          </div>
          
          {!activeItem && (
            <div className="sm:text-right shrink-0">
              {activeSection === 'tenses' && (
                <>
                  <span className="font-extrabold text-primary text-base">{masteredTenses} / 12 Mastered</span>
                  <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${(masteredTenses / 12) * 100}%` }}
                    />
                  </div>
                </>
              )}
              {activeSection === 'modals' && (
                <>
                  <span className="font-extrabold text-primary text-base">{masteredModals} / 9 Mastered</span>
                  <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${(masteredModals / 9) * 100}%` }}
                    />
                  </div>
                </>
              )}
              {activeSection === 'grammar' && (
                <>
                  <span className="font-extrabold text-primary text-base">{masteredGrammar} / {grammarLessons.length} Mastered</span>
                  <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${(masteredGrammar / Math.max(1, grammarLessons.length)) * 100}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* Section Navigation Tabs (Only visible when not practicing) */}
        {!activeItem && (
          <div className="flex gap-2 p-1.5 bg-white border border-gray-200 rounded-2xl w-max shadow-sm stagger-up">
            <button
              onClick={() => setActiveSection('tenses')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeSection === 'tenses'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Verb Tenses
            </button>
            <button
              onClick={() => setActiveSection('modals')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeSection === 'modals'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Modal Verbs
            </button>
            <button
              onClick={() => setActiveSection('grammar')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeSection === 'grammar'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Grammar Topics
            </button>
          </div>
        )}

        {/* Exercises */}
        {activeItem && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            {/* Quick Rule Box */}
            <div className="lg:col-span-5 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles size={18} />
                </div>
                <h4 className="font-extrabold text-base text-gray-900">Grammar Rules & Usage</h4>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-primary">{activeItem.name}</h3>
                
                {/* Urdu Explanation */}
                {activeItem.urdu_explanation && (
                  <div className="bg-gray-50 p-4.5 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-wider block">Urdu translation/explanation:</span>
                    <p className="text-right text-base font-semibold text-gray-800 font-urdu leading-relaxed" dir="rtl">
                      {activeItem.urdu_explanation}
                    </p>
                  </div>
                )}

                {/* Specific features for Tense */}
                {activeItemType === 'tense' && (
                  <>
                    <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                      {activeItem.explanation || 'Formula: Subject + Verb form + Object'}
                    </p>
                    {activeItem.formula && (
                      <div className="bg-primary/10 p-3.5 rounded-xl border border-primary/20 text-xs font-mono text-primary">
                        {activeItem.formula}
                      </div>
                    )}
                    {activeItem.example && (
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 font-semibold text-xs text-gray-650 italic">
                        "{activeItem.example}"
                      </div>
                    )}
                  </>
                )}

                {/* Specific features for Modal Verb */}
                {activeItemType === 'modal' && (
                  <div className="space-y-3 text-xs font-semibold text-gray-650">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-primary block mb-1">Common usage:</span>
                      <p className="text-gray-800">{activeItem.usage}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-2 border-t border-gray-100">
                      {activeItem.positive_form && (
                        <div>
                          <span className="text-[9px] text-success uppercase tracking-wider block">Positive:</span>
                          <code className="text-xs text-gray-800 font-mono">{activeItem.positive_form}</code>
                        </div>
                      )}
                      {activeItem.negative_form && (
                        <div>
                          <span className="text-[9px] text-danger uppercase tracking-wider block">Negative:</span>
                          <code className="text-xs text-gray-800 font-mono">{activeItem.negative_form}</code>
                        </div>
                      )}
                      {activeItem.question_form && (
                        <div>
                          <span className="text-[9px] text-warning uppercase tracking-wider block">Question:</span>
                          <code className="text-xs text-gray-800 font-mono">{activeItem.question_form}</code>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Specific features for Grammar Lesson */}
                {activeItemType === 'grammar' && (
                  <div className="space-y-4">
                    {activeItem.explanation && (
                      <div className="space-y-1 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100/50">
                        <span className="text-[9px] uppercase tracking-wider text-primary font-bold block">AI Explanation:</span>
                        <p className="text-xs text-gray-650 font-medium leading-relaxed mt-0.5">
                          {activeItem.explanation}
                        </p>
                      </div>
                    )}

                    {activeItem.rules && Array.isArray(activeItem.rules) && activeItem.rules.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[9px] uppercase tracking-wider text-primary block">Core Rules:</span>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-gray-600 font-medium">
                          {activeItem.rules.map((rule, idx) => (
                            <li key={idx}>{rule}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {activeItem.examples && Array.isArray(activeItem.examples) && activeItem.examples.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <span className="text-[9px] uppercase tracking-wider text-primary block">Examples:</span>
                        <div className="space-y-1.5">
                          {activeItem.examples.map((ex, idx) => (
                            <div key={idx} className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 text-xs italic text-gray-600">
                              {ex}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* AI Exercise Area */}
            <div className="lg:col-span-7 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              {generating ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-pulse">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-gray-400 font-bold">AI is generating customized fill-in-the-blank practice exercises...</p>
                </div>
              ) : showFinished ? (
                <div className="text-center py-12 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
                    <Award size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Practice Completed!</h3>
                    <p className="text-xs text-gray-500 font-semibold mt-1">
                      You correctly answered {score} out of {exercises.length} questions.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveItem(null);
                      setActiveItemType(null);
                    }}
                    className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-50 transition-all shadow-sm"
                  >
                    Return to Directory
                  </button>
                </div>
              ) : exercises.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">
                      Exercise {currentIdx + 1} of {exercises.length}
                    </span>
                    <div className="flex gap-1">
                      {exercises.map((_, i) => (
                        <div
                           key={i}
                           className={`w-2 h-2 rounded-full ${
                            i === currentIdx
                              ? 'bg-primary'
                              : i < currentIdx
                              ? 'bg-success'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                      Fill in the blank with the correct conjugate form:
                    </h3>

                    {/* Sentence displaying input box in place of '___' */}
                    <div className="text-lg md:text-xl font-bold leading-loose text-gray-900 mb-6 flex flex-wrap items-center gap-2">
                      {cleanedSentence.split('___').map((segment, idx) => (
                        <span key={idx} className="flex items-center gap-2">
                          {segment}
                          {idx === 0 && (
                            <input
                              type="text"
                              value={userInput}
                              disabled={checked}
                              onChange={(e) => setUserInput(e.target.value)}
                              placeholder="Type answer..."
                              className="px-2 py-0.5 border-b-2 border-gray-300 focus:border-primary outline-none bg-transparent font-bold text-primary max-w-[150px] text-center"
                            />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                    {!checked ? (
                      <button
                        onClick={handleCheckAnswer}
                        className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-50 transition-all shadow-sm"
                      >
                        Check Answer
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-dark transition-all flex items-center gap-1 shadow-sm"
                      >
                        Next <ArrowRight size={14} />
                      </button>
                    )}

                    <button
                      onClick={() => speakSentence(cleanedSentence, exercises[currentIdx].answer)}
                      className="p-2.5 bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all"
                      title="Speak full sentence"
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>

                  {checked && (
                    <div className={`p-4 rounded-2xl flex gap-3 border ${
                      isCorrect 
                        ? 'bg-success/10 text-success border-success/20 animate-fade-in' 
                        : 'bg-danger/10 text-danger border-danger/20 animate-fade-in'
                    }`}>
                      {isCorrect ? <CheckCircle className="shrink-0 text-success" size={18} /> : <AlertCircle className="shrink-0 text-danger" size={18} />}
                      <div className="text-xs">
                        <p className="font-bold">{isCorrect ? 'Excellent!' : 'Incorrect conjugate form.'}</p>
                        <p className="font-semibold text-gray-700 mt-1">
                          Correct Response: <span className="font-bold text-primary">{exercises[currentIdx].answer}</span>
                        </p>
                        <p className="font-medium text-gray-500 mt-1 flex items-center gap-1">
                          <Info size={11} className="shrink-0" /> {exercises[currentIdx].explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 italic">
                  Could not load exercises. Let's restart.
                </div>
              )}
            </div>
          </section>
        )}
        {/* Section 1: List of Tenses Card Directory */}
        {!activeItem && activeSection === 'tenses' && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {tenses.map((tense) => {
              const status = getPracticeStatus(tense.last_practiced_at);
              const isComplete = status === 'complete';

              return (
                <div
                  key={tense.id}
                  className={`bg-white border rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 ${
                    isComplete
                      ? 'border-success/30 bg-success/[0.02]'
                      : 'border-gray-100'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      {isComplete ? (
                        <span className="text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-lg font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 size={12} /> Complete
                        </span>
                      ) : (
                        <span className="text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg font-bold text-[9px] uppercase tracking-wider">
                          Practice
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        {tense.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-semibold mt-1 line-clamp-2 leading-relaxed">
                        {tense.explanation}
                      </p>
                    </div>

                    {tense.formula && (
                      <code className="font-mono text-[10px] text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg block w-max">
                        {tense.formula}
                      </code>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartPractice(tense, 'tense')}
                    className="mt-6 w-full py-3 rounded-xl border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                  >
                    <Play size={12} /> Start Practice
                  </button>
                </div>
              );
            })}
          </section>
        )}

        {/* Section 2: List of Modal Verbs Directory */}
        {!activeItem && activeSection === 'modals' && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {modals.map((modal) => {
              const status = getPracticeStatus(modal.last_practiced_at);
              const isComplete = status === 'complete';

              return (
                <div
                  key={modal.id}
                  className={`bg-white border rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 ${
                    isComplete
                      ? 'border-success/30 bg-success/[0.02]'
                      : 'border-gray-100'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      {isComplete ? (
                        <span className="text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-lg font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 size={12} /> Complete
                        </span>
                      ) : (
                        <span className="text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg font-bold text-[9px] uppercase tracking-wider">
                          Practice
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-lg font-black">{modal.name}</span>
                      </h3>
                      
                      {modal.urdu_explanation && (
                        <p className="text-right text-base font-semibold text-primary font-urdu mt-1" dir="rtl">
                          {modal.urdu_explanation}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500 font-semibold mt-2 line-clamp-2 leading-relaxed">
                        Usage: {modal.usage}
                      </p>
                    </div>

                    {modal.positive_form && (
                      <div className="space-y-1">
                        <span className="text-[9px] text-gray-500 font-bold uppercase block">Pattern positive:</span>
                        <code className="font-mono text-[10px] text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg block w-max max-w-full truncate">
                          {modal.positive_form}
                        </code>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartPractice(modal, 'modal')}
                    className="mt-6 w-full py-3 rounded-xl border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                  >
                    <Play size={12} /> Start Practice
                  </button>
                </div>
              );
            })}
          </section>
        )}

        {/* Section 3: List of Grammar Topics Directory */}
        {!activeItem && activeSection === 'grammar' && (
          <div className="space-y-6 animate-fade-in">
            {/* Category Sub-Tabs */}
            <div className="flex flex-wrap gap-2 stagger-up">
              {categoriesList.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl font-bold text-[11px] capitalize transition-all border ${
                    activeCategory === cat
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white text-gray-600 border-gray-250 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Topics Cards Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGrammar.map((lesson) => {
                const status = getPracticeStatus(lesson.last_practiced_at);
                const isComplete = status === 'complete';

                // Category styling badges
                let badgeStyle = 'bg-blue-50 text-blue-600 border-blue-100';
                const cat = lesson.category?.toLowerCase() || '';
                if (cat === 'speech') badgeStyle = 'bg-purple-50 text-purple-600 border-purple-100';
                else if (cat === 'articles') badgeStyle = 'bg-green-50 text-green-600 border-green-100';
                else if (cat === 'conditionals') badgeStyle = 'bg-orange-50 text-orange-650 border-orange-100';
                else if (cat === 'comparison') badgeStyle = 'bg-pink-50 text-pink-655 border-pink-100';
                else if (cat === 'prepositions') badgeStyle = 'bg-yellow-50 text-yellow-700 border-yellow-100';

                return (
                  <div
                    key={lesson.id}
                    className={`bg-white border rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 ${
                      isComplete
                        ? 'border-success/30 bg-success/[0.02]'
                        : 'border-gray-100'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-lg border ${badgeStyle}`}>
                          {lesson.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isComplete ? (
                            <span className="text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-lg font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 size={12} /> Complete
                            </span>
                          ) : (
                            <span className="text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg font-bold text-[9px] uppercase tracking-wider">
                              Practice
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-gray-900 leading-snug">
                          {lesson.name}
                        </h3>

                        {lesson.urdu_explanation && (
                          <p className="text-right text-base font-semibold text-primary font-urdu mt-1" dir="rtl">
                            {lesson.urdu_explanation}
                          </p>
                        )}
                      </div>

                      {lesson.rules && Array.isArray(lesson.rules) && lesson.rules.length > 0 && (
                        <div className="text-[11px] text-gray-500 font-semibold space-y-1">
                          <span className="text-[9px] uppercase text-primary font-bold block">Key Rule:</span>
                          <p className="line-clamp-2">{lesson.rules[0]}</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleStartPractice(lesson, 'grammar')}
                      className="mt-6 w-full py-3 rounded-xl border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md"
                    >
                      <Play size={12} /> Start Practice
                    </button>
                  </div>
                );
              })}
            </section>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
