import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Search, Filter, MapPin, Sparkles, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';

const SKILLS = [
  'All',
  'Graphic Design',
  'Legal/RTI',
  'Video Editing',
  'Social Media',
  'Field Mobilization',
  'Tech/Data',
  'Content Writing',
  'Translation',
];

const CITIES = ['All', 'Bengaluru', 'Delhi', 'Mumbai', 'Pune', 'Chennai', 'Kolkata', 'Hyderabad'];

const VolunteerDirectory = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  useEffect(() => {
    fetchVolunteers();
  }, [skillFilter, cityFilter]);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (skillFilter !== 'All') params.skill = skillFilter;
      if (cityFilter !== 'All') params.city = cityFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/auth/volunteers', { params });
      if (res.data.success) {
        setVolunteers(res.data.volunteers);
      }
    } catch (err) {
      console.error('Failed to fetch volunteer directory');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVolunteers();
  };

  const handleMobilizeVolunteer = (volunteerName) => {
    setInviteSuccess(`Action invitation sent to ${volunteerName}!`);
    setTimeout(() => setInviteSuccess(''), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-4 h-4 text-brand-600" />
            Volunteer Mobilization Engine
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Citizen Volunteer Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Search registered citizens by specialized skill sets and locations to mobilize for urgent campaigns.
          </p>
        </div>

        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <span className="text-2xl font-black text-brand-600">{volunteers.length}</span>
          <span className="text-xs font-bold uppercase text-slate-500">Available Volunteers</span>
        </div>
      </div>

      {inviteSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {inviteSuccess}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search volunteers by name, skill, or cause..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-4 text-xs pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Filter by Skill:</span>
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700"
            >
              {SKILLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Filter by City:</span>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Volunteer Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 font-medium">Filtering volunteers...</div>
      ) : volunteers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 text-sm">
          No volunteers match the selected skill or city criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {volunteers.map((vol) => (
            <div
              key={vol._id}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{vol.name}</h3>
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {vol.city || 'India'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-brand-700">{vol.reliabilityScore || 100}</span>
                    <span className="text-[10px] text-slate-400 block font-semibold">Reliability</span>
                  </div>
                </div>

                {/* Skills Tags */}
                <div>
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1.5">
                    Skills to Offer
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {vol.skills?.map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] font-bold bg-brand-50 text-brand-800 border border-brand-200/60 px-2 py-0.5 rounded-md"
                      >
                        #{skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Causes of Interest */}
                {vol.causes && vol.causes.length > 0 && (
                  <div>
                    <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                      Causes
                    </div>
                    <div className="text-xs text-slate-600 font-medium line-clamp-1">
                      {vol.causes.join(' • ')}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleMobilizeVolunteer(vol.name)}
                  className="w-full py-2.5 px-3 bg-slate-900 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Mobilize for Campaign
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VolunteerDirectory;
