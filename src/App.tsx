import React, { useState, useEffect } from 'react';
import { TripPlan } from './types/travel';
import { sampleTrips } from './data/sampleTrips';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { TripWizard } from './components/TripWizard';
import { ItineraryView } from './components/ItineraryView';
import { Compass, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'vibevoyage_current_trip';

export default function App() {
  const [activeView, setActiveView] = useState<'landing' | 'wizard' | 'itinerary'>('itinerary');
  const [currentTrip, setCurrentTrip] = useState<TripPlan>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.destination?.toLowerCase().includes('singapore')) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed reading from localStorage', e);
    }
    return sampleTrips.singapore;
  });
  const [wizardParams, setWizardParams] = useState<{ destination?: string; days?: number; groupMode?: boolean }>({});
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Listen for Google Maps Platform quota events (Tier 2 in-app defense)
  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Ensure Singapore demo trip is always saved to localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved || !JSON.parse(saved)?.destination?.toLowerCase().includes('singapore')) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleTrips.singapore));
        setCurrentTrip(sampleTrips.singapore);
      }
    } catch (e) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleTrips.singapore));
      setCurrentTrip(sampleTrips.singapore);
    }
  }, []);

  // Save current trip to LocalStorage whenever it updates
  const handleUpdateTrip = (updated: TripPlan) => {
    setCurrentTrip(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed writing to localStorage', e);
    }
  };

  const handleTripComplete = (newTrip: TripPlan) => {
    handleUpdateTrip(newTrip);
    setActiveView('itinerary');
  };

  const handleStartNewTrip = (destination?: string, days?: number, groupMode?: boolean) => {
    setWizardParams({ destination, days, groupMode });
    setActiveView('wizard');
  };

  const handleLoadSample = (key: string) => {
    if (sampleTrips[key]) {
      handleUpdateTrip(sampleTrips[key]);
      setActiveView('itinerary');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-rose-500 selection:text-white">
      
      {/* Tier 2 In-App Google Maps Quota Warning Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Strict 3-zone Header with single-line Plan New Trip Search Bar */}
      <Navbar
        onNewTrip={(dest) => handleStartNewTrip(dest)}
        onSelectSample={handleLoadSample}
        activeView={activeView}
        onGoHome={() => setActiveView('landing')}
        hasActiveTrip={Boolean(currentTrip)}
        onViewActiveTrip={() => setActiveView('itinerary')}
        isLiveAI={currentTrip?.isLiveAI ?? true}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'landing' && (
          <LandingHero
            onStartNewTrip={handleStartNewTrip}
            onLoadSingaporeDemo={() => handleLoadSample('singapore')}
            onLoadTokyoDemo={() => handleLoadSample('tokyo')}
            onLoadBaliDemo={() => handleLoadSample('bali')}
          />
        )}

        {activeView === 'wizard' && (
          <TripWizard
            initialDestination={wizardParams.destination}
            initialDays={wizardParams.days}
            initialGroupMode={wizardParams.groupMode}
            onComplete={handleTripComplete}
            onCancel={() => setActiveView(currentTrip ? 'itinerary' : 'landing')}
          />
        )}

        {activeView === 'itinerary' && currentTrip && (
          <ItineraryView
            trip={currentTrip}
            onUpdateTrip={handleUpdateTrip}
            onNewTrip={() => handleStartNewTrip()}
          />
        )}
      </main>

      {/* Consumer Startup Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-800">VibeVoyage</span>
            <span>·</span>
            <span>Collaborative Travel Itinerary Engine</span>
            <span>·</span>
            <span className="text-emerald-700 font-medium">Google Maps Platform Integrated</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hover:text-slate-700 cursor-pointer transition-colors">Privacy</span>
            <span>·</span>
            <span className="hover:text-slate-700 cursor-pointer transition-colors">Terms</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              Powered by <Sparkles className="w-3 h-3 text-amber-500" /> Gemini 3.8 Flash & Google Maps
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
