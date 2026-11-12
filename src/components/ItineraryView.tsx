import React, { useState } from 'react';
import { 
  TripPlan, 
  Activity, 
  DayPlan 
} from '../types/travel';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  ThumbsUp, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  Plus, 
  Share2, 
  Sparkles, 
  CloudRain, 
  Coffee, 
  Wallet, 
  Check, 
  Users, 
  Info, 
  Calendar, 
  Layers, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sun,
  X,
  Compass
} from 'lucide-react';

import { GoogleMapView } from './GoogleMapView';

interface ItineraryViewProps {
  trip: TripPlan;
  onUpdateTrip: (updated: TripPlan) => void;
  onNewTrip: () => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  trip,
  onUpdateTrip,
  onNewTrip
}) => {
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [activeTab, setActiveTab] = useState<'timeline' | 'map' | 'consensus' | 'expenses'>('map');
  const [selectedMapActivityId, setSelectedMapActivityId] = useState<string | null>(null);
  
  // Modals
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptNotice, setAdaptNotice] = useState<string | null>(null);

  // New activity form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTime, setNewTime] = useState('02:00 PM');
  const [newCost, setNewCost] = useState('15');
  const [newCategory, setNewCategory] = useState<Activity['category']>('sightseeing');
  const [newNeighborhood, setNewNeighborhood] = useState('Central District');

  const currentDay = trip.days.find(d => d.dayNumber === selectedDayNumber) || trip.days[0];

  // Header background image matching
  const destLower = trip.destination.toLowerCase();
  let headerImage = 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1600&q=80';
  if (destLower.includes('singapore')) {
    headerImage = 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1600&q=80';
  } else if (destLower.includes('tokyo') || destLower.includes('japan')) {
    headerImage = '/src/assets/images/hero_tokyo_twilight_1794467674929.jpg';
  } else if (destLower.includes('bali') || destLower.includes('indonesia')) {
    headerImage = '/src/assets/images/dest_bali_ubud_1794467676019.jpg';
  } else if (destLower.includes('paris') || destLower.includes('france')) {
    headerImage = '/src/assets/images/dest_paris_terrace_1794467676789.jpg';
  } else if (destLower.includes('barcelona') || destLower.includes('spain')) {
    headerImage = '/src/assets/images/dest_barcelona_quarter_1794467680665.jpg';
  }

  // Voting interaction
  const handleVote = (actId: string) => {
    const updatedDays = trip.days.map(d => {
      if (d.dayNumber !== selectedDayNumber) return d;
      return {
        ...d,
        activities: d.activities.map(a => {
          if (a.id !== actId) return a;
          const userVoted = !a.userVoted;
          return {
            ...a,
            userVoted,
            votes: userVoted ? a.votes + 1 : a.votes - 1
          };
        })
      };
    });
    onUpdateTrip({ ...trip, days: updatedDays });
  };

  // Move activity up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const activities = [...currentDay.activities];
    const temp = activities[index - 1];
    activities[index - 1] = activities[index];
    activities[index] = temp;

    const updatedDays = trip.days.map(d =>
      d.dayNumber === selectedDayNumber ? { ...d, activities } : d
    );
    onUpdateTrip({ ...trip, days: updatedDays });
  };

  // Move activity down
  const handleMoveDown = (index: number) => {
    if (index === currentDay.activities.length - 1) return;
    const activities = [...currentDay.activities];
    const temp = activities[index + 1];
    activities[index + 1] = activities[index];
    activities[index] = temp;

    const updatedDays = trip.days.map(d =>
      d.dayNumber === selectedDayNumber ? { ...d, activities } : d
    );
    onUpdateTrip({ ...trip, days: updatedDays });
  };

  // Delete activity
  const handleDeleteActivity = (actId: string) => {
    const activities = currentDay.activities.filter(a => a.id !== actId);
    const updatedDays = trip.days.map(d =>
      d.dayNumber === selectedDayNumber
        ? {
            ...d,
            activities,
            estimatedBudgetPerPerson: activities.reduce((acc, a) => acc + (a.cost || 0), 0)
          }
        : d
    );
    onUpdateTrip({ ...trip, days: updatedDays });
  };

  // Save edited activity
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;

    const activities = currentDay.activities.map(a =>
      a.id === editingActivity.id ? editingActivity : a
    );
    const updatedDays = trip.days.map(d =>
      d.dayNumber === selectedDayNumber
        ? {
            ...d,
            activities,
            estimatedBudgetPerPerson: activities.reduce((acc, a) => acc + (a.cost || 0), 0)
          }
        : d
    );
    onUpdateTrip({ ...trip, days: updatedDays });
    setEditingActivity(null);
  };

  // Add custom activity
  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newAct: Activity = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      description: newDesc || 'Custom planned experience added by traveler.',
      time: newTime,
      cost: Number(newCost) || 0,
      duration: '1.5 hrs',
      category: newCategory,
      neighborhood: newNeighborhood,
      vibe: 'Personalized Pick',
      suggestedBy: trip.travelers[0]?.name || 'Traveler',
      votes: 1,
      userVoted: true,
      notes: 'Added directly into day schedule.',
      transitToNext: '10 min walk'
    };

    const activities = [...currentDay.activities, newAct];
    const updatedDays = trip.days.map(d =>
      d.dayNumber === selectedDayNumber
        ? {
            ...d,
            activities,
            estimatedBudgetPerPerson: activities.reduce((acc, a) => acc + (a.cost || 0), 0)
          }
        : d
    );

    onUpdateTrip({ ...trip, days: updatedDays });
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  // Quick In-Trip Adaptive Replanner (Miro Canvas sticky)
  const handleAdaptiveReplan = async (conditionType: 'rain' | 'slow_morning' | 'budget_trim') => {
    setIsAdapting(true);
    setAdaptNotice(`Optimizing Day ${selectedDayNumber} for ${conditionType === 'rain' ? 'indoor rainy-day spots' : conditionType === 'slow_morning' ? 'a slower, relaxed morning' : 'maximum budget efficiency'}...`);

    try {
      const response = await fetch('/api/replan-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day: currentDay,
          conditionType,
          destination: trip.destination
        })
      });

      const res = await response.json();
      if (res.success && res.day) {
        const updatedDays = trip.days.map(d =>
          d.dayNumber === selectedDayNumber ? res.day : d
        );
        onUpdateTrip({ ...trip, days: updatedDays });
        setAdaptNotice(`Day ${selectedDayNumber} successfully adapted!`);
        setTimeout(() => setAdaptNotice(null), 3500);
      }
    } catch (err) {
      console.error('Failed to replan day:', err);
    } finally {
      setIsAdapting(false);
    }
  };

  // Total trip cost per person calculation
  const totalCostPerPerson = trip.days.reduce(
    (acc, day) => acc + day.activities.reduce((dAcc, act) => dAcc + (act.cost || 0), 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Visual Destination Header Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200">
        <div className="h-64 sm:h-80 w-full relative">
          <img
            src={headerImage}
            alt={trip.destination}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        {/* Content Overlaid on Image */}
        <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-amber-300 bg-amber-950/60 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/30">
                {trip.destination}
              </span>
              <span className="text-xs font-semibold text-slate-200">
                {trip.durationDays} Days · {trip.groupMode ? `${trip.travelers.length} Friends` : 'Solo Traveler'}
              </span>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-400/30">
                {trip.groupSummary?.consensusScore || '94% Consensus Match'}
              </span>
              {trip.isLiveAI && (
                <span className="text-[11px] font-semibold text-indigo-200 bg-indigo-950/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-indigo-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Live Gemini 3.8
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tight text-white drop-shadow-sm">
              {trip.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
              {trip.groupSummary?.reconciliationNotes}
            </p>
          </div>

          {/* Action Group */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-colors flex items-center gap-2"
            >
              <Share2 className="w-4 h-4 text-slate-200" />
              <span>Share & Export</span>
            </button>

            <button
              onClick={onNewTrip}
              className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Itinerary</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Workspace Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 gap-4 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Daily Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'map'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>Google Maps Route</span>
            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
              activeTab === 'map' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}>
              Interactive
            </span>
          </button>

          <button
            onClick={() => setActiveTab('consensus')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'consensus'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Friend Consensus Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'expenses'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Split-Cost Tracker</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium whitespace-nowrap hidden sm:block">
          Estimated Trip Cost: <span className="font-bold text-slate-900">${totalCostPerPerson}</span> / person
        </div>
      </div>

      {/* Adapt Notice Banner */}
      {adaptNotice && (
        <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>{adaptNotice}</span>
          </div>
          <button onClick={() => setAdaptNotice(null)} className="text-indigo-400 hover:text-indigo-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: Daily Timeline View */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          {/* Day Selector Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {trip.days.map(d => {
              const isSelected = d.dayNumber === selectedDayNumber;
              return (
                <button
                  key={d.dayNumber}
                  onClick={() => setSelectedDayNumber(d.dayNumber)}
                  className={`px-4 py-3 rounded-2xl text-left border transition-all shrink-0 min-w-[170px] ${
                    isSelected
                      ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/20 shadow-sm'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="font-bold text-slate-900">Day {d.dayNumber}</span>
                    <span className="text-[11px] text-slate-400 font-medium">{d.weather?.temp}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                    {d.areaSummary}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Current Day Header & In-Trip Adaptive Replanner Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  {currentDay.date} · {currentDay.areaSummary}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mt-0.5">
                  {currentDay.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> {currentDay.weather?.condition}
                  </span>
                  <span>·</span>
                  <span>~{currentDay.estimatedWalkingKm} km walking</span>
                  <span>·</span>
                  <span className="font-semibold text-slate-800">
                    Est. ${currentDay.estimatedBudgetPerPerson} / person
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('map')}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Interactive Map</span>
                </button>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Activity</span>
                </button>
              </div>
            </div>

            {/* Adaptive Replanner Widget (Miro Canvas Key Proposition) */}
            <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50/50 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>In-Trip Adaptive Replanner</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Unforeseen weather or schedule change? Re-optimize this day with 1 tap:
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  disabled={isAdapting}
                  onClick={() => handleAdaptiveReplan('rain')}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                  title="Swap outdoor spots with covered markets and art galleries"
                >
                  <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                  <span>Rainy Day Safe</span>
                </button>

                <button
                  disabled={isAdapting}
                  onClick={() => handleAdaptiveReplan('slow_morning')}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                  title="Push start to 10:45 AM for a sleep-in"
                >
                  <Coffee className="w-3.5 h-3.5 text-amber-600" />
                  <span>Slower Morning (+1.5h)</span>
                </button>

                <button
                  disabled={isAdapting}
                  onClick={() => handleAdaptiveReplan('budget_trim')}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                  title="Cut paid admissions in half"
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Trim Budget (-50%)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Activity Cards Timeline */}
          <div className="space-y-4">
            {currentDay.activities.map((act, index) => {
              const categoryColors: Record<string, string> = {
                culture: 'bg-amber-50 text-amber-700 border-amber-200',
                food: 'bg-rose-50 text-rose-700 border-rose-200',
                nature: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                art: 'bg-purple-50 text-purple-700 border-purple-200',
                nightlife: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                shopping: 'bg-cyan-50 text-cyan-700 border-cyan-200',
                sightseeing: 'bg-blue-50 text-blue-700 border-blue-200'
              };

              return (
                <div key={act.id} className="relative group">
                  <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col md:flex-row items-start justify-between gap-5">
                    
                    {/* Time & Category Pill */}
                    <div className="md:w-36 shrink-0 space-y-1.5">
                      <div className="text-sm font-bold text-slate-900 font-mono">
                        {act.time}
                      </div>
                      <div className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${categoryColors[act.category] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {act.category.toUpperCase()}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {act.duration}
                      </div>
                    </div>

                    {/* Main Description */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">
                          {act.title}
                        </h3>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {act.neighborhood}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {act.description}
                      </p>

                      {act.notes && (
                        <div className="text-[11px] text-indigo-900 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{act.notes}</span>
                        </div>
                      )}

                      {/* Travel Attribution Tag */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                        <span className="text-slate-500 font-medium">
                          Inspired by: <span className="text-slate-900 font-semibold">{act.suggestedBy}</span>
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500">
                          Cost: <span className="font-semibold text-slate-900">{act.cost === 0 ? 'Free' : `$${act.cost} / person`}</span>
                        </span>
                      </div>
                    </div>

                    {/* Interactive Controls & Upvote */}
                    <div className="flex md:flex-col items-center justify-between md:justify-start gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      {/* Voting Button */}
                      <button
                        onClick={() => handleVote(act.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                          act.userVoted
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                        title="Vote for this activity"
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${act.userVoted ? 'fill-rose-600 text-rose-600' : ''}`} />
                        <span>{act.votes}</span>
                      </button>

                      {/* Reorder, Locate on Map, and Edit Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedMapActivityId(act.id);
                            setActiveTab('map');
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                          title="Locate on Google Maps"
                        >
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        </button>
                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveUp(index)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-20 rounded-md transition-colors"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={index === currentDay.activities.length - 1}
                          onClick={() => handleMoveDown(index)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-20 rounded-md transition-colors"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingActivity(act)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
                          title="Edit Activity"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(act.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                          title="Remove Activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Calculated Transit Indicator between activities */}
                  {index < currentDay.activities.length - 1 && act.transitToNext && (
                    <div className="py-2.5 px-6 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span>Transit: {act.transitToNext}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: Interactive Google Maps Route */}
      {activeTab === 'map' && (
        <div className="space-y-6">
          <GoogleMapView
            trip={trip}
            activeDayNumber={selectedDayNumber}
            onSelectDay={setSelectedDayNumber}
            selectedActivityId={selectedMapActivityId}
            onSelectActivity={setSelectedMapActivityId}
          />
        </div>
      )}

      {/* TAB 2: Friend Consensus Inspector */}
      {activeTab === 'consensus' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Group Preference Reconciliation
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mt-1">
                How VibeVoyage Reconciled Everyone’s Passions
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Transparent view of how competing travel speeds, wake-up hours, and budget tiers were synthesized.
              </p>
            </div>

            {/* Compromise Engine Card */}
            <div className="p-5 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  Harmonized Group Rhythm
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-white px-3 py-1 rounded-full border border-indigo-200 shadow-2xs">
                  {trip.groupSummary?.compromisePace}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed">
                {trip.groupSummary?.reconciliationNotes}
              </p>
            </div>

            {/* Individual Travelers Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trip.travelers.map(t => (
                <div key={t.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${t.color} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{t.name}</div>
                      <div className="text-[11px] text-slate-500">Wake-up: {t.wakeUpTime}</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-800">Pace: </span>{t.pace}
                    </div>
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-800">Budget Limit: </span>{t.budget}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 block mb-1">Top Passions:</span>
                      <div className="flex flex-wrap gap-1">
                        {t.interests.map((int, i) => (
                          <span key={i} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                            {int}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Shared Expenses & Split Cost Calculator */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Transparent Budget Tracker
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mt-1">
                Trip Expense & Group Split Breakdown
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Itemized calculations based on scheduled meals, admissions, and estimated transit.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-xs font-semibold text-slate-500">Estimated Total Trip Cost</span>
                <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                  ${totalCostPerPerson * trip.travelers.length}
                </div>
                <span className="text-[11px] text-slate-400">For all {trip.travelers.length} travelers</span>
              </div>

              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <span className="text-xs font-semibold text-emerald-800">Per Person Share</span>
                <div className="text-2xl font-bold text-emerald-900 mt-1 font-mono">
                  ${totalCostPerPerson}
                </div>
                <span className="text-[11px] text-emerald-700">~${Math.round(totalCostPerPerson / trip.durationDays)} / person / day</span>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-xs font-semibold text-slate-500">Target Budget Tier</span>
                <div className="text-2xl font-bold text-slate-900 mt-1 capitalize font-display">
                  {trip.targetBudget}
                </div>
                <span className="text-[11px] text-emerald-600 font-medium">Within target range</span>
              </div>
            </div>

            {/* Daily Breakdown Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-50 font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200 flex justify-between">
                <span>Day & Theme</span>
                <span>Est. Per Person</span>
              </div>
              <div className="divide-y divide-slate-100">
                {trip.days.map(d => (
                  <div key={d.dayNumber} className="px-5 py-3.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-900">Day {d.dayNumber}: {d.title}</span>
                      <span className="text-slate-400 block text-[11px]">{d.activities.length} activities scheduled</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono">
                      ${d.activities.reduce((sum, a) => sum + (a.cost || 0), 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Activity Modal */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Edit Activity</h3>
              <button onClick={() => setEditingActivity(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Title</label>
                <input
                  type="text"
                  value={editingActivity.title}
                  onChange={e => setEditingActivity({ ...editingActivity, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={editingActivity.description}
                  onChange={e => setEditingActivity({ ...editingActivity, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Time</label>
                  <input
                    type="text"
                    value={editingActivity.time}
                    onChange={e => setEditingActivity({ ...editingActivity, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Cost ($/person)</label>
                  <input
                    type="number"
                    value={editingActivity.cost}
                    onChange={e => setEditingActivity({ ...editingActivity, cost: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Neighborhood / Area</label>
                <input
                  type="text"
                  value={editingActivity.neighborhood}
                  onChange={e => setEditingActivity({ ...editingActivity, neighborhood: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Activity Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add Activity to Day {selectedDayNumber}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Activity Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Record Shopping in Shimokitazawa"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description / Local Tip</label>
                <textarea
                  rows={2}
                  placeholder="What makes this spot special?"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Cost ($/person)</label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={e => setNewCost(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 bg-white"
                  >
                    <option value="sightseeing">Sightseeing</option>
                    <option value="culture">Culture</option>
                    <option value="food">Food & Dining</option>
                    <option value="art">Art & Museum</option>
                    <option value="nature">Nature</option>
                    <option value="shopping">Shopping</option>
                    <option value="nightlife">Nightlife</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Neighborhood</label>
                  <input
                    type="text"
                    value={newNeighborhood}
                    onChange={e => setNewNeighborhood(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Add to Itinerary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share / Export Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Share Itinerary with Friends</h3>
              <button onClick={() => setIsShareModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Send this link to your group so friends can view the day schedule and upvote activities directly.
            </p>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Trip Invitation Link
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`https://vibevoyage.app/join/${trip.id}`}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-700 font-mono"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://vibevoyage.app/join/${trip.id}`);
                    alert('Share link copied to clipboard!');
                  }}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                WhatsApp Ready Summary
              </div>
              <textarea
                readOnly
                rows={4}
                value={`✈️ ${trip.title}\n📍 ${trip.destination} (${trip.durationDays} Days)\n👥 Group Match: ${trip.groupSummary?.consensusScore}\n💰 Est: $${totalCostPerPerson}/person\n\nCheck out our itinerary here: https://vibevoyage.app/join/${trip.id}`}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-700 font-mono"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`✈️ ${trip.title}\n📍 ${trip.destination}\nCheck it out: https://vibevoyage.app/join/${trip.id}`);
                  alert('WhatsApp text copied!');
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
              >
                Copy for WhatsApp / Group Chat
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
