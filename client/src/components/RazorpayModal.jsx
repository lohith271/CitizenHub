import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, CheckCircle2, ShieldCheck, Heart, Sparkles, CreditCard, Smartphone } from 'lucide-react';

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500];

const RazorpayModal = ({ campaign, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState(500);
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    setLoading(true);
    setError('');

    try {
      // 1. Create Order on Backend
      const orderRes = await api.post('/donations/create-order', {
        campaignId: campaign._id,
        amount: Number(amount),
      });

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to create order');
      }

      const { orderId, keyId, isTestMode } = orderRes.data;

      // 2. If browser has Razorpay SDK and live keys exist, load Razorpay modal
      if (window.Razorpay && !isTestMode && keyId !== 'rzp_test_YourRazorpayKeyId') {
        const options = {
          key: keyId,
          amount: Math.round(Number(amount) * 100),
          currency: 'INR',
          name: 'CitizenHub India',
          description: `Contribution to ${campaign.title}`,
          order_id: orderId,
          handler: async (response) => {
            const verifyRes = await api.post('/donations/verify', {
              campaignId: campaign._id,
              amount: Number(amount),
              donorName: donorName || 'Generous Citizen',
              donorEmail: donorEmail || 'supporter@citizenhub.org',
              userId: user?.id || null,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes.data.success) {
              setSuccess(true);
              onSuccess && onSuccess(verifyRes.data.campaignRaised);
              setTimeout(() => onClose(), 2500);
            }
          },
          prefill: {
            name: donorName,
            email: donorEmail,
          },
          theme: {
            color: '#16a34a',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Test / Hackathon Demo Verification Flow
        const verifyRes = await api.post('/donations/verify', {
          campaignId: campaign._id,
          amount: Number(amount),
          donorName: donorName || 'Generous Citizen',
          donorEmail: donorEmail || 'supporter@citizenhub.org',
          userId: user?.id || null,
          razorpay_order_id: orderId,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_verified_signature',
        });

        if (verifyRes.data.success) {
          setSuccess(true);
          onSuccess && onSuccess(verifyRes.data.campaignRaised);
          setTimeout(() => onClose(), 2500);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment processing error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">Thank You!</h3>
            <p className="text-sm text-slate-600">
              Your contribution of <strong className="text-slate-900">₹{amount} INR</strong> to{' '}
              <strong className="text-slate-900">{campaign.title}</strong> was received successfully!
            </p>
            <div className="text-xs text-brand-700 font-bold bg-brand-50 py-2 px-4 rounded-xl inline-block">
              Single Currency (INR) Contribution Verified
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[11px] font-bold uppercase mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                Razorpay INR Gateway
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
                Support: {campaign.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Single currency (INR) contribution. Zero tax overhead on platform.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleDonate} className="space-y-4">
              {/* Preset Chips */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Select Amount</label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        amount === amt
                          ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Or Custom Amount (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="10"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Donor Name & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Supported Payment Badges */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-brand-600" />
                  <span>UPI (GPay / PhonePe / Paytm)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cards / NetBanking</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Opening Razorpay...' : `Contribute ₹${amount} INR`}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default RazorpayModal;
