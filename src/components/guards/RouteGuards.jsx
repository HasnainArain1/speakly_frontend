/**
 * Route guard components for role-based access control.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Redirects to login if user is not authenticated.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Only allows access if user has one of the specified roles.
 */
export function RoleRoute({ children, roles, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  const targetRoles = roles || allowedRoles || [];

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!targetRoles.includes(user?.role)) {
    // Redirect to user's appropriate dashboard
    return <Navigate to={getRoleHome(user?.role)} replace />;
  }

  return children;
}

/**
 * Redirects authenticated users away from login/register pages.
 */
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return children;
}

/**
 * Get the home route for a given role.
 */
export function getRoleHome(role) {
  switch (role) {
    case 'student':     return '/student/home';
    case 'teacher':     return '/teacher/dashboard';
    case 'owner':       return '/owner/dashboard';
    case 'admin':
    case 'super_admin': return '/admin/dashboard';
    default:            return '/login';
  }
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>Loading Speakly...</p>
    </div>
  );
}
