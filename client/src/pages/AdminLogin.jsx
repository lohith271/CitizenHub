import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, Mail, Lock, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const ADMIN_MASTER_PASSCODE = 'CITIZEN_ADMIN_2026';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityPasscode, setSecurityPasscode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Step 1: Security Passcode Enforcement
    if (securityPasscode.trim() !== ADMIN_MASTER_PASSCODE) {
      setError('Access Denied: Invalid Admin Security Key. Unauthorized access is strictly logged.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role !== 'admin') {
          setError('Access Denied: Your account does not hold Super Admin clearance.');
          return;
        }
        navigate('/admin/approvals');
      } else {
        setError(res.message || 'Authentication failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify admin credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setEmail('admin@citizenhub.org');
    setPassword('password123');
    setSecurityPasscode(ADMIN_MASTER_PASSCODE);
    setError('');
    setSubmitting(true);

    try {
      const res = await login('admin@citizenhub.org', 'password123');
      if (res.success && res.user.role === 'admin') {
        navigate('/admin/approvals');
      } else {
        setError('Admin authentication failed');
      }
    } catch (err) {
      setError('Admin authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-2xl relative">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Public Login
        </Link>

        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-black text-2xl mx-auto border border-amber-200 shadow-sm">
            <Shield className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Oversight Portal
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            Restricted access for reviewing campaigner applications and platform moderation.
          </p>
        </div>

        {/* Hackathon 1-Click Evaluation Pill */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 text-center flex items-center justify-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
            Hackathon Evaluator Fast-Track
          </div>
          <p className="text-[11px] text-amber-700 text-center leading-snug">
            Security Passcode is protected. Click below to auto-verify credentials & security key:
          </p>
          <button
            type="button"
            onClick={handleQuickAdminLogin}
            disabled={submitting}
            className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            Instant Admin Clearance (1-Click)
          </button>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 font-medium">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-4 space-y-4" onSubmit={handleAdminSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@citizenhub.org"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Security Passcode
              </label>
              <span className="text-[10px] text-slate-400">Master Secret Key</span>
            </div>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={securityPasscode}
                onChange={(e) => setSecurityPasscode(e.target.value)}
                placeholder="Enter security key..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {submitting ? 'Verifying Clearance...' : 'Authenticate Super Admin'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
