import { useState, useEffect } from 'react';
import { ownerAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Users, Mail, PlusCircle, Trash2, Shield, UserCheck,
  Award, Star, X, Search, Calendar, Flame, Layers,
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight
} from 'lucide-react';

export default function OwnerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [registeredTeachers, setRegisteredTeachers] = useState([]);
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Whitelist management tab ('students' | 'teachers')
  const [whitelistTab, setWhitelistTab] = useState('students');

  // Form inputs
  const [studentEmail, setStudentEmail] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
  const [addingTeacher, setAddingTeacher] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashRes, teachRes, studRes, assignRes] = await Promise.all([
        ownerAPI.getDashboard(),
        ownerAPI.getTeachers(),
        ownerAPI.getRegisteredStudents(),
        ownerAPI.getAssignments(),
      ]);
      setDashboardData(dashRes.data);
      setRegisteredTeachers(teachRes.data);
      setRegisteredStudents(studRes.data);
      setAssignments(assignRes.data);
    } catch (err) {
      toast.error('Failed to load owner dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!studentEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    const { organization } = dashboardData;
    if (organization.seats_used >= organization.max_seats) {
      toast.error('Quota limit reached. Please upgrade subscription.');
      return;
    }

    setAddingStudent(true);
    try {
      await ownerAPI.whitelistStudent({ email: studentEmail.trim() });
      toast.success('Student email whitelisted!');
      setStudentEmail('');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add student');
    } finally {
      setAddingStudent(false);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!teacherEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    setAddingTeacher(true);
    try {
      await ownerAPI.whitelistTeacher({ email: teacherEmail.trim() });
      toast.success('Teacher email whitelisted!');
      setTeacherEmail('');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add teacher');
    } finally {
      setAddingTeacher(false);
    }
  };

  const handleRemoveWhitelist = async (email, type) => {
    if (!window.confirm(`Are you sure you want to remove whitelisted ${type} ${email}?`)) {
      return;
    }
    try {
      await ownerAPI.removeStudent(email);
      toast.success('Whitelisted email removed');
      loadData();
    } catch (err) {
      toast.error('Failed to remove whitelisted email');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fafbfe]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fafcfb] p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800">No Organization Linked</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your owner account is not currently linked to any organization. Please contact the administrator or update your user's <code>organization_id</code> in the database.
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const { 
    organization = { name: 'Unknown Organization', plan: 'standard', seats_used: 0, max_seats: 100 }, 
    total_students = 0, 
    total_teachers = 0, 
    students = [], 
    teachers = [] 
  } = dashboardData;
  const seatProgress = Math.min(
    100,
    Math.round((organization.seats_used / organization.max_seats) * 100)
  );

  // Filtered lists for modals
  const filteredStudents = registeredStudents.filter(s =>
    s.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeachers = registeredTeachers.filter(t =>
    t.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafcfb] text-[#1e2229] antialiased">
      {/* Top Navbar */}
      <header className="h-20 flex justify-between items-center px-8 bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-600/30">
            S
          </div>
          <div>
            <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Speakly</span>
            <span className="text-[10px] block font-bold text-gray-400 tracking-wider uppercase">B2B Owner Console</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-bold text-gray-800">{organization.name}</span>
            <span className="text-xs text-gray-400 capitalize">{organization.plan} subscription</span>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            className="px-4 py-2 border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-50 transition-all duration-200"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 animate-fade-in">
        {/* Header Title Row */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 to-indigo-950 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-20 -mr-20 -mt-20 pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Organization Control Panel</h2>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Active
              </span>
            </div>
            <p className="text-indigo-200 text-sm max-w-xl">
              Welcome back. Manage your Whitelists, monitor real-time registered user details, and control your seat usage.
            </p>
          </div>

          {/* Seat Quota Bar */}
          <div className="w-full md:w-80 bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 relative z-10 space-y-3">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-indigo-200">
              <span>Seat Quota</span>
              <span>{seatProgress}% Used</span>
            </div>
            <div className="h-3 w-full bg-indigo-950/50 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-emerald-400 to-indigo-500"
                style={{ width: `${seatProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-indigo-300">
              <span>{organization.seats_used} Used</span>
              <span>{organization.max_seats - organization.seats_used} Seats Left</span>
            </div>
          </div>
        </section>

        {/* Info Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Students Card (Interactive) */}
          <div
            onClick={() => {
              setSearchQuery('');
              setShowStudentModal(true);
            }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Students</span>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <Users size={18} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-800 mt-4">{total_students}</h3>
            <div className="flex items-center gap-1 text-[11px] text-indigo-600 font-bold mt-2">
              <span>View Student Details</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Active Teachers Card (Interactive) */}
          <div
            onClick={() => {
              setSearchQuery('');
              setShowTeacherModal(true);
            }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Teachers</span>
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                <Shield size={18} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-800 mt-4">{total_teachers}</h3>
            <div className="flex items-center gap-1 text-[11px] text-purple-600 font-bold mt-2">
              <span>View Teacher Details</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Current Seats Used */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Seats Reserved</span>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Layers size={18} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-800 mt-4">{organization.seats_used}</h3>
            <p className="text-[11px] text-gray-400 mt-2">Limit: {organization.max_seats} seats total</p>
          </div>

          {/* Subscription Tier */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pricing Plan</span>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <Sparkles size={18} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mt-4 capitalize">{organization.plan}</h3>
            <p className="text-[11px] text-emerald-600 font-bold mt-3 flex items-center gap-1">
              <CheckCircle2 size={12} /> Active Subscription
            </p>
          </div>
        </section>

        {/* Dual Tab Whitelist Interface */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Email Whitelist Whitelist Control</h3>
              <p className="text-xs text-gray-400 mt-0.5">Control who can register under your organization plan.</p>
            </div>

            {/* Tab Selection buttons */}
            <div className="flex p-1 bg-gray-200/60 rounded-xl shrink-0">
              <button
                onClick={() => setWhitelistTab('students')}
                className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase transition-all ${whitelistTab === 'students'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Students Whitelist
              </button>
              <button
                onClick={() => setWhitelistTab('teachers')}
                className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase transition-all ${whitelistTab === 'teachers'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Teachers Whitelist
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Whitelist Table List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/70 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      <th className="px-6 py-4">Whitelisted Email</th>
                      <th className="px-6 py-4">Account Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm font-medium">
                    {whitelistTab === 'students' ? (
                      students.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="text-center text-gray-400 py-12 italic">
                            No students whitelisted yet. Enter an email on the right to start.
                          </td>
                        </tr>
                      ) : (
                        students.map((stud) => (
                          <tr key={stud.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-800">{stud.email}</td>
                            <td className="px-6 py-4">
                              {stud.is_active ? (
                                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-100/50">
                                  Pending Register
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100/50">
                                  Registered
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleRemoveWhitelist(stud.email, 'student')}
                                className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )
                    ) : (
                      teachers.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="text-center text-gray-400 py-12 italic">
                            No teachers whitelisted yet. Enter an email on the right to start.
                          </td>
                        </tr>
                      ) : (
                        teachers.map((teach) => (
                          <tr key={teach.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-800">{teach.email}</td>
                            <td className="px-6 py-4">
                              {teach.is_active ? (
                                <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-600 text-xs font-bold border border-purple-100/50">
                                  Pending Register
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100/50">
                                  Registered
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleRemoveWhitelist(teach.email, 'teacher')}
                                className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Input Whitelist Sidebar Forms */}
            <div className="lg:col-span-4 space-y-6">
              {whitelistTab === 'students' ? (
                <div className="bg-indigo-50/40 border border-indigo-100/50 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <PlusCircle size={20} />
                    <h4 className="font-bold">Add Student Whitelist</h4>
                  </div>
                  <p className="text-xs text-indigo-600/80 leading-relaxed">
                    Once added, students can register using this exact email. Adding them reserves 1 seat in your organization.
                  </p>
                  <form onSubmit={handleAddStudent} className="space-y-3">
                    <input
                      type="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="student@coaching.com"
                      className="w-full bg-white rounded-xl px-4 py-3 border border-indigo-200 outline-none text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium"
                    />
                    <button
                      type="submit"
                      disabled={addingStudent}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors flex justify-center items-center gap-1"
                    >
                      {addingStudent ? 'Adding...' : 'Add Student Email'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-purple-50/40 border border-purple-100/50 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-purple-700">
                    <PlusCircle size={20} />
                    <h4 className="font-bold">Add Teacher Whitelist</h4>
                  </div>
                  <p className="text-xs text-purple-600/80 leading-relaxed">
                    Whitelist a teacher email. Whitelisted teachers do not occupy student license seats, and will register directly with full teacher dashboard capabilities.
                  </p>
                  <form onSubmit={handleAddTeacher} className="space-y-3">
                    <input
                      type="email"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      placeholder="teacher@coaching.com"
                      className="w-full bg-white rounded-xl px-4 py-3 border border-purple-200 outline-none text-sm focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all font-medium"
                    />
                    <button
                      type="submit"
                      disabled={addingTeacher}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors flex justify-center items-center gap-1"
                    >
                      {addingTeacher ? 'Adding...' : 'Add Teacher Email'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Assignments Control Section */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-55 flex items-center justify-between bg-gray-50/50">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Teacher Assignments Overview</h3>
              <p className="text-xs text-gray-400 mt-0.5">View and track all student assignments created by teachers in your organization.</p>
            </div>
            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {assignments.length} Total Assignments
            </span>
          </div>

          <div className="p-6">
            {assignments.length === 0 ? (
              <div className="text-center text-gray-400 py-12 italic">
                No assignments have been created by teachers yet.
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/70 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Topic / Description</th>
                      <th className="px-6 py-4">Max Score</th>
                      <th className="px-6 py-4">Due Date</th>
                      <th className="px-6 py-4">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm font-medium">
                    {assignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{assignment.title}</td>
                        <td className="px-6 py-4 text-xs text-gray-500 max-w-md line-clamp-2 mt-1 leading-relaxed">
                          {assignment.description || 'No description.'}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-bold">{assignment.max_score} pts</td>
                        <td className="px-6 py-4 text-slate-600">
                          {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'None'}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {new Date(assignment.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ================= STUDENT DETAIL MODAL ================= */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col relative shadow-2xl overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50/20">
              <div className="flex items-center gap-2">
                <Users className="text-indigo-600" size={22} />
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Registered Students Accounts</h3>
                  <p className="text-xs text-gray-400">Total registered in database: {registeredStudents.length}</p>
                </div>
              </div>
              <button
                onClick={() => setShowStudentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filteredStudents.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-10 italic">No registered students found.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredStudents.map((stud) => (
                    <div
                      key={stud.id}
                      className="p-4 rounded-2xl border border-gray-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800 text-sm">
                          {stud.first_name} {stud.last_name || ''}
                        </h4>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Mail size={12} /> {stud.email}
                        </p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Calendar size={12} /> Registered: {new Date(stud.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-3 items-center shrink-0">
                        {/* Points Badge */}
                        <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 text-xs font-bold flex items-center gap-1">
                          <Award size={14} />
                          <span>{stud.total_points} XP</span>
                        </div>
                        {/* Streak Badge */}
                        <div className="px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-xl text-orange-700 text-xs font-bold flex items-center gap-1">
                          <Flame size={14} />
                          <span>{stud.current_streak} Streak</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TEACHER DETAIL MODAL ================= */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col relative shadow-2xl overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-purple-50/20">
              <div className="flex items-center gap-2">
                <Shield className="text-purple-600" size={22} />
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Registered Teachers Accounts</h3>
                  <p className="text-xs text-gray-400">Total registered in database: {registeredTeachers.length}</p>
                </div>
              </div>
              <button
                onClick={() => setShowTeacherModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search teachers by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                />
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filteredTeachers.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-10 italic">No registered teachers found.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredTeachers.map((teach) => (
                    <div
                      key={teach.id}
                      className="p-4 rounded-2xl border border-gray-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800 text-sm">
                          {teach.first_name} {teach.last_name || ''}
                        </h4>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Mail size={12} /> {teach.email}
                        </p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Calendar size={12} /> Registered: {new Date(teach.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0">
                        <UserCheck size={14} /> Registered Active
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
