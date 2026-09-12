import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import ActionFeed from './pages/ActionFeed';
import MyImpact from './pages/MyImpact';

// Simple route guard for logged-in citizens
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-slate-400">Loading session...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/campaigns" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/onboarding"
            element={
              <PrivateRoute>
                <Onboarding />
              </PrivateRoute>
            }
          />
          <Route
            path="/feed"
            element={
              <PrivateRoute>
                <ActionFeed />
              </PrivateRoute>
            }
          />
          <Route
            path="/impact"
            element={
              <PrivateRoute>
                <MyImpact />
              </PrivateRoute>
            }
          />

          {/* Placeholders for Member 3 & Member 4 (connected next) */}
          <Route path="/admin/approvals" element={<div className="max-w-4xl mx-auto p-12 text-center text-slate-500">Member 3 Admin Approvals Hub</div>} />
          <Route path="/campaigner/studio" element={<div className="max-w-4xl mx-auto p-12 text-center text-slate-500">Member 3 Campaigner Studio</div>} />
          <Route path="/analytics" element={<div className="max-w-4xl mx-auto p-12 text-center text-slate-500">Member 4 Analytics Dashboard</div>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-bold text-slate-700">CitizenHub 🇮🇳 Progressive Indian Civic Action Platform</div>
          <div>Built for Jhatkaa.org Civic Mobilization Challenge</div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
