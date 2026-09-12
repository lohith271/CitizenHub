import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import { Award, Sparkles, CheckCircle2, Clock, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyImpact = () => {
  const { user } = useAuth();
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      const res = await api.get('/tasks/my-tasks');
      if (res.data.success) {
        setMyTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Failed to load my tasks');
    } finally {
      setLoading(false);
    }
  };

  const completedTasks = myTasks.filter((t) => t.status === 'completed');
  const inProgressTasks = myTasks.filter((t) => t.status === 'in_progress' || t.status === 'under_review');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Member Hero Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-white flex items-center justify-center font-black text-3xl shadow-lg shadow-brand-500/20">
            {user?.name?.charAt(0) || 'V'}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-800 border border-brand-200 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Citizen Member
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{user?.name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Based in <strong>{user?.city || 'India'}</strong> • Active Volunteer
            </p>
          </div>
        </div>

        {/* Reliability Score Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 w-full md:w-auto min-w-[220px]">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Reliability Score</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-brand-700">{user?.reliabilityScore || 100}</span>
            <span className="text-xs font-semibold text-slate-500">/ 100 Pts</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-brand-500 h-1.5 rounded-full"
              style={{ width: `${user?.reliabilityScore || 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 4 Impact Stat Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-3xl font-black text-slate-900">{completedTasks.length}</div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Tasks Completed</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-3xl font-black text-brand-600">{completedTasks.length * 2 + 1}</div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Hours Contributed</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-3xl font-black text-slate-900">4</div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Petitions Signed</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-3xl font-black text-amber-500">{user?.badges?.length || 2}</div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Badges Earned</div>
        </div>
      </div>

      {/* Badges Earned Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          Earned Recognition Badges
        </h3>
        <div className="flex flex-wrap gap-3">
          {(user?.badges || ['Community Member', 'Clean Air Champion']).map((badge) => (
            <div
              key={badge}
              className="px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              {badge}
            </div>
          ))}
          <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-slate-400 text-xs font-medium flex items-center gap-1.5">
            Complete 2 more tasks to unlock "Master Organizer"
          </div>
        </div>
      </div>

      {/* Active Tasks In-Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" />
          My Claimed Tasks ({inProgressTasks.length})
        </h3>

        {loading ? (
          <div className="py-6 text-center text-slate-400">Loading your tasks...</div>
        ) : inProgressTasks.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
            <p className="text-sm text-slate-500">You don't have any active tasks claimed right now.</p>
            <Link
              to="/feed"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:underline"
            >
              Browse Open Action Tasks <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {inProgressTasks.map((task) => (
              <TaskCard key={task._id} task={task} currentUser={user} onTaskUpdated={fetchMyTasks} />
            ))}
          </div>
        )}
      </div>

      {/* Completed Contributions */}
      {completedTasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-brand-600" />
            Verified Past Contributions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {completedTasks.map((task) => (
              <TaskCard key={task._id} task={task} currentUser={user} onTaskUpdated={fetchMyTasks} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyImpact;
