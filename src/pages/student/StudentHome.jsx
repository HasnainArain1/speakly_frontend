/**
 * Student Home Page — bento grid dashboard with stats, feature cards, progress chart.
 * Wrapped in DashboardLayout.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentAPI, vocabularyAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { 
  Mic, BookText, BookOpen, GraduationCap, Trophy, 
  ArrowRight, Flame, Sparkles, LogOut, Play, Compass, Award, Target, BarChart3,
  ClipboardList, CheckCircle2, X
} from 'lucide-react';

export default function StudentHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [wordOfDay, setWordOfDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [homeRes, wodRes] = await Promise.allSettled([
        studentAPI.getHome(),
        vocabularyAPI.getWordOfDay(),
      ]);
      if (homeRes.status === 'fulfilled') setStats(homeRes.value.data);
      if (wodRes.status === 'fulfilled') setWordOfDay(wodRes.value.data);
    } catch (err) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submissionText.trim()) {
      toast.error('Please type your solution before submitting');
      return;
    }
    setSubmitting(true);
    try {
      await studentAPI.submitAssignment(activeAssignment.id, 100, submissionText.trim());
      toast.success('Assignment submitted successfully! Points added!');
      setSubmissionText('');
      setActiveAssignment(null);
      loadDashboard();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
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

  const s = stats?.stats || {};
  const assignments = stats?.assignments || [];
  const submissions = stats?.submissions || [];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in text-gray-900">
        
        {/* Top Header Row for Student Dashboard */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Welcome back, <span className="text-primary font-extrabold">{user?.first_name || 'Student'}</span>!
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Let's build your English speaking skills with our AI features.
          </p>
        </div>

        {/* Hero Banner Section */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 text-gray-900 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider rounded-lg">
                ✦ AI English Coach
              </span>
              
              <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-gray-900">
                {s.current_streak > 0
                  ? <>You're on a {s.current_streak}-day practice streak!</>
                  : <>Start your speaking practice today! ✦</>
                }
              </h2>
              
              <p className="text-gray-500 text-xs sm:text-sm font-medium leading-relaxed">
                Connect with our interactive real-time AI Voice Agent. Practice conversations, get instant grammar analysis, and level up.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => navigate('/student/voice')}
                  className="bg-primary text-white hover:bg-primary-dark px-6 py-3 rounded-xl font-bold text-xs shadow-lg transition-transform active:scale-98"
                >
                  Launch Practice Arena
                </button>
                <button
                  onClick={() => navigate('/student/progress')}
                  className="bg-white text-gray-700 px-6 py-3 rounded-xl font-bold text-xs border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  View My Metrics
                </button>
              </div>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F3F4F6" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40" fill="transparent"
                  stroke="#4F46E5" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - Math.min((s.total_sessions || 0) / 5, 1))}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{Math.min(s.total_sessions || 0, 5)}/5</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sessions</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid (Bento Style) — Unified Light Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* AI Voice Practice */}
          <div
            onClick={() => navigate('/student/voice')}
            className="group relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300 cursor-pointer overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                <Mic size={20} className="group-hover:animate-pulse" />
              </div>
              <span className="px-2.5 py-1 bg-success/10 text-success text-[10px] font-bold uppercase rounded-lg">
                Voice Agent Active
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors">
              AI Voice Practice Arena
            </h3>
            <p className="text-xs text-gray-500 font-semibold mt-1 leading-relaxed">
              Real-time speaking conversation with an interactive English tutor. Get immediate pronunciation, fluency, and grammar diagnostics.
            </p>
            <div className="flex items-center gap-1.5 text-primary font-bold text-[11px] mt-6 group-hover:translate-x-1.5 transition-transform">
              Start Practice Session <ArrowRight size={13} />
            </div>
          </div>

          {/* Tenses Masterclass */}
          <div
            onClick={() => navigate('/student/tenses')}
            className="group relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300 cursor-pointer overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                <BookText size={20} />
              </div>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-lg">
                12 Tenses Master
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors">
              Tenses Masterclass
            </h3>
            <p className="text-xs text-gray-500 font-semibold mt-1 leading-relaxed">
              Unlock the foundational rules of English. Practice conjugated verb forms for past, present, and future simple, continuous, and perfect structures.
            </p>
            <div className="flex items-center gap-1.5 text-primary font-bold text-[11px] mt-6 group-hover:translate-x-1.5 transition-transform">
              Learn & Practice Tenses <ArrowRight size={13} />
            </div>
          </div>

          {/* Vocabulary Builder */}
          <div
            onClick={() => navigate('/student/vocabulary')}
            className="group relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300 cursor-pointer overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                <BookOpen size={20} />
              </div>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-lg">
                {s.words_learned || 0} Learned
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors">
              Vocabulary Builder
            </h3>
            <p className="text-xs text-gray-500 font-semibold mt-1 leading-relaxed">
              Expand your lexicon with contextual daily word suggestions, Urdu explanations, synonyms, and AI sentences.
            </p>
            <div className="flex items-center gap-1.5 text-primary font-bold text-[11px] mt-6 group-hover:translate-x-1.5 transition-transform">
              Browse Vocab List <ArrowRight size={13} />
            </div>
          </div>

          {/* Grammar Quiz */}
          <div
            onClick={() => navigate('/student/quiz')}
            className="group relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300 cursor-pointer overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                <GraduationCap size={20} />
              </div>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-lg">
                AI Quiz Engine
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors">
              Grammar Quiz Hub
            </h3>
            <p className="text-xs text-gray-500 font-semibold mt-1 leading-relaxed">
              Challenge yourself with customized multiple-choice questions dynamically generated by AI based on selected difficulty settings.
            </p>
            <div className="flex items-center gap-1.5 text-primary font-bold text-[11px] mt-6 group-hover:translate-x-1.5 transition-transform">
              Generate New Quiz <ArrowRight size={13} />
            </div>
          </div>

          {/* Assignments from Teachers */}
          {assignments.length > 0 && (() => {
            const pendingCount = assignments.filter(assignment => {
              const submission = submissions.find(sub => sub.assignment_id === assignment.id);
              return !submission;
            }).length;
            return (
              <div
                onClick={() => setShowAssignmentsModal(true)}
                className="group relative bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300 cursor-pointer overflow-hidden md:col-span-2"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                    <ClipboardList size={20} />
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg ${
                    pendingCount > 0 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {pendingCount > 0 ? `${pendingCount} Pending` : 'All Completed'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors">
                  Assignments from Teachers
                </h3>
                <p className="text-xs text-gray-500 font-semibold mt-1 leading-relaxed">
                  Complete practice lessons, writing prompts, and tasks assigned to you by your coaching center teachers.
                </p>
                <div className="flex items-center gap-1.5 text-primary font-bold text-[11px] mt-6 group-hover:translate-x-1.5 transition-transform">
                  View Assignments <ArrowRight size={13} />
                </div>
              </div>
            );
          })()}

        </section>

        {/* Word of the Day Section */}
        {wordOfDay && (
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Award className="text-primary" size={18} />
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Word of the Day</h3>
            </div>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-3">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-xl font-bold text-primary">{wordOfDay.vocabulary?.word}</span>
                {wordOfDay.vocabulary?.urdu_meaning && (
                  <span className="text-xs text-gray-500 font-bold font-urdu">
                    (Urdu: {wordOfDay.vocabulary.urdu_meaning})
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-700 font-semibold leading-relaxed">
                Meaning: {wordOfDay.vocabulary?.meaning}
              </p>
              {wordOfDay.vocabulary?.example_sentence && (
                <div className="bg-white border border-gray-100 p-3 rounded-lg">
                  <p className="text-xs text-primary font-bold italic leading-relaxed">
                    "{wordOfDay.vocabulary.example_sentence}"
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Bottom Quick Links / Goal Cards — Unified Light */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div
            onClick={() => navigate('/student/leaderboard')}
            className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Trophy className="text-primary" size={16} /> Leaderboard
            </h4>
            <p className="text-xs text-gray-500 mt-2 font-medium">Compare your XP ranking with peers in your organization.</p>
            <div className="text-[11px] font-bold text-primary mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              View Rankings <ArrowRight size={12} />
            </div>
          </div>

          <div
            onClick={() => navigate('/student/progress')}
            className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <BarChart3 className="text-primary" size={16} /> Progress Analytics
            </h4>
            <p className="text-xs text-gray-500 mt-2 font-medium">Deep dive into quiz histories, tenses progress, and mistakes.</p>
            <div className="text-[11px] font-bold text-primary mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              View Progress <ArrowRight size={12} />
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <h4 className="text-sm font-bold text-gray-900 relative z-10 flex items-center gap-1.5">
              <Target size={16} className="text-primary" /> Target Daily Goal
            </h4>
            <p className="text-[11px] text-gray-550 mt-1 font-medium relative z-10">Complete 1 voice agent session to earn streak bonus.</p>
            
            <div className="mt-4 flex items-center gap-2 relative z-10">
              <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-700" 
                  style={{ width: `${s.total_sessions > 0 ? 100 : 0}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-gray-750 shrink-0">{s.total_sessions > 0 ? '1/1' : '0/1'}</span>
            </div>
          </div>
        </section>

      </div>

      {/* Assignments List Modal */}
      {showAssignmentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden border border-gray-100 max-h-[85vh] flex flex-col animate-scale-up">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ClipboardList size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Assignments from Teachers</h3>
                  <p className="text-xs text-gray-400 font-medium">Complete these to practice your lessons and earn points.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignmentsModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-grow bg-slate-50/30">
              {assignments.length === 0 ? (
                <div className="text-center py-12 text-gray-400 italic text-sm">
                  No assignments found from your teachers.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {assignments.map((assignment) => {
                    const submission = submissions.find(sub => sub.assignment_id === assignment.id);
                    return (
                      <div 
                        key={assignment.id} 
                        className="border border-gray-100 rounded-xl p-5 flex flex-col sm:flex-row justify-between sm:items-center bg-white hover:shadow-sm transition-all gap-4"
                      >
                        <div className="space-y-1 max-w-xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-gray-800">{assignment.title}</h4>
                            {submission ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200/50">
                                <CheckCircle2 size={10} /> Completed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                                Pending
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-550 line-clamp-1 leading-relaxed">
                            {assignment.description || 'No description provided.'}
                          </p>
                          <div className="text-[10px] text-gray-400 font-bold uppercase pt-1">
                            Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No deadline'}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {submission ? (
                            <button
                              onClick={() => {
                                setActiveAssignment(assignment);
                                setSubmissionText('');
                              }}
                              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              View Submission
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveAssignment(assignment);
                                setSubmissionText('');
                              }}
                              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
                            >
                              Attempt Now
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4.5 border-t border-gray-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setShowAssignmentsModal(false)}
                className="py-2 px-5 rounded-xl border border-gray-250 text-gray-600 hover:bg-slate-50 font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attempt / Details Assignment Modal */}
      {activeAssignment && (() => {
        const submission = submissions.find(sub => sub.assignment_id === activeAssignment.id);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col animate-scale-up">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Sparkles size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{activeAssignment.title}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">AI Generated Grammar Practice</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveAssignment(null)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-grow">
                {/* Assignment Instructions / Markdown Content */}
                <div className="bg-slate-50/50 border border-gray-100 rounded-xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Instructions & Study Material</h4>
                  <div className="prose prose-sm max-w-none text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                    {activeAssignment.description}
                  </div>
                </div>

                {submission ? (
                  <div className="space-y-4">
                    <div className="bg-green-50/30 border border-green-100 rounded-xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-green-750 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-green-650" /> Submission Confirmed
                      </h4>
                      <div className="text-gray-755 text-sm font-medium leading-relaxed whitespace-pre-wrap bg-white border border-green-100/50 p-4 rounded-lg">
                        {submission.feedback}
                      </div>
                      {submission.score !== null && (
                        <div className="text-xs font-bold text-green-800 pt-1">
                          Score Awarded: {submission.score} Points
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveAssignment(null)}
                        className="py-2.5 px-6 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold text-xs transition-colors"
                      >
                        Close Details
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Submission Form */
                  <form onSubmit={handleSubmitAssignment} className="space-y-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Your Answers / Solution</label>
                      <textarea
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        placeholder="Type your sentences or answers for the tasks here..."
                        rows={5}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveAssignment(null)}
                        className="py-2.5 px-5 rounded-xl border border-gray-200 text-gray-500 hover:bg-slate-50 font-bold text-xs transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={13} /> Submit Assignment
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </DashboardLayout>
  );
}
