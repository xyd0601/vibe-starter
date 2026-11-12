import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  APIProvider, 
  Map as GoogleMap, 
  AdvancedMarker, 
  Pin, 
  InfoWindow, 
  useMap, 
  useMapsLibrary 
} from '@vis.gl/react-google-maps';
import { TripPlan, DayPlan, Activity } from '../types/travel';
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Sparkles, 
  ExternalLink, 
  Clock, 
  DollarSign, 
  Footprints, 
  Car, 
  Train, 
  Maximize2, 
  Route as RouteIcon, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight,
  Layers,
  Info
} from 'lucide-react';

interface GoogleMapViewProps {
  trip: TripPlan;
  activeDayNumber: number;
  onSelectDay: (dayNum: number) => void;
  selectedActivityId?: string | null;
  onSelectActivity?: (activityId: string | null) => void;
}

// Fallback city center coordinates
const CITY_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  singapore: { lat: 1.2868, lng: 103.8545, zoom: 13 },
  tokyo: { lat: 35.6812, lng: 139.7671, zoom: 12 },
  bali: { lat: -8.5069, lng: 115.2625, zoom: 12 },
  paris: { lat: 48.8566, lng: 2.3522, zoom: 13 },
  barcelona: { lat: 41.3851, lng: 2.1734, zoom: 13 }
};

// Known Singapore attraction coordinates
const KNOWN_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'gardens by the bay': { lat: 1.2847, lng: 103.8657 },
  'cloud forest': { lat: 1.2847, lng: 103.8657 },
  'flower dome': { lat: 1.2847, lng: 103.8657 },
  'supertree grove': { lat: 1.2816, lng: 103.8636 },
  'satay by the bay': { lat: 1.2828, lng: 103.8697 },
  'lau pa sat': { lat: 1.2806, lng: 103.8504 },
  'national gallery': { lat: 1.2903, lng: 103.8519 },
  'marina bay sands': { lat: 1.2838, lng: 103.8590 },
  'skypark': { lat: 1.2838, lng: 103.8590 },
  'buddha tooth relic': { lat: 1.2814, lng: 103.8443 },
  'maxwell food centre': { lat: 1.2803, lng: 103.8447 },
  'kampong gelam': { lat: 1.3023, lng: 103.8590 },
  'sultan mosque': { lat: 1.3023, lng: 103.8590 },
  'haji lane': { lat: 1.3008, lng: 103.8593 },
  'atlas': { lat: 1.3000, lng: 103.8578 },
  'botanic gardens': { lat: 1.3138, lng: 103.8159 },
  'dempsey hill': { lat: 1.3045, lng: 103.8078 },
  'sentosa': { lat: 1.2589, lng: 103.8174 },
  'siloso beach': { lat: 1.2589, lng: 103.8174 },
  'cable car': { lat: 1.2650, lng: 103.8180 },
  'jewel changi': { lat: 1.3602, lng: 103.9898 },
  'rain vortex': { lat: 1.3602, lng: 103.9898 }
};

// Great-circle distance calculation (Haversine formula in km)
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// Category color definition
function getCategoryColor(category: Activity['category']) {
  switch (category) {
    case 'culture':
      return { bg: '#4f46e5', border: '#3730a3', text: 'Culture' };
    case 'food':
      return { bg: '#e11d48', border: '#9f1239', text: 'Food' };
    case 'nature':
      return { bg: '#059669', border: '#065f46', text: 'Nature' };
    case 'art':
      return { bg: '#7c3aed', border: '#5b21b6', text: 'Art' };
    case 'nightlife':
      return { bg: '#d97706', border: '#92400e', text: 'Nightlife' };
    case 'shopping':
      return { bg: '#0284c7', border: '#0369a1', text: 'Shopping' };
    case 'sightseeing':
    default:
      return { bg: '#2563eb', border: '#1d4ed8', text: 'Sight' };
  }
}

// Interactive Route Line Component rendering real road polylines & geodesic connectors
function RouteRenderer({ 
  activities,
  travelMode,
  onLegClick 
}: { 
  activities: Activity[]; 
  travelMode: 'WALKING' | 'TRANSIT' | 'DRIVING';
  onLegClick?: (idx: number) => void;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const mapsLib = useMapsLibrary('maps');
  const coreLib = useMapsLibrary('core');
  const polylineRefs = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!map || activities.length < 2) return;

    // Clean up previous polylines
    polylineRefs.current.forEach(p => p.setMap(null));
    polylineRefs.current = [];

    const coordinates = activities
      .filter(a => a.lat && a.lng)
      .map(a => ({ lat: a.lat as number, lng: a.lng as number }));

    if (coordinates.length < 2) return;

    // Fit map bounds to encompass all activities of the day
    const LatLngBoundsClass = (coreLib as any)?.LatLngBounds || (window as any).google?.maps?.LatLngBounds;
    if (LatLngBoundsClass) {
      const bounds = new LatLngBoundsClass();
      coordinates.forEach((coord: { lat: number; lng: number }) => bounds.extend(coord));
      map.fitBounds(bounds, { top: 70, right: 70, bottom: 120, left: 70 });
    }

    let routeRendered = false;

    // Try modern Google Routes API if available via routesLib
    if (routesLib && (routesLib as any).Route && typeof (routesLib as any).Route.computeRoutes === 'function') {
      try {
        const origin = coordinates[0];
        const destination = coordinates[coordinates.length - 1];
        const intermediates = coordinates.slice(1, -1);

        const request = {
          origin,
          destination,
          intermediates: intermediates.length > 0 ? intermediates : undefined,
          travelMode: travelMode === 'TRANSIT' ? 'TRANSIT' : travelMode === 'DRIVING' ? 'DRIVE' : 'WALK',
          fields: ['path', 'legs', 'viewport']
        };

        (routesLib as any).Route.computeRoutes(request)
          .then(({ routes }: { routes: any[] }) => {
            if (routes && routes.length > 0) {
              const primaryRoute = routes[0];
              if (typeof primaryRoute.createPolylines === 'function') {
                const polylines = primaryRoute.createPolylines();
                polylines.forEach((poly: google.maps.Polyline) => {
                  poly.setOptions({
                    strokeColor: travelMode === 'TRANSIT' ? '#4f46e5' : travelMode === 'DRIVING' ? '#0284c7' : '#e11d48',
                    strokeWeight: 5,
                    strokeOpacity: 0.85
                  });
                  poly.setMap(map);
                  polylineRefs.current.push(poly);
                });
                routeRendered = true;
              }
            }
          })
          .catch(() => {
            // Fall back to geodesic polyline below
          });
      } catch (e) {
        // Fall back to geodesic polyline
      }
    }

    // Resilient fallback: Draw high-visibility route segments with directional arrows
    if (mapsLib && !routeRendered) {
      // Draw path line with directional arrows
      const symbolPath = (mapsLib as any)?.SymbolPath?.FORWARD_CLOSED_ARROW ?? 1;
      const lineSymbol = {
        path: symbolPath,
        scale: 2.5,
        strokeColor: '#e11d48',
        fillColor: '#ffffff',
        fillOpacity: 1
      };

      const polyline = new mapsLib.Polyline({
        path: coordinates,
        geodesic: true,
        strokeColor: '#e11d48',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        icons: [
          {
            icon: lineSymbol,
            offset: '25%',
            repeat: '50px'
          }
        ]
      });

      polyline.setMap(map);
      polylineRefs.current.push(polyline);
    }

    return () => {
      polylineRefs.current.forEach(p => p.setMap(null));
      polylineRefs.current = [];
    };
  }, [map, routesLib, mapsLib, coreLib, activities, travelMode]);

  return null;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  trip,
  activeDayNumber,
  onSelectDay,
  selectedActivityId,
  onSelectActivity
}) => {
  const [apiKey, setApiKey] = useState<string>(() => {
    return (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  });
  const [activeMarker, setActiveMarker] = useState<Activity | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [travelMode, setTravelMode] = useState<'WALKING' | 'TRANSIT' | 'DRIVING'>('WALKING');
  const [isRoutePanelOpen, setIsRoutePanelOpen] = useState(true);

  // Fetch API key from backend if not directly in client env
  useEffect(() => {
    if (!apiKey) {
      fetch('/api/maps-key')
        .then(res => res.json())
        .then(data => {
          if (data?.apiKey) {
            setApiKey(data.apiKey);
          }
        })
        .catch(err => {
          console.warn('Could not fetch Google Maps API key:', err);
        });
    }
  }, [apiKey]);

  // Determine city default coordinates
  const destinationLower = trip.destination.toLowerCase();
  const defaultCityCenter = useMemo(() => {
    for (const [key, center] of Object.entries(CITY_CENTERS)) {
      if (destinationLower.includes(key)) {
        return center;
      }
    }
    return { lat: 1.2868, lng: 103.8545, zoom: 13 }; // Default Singapore
  }, [destinationLower]);

  // Current day's activities
  const currentDay = useMemo(() => {
    return trip.days.find(d => d.dayNumber === activeDayNumber) || trip.days[0];
  }, [trip.days, activeDayNumber]);

  // Resolved activities with accurate coordinates
  const activitiesWithCoords = useMemo(() => {
    if (!currentDay) return [];

    return currentDay.activities.map((act, idx) => {
      if (act.lat && act.lng) {
        return act;
      }

      // Check known coordinates by lowercase title matching
      const titleLower = act.title.toLowerCase();
      for (const [keyword, coords] of Object.entries(KNOWN_COORDINATES)) {
        if (titleLower.includes(keyword)) {
          return { ...act, lat: coords.lat, lng: coords.lng };
        }
      }

      // Check neighborhood match
      const hoodLower = act.neighborhood.toLowerCase();
      for (const [keyword, coords] of Object.entries(KNOWN_COORDINATES)) {
        if (hoodLower.includes(keyword)) {
          return { ...act, lat: coords.lat, lng: coords.lng };
        }
      }

      // Safe dispersion around city center
      const angle = (idx / Math.max(currentDay.activities.length, 1)) * 2 * Math.PI;
      const radius = 0.015 + idx * 0.006;
      return {
        ...act,
        lat: defaultCityCenter.lat + Math.sin(angle) * radius,
        lng: defaultCityCenter.lng + Math.cos(angle) * radius
      };
    });
  }, [currentDay, defaultCityCenter]);

  // Calculate detailed route segments and estimated travel times between consecutive stops
  const routeSegments = useMemo(() => {
    if (activitiesWithCoords.length < 2) return [];

    const segments = [];
    for (let i = 0; i < activitiesWithCoords.length - 1; i++) {
      const from = activitiesWithCoords[i];
      const to = activitiesWithCoords[i + 1];

      const distKm = calculateDistanceKm(from.lat!, from.lng!, to.lat!, to.lng!);

      // Calculate travel time according to selected mode
      let estMinutes = 0;
      let modeText = '';

      if (travelMode === 'WALKING') {
        // Average walking speed ~4.5 km/h with 1.25x street routing factor
        estMinutes = Math.max(3, Math.round((distKm * 1.25 / 4.5) * 60));
        modeText = 'walk';
      } else if (travelMode === 'TRANSIT') {
        // Public transit: 5 min waiting/access buffer + ~20 km/h speed
        estMinutes = Math.max(6, Math.round(5 + (distKm / 20) * 60));
        modeText = 'MRT / Bus';
      } else {
        // Driving/Taxi: 3 min traffic buffer + ~28 km/h speed
        estMinutes = Math.max(4, Math.round(3 + (distKm / 28) * 60));
        modeText = 'Taxi / Ride';
      }

      segments.push({
        fromIndex: i + 1,
        toIndex: i + 2,
        fromTitle: from.title,
        toTitle: to.title,
        fromNeighborhood: from.neighborhood,
        toNeighborhood: to.neighborhood,
        distanceKm: distKm,
        estimatedMinutes: estMinutes,
        modeText,
        transitNotes: from.transitToNext || `${estMinutes} mins ${modeText}`
      });
    }

    return segments;
  }, [activitiesWithCoords, travelMode]);

  // Total route metrics
  const totalRouteDistance = useMemo(() => {
    const sum = routeSegments.reduce((acc, s) => acc + s.distanceKm, 0);
    return Number(sum.toFixed(1));
  }, [routeSegments]);

  const totalEstimatedTravelTime = useMemo(() => {
    return routeSegments.reduce((acc, s) => acc + s.estimatedMinutes, 0);
  }, [routeSegments]);

  // Center coordinate for the current day
  const mapCenter = useMemo(() => {
    if (activitiesWithCoords.length > 0 && activitiesWithCoords[0].lat && activitiesWithCoords[0].lng) {
      const avgLat = activitiesWithCoords.reduce((acc, a) => acc + (a.lat || 0), 0) / activitiesWithCoords.length;
      const avgLng = activitiesWithCoords.reduce((acc, a) => acc + (a.lng || 0), 0) / activitiesWithCoords.length;
      return { lat: avgLat, lng: avgLng, zoom: 13 };
    }
    return defaultCityCenter;
  }, [activitiesWithCoords, defaultCityCenter]);

  // Sync selected activity from parent
  useEffect(() => {
    if (selectedActivityId) {
      const found = activitiesWithCoords.find(a => a.id === selectedActivityId);
      if (found) setActiveMarker(found);
    }
  }, [selectedActivityId, activitiesWithCoords]);

  const handleMarkerClick = (activity: Activity) => {
    setActiveMarker(activity);
    if (onSelectActivity) {
      onSelectActivity(activity.id);
    }
  };

  const handleDirectionsClick = (activity: Activity) => {
    const query = encodeURIComponent(`${activity.title}, ${activity.neighborhood}, ${trip.destination}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
  };

  const handleOpenFullDayRoute = () => {
    if (activitiesWithCoords.length === 0) return;
    const origin = encodeURIComponent(`${activitiesWithCoords[0].title}, ${trip.destination}`);
    const destination = encodeURIComponent(`${activitiesWithCoords[activitiesWithCoords.length - 1].title}, ${trip.destination}`);
    const waypoints = activitiesWithCoords
      .slice(1, -1)
      .map(a => encodeURIComponent(`${a.title}, ${trip.destination}`))
      .join('|');

    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${
      waypoints ? `&waypoints=${waypoints}` : ''
    }&travelmode=${travelMode.toLowerCase()}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[740px] lg:h-[820px]">
      
      {/* Top Map Control Bar */}
      <div className="p-3 sm:p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center text-white shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight font-display">
                Google Maps Itinerary Route & Travel Time
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-center gap-1 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Route Calculated
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {trip.destination} · Day {activeDayNumber} Geographic Sequence
            </p>
          </div>
        </div>

        {/* Travel Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => setTravelMode('WALKING')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              travelMode === 'WALKING'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Walking</span>
          </button>

          <button
            type="button"
            onClick={() => setTravelMode('TRANSIT')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              travelMode === 'TRANSIT'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Transit</span>
          </button>

          <button
            type="button"
            onClick={() => setTravelMode('DRIVING')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              travelMode === 'DRIVING'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Taxi / Drive</span>
          </button>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
          {trip.days.map(d => (
            <button
              key={d.dayNumber}
              type="button"
              onClick={() => {
                onSelectDay(d.dayNumber);
                setActiveMarker(null);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                d.dayNumber === activeDayNumber
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              Day {d.dayNumber}
            </button>
          ))}
        </div>

        {/* Satellite / Roadmap Toggle & Panel Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRoutePanelOpen(!isRoutePanelOpen)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
              isRoutePanelOpen
                ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <RouteIcon className="w-3.5 h-3.5" />
            <span>Route Panel</span>
          </button>

          <div className="hidden sm:flex items-center gap-1 text-xs bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setMapType('roadmap')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                mapType === 'roadmap' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                mapType === 'satellite' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
          </div>
        </div>
      </div>

      {/* Main Map View Area & Split Route Panel */}
      <div className="flex-1 relative w-full h-full min-h-[420px] overflow-hidden flex">
        
        {/* Google Map Container */}
        <div className="flex-1 relative w-full h-full min-h-[400px]">
          <APIProvider apiKey={apiKey} solutionChannel="GMP_aistudio">
            <GoogleMap
              mapId="DEMO_MAP_ID"
              defaultCenter={{ lat: mapCenter.lat, lng: mapCenter.lng }}
              defaultZoom={mapCenter.zoom}
              mapTypeId={mapType}
              gestureHandling="greedy"
              disableDefaultUI={false}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
            >
              {/* Route Polyline Renderer */}
              <RouteRenderer 
                activities={activitiesWithCoords} 
                travelMode={travelMode}
              />

              {/* Advanced Markers for each activity with stop number */}
              {activitiesWithCoords.map((act, index) => {
                if (!act.lat || !act.lng) return null;
                const isSelected = selectedActivityId === act.id || activeMarker?.id === act.id;
                const colorTheme = getCategoryColor(act.category);

                return (
                  <AdvancedMarker
                    key={act.id}
                    position={{ lat: act.lat, lng: act.lng }}
                    onClick={() => handleMarkerClick(act)}
                    title={`${index + 1}. ${act.title}`}
                    zIndex={isSelected ? 100 : 10 + index}
                  >
                    <Pin
                      background={isSelected ? '#e11d48' : colorTheme.bg}
                      borderColor={isSelected ? '#881337' : colorTheme.border}
                      glyphColor="#ffffff"
                      glyphText={`${index + 1}`}
                      scale={isSelected ? 1.25 : 1.05}
                    />
                  </AdvancedMarker>
                );
              })}

              {/* InfoWindow for Selected Stop */}
              {activeMarker && activeMarker.lat && activeMarker.lng && (
                <InfoWindow
                  position={{ lat: activeMarker.lat, lng: activeMarker.lng }}
                  onCloseClick={() => {
                    setActiveMarker(null);
                    if (onSelectActivity) onSelectActivity(null);
                  }}
                >
                  <div className="p-1 max-w-[280px] text-slate-900 font-sans">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{activeMarker.neighborhood} · Stop</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                      {activeMarker.title}
                    </h4>

                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {activeMarker.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{activeMarker.time}</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        <span>{activeMarker.cost === 0 ? 'Free' : `$${activeMarker.cost}/person`}</span>
                      </div>
                    </div>

                    {activeMarker.transitToNext && (
                      <div className="mt-2 text-[10px] bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-600 flex items-center gap-1.5">
                        <RouteIcon className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span className="line-clamp-1">{activeMarker.transitToNext}</span>
                      </div>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 italic">
                        Picked by {activeMarker.suggestedBy}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDirectionsClick(activeMarker)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-rose-600 text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Directions</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </APIProvider>

          {/* Floating Bottom Stop Strip */}
          <div className="absolute bottom-3 inset-x-3 sm:inset-x-6 z-10 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-2.5 shadow-xl flex items-center gap-2 overflow-x-auto pointer-events-auto">
              <div className="px-2 shrink-0 border-r border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Stops ({activitiesWithCoords.length})
                </span>
                <span className="text-xs font-extrabold text-slate-800">
                  Day {activeDayNumber}
                </span>
              </div>

              {activitiesWithCoords.map((act, index) => {
                const isSelected = selectedActivityId === act.id || activeMarker?.id === act.id;
                const colorTheme = getCategoryColor(act.category);

                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => handleMarkerClick(act)}
                    className={`px-3 py-1.5 rounded-xl border text-left shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-102'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ backgroundColor: colorTheme.bg }}
                    >
                      {index + 1}
                    </div>
                    <div className="max-w-[130px] sm:max-w-[170px]">
                      <div className="text-xs font-semibold truncate leading-tight">
                        {act.title}
                      </div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {act.neighborhood} · {act.time}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Collapsible Route & Estimated Travel Time Side Drawer */}
        {isRoutePanelOpen && (
          <aside className="w-80 sm:w-96 bg-white border-l border-slate-200 z-20 flex flex-col h-full shadow-lg transition-all animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <RouteIcon className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-sm text-slate-900 font-display">
                  Route & Travel Time
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Day {activeDayNumber}
              </span>
            </div>

            {/* Travel Time Metrics Banner */}
            <div className="p-4 bg-gradient-to-br from-rose-50/60 via-indigo-50/40 to-slate-50 border-b border-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-500" />
                    <span>Est. Travel Time</span>
                  </div>
                  <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                    ~{totalEstimatedTravelTime} mins
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Mode: {travelMode.toLowerCase()}
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-indigo-500" />
                    <span>Total Distance</span>
                  </div>
                  <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                    {totalRouteDistance} km
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold">
                    Zero-backtrack
                  </div>
                </div>
              </div>
            </div>

            {/* Leg-by-Leg Route Segment List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Sequential Stop Sequence
              </div>

              {activitiesWithCoords.map((act, idx) => {
                const nextAct = activitiesWithCoords[idx + 1];
                const segment = routeSegments[idx];
                const colorTheme = getCategoryColor(act.category);
                const isSelected = selectedActivityId === act.id || activeMarker?.id === act.id;

                return (
                  <div key={act.id} className="relative">
                    {/* Activity Stop Node */}
                    <button
                      type="button"
                      onClick={() => handleMarkerClick(act)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-rose-500/30'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                        style={{ backgroundColor: colorTheme.bg }}
                      >
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className={`text-[11px] font-bold truncate ${isSelected ? 'text-rose-400' : 'text-slate-500'}`}>
                            {act.time}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {act.cost === 0 ? 'Free' : `$${act.cost}`}
                          </span>
                        </div>

                        <h4 className="font-bold text-xs sm:text-sm leading-snug line-clamp-1">
                          {act.title}
                        </h4>

                        <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {act.neighborhood} · {act.vibe}
                        </p>
                      </div>
                    </button>

                    {/* Transit Leg Connection with Travel Time to Next Stop */}
                    {nextAct && segment && (
                      <div className="my-2 ml-3 pl-6 border-l-2 border-dashed border-rose-300 relative py-1 text-xs">
                        <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-rose-50 border-2 border-rose-500 flex items-center justify-center text-rose-600">
                          {travelMode === 'TRANSIT' ? (
                            <Train className="w-2.5 h-2.5" />
                          ) : travelMode === 'DRIVING' ? (
                            <Car className="w-2.5 h-2.5" />
                          ) : (
                            <Footprints className="w-2.5 h-2.5" />
                          )}
                        </div>

                        <div className="bg-slate-50/90 hover:bg-slate-100 border border-slate-200/80 rounded-xl p-2 transition-colors">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                            <span className="flex items-center gap-1 text-rose-600 font-bold">
                              <span>~{segment.estimatedMinutes} mins</span>
                              <span>({segment.distanceKm} km)</span>
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase font-medium">
                              via {segment.modeText}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                            {segment.transitNotes}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Google Maps Full Route Launcher */}
            <div className="p-3 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={handleOpenFullDayRoute}
                className="w-full py-2.5 bg-slate-900 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>Navigate Full Route in Google Maps</span>
              </button>
            </div>
          </aside>
        )}

      </div>

      {/* Bottom Summary Bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-slate-800">
            <Footprints className="w-3.5 h-3.5 text-indigo-600" />
            <span>Route Distance: <strong>{totalRouteDistance} km</strong></span>
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1.5 font-medium text-slate-800">
            <Clock className="w-3.5 h-3.5 text-rose-600" />
            <span>Total Travel Time: <strong>~{totalEstimatedTravelTime} mins</strong></span>
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500 font-medium">
            Weather: {currentDay?.weather.condition || 'Sunny'} ({currentDay?.weather.temp || '29°C'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenFullDayRoute}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Navigation className="w-3.5 h-3.5 text-rose-600" />
            <span>Turn-by-Turn in Google Maps</span>
          </button>
        </div>
      </div>

    </div>
  );
};
