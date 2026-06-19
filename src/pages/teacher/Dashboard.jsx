import { useState, useEffect } from 'react';
import { teacherAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Users, Mail, ClipboardList, TrendingUp, Award, 
  UserCheck, ShieldCheck, LogOut, PlusCircle, Calendar, 
  Flame, X, Search, Sparkles, MessageSquare, ArrowRight 
} from 'lucide-react';

export default function TeacherDashboard() {
  const { logout } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('directory');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // New Assignment form state
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDesc, setAssignmentDesc] = useState('');
  const [creationMethod, setCreationMethod] = useState('ai'); // default to 'ai'
  const [assignmentTopic, setAssignmentTopic] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [dashRes, studRes, assignRes, subRes] = await Promise.allSettled([
        teacherAPI.getDashboard(),
        teacherAPI.getStudents(),
        teacherAPI.getAssignments(),
        teacherAPI.getSubmissions(),
      ]);
      if (dashRes.status === 'fulfilled') setDashData(dashRes.value.data);
      if (studRes.status === 'fulfilled') setStudents(studRes.value.data);
      if (assignRes.status === 'fulfilled') setAssignments(assignRes.value.data);
      if (subRes.status === 'fulfilled') setSubmissions(subRes.value.data);
    } catch (err) {
      toast.error('Failed to load teacher dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (creationMethod === 'manual' && !assignmentTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    if (creationMethod === 'ai' && !assignmentTopic.trim()) {
      toast.error('Topic is required');
      return;
    }
    setCreating(true);
    try {
      const payload = creationMethod === 'ai'
        ? { topic: assignmentTopic.trim(), max_score: 100 }
        : { title: assignmentTitle.trim(), description: assignmentDesc.trim(), max_score: 100 };

      await teacherAPI.createAssignment(payload);
      toast.success(creationMethod === 'ai' ? 'AI generated assignment successfully created!' : 'Assignment created!');
      setAssignmentTitle('');
      setAssignmentDesc('');
      setAssignmentTopic('');
      setShowAssignmentForm(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create assignment');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fafbfe]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const d = dashData || {};

  // Filter students based on search query
  const filteredStudents = students.filter(s => 
    s.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafcfb] text-[#1e2229] antialiased">
      {/* Top Navbar */}
      <header className="h-20 flex justify-between items-center px-8 bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-600/30">
            T
          </div>
          <div>
            <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Speakly</span>
            <span className="text-[10px] block font-bold text-gray-400 tracking-wider uppercase">Coaching Teacher Panel</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-55/10 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 animate-fade-in">
        {/* Banner Row */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 to-indigo-950 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-20 -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Teacher Performance Control</h2>
            <p className="text-indigo-200 text-sm max-w-xl">
              Track student XP scores, streaking patterns, generate dynamic grammar assignments, and assess coaching center performance.
            </p>
          </div>
          <button
            onClick={() => setShowAssignmentForm(!showAssignmentForm)}
            className="relative z-10 flex items-center gap-2 bg-white text-indigo-950 hover:bg-indigo-50 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shrink-0"
          >
            <PlusCircle size={18} /> New Assignment
          </button>
        </section>

        {/* KPI Bento Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Users size={26} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Students</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                {d.total_students || 0}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl">
              <ClipboardList size={26} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assignments Created</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                {d.total_assignments || 0}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <TrendingUp size={26} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Averaged Score</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                {d.avg_score || 0}%
              </h3>
            </div>
          </div>
        </section>

        {/* Assignment Creation Form */}
        {showAssignmentForm && (
          <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm animate-fade-in space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Create New Student Assignment</h3>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">Students will see this assignment instantly in their progress dashboard.</p>
              </div>

              {/* Method Selector */}
              <div className="flex gap-1.5 p-1 bg-slate-50 border border-gray-100 rounded-xl w-max self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setCreationMethod('ai')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    creationMethod === 'ai'
                      ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/50'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Sparkles size={12} className={creationMethod === 'ai' ? 'text-indigo-500' : 'text-gray-400'} /> AI Generated
                </button>
                <button
                  type="button"
                  onClick={() => setCreationMethod('manual')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    creationMethod === 'manual'
                      ? 'bg-white text-slate-800 shadow-sm border border-gray-200/50'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <ClipboardList size={12} /> Manual Setup
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              {creationMethod === 'ai' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Select Grammar Topic</label>
                    <select
                      value={assignmentTopic}
                      onChange={(e) => setAssignmentTopic(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-sm font-semibold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                    >
                      <option value="">-- Select a topic --</option>
                      <option value="Present Simple Tense">Present Simple Tense</option>
                      <option value="Past Simple Tense">Past Simple Tense</option>
                      <option value="Present Perfect Tense">Present Perfect Tense</option>
                      <option value="Future Tense Rules">Future Tense Rules</option>
                      <option value="Modal Verbs: Can, Could, May, Might">Modal Verbs: Can, Could, May, Might</option>
                      <option value="Active and Passive Voice">Active and Passive Voice</option>
                      <option value="Direct and Indirect Speech">Direct and Indirect Speech</option>
                      <option value="Prepositions of Time and Place">Prepositions of Time and Place</option>
                      <option value="First Conditional Sentences">First Conditional Sentences</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Or type a custom topic</span>
                    <input
                      type="text"
                      placeholder="e.g. Present Perfect Continuous, Modal Verbs of obligation..."
                      value={assignmentTopic}
                      onChange={(e) => setAssignmentTopic(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-sm font-semibold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Title</label>
                    <input
                      type="text"
                      value={assignmentTitle}
                      onChange={(e) => setAssignmentTitle(e.target.value)}
                      placeholder="e.g., Past Tense Exercises"
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-sm font-semibold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Instructions / Description</label>
                    <textarea
                      value={assignmentDesc}
                      onChange={(e) => setAssignmentDesc(e.target.value)}
                      placeholder="Tell students what to do..."
                      rows={3}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignmentForm(false)}
                  className="py-2.5 px-6 rounded-xl border border-gray-200 text-gray-500 hover:bg-slate-50 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="py-2.5 px-6 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {creating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {creationMethod === 'ai' ? 'Generating with AI...' : 'Creating...'}
                    </>
                  ) : (
                    creationMethod === 'ai' ? 'Generate & Create with AI' : 'Create Assignment'
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Content split grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Students List */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveTab('directory');
                    setSearchQuery('');
                  }}
                  className={`text-base font-bold transition-all px-4 py-2 rounded-xl ${
                    activeTab === 'directory'
                      ? 'text-indigo-650 bg-indigo-50 border border-indigo-100/50'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  Student Directory
                </button>
                <button
                  onClick={() => {
                    setActiveTab('submissions');
                    setSearchQuery('');
                  }}
                  className={`text-base font-bold transition-all px-4 py-2 rounded-xl ${
                    activeTab === 'submissions'
                      ? 'text-indigo-655 bg-indigo-50 border border-indigo-100/50'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  Submissions
                </button>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder={activeTab === 'directory' ? "Search student email or name..." : "Search submissions..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  {activeTab === 'directory' ? (
                    <tr className="bg-gray-50/50 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Points</th>
                      <th className="px-6 py-4">Streak</th>
                      <th className="px-6 py-4">Last Activity</th>
                    </tr>
                  ) : (
                    <tr className="bg-gray-50/50 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Assignment</th>
                      <th className="px-6 py-4">Submitted Response</th>
                      <th className="px-6 py-4">Submitted Date</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm font-medium">
                  {activeTab === 'directory' ? (
                    filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-gray-400 py-12 italic">
                          No students found matching filters.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <tr
                          key={student.id}
                          onClick={() => setSelectedStudent(student)}
                          className={`hover:bg-slate-50/50 cursor-pointer transition-all ${
                            selectedStudent?.id === student.id ? 'bg-indigo-50/20' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <span className="font-extrabold text-slate-800 block">{student.first_name} {student.last_name || ''}</span>
                            <span className="text-xs text-gray-400 font-medium block">{student.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 rounded-lg text-xs">
                              {student.total_points || 0} XP
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-orange-600 bg-orange-50 border border-orange-100/50 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 w-max">
                              <Flame size={12} /> {student.current_streak || 0} days
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-400">
                            {student.last_login
                              ? new Date(student.last_login).toLocaleDateString()
                              : 'Never'}
                          </td>
                        </tr>
                      ))
                    )
                  ) : (
                    (() => {
                      const filteredSubmissions = submissions.filter(sub =>
                        sub.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        sub.student_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        sub.assignment_title?.toLowerCase().includes(searchQuery.toLowerCase())
                      );
                      return filteredSubmissions.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center text-gray-400 py-12 italic">
                            No student submissions found matching filters.
                          </td>
                        </tr>
                      ) : (
                        filteredSubmissions.map((sub) => (
                          <tr
                            key={sub.id}
                            onClick={() => setSelectedSubmission(sub)}
                            className="hover:bg-slate-50/50 cursor-pointer transition-all"
                          >
                            <td className="px-6 py-4">
                              <span className="font-extrabold text-slate-800 block">{sub.student_name}</span>
                              <span className="text-xs text-gray-400 font-medium block">{sub.student_email}</span>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-805">
                              {sub.assignment_title}
                            </td>
                            <td className="px-6 py-4 max-w-xs">
                              <p className="text-xs text-gray-500 truncate mt-0.5 max-w-[200px]">
                                {sub.feedback || 'No response details.'}
                              </p>
                              <span className="text-[10px] text-indigo-600 font-bold block mt-1 hover:underline">Click to view response</span>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-400">
                              {new Date(sub.submitted_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      );
                    })()
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Student Detail Panel */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="text-indigo-600" size={18} /> Student Performance Hub
              </h3>

              {selectedStudent ? (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center pb-4 border-b border-gray-50">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 text-xl font-black shadow-inner">
                      {selectedStudent.first_name ? selectedStudent.first_name.charAt(0) : '?'}
                    </div>
                    <h4 className="font-extrabold text-base text-slate-800">{selectedStudent.first_name} {selectedStudent.last_name}</h4>
                    <p className="text-xs text-gray-400">{selectedStudent.email}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs border border-gray-100">
                      <p className="font-bold text-indigo-600 uppercase tracking-wider text-[9px] mb-1">Learning Metrics</p>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-semibold">Total Points:</span>
                        <span className="font-bold text-slate-800">{selectedStudent.total_points || 0} XP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-semibold">Daily Streak:</span>
                        <span className="font-bold text-orange-600">{selectedStudent.current_streak || 0} days</span>
                      </div>
                    </div>

                    <div className="border border-gray-100 p-4 rounded-2xl space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registration Date</p>
                      <p className="text-sm font-bold text-slate-800">
                        {selectedStudent.created_at ? new Date(selectedStudent.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a
                      href={`mailto:${selectedStudent.email}`}
                      className="block w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-center text-xs transition-colors"
                    >
                      Email Student Profile
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 space-y-3">
                  <Users size={40} className="mx-auto text-gray-300" />
                  <p className="text-xs font-semibold max-w-[200px] mx-auto leading-relaxed">
                    Select a student from the directory to display deep metrics.
                  </p>
                </div>
              )}
            </div>

            {/* Recent Assignments */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Assignments</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {assignments.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No assignments created yet.</p>
                ) : (
                  assignments.slice(0, 8).map((a) => (
                    <div key={a.id} className="flex justify-between items-center text-xs p-3 bg-slate-50/50 hover:bg-slate-50 border border-gray-100/50 rounded-xl transition-all">
                      <div>
                        <p className="font-bold text-slate-800">{a.title}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{new Date(a.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-[9px] font-bold uppercase bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-500">
                        Max: {a.max_score}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedSubmission(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <ClipboardList size={28} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50/50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    Student Assignment Submission
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-805 mt-1">{selectedSubmission.assignment_title}</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-100 text-xs font-semibold">
                <div>
                  <p className="text-[10px] text-gray-450 font-bold uppercase tracking-wider">Student Name</p>
                  <p className="text-slate-800 text-sm font-bold mt-0.5">{selectedSubmission.student_name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-450 font-bold uppercase tracking-wider">Student Email</p>
                  <p className="text-slate-800 text-sm font-bold mt-0.5">{selectedSubmission.student_email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-450 font-bold uppercase tracking-wider">Submitted On</p>
                  <p className="text-slate-800 text-sm font-bold mt-0.5">
                    {new Date(selectedSubmission.submitted_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-455 font-bold uppercase tracking-wider">Assignment Score</p>
                  <p className="text-emerald-600 text-sm font-bold mt-0.5">
                    {selectedSubmission.score !== null ? `${selectedSubmission.score} XP` : 'Pending Score'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-450 uppercase tracking-wider">Submitted Solution Response</h4>
                <div className="bg-slate-50/50 border border-gray-100 rounded-2xl p-5 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-medium">
                  {selectedSubmission.feedback || 'No text submitted.'}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Close View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
