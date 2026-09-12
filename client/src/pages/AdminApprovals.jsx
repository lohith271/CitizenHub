import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, Building, MapPin, Calendar, Clock, Sparkles } from 'lucide-react';

const AdminApprovals = () => {
  const [campaigners, setCampaigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchPendingCampaigners();
  }, []);

  const fetchPendingCampaigners = async () => {
    try {
      const res = await api.get('/auth/pending-campaigners');
      if (res.data.success) {
        setCampaigners(res.data.campaigners);
      }
    } catch (err) {
      console.error('Failed to fetch pending campaigners');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id, decision, name) => {
    try {
      const res = await api.put(`/auth/review-campaigner/${id}`, { decision });
      if (res.data.success) {
        setActionMessage(
          decision === 'approve'
            ? `✅ Successfully APPROVED ${name}! They can now publish campaigns.`
            : `❌ Application for ${name} was rejected.`
        );
        // Remove from pending list
        setCampaigners((prev) => prev.filter((c) => c._id !== id));
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 sm:p-10 rounded-3xl border border-slate-700 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Super Admin Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Campaigner Verification Queue</h1>
          <p className="text-slate-400 text-sm mt-1">
            Review and verify activist collectives and NGO organizers before granting broadcast permissions.
          </p>
        </div>

        <div className="bg-white/10 px-5 py-3 rounded-2xl text-center border border-white/10">
          <div className="text-2xl font-black text-amber-400">{campaigners.length}</div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Pending Review</div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm font-bold text-emerald-800 shadow-sm flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          {actionMessage}
        </div>
      )}

      {/* Applications List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 font-medium">Loading applicant queue...</div>
      ) : campaigners.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">All Caught Up!</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            There are no campaigners currently waiting for review. All organizers are verified.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigners.map((applicant) => (
            <div
              key={applicant._id}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{applicant.name}</h3>
                    <div className="text-xs text-slate-500 font-medium">{applicant.email}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-extrabold uppercase">
                    Pending Review
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Building className="w-4 h-4 text-brand-600" />
                    <span>Organization: {applicant.organization || 'Independent Organizer'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Location: {applicant.city || 'India'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Applied: {new Date(applicant.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Organization Mission
                  </div>
                  <p className="text-xs text-slate-700 bg-slate-50/50 p-3 rounded-xl border border-slate-100 leading-relaxed italic">
                    "{applicant.organizationBio || 'No mission statement provided.'}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => handleDecision(applicant._id, 'reject', applicant.name)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Decline
                </button>
                <button
                  onClick={() => handleDecision(applicant._id, 'approve', applicant.name)}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Organizer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminApprovals;
