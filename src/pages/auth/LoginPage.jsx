/**
 * Login page — matches the premium landing/login design.
 * Split layout: left mesh gradient hero, right login form.
 * Includes TEMPORARY demo signup panel for MVP testing.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRoleHome } from '../../components/guards/RouteGuards';
import toast from 'react-hot-toast';
import { BookOpen, Mic, TrendingUp, Sparkles, ChevronDown, Rocket } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, demoSignup, demoModeEnabled } = useAuth();
  const navigate = useNavigate();

  // Demo signup state
  const [showDemoSignup, setShowDemoSignup] = useState(false);
  const [demoName, setDemoName] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoPassword, setDemoPassword] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.first_name}!`);
      navigate(getRoleHome(user.role));
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignup = async () => {
    if (!demoName || !demoEmail || !demoPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (demoPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setDemoLoading(true);
    try {
      const user = await demoSignup({
        email: demoEmail,
        password: demoPassword,
        first_name: demoName,
      });
      toast.success(`Welcome to Speakly, ${user.first_name}!`);
      navigate('/student/home');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Something went wrong';
      toast.error(msg);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left Hero Section */}
      <section className="hidden lg:flex lg:w-[55%] mesh-bg flex-col justify-between p-16 relative">
        {/* Mesh orbs */}
        <div className="absolute w-[400px] h-[400px] bg-primary-container rounded-full -top-[100px] -left-[100px] blur-[80px] opacity-40 z-[1]" />
        <div className="absolute w-[350px] h-[350px] bg-secondary rounded-full -bottom-[50px] -right-[50px] blur-[80px] opacity-40 z-[1]" />
        <div className="absolute w-[300px] h-[300px] bg-purple-500 rounded-full top-[40%] left-[30%] blur-[80px] opacity-40 z-[1]" />

        {/* Floating words */}
        <span className="absolute text-4xl top-20 right-20 font-bold text-white opacity-[0.08] pointer-events-none animate-float">Fluency</span>
        <span className="absolute text-3xl bottom-40 left-20 font-bold text-white opacity-[0.08] pointer-events-none animate-float" style={{ animationDelay: '-3s' }}>Grammar</span>
        <span className="absolute text-5xl top-[40%] right-[10%] font-bold text-white opacity-[0.08] pointer-events-none animate-float" style={{ animationDelay: '-5s' }}>Practice</span>

        {/* Logo */}
        <div className="z-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-headline-md text-white flex items-center gap-2 font-extrabold">
            <BookOpen className="text-secondary" size={32} />
            Speakly
          </h1>
        </div>

        {/* Hero text */}
        <div className="z-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-hero-display text-white max-w-xl">
            Speak English.<br />
            Write Better.<br />
            <span className="text-gradient">Learn Faster.</span>
          </h2>

          <div className="mt-12 flex flex-col gap-4 max-w-md">
            <div className="glass-pill p-4 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
                <Mic className="text-white" size={20} />
              </div>
              <div>
                <p className="text-white font-bold text-body-md">AI-Powered Speech Analysis</p>
                <p className="text-sidebar-text text-sm">Perfect your accent with real-time feedback.</p>
              </div>
            </div>
            <div className="glass-pill p-4 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <BookOpen className="text-white" size={20} />
              </div>
              <div>
                <p className="text-white font-bold text-body-md">Contextual Vocabulary</p>
                <p className="text-sidebar-text text-sm">Learn words as they are used in real scenarios.</p>
              </div>
            </div>
            <div className="glass-pill p-4 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-tertiary flex items-center justify-center">
                <TrendingUp className="text-white" size={20} />
              </div>
              <div>
                <p className="text-white font-bold text-body-md">Smart Progress Hub</p>
                <p className="text-sidebar-text text-sm">Visualize your journey to English mastery.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="z-10 animate-slide-up" style={{ animationDelay: '0.5s' }}>
        </div>
      </section>

      {/* Right Login Form */}
      <main className="w-full lg:w-[45%] bg-bg-lavender flex items-center justify-center p-8 relative overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-highest/30 to-transparent pointer-events-none" />

        <div className="w-full max-w-md z-10 flex flex-col gap-6">
          {/* Login Card */}
          <div className="bg-white rounded-[32px] shadow-card p-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Logo */}
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-16 h-16 rounded-2xl mesh-gradient flex items-center justify-center shadow-lg mb-6">
                <BookOpen className="text-white" size={32} />
              </div>
              <h3 className="text-headline-lg text-on-surface mb-2">Speakly</h3>
              <p className="text-on-surface-variant text-body-md">Sign in to continue your learning journey.</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-label-caps text-on-surface-variant ml-1" htmlFor="login-email">
                  EMAIL ADDRESS
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-5 py-4 rounded-xl border border-outline-variant/30 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 outline-none transition-all text-body-md bg-surface-container-lowest"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-label-caps text-on-surface-variant ml-1" htmlFor="login-password">
                    PASSWORD
                  </label>
                </div>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-4 rounded-xl border border-outline-variant/30 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 outline-none transition-all text-body-md bg-surface-container-lowest"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl mesh-gradient text-white font-bold text-lg hover:scale-[1.02] hover:shadow-xl active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="mt-8 text-center text-on-surface-variant text-body-md">
              New to Speakly?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Create account
              </Link>
            </p>

            {/* Mobile logo */}
            <div className="mt-6 text-center lg:hidden">
              <p className="text-on-surface-variant text-label-caps text-[10px]">
                © 2024 Speakly AI Learning
              </p>
            </div>
          </div>

          {/* TEMPORARY — Demo Signup Panel (only shown when DEMO_MODE_ENABLED=true) */}
          {demoModeEnabled && (
            <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
              {/* Prominent Demo CTA Button */}
              {!showDemoSignup && (
                <button
                  onClick={() => setShowDemoSignup(true)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary via-secondary to-tertiary text-white font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] hover:shadow-xl active:scale-95 transition-all duration-200 shadow-lg"
                >
                  <Rocket size={20} />
                  Try Free Demo
                </button>
              )}

              {/* Expanded Demo Form */}
              <div
                className={`overflow-hidden transition-all duration-400 ease-in-out ${
                  showDemoSignup ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="bg-white rounded-[32px] shadow-card p-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Sparkles className="text-white" size={18} />
                      </div>
                      <div>
                        <h4 className="text-on-surface font-bold text-body-lg">Try Speakly Demo</h4>
                        <p className="text-on-surface-variant text-body-md">
                          Explore all features for free
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDemoSignup(false)}
                      className="text-on-surface-variant hover:text-on-surface transition-colors text-xl leading-none px-2 py-1 rounded-lg hover:bg-surface-container-highest/50"
                      aria-label="Close demo signup"
                    >
                      ×
                    </button>
                  </div>

                  {/* Demo Form Fields */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-label-caps text-on-surface-variant ml-1" htmlFor="demo-name">
                        YOUR NAME
                      </label>
                      <input
                        id="demo-name"
                        type="text"
                        value={demoName}
                        onChange={(e) => setDemoName(e.target.value)}
                        placeholder="Ahmed Khan"
                        className="w-full px-5 py-4 rounded-xl border border-outline-variant/30 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 outline-none transition-all text-body-md bg-surface-container-lowest"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-label-caps text-on-surface-variant ml-1" htmlFor="demo-email">
                        EMAIL ADDRESS
                      </label>
                      <input
                        id="demo-email"
                        type="email"
                        value={demoEmail}
                        onChange={(e) => setDemoEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-5 py-4 rounded-xl border border-outline-variant/30 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 outline-none transition-all text-body-md bg-surface-container-lowest"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-label-caps text-on-surface-variant ml-1" htmlFor="demo-password">
                        CHOOSE A PASSWORD
                      </label>
                      <input
                        id="demo-password"
                        type="password"
                        value={demoPassword}
                        onChange={(e) => setDemoPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full px-5 py-4 rounded-xl border border-outline-variant/30 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 outline-none transition-all text-body-md bg-surface-container-lowest"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleDemoSignup}
                      disabled={demoLoading}
                      className="w-full py-4 rounded-xl mesh-gradient text-white font-bold text-lg hover:scale-[1.02] hover:shadow-xl active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 mt-2"
                    >
                      {demoLoading ? 'Creating account...' : 'Start Learning for Free'}
                    </button>
                  </div>

                  {/* Info note */}
                  <p className="mt-4 text-center text-on-surface-variant text-[11px] leading-relaxed">
                    Demo accounts are for testing purposes.
                    Your data may be reset periodically.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

