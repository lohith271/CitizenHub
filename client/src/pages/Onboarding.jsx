import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Heart, Sparkles, Check, ArrowRight } from 'lucide-react';

const CITIES = ['Bengaluru', 'Delhi', 'Mumbai', 'Pune', 'Chennai', 'Kolkata', 'Hyderabad', 'National / Remote'];

const CAUSES = [
  'Air Pollution',
  'Forest & Wildlife',
  'Civic Rights & Justice',
  'Water & Sanitation',
  'Climate Action',
  'Women Safety & Equality',
];

const SKILLS = [
  { id: 'Graphic Design', desc: 'Posters, social banners, Canva' },
  { id: 'Legal/RTI', desc: 'Filing RTIs, reviewing draft bills' },
  { id: 'Video Editing', desc: 'Reels, YouTube shorts, drone clips' },
  { id: 'Social Media', desc: 'Twitter storms, Instagram growth' },
  { id: 'Field Mobilization', desc: 'On-ground marches, community surveys' },
  { id: 'Tech/Data', desc: 'Web development, scrapers, data analysis' },
  { id: 'Content Writing', desc: 'Press releases, petition letters' },
  { id: 'Translation', desc: 'Hindi, Tamil, Kannada, Marathi, etc.' },
];

const Onboarding = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedCity, setSelectedCity] = useState(user?.city || 'Bengaluru');
  const [selectedCauses, setSelectedCauses] = useState(user?.causes || ['Air Pollution']);
  const [selectedSkills, setSelectedSkills] = useState(user?.skills || ['Graphic Design']);
  const [submitting, setSubmitting] = useState(false);

  const toggleCause = (cause) => {
    setSelectedCauses((prev) =>
      prev.includes(cause) ? prev.filter((c) => c !== cause) : [...prev, cause]
    );
  };

  const toggleSkill = (skillId) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]
    );
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      await updateProfile({
        city: selectedCity,
        causes: selectedCauses,
        skills: selectedSkills,
      });
      navigate('/feed');
    } catch (err) {
      console.error('Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl space-y-8">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            <span>Step {step} of 3</span>
            <span>{step === 1 ? 'Your City' : step === 2 ? 'Your Causes' : 'Your Skills'}</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* STEP 1: CITY */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-brand-600" />
                Where are you based?
              </h2>
              <p className="text-sm text-slate-500 mt-1">This helps us show you campaigns in your neighborhood.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  className={`p-3.5 rounded-2xl text-xs font-bold text-center border transition-all ${
                    selectedCity === city
                      ? 'bg-brand-50 border-brand-500 text-brand-800 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow flex items-center justify-center gap-2"
            >
              Continue to Causes <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: CAUSES */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                Which causes fire you up?
              </h2>
              <p className="text-sm text-slate-500 mt-1">Select all the movements you want to support.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CAUSES.map((cause) => {
                const selected = selectedCauses.includes(cause);
                return (
                  <button
                    key={cause}
                    type="button"
                    onClick={() => toggleCause(cause)}
                    className={`p-4 rounded-2xl text-left border flex items-center justify-between transition-all ${
                      selected
                        ? 'bg-brand-50 border-brand-500 text-brand-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-sm font-bold">{cause}</span>
                    {selected && <Check className="w-5 h-5 text-brand-600" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="py-3.5 px-6 border border-slate-300 font-bold text-slate-700 text-sm rounded-xl hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow flex items-center justify-center gap-2"
              >
                Continue to Skills <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SKILLS */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-500" />
                How can you help? (Your Skills)
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Campaigners post urgent tasks matching these skills. Select what you are good at!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SKILLS.map((skill) => {
                const selected = selectedSkills.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.id)}
                    className={`p-3.5 rounded-2xl text-left border flex items-start justify-between transition-all ${
                      selected
                        ? 'bg-brand-50 border-brand-500 text-brand-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold">{skill.id}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{skill.desc}</div>
                    </div>
                    {selected && <Check className="w-5 h-5 text-brand-600 shrink-0 mt-1" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="py-3.5 px-6 border border-slate-300 font-bold text-slate-700 text-sm rounded-xl hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={submitting}
                className="flex-1 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Saving Profile...' : 'Complete & Go to Action Feed'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
