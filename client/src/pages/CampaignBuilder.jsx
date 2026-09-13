import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, Check, Sparkles, AlertCircle, Layers, FileText, Heart, Calendar, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  'Air Pollution',
  'Forest & Wildlife',
  'Civic Rights & Justice',
  'Water & Sanitation',
  'Climate Action',
  'Women Safety & Equality',
];

const SKILL_OPTIONS = [
  'Graphic Design',
  'Legal/RTI',
  'Video Editing',
  'Social Media',
  'Field Mobilization',
  'Tech/Data',
  'Content Writing',
  'Translation',
];

const CampaignBuilder = () => {
  const navigate = useNavigate();

  // Campaign Basics
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Air Pollution');
  const [location, setLocation] = useState('Delhi');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [bannerImage, setBannerImage] = useState(
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80'
  );

  // Modular Action Blocks Toggles
  const [hasPetition, setHasPetition] = useState(true);
  const [targetSignatures, setTargetSignatures] = useState(10000);

  const [hasDonation, setHasDonation] = useState(true);
  const [targetAmount, setTargetAmount] = useState(100000);

  const [hasTasks, setHasTasks] = useState(true);
  const [tasks, setTasks] = useState([
    {
      title: 'Create 3 Social Media Banners for Launch',
      description: 'Design square graphics detailing our core demands to be shared on Instagram and Twitter.',
      requiredSkills: ['Graphic Design', 'Social Media'],
      city: 'Remote',
      urgency: 'high',
      deadlineHours: 48,
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addTaskField = () => {
    setTasks([
      ...tasks,
      {
        title: '',
        description: '',
        requiredSkills: ['General Support'],
        city: 'Remote',
        urgency: 'medium',
        deadlineHours: 48,
      },
    ]);
  };

  const updateTask = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // 1. Create Campaign with Modular Blocks
      const campaignPayload = {
        title,
        category,
        location,
        summary,
        description,
        bannerImage,
        targetSignatures: hasPetition ? Number(targetSignatures) : 0,
        targetAmount: hasDonation ? Number(targetAmount) : 0,
        modularBlocks: {
          hasPetition,
          hasTasks,
          hasDonation,
          hasEvent: false,
        },
      };

      const campRes = await api.post('/campaigns', campaignPayload);

      if (campRes.data.success) {
        const newCampaignId = campRes.data.campaign._id;

        // 2. Create Attached Tasks
        if (hasTasks && tasks.length > 0) {
          for (const t of tasks) {
            if (t.title.trim()) {
              await api.post('/tasks', {
                campaignId: newCampaignId,
                title: t.title,
                description: t.description,
                requiredSkills: t.requiredSkills,
                city: t.city || location,
                urgency: t.urgency,
                deadlineHours: Number(t.deadlineHours),
              });
            }
          }
        }

        navigate('/campaigns');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Layers className="w-4 h-4 text-brand-600" />
          Campaigner Studio
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Modular Campaign Builder</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure actions, set petition goals, and recruit volunteers matching specific skill sets.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm font-medium text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Campaign Overview */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 text-brand-600" />
            1. Campaign Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Campaign Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Clean Yamuna: Mandate Industrial Sewage Filters"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Focus Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Delhi NCR or National"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Short Summary</label>
              <input
                type="text"
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="A compelling 1-2 sentence hook for citizen action..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Full Campaign Story & Demands</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the background problem, who we are holding accountable, and why immediate citizen action is vital..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Section 2: Modular Action Blocks */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="w-5 h-5 text-brand-600" />
            2. Modular Action Blocks (Customizable per Campaign)
          </h2>

          {/* Modular Block A: Petition */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-sm">Action Block: Digital Petition</div>
                <div className="text-xs text-slate-500">Collect verified 1-click citizen signatures</div>
              </div>
              <input
                type="checkbox"
                checked={hasPetition}
                onChange={(e) => setHasPetition(e.target.checked)}
                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
              />
            </div>

            {hasPetition && (
              <div className="pt-2 border-t border-slate-200 flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700">Target Signatures Goal:</label>
                <input
                  type="number"
                  min="100"
                  value={targetSignatures}
                  onChange={(e) => setTargetSignatures(e.target.value)}
                  className="w-36 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                />
              </div>
            )}
          </div>

          {/* Modular Block B: Donations */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-sm">Action Block: Single Currency (INR) Crowdfunding</div>
                <div className="text-xs text-slate-500">Razorpay-powered micro contributions without platform tax overhead</div>
              </div>
              <input
                type="checkbox"
                checked={hasDonation}
                onChange={(e) => setHasDonation(e.target.checked)}
                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
              />
            </div>

            {hasDonation && (
              <div className="pt-2 border-t border-slate-200 flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700">Target Amount (₹ INR):</label>
                <input
                  type="number"
                  min="1000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-36 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                />
              </div>
            )}
          </div>

          {/* Modular Block C: Skill-Based Tasks */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 text-sm">Action Block: Skill-Based Task Callouts</div>
                <div className="text-xs text-slate-500">Mobilize volunteers matching exact skills with 48h countdown timers</div>
              </div>
              <input
                type="checkbox"
                checked={hasTasks}
                onChange={(e) => setHasTasks(e.target.checked)}
                className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
              />
            </div>

            {hasTasks && (
              <div className="space-y-4 pt-2 border-t border-slate-200">
                {tasks.map((task, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-brand-700">Task #{idx + 1}</span>
                      {tasks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTask(idx)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      placeholder="Task Title (e.g. Design 3 Campaign Posters)"
                      value={task.title}
                      onChange={(e) => updateTask(idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />

                    <textarea
                      rows={2}
                      placeholder="Specific instructions and requirements for volunteer..."
                      value={task.description}
                      onChange={(e) => updateTask(idx, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    ></textarea>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-bold text-slate-600">Required Skill:</label>
                        <select
                          value={task.requiredSkills[0] || 'Graphic Design'}
                          onChange={(e) => updateTask(idx, 'requiredSkills', [e.target.value])}
                          className="w-full mt-1 px-2 py-1.5 bg-slate-50 border rounded-lg font-medium"
                        >
                          {SKILL_OPTIONS.map((skill) => (
                            <option key={skill} value={skill}>
                              {skill}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-600">Task Completion Deadline:</label>
                        <select
                          value={task.deadlineHours}
                          onChange={(e) => updateTask(idx, 'deadlineHours', e.target.value)}
                          className="w-full mt-1 px-2 py-1.5 bg-slate-50 border rounded-lg font-medium"
                        >
                          <option value="12">12 Hours (Flash Rapid Response)</option>
                          <option value="24">24 Hours (1 Day)</option>
                          <option value="48">48 Hours (2 Days - Standard)</option>
                          <option value="72">72 Hours (3 Days)</option>
                          <option value="120">120 Hours (5 Days)</option>
                          <option value="168">168 Hours (1 Week)</option>
                          <option value="336">336 Hours (2 Weeks)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addTaskField}
                  className="py-2 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Another Action Task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? 'Publishing Campaign...' : 'Publish Modular Campaign & Mobilize'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default CampaignBuilder;
