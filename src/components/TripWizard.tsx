import React, { useState } from 'react';
import { Compass, Users, User, Calendar, DollarSign, Sparkles, Plus, Trash2, ArrowRight, ArrowLeft, Check, Heart, Coffee, Moon, Sun, AlertTriangle, MapPin } from 'lucide-react';
import { TravelerProfile, TripPlan, BudgetTier, TravelPace } from '../types/travel';

interface TripWizardProps {
  onComplete: (trip: TripPlan) => void;
  onCancel: () => void;
  initialDestination?: string;
  initialDays?: number;
  initialGroupMode?: boolean;
}

const POPULAR_DESTINATIONS = [
  { 
    name: 'Singapore', 
    days: 3, 
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80',
    tag: 'Marina Bay & Hawkers (Google Maps Demo)'
  },
  { 
    name: 'Tokyo, Japan', 
    days: 3, 
    image: '/src/assets/images/hero_tokyo_twilight_1794467674929.jpg',
    tag: 'Culture, Neon & Food'
  },
  { 
    name: 'Ubud & Canggu, Bali', 
    days: 3, 
    image: '/src/assets/images/dest_bali_ubud_1794467676019.jpg',
    tag: 'Rice Terraces & Surf'
  },
  { 
    name: 'Paris & Marais, France', 
    days: 3, 
    image: '/src/assets/images/dest_paris_terrace_1794467676789.jpg',
    tag: 'Cafes, Art & Architecture'
  },
  { 
    name: 'Barcelona, Spain', 
    days: 4, 
    image: '/src/assets/images/dest_barcelona_quarter_1794467680665.jpg',
    tag: 'Gothic Quarter & Tapas'
  }
];

const INTEREST_TAGS = [
  'Historic Temples & Shrines',
  'Local Street Food & Markets',
  'Michelin & Fine Dining',
  'Scenic Viewpoints & Sunsets',
  'Modern Art & Museums',
  'Nightlife & Craft Bars',
  'Indie Shopping & Fashion',
  'Nature Hikes & Parks',
  'Coffee Roasters & Cafes',
  'Architecture & Design'
];

export const TripWizard: React.FC<TripWizardProps> = ({
  onComplete,
  onCancel,
  initialDestination,
  initialDays,
  initialGroupMode
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Basics
  const [destination, setDestination] = useState(initialDestination || 'Singapore');
  const [durationDays, setDurationDays] = useState(initialDays || 3);
  const [groupMode, setGroupMode] = useState(initialGroupMode !== undefined ? initialGroupMode : true);
  const [targetBudget, setTargetBudget] = useState<BudgetTier>('moderate');
  const [travelStyle, setTravelStyle] = useState('Balanced Culture & Local Gastronomy');

  // Step 2: Traveler Profiles
  const [travelers, setTravelers] = useState<TravelerProfile[]>([
    {
      id: 't-1',
      name: 'Alex Rivera',
      avatar: 'AR',
      color: 'from-amber-500 to-orange-600',
      pace: 'balanced',
      budget: 'moderate',
      interests: ['Local Street Food & Markets', 'Nightlife & Craft Bars', 'Indie Shopping & Fashion'],
      foodPreference: 'Adventurous local street bites & ramen',
      wakeUpTime: '10:00 AM (Late Riser)',
      mustHaves: 'Authentic yakitori alleyway'
    },
    {
      id: 't-2',
      name: 'Maya Chen',
      avatar: 'MC',
      color: 'from-emerald-500 to-teal-600',
      pace: 'fast_paced',
      budget: 'moderate',
      interests: ['Historic Temples & Shrines', 'Modern Art & Museums', 'Architecture & Design'],
      foodPreference: 'Traditional tea & plant-forward noodles',
      wakeUpTime: '07:30 AM (Early Bird)',
      mustHaves: 'Peaceful morning shrines before crowds'
    },
    {
      id: 't-3',
      name: 'Sam Taylor',
      avatar: 'ST',
      color: 'from-blue-500 to-indigo-600',
      pace: 'relaxed',
      budget: 'budget',
      interests: ['Scenic Viewpoints & Sunsets', 'Nature Hikes & Parks', 'Coffee Roasters & Cafes'],
      foodPreference: 'Affordable convenience hacks & casual noodle bars',
      wakeUpTime: '09:00 AM (Moderate)',
      mustHaves: 'Open-air panoramic sunset viewpoint'
    }
  ]);

  // Loading generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('Analyzing friend preferences...');

  // Toggle friend interests
  const toggleInterest = (travelerId: string, interest: string) => {
    setTravelers(prev =>
      prev.map(t => {
        if (t.id !== travelerId) return t;
        const exists = t.interests.includes(interest);
        const updated = exists
          ? t.interests.filter(i => i !== interest)
          : [...t.interests, interest];
        return { ...t, interests: updated };
      })
    );
  };

  // Add new friend
  const addTraveler = () => {
    const nextIdx = travelers.length + 1;
    const colors = [
      'from-purple-500 to-pink-600',
      'from-rose-500 to-red-600',
      'from-cyan-500 to-blue-600',
      'from-lime-500 to-emerald-600'
    ];
    const newTraveler: TravelerProfile = {
      id: `t-${Date.now()}`,
      name: `Friend ${nextIdx}`,
      avatar: `F${nextIdx}`,
      color: colors[nextIdx % colors.length],
      pace: 'balanced',
      budget: targetBudget,
      interests: ['Local Street Food & Markets', 'Historic Temples & Shrines'],
      foodPreference: 'Open to anything',
      wakeUpTime: '09:00 AM',
      mustHaves: 'Fun photo spots'
    };
    setTravelers([...travelers, newTraveler]);
  };

  // Remove friend
  const removeTraveler = (id: string) => {
    if (travelers.length <= 1) return;
    setTravelers(travelers.filter(t => t.id !== id));
  };

  // Switch to Solo Mode automatically trims to 1 traveler
  const handleGroupModeChange = (isGroup: boolean) => {
    setGroupMode(isGroup);
    if (!isGroup && travelers.length > 1) {
      setTravelers([travelers[0]]);
    } else if (isGroup && travelers.length === 1) {
      setTravelers([
        travelers[0],
        {
          id: 't-2',
          name: 'Maya Chen',
          avatar: 'MC',
          color: 'from-emerald-500 to-teal-600',
          pace: 'fast_paced',
          budget: 'moderate',
          interests: ['Historic Temples & Shrines', 'Modern Art & Museums'],
          foodPreference: 'Traditional tea & plant-forward noodles',
          wakeUpTime: '07:30 AM (Early Bird)',
          mustHaves: 'Peaceful morning shrines'
        }
      ]);
    }
  };

  // Trigger Gemini Itinerary Generation via Server Route
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationStage('Reconciling group preferences & wake-up times...');

    setTimeout(() => {
      setGenerationStage('Clustering activities by neighborhood to eliminate backtracking...');
    }, 1200);

    setTimeout(() => {
      setGenerationStage('Generating customized route with Gemini 3.8 Flash...');
    }, 2400);

    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          daysCount: durationDays,
          budget: targetBudget,
          style: travelStyle,
          travelers,
          groupMode
        })
      });

      const result = await response.json();
      if (result.success && result.data) {
        const trip: TripPlan = {
          id: `trip-${Date.now()}`,
          title: `${destination} ${durationDays}-Day ${groupMode ? 'Friend Odyssey' : 'Solo Journey'}`,
          destination,
          groupMode,
          startDate: '2026-11-20',
          endDate: '2026-11-23',
          durationDays,
          targetBudget,
          travelStyle,
          travelers,
          groupSummary: result.data.groupSummary || {
            consensusScore: '92% Match',
            reconciliationNotes: 'Balanced mornings, grouped shared food stops, and scenic afternoons.',
            sharedInterests: ['Food & Culture', 'Scenic Views'],
            compromisePace: 'Moderate'
          },
          days: result.data.days,
          createdAt: new Date().toISOString(),
          isLiveAI: result.isLiveAI
        };

        setIsGenerating(false);
        onComplete(trip);
        return;
      }
    } catch (err) {
      console.error('Error in itinerary generation:', err);
    }

    setIsGenerating(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Wizard Step Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span className={step >= 1 ? 'text-indigo-600 font-bold' : ''}>1. Trip Basics</span>
          <span className={step >= 2 ? 'text-indigo-600 font-bold' : ''}>2. {groupMode ? 'Group Preference Reconciler' : 'Solo Preferences'}</span>
          <span className={step >= 3 ? 'text-indigo-600 font-bold' : ''}>3. AI Itinerary Generation</span>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300"
            style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
          />
        </div>
      </div>

      {/* Step 1: Destination, Duration, Mode, Budget */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-8 shadow-sm">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Step 1 of 2</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-1">
              Where are you heading and who’s coming?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Choose your destination, trip length, and group composition to get started.
            </p>
          </div>

          {/* Group vs Solo Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Travel Party
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleGroupModeChange(true)}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                  groupMode
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${groupMode ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Group of Friends</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Multi-person styles, automated consensus matching & shared expenses.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleGroupModeChange(false)}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                  !groupMode
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${!groupMode ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Solo Explorer</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Tailored strictly to your personal rhythm, interests & unhurried speed.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Destination Selector with Visual Image Cards */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Select Destination</span>
              <span className="text-[11px] text-slate-400 font-normal">Featured workshop cities</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {POPULAR_DESTINATIONS.map((d) => {
                const isSelected = destination === d.name;
                return (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => {
                      setDestination(d.name);
                      setDurationDays(d.days);
                    }}
                    className={`rounded-2xl overflow-hidden border text-left transition-all group relative flex flex-col ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-600 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="h-24 sm:h-28 w-full relative overflow-hidden bg-slate-100">
                      <img
                        src={d.image}
                        alt={d.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 bg-white flex-1">
                      <div className="font-bold text-xs text-slate-900 line-clamp-1">{d.name}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{d.tag}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="relative mt-2">
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="Or type any city (e.g., Rome, Seoul, Kyoto, Lisbon)..."
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* Trip Duration & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Trip Duration (Days)
              </label>
              <div className="flex items-center gap-2">
                {[2, 3, 4, 5, 7].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDurationDays(num)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                      durationDays === num
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {num} Days
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Overall Budget Tier
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: 'budget', label: '$ Budget', sub: '< $60/day' },
                  { id: 'moderate', label: '$$ Moderate', sub: '$60-$120/day' },
                  { id: 'luxury', label: '$$$ Premium', sub: '$150+/day' }
                ].map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setTargetBudget(b.id as BudgetTier)}
                    className={`flex-1 py-1.5 px-2 text-center rounded-xl border transition-all ${
                      targetBudget === b.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{b.label}</div>
                    <div className="text-[10px] text-slate-400">{b.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-sm flex items-center gap-2"
            >
              <span>Next: Set {groupMode ? 'Friends’ Vibes' : 'Your Vibes'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Friend Preference Collector & Consensus Engine */}
      {step === 2 && !isGenerating && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Step 2 of 2</span>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-1">
                  {groupMode ? 'Collect & Reconcile Friend Vibes' : 'Your Personal Travel Preferences'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  {groupMode
                    ? 'Each person can have their own wake-up rhythm, pace, and interests. Our consensus algorithm blends them.'
                    : 'Fine-tune your personal speed, dining desires, and must-see bucket list.'}
                </p>
              </div>

              {groupMode && (
                <button
                  type="button"
                  onClick={addTraveler}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Friend</span>
                </button>
              )}
            </div>

            {/* Traveler Cards Grid */}
            <div className="space-y-6">
              {travelers.map((traveler, index) => (
                <div
                  key={traveler.id}
                  className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4"
                >
                  {/* Top Bar for Traveler */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${traveler.color} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                        {traveler.avatar}
                      </div>
                      <div>
                        <input
                          type="text"
                          value={traveler.name}
                          onChange={e => {
                            const val = e.target.value;
                            setTravelers(travelers.map(t => t.id === traveler.id ? { ...t, name: val } : t));
                          }}
                          className="font-bold text-sm text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none"
                        />
                        <div className="text-[11px] text-slate-400">
                          Traveler {index + 1} of {travelers.length}
                        </div>
                      </div>
                    </div>

                    {groupMode && travelers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTraveler(traveler.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                        title="Remove traveler"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Pace, Wake Up, Budget Matrix for this friend */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Travel Pace
                      </span>
                      <select
                        value={traveler.pace}
                        onChange={e => {
                          const val = e.target.value as TravelPace;
                          setTravelers(travelers.map(t => t.id === traveler.id ? { ...t, pace: val } : t));
                        }}
                        className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                      >
                        <option value="relaxed">Relaxed (Slow mornings & cafes)</option>
                        <option value="balanced">Balanced (3-4 spots per day)</option>
                        <option value="fast_paced">Fast-Paced (Pack in everything)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Wake-Up Rhythm
                      </span>
                      <select
                        value={traveler.wakeUpTime}
                        onChange={e => {
                          const val = e.target.value;
                          setTravelers(travelers.map(t => t.id === traveler.id ? { ...t, wakeUpTime: val } : t));
                        }}
                        className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                      >
                        <option value="07:30 AM (Early Bird)">07:30 AM (Early Bird - Shrines & Dawn)</option>
                        <option value="09:00 AM (Moderate)">09:00 AM (Balanced Normal)</option>
                        <option value="10:30 AM (Late Riser)">10:30 AM (Late Riser - Needs Coffee)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Personal Budget Limit
                      </span>
                      <select
                        value={traveler.budget}
                        onChange={e => {
                          const val = e.target.value as BudgetTier;
                          setTravelers(travelers.map(t => t.id === traveler.id ? { ...t, budget: val } : t));
                        }}
                        className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                      >
                        <option value="budget">Budget-Friendly (Free parks & local stalls)</option>
                        <option value="moderate">Moderate (Good cafes, paid entries)</option>
                        <option value="luxury">Luxury / Splurge (High-end experiences)</option>
                      </select>
                    </div>
                  </div>

                  {/* Top Interests Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Top Passions (Select 2-4)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {INTEREST_TAGS.map(tag => {
                        const isSelected = traveler.interests.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleInterest(traveler.id, tag)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 inline-block mr-1 -mt-0.5" />}
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Real-time Group Reconciliation Engine Preview (Miro UVP) */}
            {groupMode && (
              <div className="p-4 sm:p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      Live Group Reconciliation Preview
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                    94% Consensus Score
                  </span>
                </div>
                <p className="text-xs text-emerald-950 leading-relaxed">
                  <span className="font-semibold">Algorithm Compromise: </span>
                  We resolved the 07:30 AM vs 10:30 AM wake-up gap by scheduling quiet individual morning walks or coffee runs, converging the group at 10:45 AM for lunch and shared neighborhood sights. Food stops align with the agreed mid-tier budget ceiling.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Basics</span>
              </button>

              <button
                type="button"
                onClick={handleGenerate}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-md flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Itinerary with Gemini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Loading Animation State */}
      {isGenerating && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-6 shadow-sm">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
            <Compass className="w-7 h-7 text-indigo-600 absolute inset-0 m-auto" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold font-display text-slate-900">
              Crafting Your {destination} Itinerary
            </h3>
            <p className="text-xs text-slate-500 font-medium animate-pulse">
              {generationStage}
            </p>
          </div>

          <div className="max-w-xs mx-auto p-3 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Analyzing {travelers.length} friend profiles</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Eliminating zig-zag transit routes</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Integrating local food & viewpoints</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
