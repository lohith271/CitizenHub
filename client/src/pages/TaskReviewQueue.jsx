import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle2, AlertTriangle, ExternalLink, Image, Clock, Sparkles, MessageSquare } from 'lucide-react';

const TaskReviewQueue = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewMessage, setReviewMessage] = useState('');
  const [feedbackInput, setFeedbackInput] = useState({});

  useEffect(() => {
    fetchReviewTasks();
  }, []);

  const fetchReviewTasks = async () => {
    try {
      const res = await api.get('/tasks', { params: { status: 'under_review' } });
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Failed to load review queue');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (taskId, decision, volunteerName) => {
    try {
      const feedback = feedbackInput[taskId] || '';
      const res = await api.post(`/tasks/${taskId}/review`, { decision, feedback });

      if (res.data.success) {
        setReviewMessage(
          decision === 'approve'
            ? `🎉 Verified & Approved work by ${volunteerName}! Points awarded.`
            : `⚠️ Revision requested from ${volunteerName}.`
        );
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        setTimeout(() => setReviewMessage(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Review action failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Verification Queue
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Task Verification & Proof Review</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review submitted photos, files, and links before awarding volunteer impact points.
          </p>
        </div>

        <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200 flex items-center gap-3">
          <span className="text-2xl font-black text-blue-600">{tasks.length}</span>
          <span className="text-xs font-bold uppercase text-slate-500">Under Review</span>
        </div>
      </div>

      {reviewMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          {reviewMessage}
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 font-medium">Loading review queue...</div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Queue is Clear!</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            All submitted volunteer work has been reviewed and verified.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {tasks.map((task) => {
            const volunteerName = task.assignedTo?.name || 'Volunteer';
            const submissionUrl = task.proofSubmission?.submissionUrl || '';
            const isImage = submissionUrl.match(/\.(jpeg|jpg|png|webp)($|\?)/i) || submissionUrl.includes('cloudinary');

            return (
              <div
                key={task._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">
                      {task.campaignId?.title || 'Campaign'}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">{task.title}</h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-xs font-bold text-slate-800">{volunteerName}</div>
                    <div className="text-[11px] text-slate-400">{task.assignedTo?.email}</div>
                  </div>
                </div>

                {/* Submitted Proof Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  {/* Photo or Link */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Submitted Proof Attachment
                    </div>
                    {isImage ? (
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-white max-h-64 flex items-center justify-center">
                        <img
                          src={submissionUrl}
                          alt="Proof"
                          className="w-full h-full object-contain max-h-64"
                        />
                      </div>
                    ) : submissionUrl ? (
                      <a
                        href={submissionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-4 bg-white rounded-xl border border-slate-200 text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-2 hover:bg-brand-50/50 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-brand-600" />
                        Open Cloud Proof Link (Drive / Figma / Canva)
                      </a>
                    ) : (
                      <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-400">
                        No external attachment provided.
                      </div>
                    )}
                  </div>

                  {/* Volunteer Notes */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Volunteer Summary & Notes
                    </div>
                    <p className="text-xs text-slate-700 bg-white p-4 rounded-xl border border-slate-200 leading-relaxed">
                      "{task.proofSubmission?.notes || 'No description added.'}"
                    </p>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Optional Feedback / Revision Note
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Great work! or Please increase logo size..."
                        value={feedbackInput[task._id] || ''}
                        onChange={(e) =>
                          setFeedbackInput({ ...feedbackInput, [task._id]: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Campaigner Review Decision Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleReview(task._id, 'reject', volunteerName)}
                    className="py-2.5 px-5 bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Request Changes
                  </button>

                  <button
                    onClick={() => handleReview(task._id, 'approve', volunteerName)}
                    className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve & Award Credit (+10 Pts)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskReviewQueue;
