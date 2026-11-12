import React, { useState } from 'react';
import { Compass, Sparkles, Globe, Search, X, MapPin } from 'lucide-react';

interface NavbarProps {
  onNewTrip: (destination?: string) => void;
  onSelectSample: (tripKey: string) => void;
  activeView: 'landing' | 'wizard' | 'itinerary';
  onGoHome: () => void;
  hasActiveTrip: boolean;
  onViewActiveTrip: () => void;
  isLiveAI?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewTrip,
  onSelectSample,
  activeView,
  onGoHome,
  hasActiveTrip,
  onViewActiveTrip,
  isLiveAI = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickSelect, setShowQuickSelect] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowQuickSelect(false);
    onNewTrip(searchQuery.trim() || undefined);
  };

  const handleQuickPick = (dest: string) => {
    setSearchQuery(dest);
    setShowQuickSelect(false);
    onNewTrip(dest);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Zone 1: Brand Wordmark */}
        <button 
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left text-slate-900 group whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-rose-500/20">
            <Compass className="w-5 h-5 transition-transform group-hover:rotate-45" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-bold text-lg tracking-tight font-display text-slate-900 leading-tight">
              VibeVoyage
            </span>
            <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase -mt-0.5">
              Collaborative Travel AI
            </span>
          </div>
        </button>

        {/* Zone 2: Single-Line Plan New Trip Search Bar */}
        <div className="flex-1 max-w-md lg:max-w-xl mx-1 sm:mx-2 relative">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center bg-slate-100/90 hover:bg-slate-100 focus-within:bg-white border border-slate-200 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/15 rounded-xl transition-all shadow-2xs"
          >
            <div className="pl-3 pr-1.5 text-slate-400 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowQuickSelect(true)}
              placeholder="Search destination to plan trip... (e.g. Singapore, Tokyo, Paris)"
              className="w-full py-1.5 sm:py-2 bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium truncate"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 mr-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="mr-1 my-1 px-3 sm:px-3.5 py-1.5 bg-slate-900 hover:bg-rose-600 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Plan New Trip</span>
              <span className="sm:hidden">Plan</span>
            </button>
          </form>

          {/* Quick suggestions dropdown on focus */}
          {showQuickSelect && (
            <div 
              className="absolute top-full left-0 right-0 mt-1.5 p-2 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-1"
              onMouseLeave={() => setShowQuickSelect(false)}
            >
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Featured Destinations</span>
                <span className="text-[10px] text-slate-400 font-normal">Click to plan or preview</span>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {[
                  { name: 'Singapore', desc: 'Marina Bay & Hawkers (Google Maps Demo)' },
                  { name: 'Tokyo, Japan', desc: 'Culture & Food' },
                  { name: 'Ubud & Canggu, Bali', desc: 'Wellness & Surf' },
                  { name: 'Paris & Marais, France', desc: 'Cafes & Art' }
                ].map(item => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      if (item.name === 'Singapore') {
                        onSelectSample('singapore');
                        setShowQuickSelect(false);
                      } else {
                        handleQuickPick(item.name);
                      }
                    }}
                    className={`flex items-start gap-2 p-1.5 text-left rounded-lg transition-colors cursor-pointer ${
                      item.name === 'Singapore' ? 'bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${item.name === 'Singapore' ? 'text-rose-600' : 'text-slate-400'}`} />
                    <div>
                      <div className={`text-xs font-semibold ${item.name === 'Singapore' ? 'text-rose-950 font-bold' : 'text-slate-800'}`}>
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{item.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Zone 3: Navigation Links & Actions */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <nav className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-600">
            <button
              onClick={onGoHome}
              className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
                activeView === 'landing' ? 'text-rose-600 font-semibold' : ''
              }`}
            >
              Overview
            </button>
            
            {hasActiveTrip && (
              <button
                onClick={onViewActiveTrip}
                className={`transition-colors whitespace-nowrap hover:text-slate-900 ${
                  activeView === 'itinerary' ? 'text-rose-600 font-semibold' : ''
                }`}
              >
                Current Trip
              </button>
            )}

            <button
              onClick={() => onSelectSample('singapore')}
              className="px-2.5 py-1 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              title="Open Singapore 3-Day Demo with Google Maps"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span>Singapore Demo</span>
            </button>

            <div className="relative group">
              <button className="flex items-center gap-1 transition-colors whitespace-nowrap hover:text-slate-900">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Samples</span>
              </button>
              <div className="absolute top-full right-0 mt-2 w-56 p-1.5 bg-white rounded-xl shadow-xl border border-slate-200 hidden group-hover:block z-50">
                <button
                  onClick={() => onSelectSample('singapore')}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 rounded-lg flex flex-col cursor-pointer border-b border-slate-100"
                >
                  <span className="font-semibold text-rose-600 flex items-center justify-between">
                    <span>Singapore 3-Day Highlights</span>
                    <span className="text-[9px] bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded font-bold">Maps</span>
                  </span>
                  <span className="text-slate-500 text-[10px]">Gardens, Hawkers & Marina Bay</span>
                </button>
                <button
                  onClick={() => onSelectSample('tokyo')}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 rounded-lg flex flex-col cursor-pointer"
                >
                  <span className="font-semibold text-slate-800">Tokyo 3-Day Odyssey</span>
                  <span className="text-slate-500 text-[10px]">3 Friends · 94% Match</span>
                </button>
                <button
                  onClick={() => onSelectSample('bali')}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 rounded-lg flex flex-col cursor-pointer"
                >
                  <span className="font-semibold text-slate-800">Bali 3-Day Wellness</span>
                  <span className="text-slate-500 text-[10px]">Solo Explorer</span>
                </button>
              </div>
            </div>
          </nav>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/50">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-medium">Gemini 3.8</span>
          </div>
        </div>
      </div>
    </header>
  );
};
