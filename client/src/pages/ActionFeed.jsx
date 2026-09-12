import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import { Sparkles, CheckCircle2, HeartHandshake, Filter, Search, ArrowRight, Flame } from 'lucide-react';

const ActionFeed = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'matched', 'tasks'
  const [signedCampaigns, setSignedCampaigns] = useState([]);

  // Donation state
  const [donationModal, setDonationModal] = useState(null); // holds campaign
  const [donationAmount, setDonationAmount] = useState(500);
  const [donating, setDonating] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [campRes, taskRes] = await Promise.all([
        api.get('/campaigns'),
        api.get('/tasks'),
      ]);

      if (campRes.data.success) setCampaigns(campRes.data.campaigns);
      if (taskRes.data.success) setTasks(taskRes.data.tasks);
    } catch (err) {
      console.error('Failed to load action feed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignPetition = async (campaignId) => {
    try {
      const res = await api.post(`/campaigns/${campaignId}/sign`);
      if (res.data.success) {
        setSignedCampaigns((prev) => [...prev, campaignId]);
        setCampaigns((prev) =>
          prev.map((c) =>
            c._id === campaignId ? { ...c, signaturesCount: res.data.signaturesCount } : c
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error signing petition');
    }
  };

  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    setDonating(true);
    setDonationSuccess(null);

    try {
      // 1. Create Order
      const orderRes = await api.post('/donations/create-order', {
        campaignId: donationModal._id,
        amount: donationAmount,
      });

      if (orderRes.data.success) {
        // 2. Verify Payment (simulated test flow or live Razorpay modal)
        const verifyRes = await api.post('/donations/verify', {
          campaignId: donationModal._id,
          amount: donationAmount,
          donorName: user?.name || 'Generous Citizen',
          donorEmail: user?.email || 'citizen@citizenhub.org',
          razorpay_order_id: orderRes.data.orderId,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_verified_signature',
        });

        if (verifyRes.data.success) {
          setDonationSuccess(verifyRes.data.message);
          setCampaigns((prev) =>
            prev.map((c) =>
              c._id === donationModal._id ? { ...c, raisedAmount: verifyRes.data.campaignRaised } : c
            )
          );
          setTimeout(() => {
            setDonationModal(null);
            setDonationSuccess(null);
          }, 2000);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Donation failed');
    } finally {
      setDonating(false);
    }
  };

  // Filter tasks matching user skills
  const userSkills = user?.skills || [];
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'matched') {
      return t.requiredSkills.some((s) => userSkills.includes(s));
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Personalized Header */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Personalized For You
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2">
            Showing actions in <strong className="text-white">{user?.city || 'India'}</strong> matching your skills:{' '}
            <span className="text-brand-300 font-semibold">{userSkills.join(', ') || 'Any'}</span>.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="bg-white/10 px-3 py-1 rounded-full text-slate-200">
              Reliability Score: <strong className="text-brand-300">{user?.reliabilityScore || 100} Pts</strong>
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-full text-slate-200">
              Badge: <strong className="text-amber-300">{user?.badges?.[0] || 'Advocate'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Movements
          </button>
          <button
            onClick={() => setFilter('matched')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
              filter === 'matched'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Matched to My Skills ({tasks.filter((t) => t.requiredSkills.some((s) => userSkills.includes(s))).length})
          </button>
        </div>
      </div>

      {/* Urgent Skill Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              Skill-Based Action Tasks (48h Timers)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Claim a task matching your expertise, submit proof, and get verified.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-400">Loading action tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
            No tasks currently open matching this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard key={task._id} task={task} currentUser={user} onTaskUpdated={fetchData} />
            ))}
          </div>
        )}
      </div>

      {/* Active Campaigns & 1-Click Petitions */}
      <div className="pt-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-brand-600" />
          Active Public Campaigns
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((camp) => {
            const hasSigned = signedCampaigns.includes(camp._id) || camp.signers?.some((s) => s.user === user?.id);

            return (
              <div key={camp._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">
                      {camp.category}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">📍 {camp.location}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{camp.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">{camp.summary}</p>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                      <span>{camp.signaturesCount?.toLocaleString()} Signed</span>
                      <span>Goal: {camp.targetSignatures?.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (camp.signaturesCount / camp.targetSignatures) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                  {hasSigned ? (
                    <button
                      disabled
                      className="flex-1 py-2.5 px-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Petition Signed!
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSignPetition(camp._id)}
                      className="flex-1 py-2.5 px-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                    >
                      Sign Petition (1-Click)
                    </button>
                  )}

                  {camp.modularBlocks?.hasDonation && (
                    <button
                      onClick={() => setDonationModal(camp)}
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                    >
                      Contribute INR
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DONATION MODAL */}
      {donationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <h3 className="text-xl font-extrabold text-slate-900">Contribute in Single Currency (INR)</h3>
            <p className="text-xs text-slate-500">{donationModal.title}</p>

            {donationSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200">
                {donationSuccess}
              </div>
            )}

            <form onSubmit={handleDonationSubmit} className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {[200, 500, 1000, 2500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDonationAmount(amt)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      donationAmount === amt
                        ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Custom Amount (₹ INR)</label>
                <input
                  type="number"
                  min="50"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDonationModal(null)}
                  className="py-2.5 px-4 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={donating}
                  className="flex-1 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow disabled:opacity-50"
                >
                  {donating ? 'Processing Razorpay...' : `Pay ₹${donationAmount} via Razorpay`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionFeed;
