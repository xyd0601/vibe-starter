import React from 'react';
import { Compass, Users, Sparkles, MapPin, ArrowRight, ShieldCheck, Clock, Route, DollarSign, CloudRain, Check, ChevronRight, Star, Heart } from 'lucide-react';

interface LandingHeroProps {
  onStartNewTrip: (destination?: string, days?: number, groupMode?: boolean) => void;
  onLoadSingaporeDemo: () => void;
  onLoadTokyoDemo: () => void;
  onLoadBaliDemo: () => void;
}

const DESTINATION_CARDS = [
  {
    key: 'singapore',
    name: 'Singapore',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80',
    tag: 'Google Maps Route · 3 Days',
    title: 'Gardens by the Bay, Hawker Feasts & Marina Bay',
    vibe: '96% Consensus Match',
    price: '$52 / day'
  },
  {
    key: 'tokyo',
    name: 'Tokyo, Japan',
    image: '/src/assets/images/hero_tokyo_twilight_1794467674929.jpg',
    tag: 'Group Favorite · 3 Days',
    title: 'Neon, Shinto Shrines & Hidden Izakayas',
    vibe: '94% Consensus Match',
    price: '$58 / day'
  },
  {
    key: 'bali',
    name: 'Ubud & Canggu, Bali',
    image: '/src/assets/images/dest_bali_ubud_1794467676019.jpg',
    tag: 'Solo Retreat · 3 Days',
    title: 'Emerald Rice Terraces & Sound Healing',
    vibe: '100% Personal Flow',
    price: '$45 / day'
  },
  {
    key: 'paris',
    name: 'Paris & Marais, France',
    image: '/src/assets/images/dest_paris_terrace_1794467676789.jpg',
    tag: 'Couples & Foodies · 3 Days',
    title: 'Artisanal Roasteries, Galleries & Bistros',
    vibe: '92% Shared Vibe',
    price: '$85 / day'
  },
  {
    key: 'barcelona',
    name: 'Barcelona, Spain',
    image: '/src/assets/images/dest_barcelona_quarter_1794467680665.jpg',
    tag: 'Friends & Culture · 4 Days',
    title: 'Gothic Quarter Tapas & Modernist Architecture',
    vibe: '96% Consensus Match',
    price: '$65 / day'
  }
];

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartNewTrip,
  onLoadSingaporeDemo,
  onLoadTokyoDemo,
  onLoadBaliDemo
}) => {
  const [searchDest, setSearchDest] = React.useState('');
  const [searchDays, setSearchDays] = React.useState(3);
  const [searchParty, setSearchParty] = React.useState(true); // true = group

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onStartNewTrip(searchDest.trim() || undefined, searchDays, searchParty);
  };

  return (
    <div className="space-y-20 pb-20">
      
      {/* Hero Section with High-Fidelity Split Layout */}
      <section className="relative pt-8 sm:pt-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Value Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-200/80 rounded-full text-xs font-semibold text-rose-900 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>Intelligent Travel Engine · Built for Friends & Solo Trips</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-display text-balance leading-[1.12]">
              Travel planning without the group chat chaos.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              VibeVoyage reconciles conflicting friend styles, eliminates zigzagging routes, matches budgets privately, and generates realistic daily itineraries powered by Gemini.
            </p>

            {/* Single-Line Plan New Trip Search Bar */}
            <div className="pt-2 space-y-3">
              <form
                onSubmit={handleHeroSearch}
                className="bg-white rounded-2xl border-2 border-slate-200 hover:border-slate-300 focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-100 shadow-md p-1.5 transition-all flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
              >
                {/* Where to? */}
                <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5 min-w-[200px]">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Where to?
                    </label>
                    <input
                      type="text"
                      value={searchDest}
                      onChange={(e) => setSearchDest(e.target.value)}
                      placeholder="e.g. Singapore, Tokyo, Bali, Paris..."
                      className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-transparent placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="hidden sm:block w-px h-8 bg-slate-200" />

                {/* Duration */}
                <div className="flex items-center gap-2 px-3 py-1.5 shrink-0">
                  <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Duration
                    </label>
                    <select
                      value={searchDays}
                      onChange={(e) => setSearchDays(Number(e.target.value))}
                      className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value={2}>2 Days</option>
                      <option value={3}>3 Days</option>
                      <option value={4}>4 Days</option>
                      <option value={5}>5 Days</option>
                      <option value={7}>7 Days</option>
                    </select>
                  </div>
                </div>

                <div className="hidden sm:block w-px h-8 bg-slate-200" />

                {/* Party */}
                <div className="flex items-center gap-2 px-3 py-1.5 shrink-0">
                  <Users className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Party
                    </label>
                    <select
                      value={searchParty ? 'group' : 'solo'}
                      onChange={(e) => setSearchParty(e.target.value === 'group')}
                      className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value="group">Group of Friends</option>
                      <option value="solo">Solo Explorer</option>
                    </select>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="px-5 py-3 bg-slate-900 hover:bg-rose-600 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer group whitespace-nowrap"
                >
                  <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
                  <span>Plan New Trip</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>

              {/* Quick Destination Chips & Demo Shortcut */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5 text-slate-500">
                  <span className="font-medium text-slate-400 text-[11px]">Popular:</span>
                  {[
                    { label: 'Singapore', val: 'Singapore' },
                    { label: 'Tokyo', val: 'Tokyo, Japan' },
                    { label: 'Bali', val: 'Ubud & Canggu, Bali' },
                    { label: 'Paris', val: 'Paris & Marais, France' },
                    { label: 'Barcelona', val: 'Barcelona, Spain' }
                  ].map(dest => (
                    <button
                      key={dest.label}
                      type="button"
                      onClick={() => {
                        if (dest.val === 'Singapore') {
                          onLoadSingaporeDemo();
                        } else {
                          setSearchDest(dest.val);
                          onStartNewTrip(dest.val, searchDays, searchParty);
                        }
                      }}
                      className={`px-2.5 py-1 border rounded-lg font-medium transition-colors cursor-pointer text-[11px] ${
                        dest.label === 'Singapore'
                          ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold hover:bg-rose-100'
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {dest.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={onLoadSingaporeDemo}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Or preview Singapore 3-Day Demo (Google Maps Route)</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Quiet Trust Bar */}
            <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Free instant prototype
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Google Maps Route & Travel Time
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Powered by Gemini 3.8
              </span>
            </div>
          </div>

          {/* Right Column: Visual Destination Hero Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 group">
              <img
                src="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80"
                alt="Singapore Marina Bay Sands and Skyline"
                referrerPolicy="no-referrer"
                className="w-full h-[420px] sm:h-[480px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
              
              {/* Floating Overlay Badge: Group Consensus */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">96% Group Consensus · Google Maps</span>
              </div>

              {/* Floating Bottom Card Content */}
              <div className="absolute bottom-0 inset-x-0 p-6 text-white space-y-2">
                <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Singapore · 3-Day Demo Trip</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-display leading-snug">
                  Gardens by the Bay & Lau Pa Sat Hawkers
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2">
                  Reconciled morning mist at Cloud Forest with late-night satay feasts and craft cocktails, with calculated travel times and interactive route maps.
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-amber-500 border-2 border-white text-[10px] font-bold flex items-center justify-center text-white">AR</div>
                    <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white text-[10px] font-bold flex items-center justify-center text-white">MC</div>
                    <div className="w-7 h-7 rounded-full bg-blue-500 border-2 border-white text-[10px] font-bold flex items-center justify-center text-white">ST</div>
                  </div>

                  <button
                    onClick={onLoadSingaporeDemo}
                    className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Singapore Demo</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destination Showcase Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Trending Itineraries
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mt-1">
              Popular Pre-Reconciled Trips
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            Click any destination below to immediately test the daily timeline, activity voting, and adaptive replanning.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DESTINATION_CARDS.map((dest) => (
            <div
              key={dest.key}
              onClick={() => {
                if (dest.key === 'singapore') onLoadSingaporeDemo();
                else if (dest.key === 'tokyo') onLoadTokyoDemo();
                else if (dest.key === 'bali') onLoadBaliDemo();
                else onStartNewTrip(dest.name);
              }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer group flex flex-col"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={dest.image}
                  alt={dest.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[11px] font-semibold text-slate-800 px-2.5 py-0.5 rounded-full shadow-2xs">
                  {dest.tag}
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-950/75 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                  {dest.price}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold text-slate-900">{dest.name}</span>
                    <span className="text-emerald-700 font-medium">{dest.vibe}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 group-hover:text-rose-600 transition-colors line-clamp-1">
                    {dest.title}
                  </h3>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
                  <span>Explore Plan</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Showcase Split: Friends Planning Together */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 lg:p-12 overflow-hidden relative shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Built for Real Friend Groups
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold font-display leading-tight">
                No one person has to plan everything anymore.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                When one friend wants to wake up at 7:00 AM for sunrise temples and another wants to sleep until 10:30 AM before hitting cafe roasteries, traditional planning fails.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-white block">Multi-Traveler Preference Capture</span>
                    <span className="text-slate-400">Collects pace, budget ceilings, dietary rules, and must-see spots without awkward confrontations.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Route className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-white block">Geographic Neighborhood Clustering</span>
                    <span className="text-slate-400">Eliminates back-and-forth zigzagging across huge metro areas, saving 2+ hours daily.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CloudRain className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-white block">1-Tap In-Trip Adaptive Replanner</span>
                    <span className="text-slate-400">Rainy weather? Slower morning? One tap adapts the day with cozy covered alternatives.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onStartNewTrip()}
                  className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>Build Your Group Itinerary</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <img
                  src="/src/assets/images/travelers_friends_planning_1794467677172.jpg"
                  alt="Friends planning travel together"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 sm:h-96 object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4 Core Value Propositions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Value Propositions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            Built to Solve Real Travel Planning Problems
          </h2>
          <p className="text-sm text-slate-600">
            Directly addressing group coordination, routing, and budget friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Inclusive Group Consensus</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No one gets stuck planning everything. Each friend sets wake-up hours, dietary desires, and pace. Our algorithm finds the compromise curve.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 font-medium border-t border-slate-100 flex items-center justify-between">
              <span>Shared voting</span>
              <span className="text-rose-600 font-semibold">94% typical consensus</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Route className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Zero Backtracking Routes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Stop spending half your holiday riding trains back and forth. Activities are grouped geographically by district with calculated transit gaps.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 font-medium border-t border-slate-100 flex items-center justify-between">
              <span>Neighborhood clusters</span>
              <span className="text-indigo-600 font-semibold">Saves 2.5 hrs/day</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Stress-Free Budget Matching</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Avoid uncomfortable money discussions. Itineraries align with the group’s shared financial ceiling while tracking per-person costs.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 font-medium border-t border-slate-100 flex items-center justify-between">
              <span>Transparent itemized costs</span>
              <span className="text-emerald-600 font-semibold">Split calculator</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CloudRain className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Adaptive In-Trip Replanning</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When it pours rain or someone wakes up late, don't scrap your day. Tap 1 button and Gemini reconfigures your day with cozy indoor gems.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 font-medium border-t border-slate-100 flex items-center justify-between">
              <span>Rain & sleep-in modes</span>
              <span className="text-amber-600 font-semibold">Instant replanning</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
