/**
 * Registration page — matches the login design with registration form.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { BookOpen, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    role: 'student',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.first_name) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name || null,
        role: formData.role,
      });
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-lavender flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-highest/30 to-transparent pointer-events-none" />

      <div className="w-full max-w-lg bg-white rounded-[32px] shadow-card p-10 z-10 animate-slide-up">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mesh-gradient flex items-center justify-center shadow-lg mb-6">
            <UserPlus className="text-white" size={32} />
          </div>
          <h3 className="text-headline-lg text-on-surface mb-2">Create Account</h3>
          <p className="text-on-surface-variant text-body-md">Start your English mastery journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-label-caps text-on-surface-variant ml-1">FIRST NAME *</label>
              <input
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Ahmed"
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 outline-none transition-all text-body-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-label-caps text-on-surface-variant ml-1">LAST NAME</label>
              <input
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Khan"
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 outline-none transition-all text-body-md"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-label-caps text-on-surface-variant ml-1">EMAIL ADDRESS *</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 outline-none transition-all text-body-md"
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-caps text-on-surface-variant ml-1">I AM A</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 outline-none transition-all text-body-md bg-white"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="owner">Coaching Center Owner</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-label-caps text-on-surface-variant ml-1">PASSWORD *</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 outline-none transition-all text-body-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-label-caps text-on-surface-variant ml-1">CONFIRM *</label>
              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 outline-none transition-all text-body-md"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl mesh-gradient text-white font-bold text-lg hover:scale-[1.02] hover:shadow-xl active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-on-surface-variant text-body-md">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
