import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { progressAPI, modalVerbsAPI, grammarLessonsAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { 
  Calendar, Percent, BookOpen, Flame, ArrowUp, AlertCircle, 
  CheckCircle2, Play, Sparkles, Award, ArrowRight, ShieldCheck, XCircle,
  Zap, Layers
} from 'lucide-react';

const CATEGORY_LABELS = {
  voice: 'Active & Passive Voice',
  speech: 'Direct & Indirect Speech',
  articles: 'Articles',
  conditionals: 'Conditionals',
  comparison: 'Comparison',
  prepositions: 'Prepositions',
};

export default function Progress() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [modalProgress, setModalProgress] = useState([]);
  const [grammarProgress, setGrammarProgress] = useState({});
  const [activeGrammarCategory, setActiveGrammarCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const [overviewRes, modalRes, grammarRes] = await Promise.allSettled([
        progressAPI.getOverview(),
        modalVerbsAPI.getProgress(),
        grammarLessonsAPI.getProgress(),
      ]);

      if (overviewRes.status === 'fulfilled') setData(overviewRes.value.data);
      if (modalRes.status === 'fulfilled') setModalProgress(modalRes.value.data);
      if (grammarRes.status === 'fulfilled') {
        const gData = grammarRes.value.data;
        setGrammarProgress(gData);
        // Set initial active category to the first one that has items
        const categories = Object.keys(gData);
        if (categories.length > 0) {
          setActiveGrammarCategory(categories[0]);
        }
      }
    } catch (err) {
      toast.error('Failed to load progress analytics');
    } finally {
      setLoading(false);
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

  // Destructure exact keys returned by the backend ProgressOverview schema
  const {
    total_sessions = 0,
    avg_score = 0,
    words_learned = 0,
    current_streak = 0,
    total_points = 0,
    tense_mastery = [],
    recent_quiz_scores = [],
    recent_voice_sessions = []
  } = data || {};

  // Extract mistakes from the most recent completed voice session's JSON report
  const recentMistakes = [];
  const latestVoiceSession = recent_voice_sessions.find(vs => vs.report !== null);
  if (latestVoiceSession && latestVoiceSession.report && Array.isArray(latestVoiceSession.report.mistakes)) {
    latestVoiceSession.report.mistakes.forEach(m => {
      recentMistakes.push({
        wrong: m.wrong,
        correct: m.correct,
        explanation: m.explanation || 'Review the tense conjugations.',
        topic: latestVoiceSession.topic || 'General'
      });
    });
  }

  // Extract AI recommended focus from the latest voice session report
  const latestVoiceSessionWithGoal = recent_voice_sessions.find(vs => vs.report?.next_session_goal);
  const recommendedFocus = latestVoiceSessionWithGoal?.report?.next_session_goal || 
    "Start a new AI voice conversation in the practice arena to analyze your sentence structure!";

  // Generate dynamic chart points based on actual quiz scores
  const quizScoresData = recent_quiz_scores.slice(0, 5).reverse();
  const hasScores = quizScoresData.length > 0;

  // Grammar category tabs
  const grammarCategories = Object.keys(grammarProgress);
  const activeGrammarLessons = grammarProgress[activeGrammarCategory] || [];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in text-gray-900">
        
        {/* Header */}
        <section className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-gray-150 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">My Progress Hub</h2>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              Comprehensive report of your speaking scores, active streaks, and tenses mastery.
            </p>
          </div>
          <div className="px-4 py-2 bg-white border border-gray-150 rounded-xl text-xs font-bold text-primary shrink-0">
            Total Score: {total_points} XP
          </div>
        </section>

        {/* Metrics Overview Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sessions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center hover:bg-gray-50 transition-all">
            <div className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center mb-4">
              <Calendar size={22} />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Sessions Done</span>
            <span className="text-2xl font-bold text-gray-900">{total_sessions}</span>
            <span className="text-[10px] text-success font-bold mt-2">
              Completed today
            </span>
          </div>

          {/* Average Score */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center hover:bg-gray-50 transition-all">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 border border-purple-100 rounded-2xl flex items-center justify-center mb-4">
              <Percent size={22} />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Avg Tutor Score</span>
            <span className="text-2xl font-bold text-gray-900">{avg_score}%</span>
            <span className="text-[10px] text-success font-bold mt-2">
              Speaking competency
            </span>
          </div>

          {/* Words Learned */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center hover:bg-gray-50 transition-all">
            <div className="w-12 h-12 bg-amber-50 text-amber-655 border border-amber-100 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen size={22} />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Vocabulary words</span>
            <span className="text-2xl font-bold text-gray-900">{words_learned}</span>
            <span className="text-[10px] text-primary font-bold mt-2">
              Learned today
            </span>
          </div>

          {/* Streak */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center hover:bg-gray-50 transition-all">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 border border-orange-100 rounded-2xl flex items-center justify-center mb-4">
              <Flame size={22} />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Active Streak</span>
            <span className="text-2xl font-bold text-gray-900">{current_streak} days</span>
            <span className="text-[10px] text-orange-600 font-bold mt-2">
              Keep it rolling!
            </span>
          </div>
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Quiz Scores Trend */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-gray-900">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Quiz Score Trend</h3>
            
            {hasScores ? (
              <div className="space-y-6">
                <div className="h-44 flex items-end justify-between relative px-2 border-b border-l border-gray-200 pb-1">
                  {/* Render dynamic SVG line for quiz scores */}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                    <path
                      d={quizScoresData.map((qs, idx) => {
                        const x = (idx / (quizScoresData.length - 1)) * 100;
                        // Map score 0-100 to y position (h-44 is 176px, leave margin)
                        const percentage = (qs.score / (qs.total_questions || 5));
                        const y = 160 - percentage * 120;
                        return `${idx === 0 ? 'M' : 'L'} ${x}%,${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#4F46E5"
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  
                  {quizScoresData.map((qs, idx) => {
                    const percentage = (qs.score / (qs.total_questions || 5)) * 100;
                    return (
                      <div key={qs.id} className="flex flex-col items-center z-10" style={{ width: `${100 / quizScoresData.length}%` }}>
                        <span className="text-[10px] font-extrabold text-primary bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded-md mb-2">
                          {Math.round(percentage)}%
                        </span>
                        <div className="w-2.5 h-2.5 bg-primary rounded-full border-2 border-white shadow-sm" />
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-between text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                  {quizScoresData.map((qs, idx) => (
                    <span key={qs.id}>Quiz {idx + 1}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center border border-dashed border-gray-200 rounded-2xl">
                <p className="text-xs text-gray-500 italic font-medium">No quiz scores recorded yet. Launch a quiz to see trends!</p>
              </div>
            )}
          </div>

          {/* Grammar Mastery progress */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-gray-900">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Tenses Mastery Overview</h3>
            
            {tense_mastery.length === 0 ? (
              <div className="h-44 flex items-center justify-center border border-dashed border-gray-200 rounded-2xl">
                <p className="text-xs text-gray-500 italic font-medium">Start grammar lessons to track tense masteries!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[176px] overflow-y-auto pr-1">
                {tense_mastery.map((tm) => (
                  <div key={tm.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>{tm.tense?.name || 'Unknown Tense'}</span>
                      <span className="text-primary">{tm.mastery_percent}% Mastery</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 border border-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${tm.mastery_percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Modal Verbs Mastery Section */}
        <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-gray-900">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={18} className="text-primary" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Modal Verbs Mastery</h3>
          </div>

          {modalProgress.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <p className="text-xs text-gray-500 italic font-medium">No modal verb progress yet. Practice modal verbs to track your mastery!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {modalProgress.map((mv) => (
                <div key={mv.id} className="space-y-2 p-4 bg-gray-50 border border-gray-150 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-800 capitalize">{mv.name}</span>
                    <div className="flex items-center gap-1.5">
                      {mv.is_completed && (
                        <CheckCircle2 size={14} className="text-success" />
                      )}
                      <span className="text-xs font-bold text-primary">{mv.mastery_percent}%</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        mv.mastery_percent >= 70 ? 'bg-success' : 
                        mv.mastery_percent >= 40 ? 'bg-warning' : 'bg-primary'
                      }`}
                      style={{ width: `${mv.mastery_percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Grammar Topics Mastery Section */}
        <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-gray-900">
          <div className="flex items-center gap-2 mb-6">
            <Layers size={18} className="text-purple-600" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Grammar Topics Mastery</h3>
          </div>

          {grammarCategories.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <p className="text-xs text-gray-500 italic font-medium">No grammar progress yet. Practice grammar lessons to track your mastery!</p>
            </div>
          ) : (
            <>
              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {grammarCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveGrammarCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeGrammarCategory === cat 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'bg-gray-50 border border-gray-200 text-gray-650 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>

              {/* Lessons for Active Category */}
              {activeGrammarLessons.length === 0 ? (
                <div className="py-6 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <p className="text-xs text-gray-500 italic font-medium">No lessons in this category yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeGrammarLessons.map((lesson) => (
                    <div key={lesson.id} className="space-y-1 p-4 bg-gray-50 border border-gray-150 rounded-xl">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-800">{lesson.name}</span>
                        <div className="flex items-center gap-1.5">
                          {lesson.is_completed && (
                            <CheckCircle2 size={14} className="text-success" />
                          )}
                          <span className="text-xs font-bold text-primary">{lesson.mastery_percent}% Mastery</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            lesson.mastery_percent >= 70 ? 'bg-success' : 
                            lesson.mastery_percent >= 40 ? 'bg-warning' : 'bg-primary'
                          }`}
                          style={{ width: `${lesson.mastery_percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* Mistakes Logs & Guidance */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Recent Mistakes List */}
          <div className="lg:col-span-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6 text-gray-900">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Grammatical Mistakes from Latest Session</h3>
            
            {recentMistakes.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <p className="text-xs text-gray-500 italic font-medium">No mistakes logged in your latest voice session! Great job!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentMistakes.map((m, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 border border-gray-150 rounded-xl space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md uppercase text-[9px]">
                        {m.topic}
                      </span>
                      <span className="text-danger line-through">Wrong: "{m.wrong}"</span>
                      <span className="text-success">Correct: "{m.correct}"</span>
                    </div>
                    <p className="text-xs text-gray-650 leading-relaxed">
                      Reason: {m.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Focus Box */}
          <div className="lg:col-span-4 bg-primary text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[70px] pointer-events-none" />
            
            <div className="relative z-10 space-y-4">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} /> AI Recommendation
              </h4>
              <p className="text-white/90 text-xs font-semibold leading-relaxed">
                {recommendedFocus}
              </p>
            </div>

            <button
              onClick={() => navigate('/student/voice')}
              className="mt-8 w-full py-3 bg-white hover:bg-white/90 text-primary font-bold text-xs rounded-xl shadow-sm transition-transform active:scale-98 flex items-center justify-center gap-1.5 z-10"
            >
              <Play size={14} /> Start Voice Session
            </button>
          </div>

        </section>

      </div>
    </DashboardLayout>
  );
}
