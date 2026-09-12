import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Users, FileCheck, Award, ArrowRight, ShieldCheck, HeartHandshake, Flame, Sparkles } from 'lucide-react';

const Landing = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await api.get('/campaigns');
        if (res.data.success) {
          setCampaigns(res.data.campaigns.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-brand-50/70 to-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-brand-800 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4 text-brand-600" />
            Empowering Progressive Indians
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Turn Your Skills Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-500">Collective Civic Action</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Join thousands of citizens volunteering their legal, creative, tech, and field skills to win environmental, civic, and human rights campaigns across India.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-lg shadow-brand-600/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Sign Up as a Volunteer
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/campaigns"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-300 shadow-sm transition-all"
            >
              Explore Active Campaigns
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-slate-200/80 shadow-sm">
              <div className="text-3xl font-black text-slate-900">63,500+</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Petitions Signed</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-slate-200/80 shadow-sm">
              <div className="text-3xl font-black text-brand-600">850+</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Skill Tasks Done</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-slate-200/80 shadow-sm">
              <div className="text-3xl font-black text-slate-900">₹3.8L+</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Crowdfunded (INR)</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-slate-200/80 shadow-sm">
              <div className="text-3xl font-black text-amber-600">100%</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Verified Actions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Campaigns Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Urgent Campaigns Needing Help</h2>
            <p className="text-sm text-slate-500 mt-1">Sign petitions or claim skill-based action tasks.</p>
          </div>
          <Link to="/campaigns" className="text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1">
            View All Campaigns <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading campaigns...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {campaigns.map((camp) => (
              <div key={camp._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="h-48 overflow-hidden relative">
                  <img src={camp.bannerImage} alt={camp.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-md text-xs font-extrabold text-slate-800 shadow-sm">
                    {camp.category}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-2 leading-snug">{camp.title}</h3>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-3">{camp.summary}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                      <span>{camp.signaturesCount.toLocaleString()} Signatures</span>
                      <span>Target: {camp.targetSignatures.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-brand-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (camp.signaturesCount / camp.targetSignatures) * 100)}%` }}
                      ></div>
                    </div>

                    <Link
                      to={`/campaigns/${camp._id}`}
                      className="mt-4 block w-full py-2.5 text-center text-sm font-bold text-white bg-slate-900 hover:bg-brand-600 rounded-xl transition-colors"
                    >
                      Take Action
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How It Works for Citizens */}
      <section className="bg-slate-900 text-white py-16 rounded-3xl max-w-7xl mx-auto px-6 sm:px-12 my-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold">How CitizenHub Mobilizes You</h2>
          <p className="text-slate-400 mt-2 text-sm">No WhatsApp spam, no lost spreadsheets. Just clear, impact-driven tasks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-slate-800/60 p-8 rounded-2xl border border-slate-700/60">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold">1. Tag Your Skills</h3>
            <p className="text-sm text-slate-400 mt-2">Pick your location and skills (Legal, Video Editing, Social Media, Design, or Field organizing).</p>
          </div>

          <div className="bg-slate-800/60 p-8 rounded-2xl border border-slate-700/60">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Flame className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold">2. Claim 48h Tasks</h3>
            <p className="text-sm text-slate-400 mt-2">Accept bite-sized tasks tailored to your schedule with auto-release timers to prevent hoarding.</p>
          </div>

          <div className="bg-slate-800/60 p-8 rounded-2xl border border-slate-700/60">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold">3. Earn Impact Badges</h3>
            <p className="text-sm text-slate-400 mt-2">Submit proof of work, get verified by campaign leads, and track your civic contribution live.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
