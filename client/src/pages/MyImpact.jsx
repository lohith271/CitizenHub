import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import { Award, Sparkles, CheckCircle2, Clock, ShieldCheck, ArrowRight, FileText, ExternalLink } from 'lucide-react';
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

      {/* Accepted Work Records */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-600" />
          My Accepted Work & Submissions ({myTasks.length})
        </h3>
        {myTasks.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-sm text-slate-500">
            Accepted tasks and submitted work will appear here.
          </div>
        ) : (
          <div className="space-y-4">
            {myTasks.map((task) => (
              <article key={task._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900">{task.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Campaign: {task.campaignId?.title || 'Campaign'} · Accepted {task.assignedAt ? new Date(task.assignedAt).toLocaleDateString() : 'recently'}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold uppercase">
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="font-bold uppercase text-slate-400 mb-1">What I submitted</div>
                    <p className="text-slate-700">{task.proofSubmission?.notes || 'No proof submitted yet.'}</p>
                    {task.proofSubmission?.submittedAt && (
                      <p className="text-slate-400 mt-2">Submitted {new Date(task.proofSubmission.submittedAt).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="font-bold uppercase text-slate-400 mb-1">Review result</div>
                    <p className="text-slate-700">{task.reviewFeedback || (task.status === 'completed' ? 'Approved by campaigner.' : 'Waiting for campaigner review.')}</p>
                    {task.proofSubmission?.submissionUrl && (
                      <a href={task.proofSubmission.submissionUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-brand-700 font-bold hover:underline">
                        Open submitted work <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                {task.proofSubmission?.photos?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {task.proofSubmission.photos.map((photo) => (
                      <a key={photo} href={photo} target="_blank" rel="noreferrer" className="text-xs text-brand-700 font-bold hover:underline">
                        View submitted photo
                      </a>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyImpact;
