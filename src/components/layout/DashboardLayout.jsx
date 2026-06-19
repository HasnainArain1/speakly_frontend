/**
 * Main sidebar layout component.
 * Used by all authenticated pages (student, teacher, owner, admin).
 * Matches the premium design with dark sidebar + dotted background.
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Mic, BookOpen, TrendingUp, Trophy,
  BookText, Settings, HelpCircle, LogOut, GraduationCap,
  Users, ClipboardList, Building2, Shield,
  Menu, X, Flame
} from 'lucide-react';
import { useState } from 'react';

const studentNav = [
  { to: '/student/home', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/tenses', icon: BookText, label: 'Grammar Lessons' },
  { to: '/student/voice', icon: Mic, label: 'Practice Arena' },
  { to: '/student/vocabulary', icon: BookOpen, label: 'Vocabulary' },
  { to: '/student/quiz', icon: GraduationCap, label: 'Grammar Quiz' },
  { to: '/student/progress', icon: TrendingUp, label: 'Progress Hub' },
  { to: '/student/leaderboard', icon: Trophy, label: 'Leaderboard' },
];

const teacherNav = [
  { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/teacher/students', icon: Users, label: 'Students' },
  { to: '/teacher/assignments', icon: ClipboardList, label: 'Assignments' },
];

const ownerNav = [
  { to: '/owner/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/owner/students', icon: Users, label: 'Manage Students' },
  { to: '/owner/teachers', icon: GraduationCap, label: 'Manage Teachers' },
];

const adminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/organizations', icon: Building2, label: 'Organizations' },
  { to: '/admin/users', icon: Users, label: 'All Users' },
];

function getNavItems(role) {
  switch (role) {
    case 'student':     return studentNav;
    case 'teacher':     return teacherNav;
    case 'owner':       return ownerNav;
    case 'super_admin': return adminNav;
    default:            return [];
  }
}

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = getNavItems(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen ${user?.role === 'student' ? 'bg-page text-gray-900' : 'dot-bg bg-background'}`}>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-[60] lg:hidden p-2 bg-sidebar-bg rounded-xl text-white shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full w-sidebar-width bg-sidebar-bg shadow-2xl z-50
        flex flex-col p-6 overflow-y-auto
        transition-transform duration-300
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="mb-10">
          <h1 className="text-headline-md text-white tracking-tight font-extrabold">
            Speakly
          </h1>
          <p className="text-sidebar-text text-body-md opacity-70">Grammar Tutor</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-grow">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              <Icon size={20} />
              <span className="text-body-md">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="mt-auto space-y-4 pt-6 border-t border-white/10">
          {/* User info */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              {user?.first_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate">
                {user?.first_name} {user?.last_name || ''}
              </p>
              <p className="text-sidebar-text text-xs capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="sidebar-link sidebar-link-inactive w-full text-left"
          >
            <LogOut size={18} />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-sidebar-width min-h-screen">
        {/* Top Header Bar */}
        <header className={`h-16 flex justify-between items-center px-gutter sticky top-0 z-30 backdrop-blur-md border-b ${user?.role === 'student' ? 'bg-white/80 border-gray-200 text-gray-900' : 'bg-surface/80 border-outline-variant/10 text-on-surface'}`}>
          <div className="flex-1 max-w-xl pl-12 lg:pl-0">
            <div className="relative">
              <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${user?.role === 'student' ? 'text-gray-400' : 'text-outline'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className={`w-full h-11 border rounded-full pl-12 pr-4 focus:ring-2 focus:ring-primary/20 text-body-md transition-all outline-none ${user?.role === 'student' ? 'bg-white border-gray-250 text-gray-900 placeholder-gray-450' : 'bg-surface-container-low border-none text-on-surface'}`}
                placeholder="Search lessons, vocabulary, or rules..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user?.role === 'student' && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-warning/10 text-warning rounded-full font-bold text-sm">
                <Flame size={16} />
                <span>Streak: {user?.current_streak || 0}</span>
              </div>
            )}
            <div className={`flex items-center gap-3 pl-4 border-l ${user?.role === 'student' ? 'border-gray-200' : 'border-outline-variant/30'}`}>
              <div className="text-right hidden sm:block">
                <p className={`font-bold text-sm ${user?.role === 'student' ? 'text-gray-900' : 'text-on-background'}`}>{user?.first_name}</p>
                <p className={`text-xs capitalize ${user?.role === 'student' ? 'text-gray-500' : 'text-on-surface-variant'}`}>
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold ring-2 ring-primary/20">
                {user?.first_name?.[0]?.toUpperCase() || '?'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="max-w-[1200px] mx-auto px-gutter py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
