import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, Shield, User, Building } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        // Smart Role Redirection
        if (res.user.role === 'admin') {
          navigate('/admin/approvals');
        } else if (res.user.role === 'campaigner') {
          navigate('/campaigner/studio');
        } else {
          navigate('/feed');
        }
      } else {
        setError(res.message || 'Invalid email or password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Demo Instant Logins for Hackathon Evaluators
  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setSubmitting(true);

    try {
      const res = await login(demoEmail, demoPassword);
      if (res.success) {
        if (res.user.role === 'campaigner') {
          navigate('/campaigner/studio');
        } else if (res.user.role === 'admin') {
          navigate('/admin/approvals');
        } else {
          navigate('/feed');
        }
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md shadow-brand-500/20">
            C
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in to mobilize, take action, or review campaigns.</p>
        </div>

        {/* Demo One-Click Fillers for Judges (Instant Login) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            ⚡ Hackathon Quick Login (1-Click Instant Sign In)
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleQuickLogin('rohan.designer@gmail.com', 'password123')}
              className="py-2.5 px-3 bg-white hover:bg-brand-50 hover:border-brand-300 border border-slate-200 rounded-xl font-bold text-slate-700 hover:text-brand-700 flex flex-col items-center gap-1 transition-all shadow-sm"
            >
              <User className="w-4 h-4 text-brand-600" />
              <span>Citizen Volunteer</span>
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleQuickLogin('arjun@jhatkaa.org', 'password123')}
              className="py-2.5 px-3 bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl font-bold text-slate-700 hover:text-blue-700 flex flex-col items-center gap-1 transition-all shadow-sm"
            >
              <Building className="w-4 h-4 text-blue-600" />
              <span>Campaign Organizer</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 font-medium">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/20 transition-all hover:shadow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 space-y-3">
          <div>
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-700 hover:underline">
              Register as Volunteer or Organization
            </Link>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Platform Administrator?</span>
            <Link to="/admin/login" className="font-bold text-slate-600 hover:text-brand-700 hover:underline">
              Secure Staff Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
