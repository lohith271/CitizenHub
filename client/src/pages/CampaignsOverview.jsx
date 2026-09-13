import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RazorpayModal from '../components/RazorpayModal';
import {
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  HeartHandshake,
  MapPin,
  Flame,
  ArrowRight,
  BookOpen,
  Share2,
  Users,
  ShieldCheck,
  X,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Air Pollution',
  'Forest & Wildlife',
  'Women Safety & Equality',
  'Civic Rights & Justice',
  'Climate Action',
];

const CampaignsOverview = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [signedCampaigns, setSignedCampaigns] = useState([]);
  const [donationModal, setDonationModal] = useState(null);
  const [storyModal, setStoryModal] = useState(null); // Full story modal

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/campaigns');
      if (res.data.success) {
        setCampaigns(res.data.campaigns);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignPetition = async (campaignId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

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

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    const matchesCategory =
      selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location && c.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-brand-400" />
            Active Grassroots Movements Across India
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Explore Campaigns & Petitions
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Support citizen-led initiatives demanding clean air, forest conservation, women safety, and civic accountability. Sign digital petitions or fund on-ground work directly in INR.
          </p>

          {!isAuthenticated && (
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                Join as Volunteer <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs rounded-xl transition-all"
              >
                Sign In to Mobilize
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search campaigns, issues, or cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
            />
          </div>

          {/* Volunteer CTA link if logged in */}
          {isAuthenticated && (
            <Link
              to="/feed"
              className="w-full md:w-auto px-4 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl border border-brand-200 flex items-center justify-center gap-2 transition-colors"
            >
              <Users className="w-4 h-4 text-brand-600" />
              View My Skill-Matched Tasks in Action Feed →
            </Link>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-medium">Loading campaigns...</div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <p className="text-slate-500 font-medium text-sm">No campaigns found matching your search criteria.</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-brand-700 hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCampaigns.map((camp) => {
            const hasSigned =
              signedCampaigns.includes(camp._id) ||
              camp.signers?.some((s) => s.user === user?.id);

            const signaturePct = Math.min(
              100,
              Math.round((camp.signaturesCount / (camp.targetSignatures || 1000)) * 100)
            );

            return (
              <div
                key={camp._id}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Banner */}
                  <div className="h-48 relative overflow-hidden bg-slate-100">
                    <img
                      src={camp.bannerImage}
                      alt={camp.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider text-slate-800 shadow-sm">
                        {camp.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-slate-900/80 backdrop-blur text-white px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brand-400" /> {camp.location || 'India'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                        {camp.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                        {camp.summary}
                      </p>
                    </div>

                    {/* Petition Progress */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-600">
                        <span>{camp.signaturesCount?.toLocaleString()} Signed</span>
                        <span className="text-brand-700">{signaturePct}% of Goal</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${signaturePct}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">
                        Goal: {camp.targetSignatures?.toLocaleString()} citizens
                      </div>
                    </div>

                    {/* Crowdfunding Bar (if enabled) */}
                    {camp.modularBlocks?.hasDonation && (
                      <div className="flex items-center justify-between text-xs px-1 text-slate-500 font-medium">
                        <span>💰 Raised in INR:</span>
                        <strong className="text-emerald-700 font-bold">
                          ₹{(camp.raisedAmount || 0).toLocaleString()}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-6 pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    {hasSigned ? (
                      <button
                        disabled
                        className="flex-1 py-2.5 px-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Petition Signed
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSignPetition(camp._id)}
                        className="flex-1 py-2.5 px-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                      >
                        {isAuthenticated ? 'Sign Petition (1-Click)' : 'Sign Petition'}
                      </button>
                    )}

                    {camp.modularBlocks?.hasDonation && (
                      <button
                        onClick={() => setDonationModal(camp)}
                        className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
                        title="Contribute single-currency INR via Razorpay"
                      >
                        Donate INR
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setStoryModal(camp)}
                    className="w-full py-1.5 text-center text-[11px] font-bold text-slate-500 hover:text-brand-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Read Full Demands & Story
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Volunteer Callout Banner */}
      <div className="bg-gradient-to-r from-brand-50 to-emerald-50 border border-brand-200 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-brand-800">
            <Users className="w-4 h-4 text-brand-600" />
            Volunteer Mobilization
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            Want to take on-ground civic action instead of just signing?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            CitizenHub matches your specialized skills (Legal/RTI, Graphic Design, Video Editing, Social Media, or Field Organizing) with time-boxed campaign tasks.
          </p>
        </div>

        <div>
          {isAuthenticated ? (
            <Link
              to="/feed"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
            >
              Open My Action Feed <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/register"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
            >
              Register as Volunteer <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* FULL STORY MODAL */}
      {storyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setStoryModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">
                {storyModal.category} • 📍 {storyModal.location}
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">{storyModal.title}</h2>
              <p className="text-xs text-slate-500 mt-1">
                Target: {storyModal.targetSignatures?.toLocaleString()} digital signatures
              </p>
            </div>

            <div className="h-56 rounded-2xl overflow-hidden border border-slate-100">
              <img
                src={storyModal.bannerImage}
                alt={storyModal.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">The Problem & Demand</h4>
              <p>{storyModal.description || storyModal.summary}</p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStoryModal(null)}
                className="py-2.5 px-4 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSignPetition(storyModal._id);
                  setStoryModal(null);
                }}
                className="flex-1 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow"
              >
                Sign This Petition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RAZORPAY DONATION MODAL */}
      {donationModal && (
        <RazorpayModal
          campaign={donationModal}
          onClose={() => setDonationModal(null)}
          onSuccess={(raised) => {
            setCampaigns((prev) =>
              prev.map((c) =>
                c._id === donationModal._id ? { ...c, raisedAmount: raised } : c
              )
            );
          }}
        />
      )}
    </div>
  );
};

export default CampaignsOverview;
