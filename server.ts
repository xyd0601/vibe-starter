import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// API Route: Google Maps API key lookup
app.get('/api/maps-key', (_req: Request, res: Response) => {
  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
  res.json({ apiKey });
});

// Server-side Gemini initialization using official @google/genai guidelines
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback curated itinerary generator if Gemini API key is missing or encounters rate limits
function getFallbackItinerary(destination: string, daysCount: number, travelers: any[]) {
  const isSingapore = destination.toLowerCase().includes('singapore') || destination.toLowerCase().includes('sg');
  const isTokyo = destination.toLowerCase().includes('tokyo') || destination.toLowerCase().includes('japan');
  const isBali = destination.toLowerCase().includes('bali') || destination.toLowerCase().includes('indonesia');
  const isParis = destination.toLowerCase().includes('paris') || destination.toLowerCase().includes('france');

  const travelerNames = travelers.map(t => t.name || 'Traveler');

  const days = [];
  for (let d = 1; d <= daysCount; d++) {
    let dayTitle = `Day ${d}: Cultural Highlights & City Pulse`;
    let area = 'Central District';
    let activities = [];

    if (isSingapore) {
      if (d === 1) {
        dayTitle = 'Day 1: Futuristic Marina Bay, Supertree Grove & Lau Pa Sat Satay';
        area = 'Marina Bay & Civic District';
        activities = [
          {
            id: `act-${d}-1`,
            time: '09:30 AM',
            title: 'Gardens by the Bay: Cloud Forest & Flower Dome',
            description: 'Step into the cool mist of the world’s tallest indoor waterfall surrounded by lush tropical biodiversity.',
            category: 'nature',
            cost: 24,
            duration: '2.5 hrs',
            neighborhood: 'Marina Bay',
            vibe: 'Futuristic Eco-Wonder',
            suggestedBy: travelerNames[2] || 'Sam',
            votes: 3,
            notes: 'Air-conditioned conservatories keep the group energized.',
            transitToNext: '10 min walk via Dragonfly Bridge',
            lat: 1.2847,
            lng: 103.8657,
            address: '18 Marina Gardens Dr, Singapore 018953'
          },
          {
            id: `act-${d}-2`,
            time: '12:30 PM',
            title: 'Marina Bay Waterfront Walk to Satay by the Bay',
            description: 'Leisurely boardwalk stroll along the waterfront followed by Hainanese chicken rice and crispy popiah.',
            category: 'food',
            cost: 12,
            duration: '1.5 hrs',
            neighborhood: 'Marina South',
            vibe: 'Alfresco Foodie Hall',
            suggestedBy: travelerNames[0] || 'Alex',
            votes: 4,
            notes: 'Generous sharing plates for the group under budget.',
            transitToNext: '15 min via Bayfront MRT',
            lat: 1.2828,
            lng: 103.8697,
            address: '18 Marina Gardens Dr, Singapore'
          },
          {
            id: `act-${d}-3`,
            time: '03:30 PM',
            title: 'National Gallery Singapore & Padang Cityscape View',
            description: 'Restored former City Hall exploring world-leading modern Southeast Asian art.',
            category: 'art',
            cost: 15,
            duration: '2 hrs',
            neighborhood: 'Civic District',
            vibe: 'Modern Cultural Heritage',
            suggestedBy: travelerNames[1] || 'Maya',
            votes: 3,
            notes: 'Rooftop viewing gallery gives direct views over the Padang.',
            transitToNext: '10 min walk to Lau Pa Sat',
            lat: 1.2903,
            lng: 103.8519,
            address: '1 St Andrew\'s Rd, Singapore'
          },
          {
            id: `act-${d}-4`,
            time: '06:30 PM',
            title: 'Lau Pa Sat Hawker Market & Historic Satay Street',
            description: 'Victorian cast-iron market hall with outdoor smoke billows from charcoal grills serving sizzling satay.',
            category: 'food',
            cost: 20,
            duration: '2.5 hrs',
            neighborhood: 'Downtown Core',
            vibe: 'Electric Street Feast',
            suggestedBy: travelerNames[0] || 'Alex',
            votes: 4,
            notes: 'Order peanut sauce with pineapple puree. Top group consensus pick.',
            transitToNext: 'Return to stay',
            lat: 1.2806,
            lng: 103.8504,
            address: '18 Raffles Quay, Singapore'
          }
        ];
      } else if (d === 2) {
        dayTitle = 'Day 2: Chinatown Shophouses, Maxwell Hawker & Kampong Gelam';
        area = 'Chinatown & Bugis';
        activities = [
          {
            id: `act-${d}-1`,
            time: '09:00 AM',
            title: 'Buddha Tooth Relic Temple & Heritage Shophouses',
            description: 'Magnificent Tang-dynasty inspired temple housing sacred relics and rooftop orchid gardens.',
            category: 'culture',
            cost: 0,
            duration: '2 hrs',
            neighborhood: 'Chinatown',
            vibe: 'Serene Heritage',
            suggestedBy: travelerNames[1] || 'Maya',
            votes: 4,
            notes: 'Free entry; peaceful atmosphere.',
            transitToNext: '3 min walk across the street',
            lat: 1.2814,
            lng: 103.8443,
            address: '288 South Bridge Rd, Singapore'
          },
          {
            id: `act-${d}-2`,
            time: '12:00 PM',
            title: 'Maxwell Food Centre: Tian Tian Chicken Rice',
            description: 'Legendary hawker market. Sample tender chicken served over fragrant ginger-pandan rice.',
            category: 'food',
            cost: 8,
            duration: '1.2 hrs',
            neighborhood: 'Tanjong Pagar',
            vibe: 'Iconic Street Bites',
            suggestedBy: travelerNames[0] || 'Alex',
            votes: 4,
            notes: 'Pair with ice-cold sugarcane juice.',
            transitToNext: '15 min via MRT to Bugis',
            lat: 1.2803,
            lng: 103.8447,
            address: '1 Kadayanallur St, Singapore'
          },
          {
            id: `act-${d}-3`,
            time: '02:30 PM',
            title: 'Kampong Gelam & Sultan Mosque / Haji Lane',
            description: 'Historic Malay-Arab royal district. Browse eclectic mural art, indie streetwear, and artisanal cafes.',
            category: 'culture',
            cost: 5,
            duration: '2.5 hrs',
            neighborhood: 'Kampong Gelam',
            vibe: 'Bohemian & Artistic',
            suggestedBy: travelerNames[1] || 'Maya',
            votes: 3,
            notes: 'Take group photos in front of Haji Lane graffiti murals.',
            transitToNext: '5 min walk down North Bridge Road',
            lat: 1.3023,
            lng: 103.8590,
            address: '3 Muscat St, Singapore'
          },
          {
            id: `act-${d}-4`,
            time: '06:30 PM',
            title: 'Atlas Grand Lobby Gin Tower & Bugis Night Bazaar',
            description: '1920s Art Deco cathedral-style grand lounge with over 1,300 craft gin bottles.',
            category: 'nightlife',
            cost: 32,
            duration: '2 hrs',
            neighborhood: 'Bugis',
            vibe: 'Gatsby Glamour & Buzz',
            suggestedBy: travelerNames[0] || 'Alex',
            votes: 4,
            notes: 'Smart casual dress code.',
            transitToNext: 'Return via Bugis MRT',
            lat: 1.3000,
            lng: 103.8578,
            address: '600 North Bridge Rd, Singapore'
          }
        ];
      } else {
        dayTitle = 'Day 3: UNESCO Botanic Gardens, Sentosa Sunset & Jewel Changi';
        area = 'Tanglin & Changi';
        activities = [
          {
            id: `act-${d}-1`,
            time: '09:00 AM',
            title: 'Singapore Botanic Gardens & National Orchid Garden',
            description: '165-year-old UNESCO World Heritage tropical garden with 1,000+ species of VIP orchids.',
            category: 'nature',
            cost: 10,
            duration: '2.5 hrs',
            neighborhood: 'Tanglin',
            vibe: 'UNESCO Tranquility',
            suggestedBy: travelerNames[1] || 'Maya',
            votes: 4,
            notes: 'Early arrival avoids midday heat.',
            transitToNext: '10 min walk to Dempsey Hill',
            lat: 1.3138,
            lng: 103.8159,
            address: '1 Cluny Rd, Singapore'
          },
          {
            id: `act-${d}-2`,
            time: '12:30 PM',
            title: 'Dempsey Hill Colonial Barracks Brunch',
            description: 'Converted military barracks nestled in lush greenery with sourdough tartines and single-origin coffee.',
            category: 'food',
            cost: 22,
            duration: '2 hrs',
            neighborhood: 'Dempsey',
            vibe: 'Lush Forest Hideaway',
            suggestedBy: travelerNames[2] || 'Sam',
            votes: 3,
            notes: 'Relaxed unhurried lunch before afternoon island exploration.',
            transitToNext: '20 min taxi / MRT to Sentosa',
            lat: 1.3045,
            lng: 103.8078,
            address: 'Dempsey Rd, Singapore'
          },
          {
            id: `act-${d}-3`,
            time: '04:00 PM',
            title: 'Sentosa Scenic Cable Car & Siloso Beach Sunset Walk',
            description: 'Glide over the harbor with panoramic views of islands and coastlines.',
            category: 'sightseeing',
            cost: 20,
            duration: '2.5 hrs',
            neighborhood: 'Sentosa Island',
            vibe: 'Coastal Golden Hour',
            suggestedBy: travelerNames[2] || 'Sam',
            votes: 4,
            notes: 'Spectacular sunset lighting over Singapore Strait.',
            transitToNext: 'MRT transfer to Changi',
            lat: 1.2589,
            lng: 103.8174,
            address: 'Siloso Beach, Sentosa, Singapore'
          },
          {
            id: `act-${d}-4`,
            time: '07:30 PM',
            title: 'Jewel Changi: HSBC Rain Vortex & Canopy Park',
            description: 'World’s tallest indoor waterfall cascading 40 meters surrounded by a 4-story terraced Forest Valley.',
            category: 'sightseeing',
            cost: 0,
            duration: '2 hrs',
            neighborhood: 'Changi Airport',
            vibe: 'Architectural Masterpiece',
            suggestedBy: travelerNames[0] || 'Alex',
            votes: 4,
            notes: 'Unforgettable finale with evening light show.',
            transitToNext: 'Departure gates',
            lat: 1.3602,
            lng: 103.9898,
            address: '78 Airport Blvd, Singapore'
          }
        ];
      }
    } else if (isTokyo) {
      if (d === 1) {
        dayTitle = 'Day 1: Historic Asakusa & Modern Akihabara';
        area = 'Taito & Chiyoda';
        activities = [
          {
            id: `act-${d}-1`,
            time: '09:00 AM',
            title: 'Senso-ji Temple & Nakamise-dori',
            description: 'Wander Tokyo’s oldest Buddhist temple, savor freshly baked ningyo-yaki, and take in the iconic Kaminarimon Gate.',
            category: 'culture',
            cost: 0,
            duration: '2.5 hrs',
            neighborhood: 'Asakusa',
            vibe: 'Historic & Sensory',
            suggestedBy: travelerNames[0] || 'Alex',
            votes: 3,
            notes: 'Quiet early morning arrival avoids the midday tour crowds.',
            transitToNext: '15 min via Ginza Line'
          },
          {
            id: `act-${d}-2`,
            time: '12:30 PM',
            title: 'Artisanal Soba Lunch at Namiki Yabusoba',
            description: 'Michelin-recognized century-old soba parlor famed for buckwheat noodles served with rich dashi broth.',
            category: 'food',
            cost: 18,
            duration: '1 hr',
            neighborhood: 'Asakusa',
            vibe: 'Authentic Local Food',
            suggestedBy: travelerNames[1] || 'Maya',
            votes: 4,
            notes: 'Cash preferred; try the duck dipping sauce (kamo-seiro).',
            transitToNext: '10 min walk'
          },
          {
            id: `act-${d}-3`,
            time: '02:30 PM',
            title: 'Sumida River Cruise to Hamarikyu Gardens',
            description: 'Board a sleek water bus cruising downstream under 12 bridges, arriving directly inside feudal shogun landscaped gardens.',
            category: 'nature',
            cost: 12,
            duration: '2 hrs',
            neighborhood: 'Sumida & Shiodome',
            vibe: 'Scenic & Relaxed',
            suggestedBy: travelerNames[2] || 'Sam',
            votes: 3,
            notes: 'Stop by the 300-year-old teahouse inside the pond for matcha.',
            transitToNext: '20 min via Yamanote'
          },
          {
            id: `act-${d}-4`,
            time: '06:30 PM',
            title: 'Omoide Yokocho (Memory Lane) Yakitori & Craft Beer',
            description: 'Atmospheric post-war lantern-lit alleyways grilling skewers over binchotan charcoal.',
            category: 'nightlife',
            cost: 28,
            duration: '2 hrs',
            neighborhood: 'Shinjuku',
            vibe: 'Vibrant Nightlife',
            suggestedBy: travelerNames[0] || 'Alex',
            votes: 4,
            notes: 'Great spot for group casual dining and local Izakaya vibes.',
            transitToNext: 'Back to hotel'
          }
        ];
      } else if (d === 2) {
        dayTitle = 'Day 2: Shibuya Crossroads, Meiji Shrine & Harajuku';
        area = 'Shibuya & Harajuku';
        activities = [
          {
            id: `act-${d}-1`,
            time: '09:30 AM',
            title: 'Meiji Jingu Forest Walk & Torii Gate',
            description: 'Tranquil evergreen forest with 120,000 trees donated from across Japan, enveloping the grand shrine.',
            category: 'culture',
            cost: 0,
            duration: '2 hrs',
            neighborhood: 'Harajuku',
            vibe: 'Mindful Nature',
            suggestedBy: travelerNames[1] || 'Maya',
            votes: 4,
            notes: 'Write wooden ema prayer tablets at the sacred camphor tree.',
            transitToNext: '5 min walk'
          },
          {
            id: `act-${d}-2`,
            time: '12:00 PM',
            title: 'Omotesando Cafe Roastery & Hidden Backstreet Boutiques',
            description: 'Specialty pour-over coffee followed by browsing Cat Street independent indie designers and architecture.',
            category: 'shopping',
            cost: 22,
            duration: '2 hrs',
            neighborhood: 'Omotesando',
            vibe: 'Design & Shopping',
            suggestedBy: travelerNames[0] || 'Alex',
            votes: 3,
            notes: 'Perfect mid-tier budget balance with zero entry fees.',
            transitToNext: '10 min walk'
          },
          {
            id: `act-${d}-3`,
            time: '04:00 PM',
            title: 'SHIBUYA SKY 360-Degree Open-Air Observation Deck',
            description: 'Rooftop viewing deck 229 meters above Shibuya Crossing offering unobstructed sunset views of Mount Fuji and Tokyo Tower.',
            category: 'sightseeing',
            cost: 20,
            duration: '1.5 hrs',
            neighborhood: 'Shibuya',
            vibe: 'Iconic Sunset',
            suggestedBy: travelerNames[2] || 'Sam',
            votes: 4,
            notes: 'Pre-booked 4:30 PM slot catches both golden hour and night skyline lighting.',
            transitToNext: '5 min walk'
          },
          {
            id: `act-${d}-4`,
            time: '07:30 PM',
            title: 'Dogenzaka Izakaya & Wagyu Sukiyaki Sharing Dinner',
            description: 'Communal banquet table savoring tender marbled beef simmered in sweet soy broth with seasonal mushrooms.',
            category: 'food',
            cost: 38,
            duration: '2 hrs',
            neighborhood: 'Shibuya',
            vibe: 'Group Celebration',
            suggestedBy: travelerNames[0] || 'Alex',
            votes: 4,
            notes: 'Reconciles group preference for high-quality food within budget cap.',
            transitToNext: 'Walk to Shibuya station'
          }
        ];
      } else {
        dayTitle = `Day ${d}: Creative Yanaka & Roppongi Modern Art`;
        area = 'Ueno & Roppongi';
        activities = [
          {
            id: `act-${d}-1`,
            time: '10:00 AM',
            title: 'Yanaka Ginza "Old Tokyo" Stroll',
            description: 'One of Tokyo’s few surviving pre-war neighborhoods with charming artisanal craft shops and cat statues.',
            category: 'culture',
            cost: 5,
            duration: '2 hrs',
            neighborhood: 'Yanaka',
            vibe: 'Charming & Slow-Paced',
            suggestedBy: travelerNames[1] || 'Maya',
            votes: 3,
            notes: 'Sample menchi-katsu minced meat cutlets from local butcher stalls.',
            transitToNext: '25 min via Chiyoda Line'
          },
          {
            id: `act-${d}-2`,
            time: '01:00 PM',
            title: 'Mori Art Museum & Roppongi Hills',
            description: 'Cutting-edge contemporary Asian art exhibitions hosted on the 53rd floor of Roppongi Hills Mori Tower.',
            category: 'art',
            cost: 16,
            duration: '2.5 hrs',
            neighborhood: 'Roppongi',
            vibe: 'Contemporary Art',
            suggestedBy: travelerNames[2] || 'Sam',
            votes: 3,
            notes: 'Ticket includes Tokyo City View observation gallery.',
            transitToNext: '10 min walk'
          },
          {
            id: `act-${d}-3`,
            time: '06:30 PM',
            title: 'Farewell Tokyo Ramen Lab & Sake Tasting',
            description: 'Tasting flights of junmai daiginjo sake paired with artisanal rich tonkotsu or vegan yuzu ramen bowls.',
            category: 'food',
            cost: 25,
            duration: '2 hrs',
            neighborhood: 'Azabu-Juban',
            vibe: 'Culinary Finale',
            suggestedBy: travelerNames[0] || 'Alex',
            votes: 4,
            notes: 'Dietary requirements accommodated for both meat and vegetarian eaters.',
            transitToNext: 'Transit home'
          }
        ];
      }
    } else {
      // Generic high-quality city experience
      activities = [
        {
          id: `act-${d}-1`,
          time: '09:00 AM',
          title: `${destination} Historic Center & Landmark Walking Tour`,
          description: `Discover top cultural architecture, lively public squares, and hidden alleyways in the heart of ${destination}.`,
          category: 'culture',
          cost: 15,
          duration: '2.5 hrs',
          neighborhood: 'Historic District',
          vibe: 'Iconic Sights',
          suggestedBy: travelerNames[0] || 'Traveler 1',
          votes: 3,
          notes: 'Great orientation for first-time visitors.',
          transitToNext: '10 min walk'
        },
        {
          id: `act-${d}-2`,
          time: '12:30 PM',
          title: `Artisanal Market & Street Food Crawl in ${destination}`,
          description: 'Sample local specialties, farm-fresh produce, and seasonal delicacies at the city’s premier indoor foodie hall.',
          category: 'food',
          cost: 20,
          duration: '1.5 hrs',
          neighborhood: 'Market Quarter',
          vibe: 'Vibrant Gastronomy',
          suggestedBy: travelerNames[1] || 'Traveler 2',
          votes: 4,
          notes: 'Accommodates mixed dietary preferences.',
          transitToNext: '15 min via metro/walk'
        },
        {
          id: `act-${d}-3`,
          time: '03:00 PM',
          title: `${destination} Botanical Garden & Scenic Panorama`,
          description: 'Relaxed afternoon escape featuring landscaped gardens, local flora, and panoramic view of the skyline.',
          category: 'nature',
          cost: 10,
          duration: '2 hrs',
          neighborhood: 'Parkside',
          vibe: 'Tranquil & Scenic',
          suggestedBy: travelerNames[2] || 'Traveler 3',
          votes: 3,
          notes: 'Optimal golden hour lighting for group photos.',
          transitToNext: '15 min transit'
        },
        {
          id: `act-${d}-4`,
          time: '07:00 PM',
          title: `Rooftop Terrace Dinner & Evening Social`,
          description: 'Celebratory group dinner featuring seasonal plates, local beverages, and acoustic live atmosphere.',
          category: 'food',
          cost: 35,
          duration: '2.5 hrs',
          neighborhood: 'Uptown',
          vibe: 'Social & Fun',
          suggestedBy: travelerNames[0] || 'Traveler 1',
          votes: 4,
          notes: 'Pre-reserved table with scenic city views.',
          transitToNext: 'Return to stay'
        }
      ];
    }

    days.push({
      dayNumber: d,
      date: `Day ${d}`,
      title: dayTitle,
      areaSummary: area,
      weather: { condition: 'Sunny / Mild', temp: '22°C', icon: 'sun' },
      estimatedWalkingKm: 5.4 + d * 0.5,
      estimatedBudgetPerPerson: activities.reduce((acc, a) => acc + a.cost, 0),
      activities
    });
  }

  return {
    destination,
    tripDurationDays: daysCount,
    groupSummary: {
      consensusScore: '94%',
      reconciliationNotes: 'Balanced high-energy mornings with relaxed mid-afternoon cafe respites. Group food preferences were prioritized for lunch and dinner with options for every budget tier.',
      sharedInterests: ['Local Gastronomy', 'Scenic Viewpoints', 'Historic Neighborhoods'],
      compromisePace: 'Moderate (balanced between packed & leisurely)'
    },
    days
  };
}

// API Route: Generate Itinerary with Gemini 3.8 Flash
app.post('/api/generate-itinerary', async (req: Request, res: Response) => {
  try {
    const { destination, startDate, endDate, daysCount = 3, budget, style, travelers = [], groupMode } = req.body;

    const numDays = Math.min(Math.max(Number(daysCount) || 3, 1), 7);
    const destinationName = destination || 'Tokyo, Japan';

    // If Gemini is available, call gemini-3.8-flash with structured schema
    if (ai) {
      const travelersDescription = travelers.map((t: any) =>
        `- ${t.name}: Pace preference=${t.pace || 'balanced'}, Top Interests=${(t.interests || []).join(', ')}, Budget=${t.budget || 'moderate'}, Food style=${t.food || 'open'}`
      ).join('\n');

      const prompt = `You are VibeVoyage's Lead AI Travel Planner and Group Preference Reconciler.
Create an unforgettable, logically sequenced, route-optimized ${numDays}-day itinerary for ${destinationName}.

TRIP CONTEXT:
- Destination: ${destinationName}
- Days: ${numDays}
- Group Type: ${groupMode ? 'Group of Friends' : 'Solo Explorer'}
- Overall Target Budget Tier: ${budget || 'Moderate'}
- Travel Style: ${style || 'Balanced Culture & Food'}
- Participating Travelers:
${travelersDescription || '- Traveler: Balanced pace, interested in culture, local food, and scenic spots.'}

CRITICAL ROUTE & PLANNING RULES:
1. GEOGRAPHIC COHERENCE: Cluster activities by neighborhood for each day to prevent crisscrossing and transit burnout.
2. GROUP RECONCILIATION: Explicitly credit which traveler's style or interest inspired each activity in "suggestedBy".
3. REALISTIC TIMING: Provide morning (9-10 AM), lunch (12-1 PM), afternoon (2-4 PM), and dinner/evening (6-8 PM) with realistic transit notes.
4. REALISTIC COSTS: Estimates in USD per person.
5. HIDDEN GEMS: Include at least one authentic local tip or hidden gem per day.

Return your response adhering to the exact JSON format.`;

      try {
        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                destination: { type: Type.STRING },
                tripDurationDays: { type: Type.INTEGER },
                groupSummary: {
                  type: Type.OBJECT,
                  properties: {
                    consensusScore: { type: Type.STRING },
                    reconciliationNotes: { type: Type.STRING },
                    sharedInterests: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    compromisePace: { type: Type.STRING }
                  },
                  required: ['consensusScore', 'reconciliationNotes', 'sharedInterests', 'compromisePace']
                },
                days: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      dayNumber: { type: Type.INTEGER },
                      date: { type: Type.STRING },
                      title: { type: Type.STRING },
                      areaSummary: { type: Type.STRING },
                      weather: {
                        type: Type.OBJECT,
                        properties: {
                          condition: { type: Type.STRING },
                          temp: { type: Type.STRING },
                          icon: { type: Type.STRING }
                        },
                        required: ['condition', 'temp', 'icon']
                      },
                      estimatedWalkingKm: { type: Type.NUMBER },
                      estimatedBudgetPerPerson: { type: Type.NUMBER },
                      activities: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            time: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            category: { type: Type.STRING },
                            cost: { type: Type.NUMBER },
                            duration: { type: Type.STRING },
                            neighborhood: { type: Type.STRING },
                            vibe: { type: Type.STRING },
                            suggestedBy: { type: Type.STRING },
                            votes: { type: Type.INTEGER },
                            notes: { type: Type.STRING },
                            transitToNext: { type: Type.STRING },
                            lat: { type: Type.NUMBER },
                            lng: { type: Type.NUMBER },
                            address: { type: Type.STRING }
                          },
                          required: ['id', 'time', 'title', 'description', 'category', 'cost', 'duration', 'neighborhood', 'vibe', 'suggestedBy', 'votes', 'notes', 'transitToNext']
                        }
                      }
                    },
                    required: ['dayNumber', 'date', 'title', 'areaSummary', 'weather', 'estimatedWalkingKm', 'estimatedBudgetPerPerson', 'activities']
                  }
                }
              },
              required: ['destination', 'tripDurationDays', 'groupSummary', 'days']
            }
          }
        });

        // 9-second timeout race for instant UI responsiveness
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI generation timeout')), 9000)
        );

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        const textOutput = response.text;
        if (textOutput) {
          const parsed = JSON.parse(textOutput);
          return res.json({ success: true, isLiveAI: true, data: parsed });
        }
      } catch (geminiError: any) {
        console.warn('Gemini generation warning, falling back to curated itinerary engine:', geminiError?.message || geminiError);
      }
    }

    // Fallback if AI not configured or failed
    const fallback = getFallbackItinerary(destinationName, numDays, travelers);
    return res.json({ success: true, isLiveAI: false, data: fallback });
  } catch (error: any) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({ error: 'Failed to generate itinerary', details: error.message });
  }
});

// API Route: Quick Adaptive Replan (e.g. Rainy Day, Slower Morning, Budget Trim)
app.post('/api/replan-day', async (req: Request, res: Response) => {
  try {
    const { day, conditionType, destination } = req.body;
    // conditionType: 'rain' | 'slow_morning' | 'budget_trim' | 'foodie_upgrade'

    if (ai) {
      try {
        const prompt = `The user is replanning Day ${day.dayNumber} of their trip in ${destination || 'the city'}.
Adjustment condition: ${conditionType}.
Current activities:
${JSON.stringify(day.activities, null, 2)}

Provide an adapted set of activities for this day:
- If 'rain': Replace outdoor visits with cozy indoor museums, covered arcades, covered markets, teahouses or galleries.
- If 'slow_morning': Shift morning start to 10:30 AM or 11:00 AM, adjust times smoothly.
- If 'budget_trim': Swap expensive activities for free scenic viewpoints, public parks, historic markets or budget-friendly street food.
- If 'foodie_upgrade': Add a top-rated local dining or dessert experience.

Return the modified day object matching the structure:
{
  "dayNumber": ${day.dayNumber},
  "date": "${day.date}",
  "title": "string (updated title reflecting the adapted theme)",
  "areaSummary": "string",
  "weather": {"condition": "string", "temp": "string", "icon": "string"},
  "estimatedWalkingKm": number,
  "estimatedBudgetPerPerson": number,
  "activities": [ ... array of updated activity objects ... ]
}`;

        const replanPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json'
          }
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Replan timeout')), 7000)
        );

        const response: any = await Promise.race([replanPromise, timeoutPromise]);

        if (response?.text) {
          const adapted = JSON.parse(response.text);
          return res.json({ success: true, isLiveAI: true, day: adapted });
        }
      } catch (err: any) {
        console.warn('Replan Gemini error, using algorithmic replan:', err.message);
      }
    }

    // Resilient programmatic fallback adaptation
    const modifiedActivities = day.activities.map((act: any, idx: number) => {
      if (conditionType === 'rain') {
        if (act.category === 'nature' || act.category === 'sightseeing') {
          return {
            ...act,
            title: `[Indoor Gem] ${act.neighborhood} Art Gallery & Covered Arcade`,
            description: 'Protected from the rain: Explore historic covered market halls, artisan workshops, and modern indoor galleries.',
            category: 'art',
            notes: 'Rain-adapted replacement with cozy shelter.',
            vibe: 'Cozy & Sheltered'
          };
        }
      } else if (conditionType === 'slow_morning') {
        if (idx === 0) {
          return {
            ...act,
            time: '10:45 AM',
            title: `Leisurely Brunch & ${act.title.replace(/^\[.*?\]\s*/, '')}`,
            description: 'Sleep in and recharge: Enjoy specialty brew coffee and leisurely breakfast pastries before kicking off the day.',
            duration: '1.5 hrs',
            notes: 'Pushed later to match relaxed group rhythm.'
          };
        } else if (idx === 1) {
          return { ...act, time: '01:15 PM' };
        } else if (idx === 2) {
          return { ...act, time: '03:45 PM' };
        } else if (idx === 3) {
          return { ...act, time: '07:30 PM' };
        }
      } else if (conditionType === 'budget_trim') {
        return {
          ...act,
          cost: Math.max(0, Math.round(act.cost * 0.5)),
          notes: 'Optimized for budget efficiency without sacrificing experience.'
        };
      }
      return act;
    });

    const adaptedDay = {
      ...day,
      title: conditionType === 'rain' ? `${day.title} (Rain-Safe Edition)` : day.title,
      estimatedBudgetPerPerson: modifiedActivities.reduce((acc: number, a: any) => acc + (a.cost || 0), 0),
      activities: modifiedActivities
    };

    return res.json({ success: true, isLiveAI: false, day: adaptedDay });
  } catch (error: any) {
    res.status(500).json({ error: 'Replan failed', details: error.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`VibeVoyage server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
