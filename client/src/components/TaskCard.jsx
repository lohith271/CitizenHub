import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Clock, AlertCircle, CheckCircle2, Upload, ExternalLink, Sparkles, X } from 'lucide-react';

const TaskCard = ({ task, currentUser, onTaskUpdated }) => {
  const [submitting, setSubmitting] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Submit form state
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitError, setSubmitError] = useState('');

  // 48-Hour Countdown calculation
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (task.status === 'in_progress' && task.expiresAt) {
      const updateTimer = () => {
        const diff = new Date(task.expiresAt).getTime() - new Date().getTime();
        if (diff <= 0) {
          setTimeLeft('Expired (Auto-releasing...)');
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hours}h ${mins}m left`);
        }
      };
      updateTimer();
      const interval = setInterval(updateTimer, 60000);
      return () => clearInterval(interval);
    }
  }, [task]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await api.post(`/tasks/${task._id}/claim`);
      if (res.data.success) {
        onTaskUpdated && onTaskUpdated(res.data.task);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim task');
    } finally {
      setClaiming(false);
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      if (photoFile) {
        formData.append('image', photoFile);
      }
      if (submissionUrl) {
        formData.append('submissionUrl', submissionUrl);
      }
      formData.append('notes', notes);

      const res = await api.post(`/tasks/${task._id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setModalOpen(false);
        onTaskUpdated && onTaskUpdated(res.data.task);
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const isAssignedToMe = task.assignedTo && currentUser && (task.assignedTo._id === currentUser.id || task.assignedTo === currentUser.id);

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          {/* Urgency & Status Bar */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider bg-slate-100 text-slate-700">
              {task.city || 'Remote'}
            </span>

            {task.status === 'available' && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                Available to Claim
              </span>
            )}
            {task.status === 'in_progress' && (
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {timeLeft || 'In Progress'}
              </span>
            )}
            {task.status === 'under_review' && (
              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                ⏳ Under Review
              </span>
            )}
            {task.status === 'completed' && (
              <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified & Completed
              </span>
            )}
          </div>

          <h4 className="text-base font-bold text-slate-900 leading-snug">{task.title}</h4>
          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">{task.description}</p>

          {/* Required Skills Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {task.requiredSkills?.map((skill) => (
              <span key={skill} className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                #{skill}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-3 border-t border-slate-100">
          {task.status === 'available' && (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full py-2 px-3 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {claiming ? 'Claiming...' : 'Claim Task (48h Timer)'}
            </button>
          )}

          {task.status === 'in_progress' && isAssignedToMe && (
            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-2 px-3 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Work Proof
            </button>
          )}

          {task.status === 'in_progress' && !isAssignedToMe && (
            <div className="text-xs text-slate-400 font-medium text-center py-1">
              Claimed by another volunteer
            </div>
          )}

          {task.status === 'under_review' && (
            <div className="text-xs text-blue-600 font-bold text-center py-1">
              Campaigner reviewing your submission
            </div>
          )}

          {task.status === 'completed' && (
            <div className="text-xs text-brand-700 font-bold text-center py-1 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              Credit Awarded (+10 Pts)
            </div>
          )}
        </div>
      </div>

      {/* SUBMISSION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Submit Your Work Proof</h3>
              <p className="text-xs text-slate-500 mt-1">{task.title}</p>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-200">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmitProof} className="space-y-4">
              {/* Photo Upload Input */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Direct Photo Upload (Phone Camera / Laptop)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
                {previewUrl && (
                  <div className="mt-2 h-32 rounded-xl overflow-hidden border border-slate-200">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* OR Link */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  OR Paste Cloud Link (Figma, Drive, Doc)
                </label>
                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Work Notes */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Notes / Brief Summary
                </label>
                <textarea
                  rows={2}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain what you did or summarize your work..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2.5 px-4 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow disabled:opacity-50"
                >
                  {submitting ? 'Uploading Proof...' : 'Submit to Campaigner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskCard;
