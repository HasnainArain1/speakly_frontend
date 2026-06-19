import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleRoute } from './components/guards/RouteGuards';
import { Toaster } from 'react-hot-toast';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student Pages
import StudentHome from './pages/student/StudentHome';
import VoiceAgent from './pages/student/VoiceAgent';
import Tenses from './pages/student/Tenses';
import Vocabulary from './pages/student/Vocabulary';
import Quiz from './pages/student/Quiz';
import Leaderboard from './pages/student/Leaderboard';
import Progress from './pages/student/Progress';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';

// Owner Pages
import OwnerDashboard from './pages/owner/Dashboard';

// Super Admin Pages
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Protected Routes */}
          <Route
            path="/student/home"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['student']}>
                  <StudentHome />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/voice"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['student']}>
                  <VoiceAgent />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/tenses"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['student']}>
                  <Tenses />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/vocabulary"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['student']}>
                  <Vocabulary />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/quiz"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['student']}>
                  <Quiz />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/leaderboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['student']}>
                  <Leaderboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/progress"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['student']}>
                  <Progress />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Teacher Protected Routes */}
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Owner Protected Routes */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['owner']}>
                  <OwnerDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Super Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin', 'super_admin']}>
                  <AdminDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Fallback to Login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;