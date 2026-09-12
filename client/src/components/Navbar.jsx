import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, LogOut, User, CheckCircle2, ChevronRight, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isCampaigner, isCitizen } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              C
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">Citizen<span className="text-brand-600">Hub</span></span>
              <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-brand-100 text-brand-800 rounded">
                India 🇮🇳
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/campaigns"
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-brand-700 hover:bg-slate-100/70 rounded-lg transition-colors"
            >
              Campaigns
            </Link>

            {isCitizen && (
              <>
                <Link
                  to="/feed"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-brand-700 hover:bg-slate-100/70 rounded-lg transition-colors"
                >
                  My Action Feed
                </Link>
                <Link
                  to="/impact"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  My Impact
                </Link>
              </>
            )}

            {isCampaigner && (
              <>
                <Link
                  to="/campaigner/studio"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-brand-700 hover:bg-slate-100/70 rounded-lg transition-colors"
                >
                  Campaigner Studio
                </Link>
                <Link
                  to="/campaigner/volunteers"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-brand-700 hover:bg-slate-100/70 rounded-lg transition-colors"
                >
                  Volunteer Directory
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin/approvals"
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
              >
                <Shield className="w-4 h-4 text-amber-600" />
                Admin Approvals
              </Link>
            )}

            <Link
              to="/analytics"
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-brand-700 hover:bg-slate-100/70 rounded-lg transition-colors"
            >
              Analytics
            </Link>
          </nav>

          {/* User Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 leading-none">{user.name}</div>
                  <div className="text-[11px] font-medium text-slate-500 capitalize flex items-center justify-end gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    {user.role} {user.city ? `• ${user.city}` : ''}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-600/20 transition-all hover:shadow"
                >
                  Join the Movement
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          <Link to="/campaigns" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-medium text-slate-800">
            Campaigns
          </Link>
          {isCitizen && (
            <>
              <Link to="/feed" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-medium text-slate-800">
                Action Feed
              </Link>
              <Link to="/impact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-semibold text-brand-700">
                My Impact
              </Link>
            </>
          )}
          {isCampaigner && (
            <Link to="/campaigner/studio" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-medium text-slate-800">
              Campaigner Studio
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin/approvals" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-medium text-amber-700">
              Admin Approvals
            </Link>
          )}
          <Link to="/analytics" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-medium text-slate-800">
            Analytics
          </Link>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-red-600 font-semibold"
              >
                Sign Out ({user.name})
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full py-2 text-center text-slate-800 font-medium">
                  Log In
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full py-2 text-center text-white bg-brand-600 rounded-lg font-semibold">
                  Join Movement
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
