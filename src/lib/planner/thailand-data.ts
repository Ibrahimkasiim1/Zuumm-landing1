/* Thailand FIT dataset — generated from the rate-card Excel
   (v1landing/thailand_complete_real_data_FIT_FINAL) via the v1 prototype.
   Prices are INR. Hotels are per room per night, double occupancy.
   Activity prices are per person and seasonal:
   low = green season (May–Sep), shoulder = Oct/Mar/Apr, peak = Nov–Feb. */

export type HotelTierKey = "3" | "4" | "5";

export interface HotelTier {
  names: string[];
  low: number; // per room / night, green season
  high: number; // per room / night, peak season
}

export interface CityActivity {
  name: string;
  about: string;
  duration: string;
  start: string;
  end: string;
  price: { low: number; shoulder: number; peak: number }; // per person, avg of range
  priceLabel: { low: string; shoulder: string; peak: string };
  inclusions: string[];
  exclusions: string[];
  /** 2-way drive between the hub and the activity area, hours — counted
      against the day budget by the scheduler (datasets that carry it) */
  travelHours?: number;
  /** per-person 2-way shared-transfer fare, INR — only on activities whose
      price doesn't already include hotel pickup */
  transferCost?: number;
}

export interface City {
  name: string;
  code: string;
  icon: string;
  theme: string;
  pop: "Very Popular" | "Popular" | "Rising" | "Hidden Gem";
  /** % position on the simplified north→south Thailand map */
  x: number;
  y: number;
  /** which country dataset this city belongs to; absent → Thailand */
  country?: string;
  /** present only on satellite cities — the gateway hub you fly into */
  gateway?: string;
  km?: number;
  hopHours?: number;
  hopLabel?: string;
  hopMode?: string;
  hopCost?: number; // avg private-vehicle round trip, INR
  hopCostLabel?: string;
  gatewayLabel?: string; // present only on gateways
  /** usable planning hours per day when the dataset counts travel time into
      activities (Bali: 14h incl. transfers); absent → the scheduler default */
  dayBudgetHours?: number;
  /** how you cross to an adjacent gateway in the same country when it isn't
      a domestic flight (whole-party vehicle, e.g. Kuta ↔ Ubud) */
  landCrossing?: { mode: string; label: string; cost: number };
  hotels: Record<HotelTierKey, HotelTier>;
  activities: CityActivity[];
}

/** North → south visit order used to sequence multi-city routes. */
export const GATEWAY_ORDER: string[] = ["Bangkok","Chiang Mai","Chiang Rai","Khon Kaen","Udon Thani","Buriram","Koh Samui","Krabi","Phuket","Surat Thani","Hat Yai"];

export const CITIES: Record<string, City> = {
  "Bangkok": {
    "name": "Bangkok",
    "code": "BAN",
    "icon": "🏙️",
    "theme": "Culture & City",
    "pop": "Very Popular",
    "x": 52,
    "y": 44,
    "gatewayLabel": "Main international gateway · BKK/DMK airports",
    "hotels": {
      "3": {
        "names": [
          "Ibis Bangkok Siam",
          "Novotel Bangkok Sukhumvit 20",
          "Hotel Indigo Bangkok Wireless Road",
          "Red Planet Bangkok Surawong",
          "Lub d Bangkok Silom"
        ],
        "low": 2200,
        "high": 4200
      },
      "4": {
        "names": [
          "Dusit Thani Bangkok",
          "Anantara Siam Bangkok",
          "Shangri-La Bangkok",
          "SO/ Bangkok",
          "Chatrium Hotel Riverside Bangkok"
        ],
        "low": 4500,
        "high": 8500
      },
      "5": {
        "names": [
          "Mandarin Oriental Bangkok",
          "The Peninsula Bangkok",
          "Four Seasons Hotel Bangkok at Chao Phraya River",
          "Capella Bangkok",
          "The Sukhothai Bangkok"
        ],
        "low": 8500,
        "high": 15500
      }
    },
    "activities": [
      {
        "name": "Grand Palace, Wat Pho & Wat Arun Temple Tour",
        "about": "Full-day guided tour covering Bangkok's three most iconic temples. Start at the Grand Palace and Emerald Buddha (Wat Phra Kaew), then visit Wat Pho with its 46m reclining Buddha, and finish at Wat Arun (Temple of Dawn) on the Chao Phraya River.",
        "duration": "6-8 hrs",
        "start": "08:00",
        "end": "15:00",
        "price": {
          "low": 5900,
          "shoulder": 6400,
          "peak": 6900
        },
        "priceLabel": {
          "low": "₹4,400–7,400",
          "shoulder": "₹4,800–8,000",
          "peak": "₹5,200–8,600"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Air-conditioned minivan (shared)",
          "All temple entry fees (Grand Palace 500 THB, Wat Pho 300 THB, Wat Arun 100 THB)",
          "Central meeting point pickup (BTS Saphan Taksin/Siam area)",
          "Bottled water"
        ],
        "exclusions": [
          "Lunch (~200-400 THB)",
          "Paddle boat at floating market (150 THB extra)",
          "Personal expenses",
          "Gratuities",
          "Private guide upgrade (~2,500 THB)",
          "Hotel pickup outside central zone (extra charge)"
        ]
      },
      {
        "name": "Damnoen Saduak Floating Market & Railway Market Tour",
        "about": "Early morning tour to Damnoen Saduak Floating Market (100km southwest of Bangkok) where vendors sell fresh produce and local food from boats. Also visit the Maeklong Railway Market where stalls fold away when the train passes through.",
        "duration": "8-10 hrs",
        "start": "06:00",
        "end": "15:00",
        "price": {
          "low": 7050,
          "shoulder": 7700,
          "peak": 8300
        },
        "priceLabel": {
          "low": "₹5,300–8,800",
          "shoulder": "₹5,800–9,600",
          "peak": "₹6,200–10,400"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Air-conditioned minivan (shared)",
          "Longtail boat ride at floating market",
          "Central meeting point pickup",
          "Bottled water",
          "Cold towels"
        ],
        "exclusions": [
          "Meals (~150-300 THB)",
          "Paddle boat ride (150 THB extra)",
          "Personal shopping",
          "Gratuities",
          "Private guide upgrade (~2,500 THB)",
          "Hotel pickup outside central zone"
        ]
      },
      {
        "name": "Yaowarat Chinatown Street Food Walking Tour",
        "about": "Evening walking food tour through Bangkok's vibrant Chinatown (Yaowarat), one of the world's best street food districts. Taste legendary dishes like pad thai, tom yum goong, mango sticky rice, bird's nest soup, and Chinese-style desserts. Visit the 5.5-ton Golden Buddha at Wat Traimit and explore the bustling Sampeng Lane market.",
        "duration": "3-4 hrs",
        "start": "17:00",
        "end": "21:00",
        "price": {
          "low": 4450,
          "shoulder": 4800,
          "peak": 5150
        },
        "priceLabel": {
          "low": "₹3,000–5,900",
          "shoulder": "₹3,200–6,400",
          "peak": "₹3,400–6,900"
        },
        "inclusions": [
          "Licensed food guide (walking tour specialist)",
          "8-10 food tastings (dim sum, noodles, desserts)",
          "Walking tour of Chinatown",
          "Visit to Wat Traimit (Golden Buddha)",
          "Bottled water",
          "Wet wipes",
          "Meet at Hua Lamphong MRT (self-transfer)"
        ],
        "exclusions": [
          "Additional food purchases",
          "Alcoholic drinks",
          "Personal shopping",
          "Tips for guide",
          "Hotel transfers (meet at Hua Lamphong MRT)",
          "Private guide upgrade (~1,500 THB)"
        ]
      }
    ]
  },
  "Chiang Mai": {
    "name": "Chiang Mai",
    "code": "CHI",
    "icon": "⛩️",
    "theme": "Culture & Nature",
    "pop": "Very Popular",
    "x": 40,
    "y": 14,
    "gatewayLabel": "Regional gateway · CNX airport",
    "hotels": {
      "3": {
        "names": [
          "Green Tiger Vegetarian House",
          "Imm Hotel Thaphae Chiang Mai",
          "De Lanna Hotel",
          "The 3 Sis Hotel",
          "B2 Chiang Mai Premier Resort"
        ],
        "low": 1800,
        "high": 3500
      },
      "4": {
        "names": [
          "U Chiang Mai",
          "Le Meridien Chiang Mai",
          "Rachamankha Hotel",
          "De Naga Hotel Chiang Mai",
          "The Rim Chiang Mai"
        ],
        "low": 3800,
        "high": 7000
      },
      "5": {
        "names": [
          "Four Seasons Resort Chiang Mai",
          "Anantara Chiang Mai Resort",
          "Dhara Dhevi Chiang Mai",
          "137 Pillars House Chiang Mai",
          "akyra Manor Chiang Mai"
        ],
        "low": 7000,
        "high": 13000
      }
    },
    "activities": [
      {
        "name": "Old City Temples & Doi Suthep Half-Day Tour",
        "about": "Half-day cultural tour exploring Chiang Mai's most significant temples within the old city walls: Wat Phra Singh (14th-century Lanna architecture), Wat Chedi Luang (massive pagoda), and Wat Chiang Man (oldest temple). Then drive up Doi Suthep mountain to Wat Phra That Doi Suthep for panoramic city views and the golden chedi.",
        "duration": "4-5 hrs",
        "start": "08:00",
        "end": "13:00",
        "price": {
          "low": 3400,
          "shoulder": 3700,
          "peak": 4000
        },
        "priceLabel": {
          "low": "₹2,400–4,400",
          "shoulder": "₹2,600–4,800",
          "peak": "₹2,800–5,200"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned transport",
          "Wat Phra Singh entry",
          "Wat Chedi Luang entry",
          "Doi Suthep temple entry",
          "Hotel pickup & drop-off (Old City/Nimman area)",
          "Bottled water"
        ],
        "exclusions": [
          "Lunch",
          "Personal expenses",
          "Donations at temples",
          "Gratuities",
          "Doi Suthep tram (30 THB optional)",
          "Private guide upgrade (~2,000 THB)",
          "Hotel pickup outside Old City/Nimman"
        ]
      },
      {
        "name": "Ethical Elephant Sanctuary Half-Day Experience",
        "about": "Visit an ethical elephant sanctuary in the Mae Wang or Mae Taeng area (1-1.5 hours from Chiang Mai). Learn about Asian elephant conservation, feed the elephants by hand, walk alongside them in their natural forest habitat, and observe their social behavior. No riding or circus tricks — focused on welfare and education. Popular sanctuaries include Elephant Nature Park, Elephant Jungle Sanctuary, and Kerchor Eco Elephant Park.",
        "duration": "5-6 hrs",
        "start": "08:00",
        "end": "14:00",
        "price": {
          "low": 5450,
          "shoulder": 5900,
          "peak": 6350
        },
        "priceLabel": {
          "low": "₹3,500–7,400",
          "shoulder": "₹3,800–8,000",
          "peak": "₹4,100–8,600"
        },
        "inclusions": [
          "Round-trip shared transport from Chiang Mai city",
          "English-speaking sanctuary staff",
          "Elephant feeding experience",
          "Prepare elephant food (bananas, sugarcane)",
          "Walk with elephants in natural habitat",
          "Learn about elephant behavior & conservation",
          "Bottled water",
          "Light snack",
          "Small group format (max 12 pax)"
        ],
        "exclusions": [
          "Lunch (full-day includes lunch)",
          "Tips for mahouts",
          "Personal expenses",
          "Elephant bathing (some sanctuaries include, others charge extra)",
          "Photos with elephants (some charge)",
          "Private transfer upgrade (~2,000 THB)"
        ]
      },
      {
        "name": "Thai Cooking Class with Market Tour",
        "about": "Learn to cook authentic Northern Thai cuisine in a hands-on cooking class. Start with a guided tour of a local market to select fresh ingredients (Thai basil, galangal, kaffir lime, curry paste). Then prepare 4-5 dishes such as Pad Thai, Green Curry, Tom Yum Goong, Mango Sticky Rice, and Papaya Salad. Classes are held in open-air kitchens or organic farms.",
        "duration": "4-5 hrs",
        "start": "09:00",
        "end": "14:00",
        "price": {
          "low": 4450,
          "shoulder": 4800,
          "peak": 5150
        },
        "priceLabel": {
          "low": "₹3,000–5,900",
          "shoulder": "₹3,200–6,400",
          "peak": "₹3,400–6,900"
        },
        "inclusions": [
          "Local market tour with chef-instructor",
          "All fresh ingredients",
          "Hands-on cooking instruction",
          "Recipe booklet to take home",
          "4-5 dishes prepared",
          "Vegetarian options available",
          "Bottled water",
          "Apron & utensils provided",
          "Small group class (max 8 pax)",
          "Self-transfer to cooking school"
        ],
        "exclusions": [
          "Hotel transfers (self-transfer to cooking school)",
          "Alcoholic drinks",
          "Additional recipes",
          "Tips for chef",
          "Personal shopping at market",
          "Private class upgrade (~3,000 THB)"
        ]
      },
      {
        "name": "Skyline Adventure Zipline with Waterfall",
        "about": "Thrill-seeking zipline adventure through the rainforest canopy near Mae Rim (1 hour from Chiang Mai). Features 42 platforms, 24 ziplines including one 900-meter 'Superman' line, 2 sky bridges, and 2 abseil points. Includes a visit to a nearby waterfall. Safety-certified with professional guides. Weight limit: 140kg. Suitable for ages 5+.",
        "duration": "6-7 hrs",
        "start": "08:00",
        "end": "15:00",
        "price": {
          "low": 6500,
          "shoulder": 7050,
          "peak": 7600
        },
        "priceLabel": {
          "low": "₹4,700–8,300",
          "shoulder": "₹5,100–9,000",
          "peak": "₹5,500–9,700"
        },
        "inclusions": [
          "Round-trip shared transport",
          "Professional safety instructors",
          "All zipline equipment (harness, helmet, gloves)",
          "42 platforms across 24 ziplines",
          "2 sky bridges",
          "2 abseil descents",
          "Lunch (Thai buffet)",
          "Bottled water",
          "Insurance",
          "Small group adventure (max 15 pax)"
        ],
        "exclusions": [
          "Photos & videos (available for purchase ~500 THB)",
          "Tips for guides",
          "Personal expenses",
          "Additional activities (roller coaster, giant swing)",
          "Private transfer upgrade (~2,000 THB)"
        ]
      },
      {
        "name": "Doi Inthanon National Park & Hill Tribe Village Tour",
        "about": "Full-day tour to Doi Inthanon National Park, home to Thailand's highest peak. Trek the Ang Ka Nature Trail through mossy forest, visit the stunning Wachirathan and Sirithan waterfalls, see the twin Royal Pagodas built for the King and Queen, and interact with Karen and Hmong hill tribe communities. Includes a stop at a local coffee farm famous for Chiang Mai's arabica beans.",
        "duration": "8-10 hrs",
        "start": "07:00",
        "end": "17:00",
        "price": {
          "low": 5600,
          "shoulder": 6100,
          "peak": 6550
        },
        "priceLabel": {
          "low": "₹4,100–7,100",
          "shoulder": "₹4,500–7,700",
          "peak": "₹4,800–8,300"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned minivan",
          "Doi Inthanon National Park entry (300 THB)",
          "Visit to Thailand's highest peak (2,565m)",
          "Ang Ka Nature Trail",
          "Wachirathan & Sirithan Waterfalls",
          "Karen & Hmong hill tribe villages",
          "Royal Pagodas",
          "Lunch",
          "Bottled water"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "Souvenirs from hill tribe villages",
          "Additional snacks",
          "Coffee at local farm (optional)",
          "Private guide upgrade (~3,000 THB)"
        ]
      }
    ]
  },
  "Chiang Rai": {
    "name": "Chiang Rai",
    "code": "CHI",
    "icon": "🛕",
    "theme": "Culture & Art",
    "pop": "Very Popular",
    "x": 46,
    "y": 5,
    "gatewayLabel": "Regional gateway · CEI airport",
    "hotels": {
      "3": {
        "names": [
          "Baan Jaru",
          "Sleepy House Chiang Rai",
          "B2 Chiang Rai Boutique & Budget Hotel",
          "Chiang Rai Clock Tower Hostel",
          "Happynest Hostel"
        ],
        "low": 1500,
        "high": 2800
      },
      "4": {
        "names": [
          "Nak Nakara Hotel",
          "Wiang Inn Hotel",
          "Golden Triangle Inn",
          "B2 Chiang Rai Boutique & Budget Hotel",
          "The Mantrini Chiang Rai"
        ],
        "low": 3000,
        "high": 5500
      },
      "5": {
        "names": [
          "Le Méridien Chiang Rai Resort",
          "The Legend Chiang Rai Boutique River Resort & Spa",
          "Anantara Golden Triangle Elephant Camp & Resort",
          "Four Seasons Tented Camp Golden Triangle",
          "Rasa Boutique Hotel Chiang Rai"
        ],
        "low": 5500,
        "high": 10000
      }
    },
    "activities": [
      {
        "name": "White Temple (Wat Rong Khun) & Blue Temple Tour",
        "about": "Half-day art and culture tour visiting Chiang Rai's most stunning contemporary temples. Wat Rong Khun (White Temple) is an all-white, mirror-encrusted masterpiece by artist Chalermchai Kositpipat. Wat Rong Suea Ten (Blue Temple) dazzles with its deep blue interior and white Buddha. The Black House (Baan Dam Museum) is a dark, provocative art complex by Thawan Duchanee.",
        "duration": "4-5 hrs",
        "start": "08:00",
        "end": "13:00",
        "price": {
          "low": 3550,
          "shoulder": 3850,
          "peak": 4150
        },
        "priceLabel": {
          "low": "₹2,400–4,700",
          "shoulder": "₹2,600–5,100",
          "peak": "₹2,800–5,500"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned transport",
          "Wat Rong Khun (White Temple) entry",
          "Wat Rong Suea Ten (Blue Temple) entry",
          "Black House (Baan Dam Museum) entry",
          "Hotel pickup & drop-off (Chiang Rai city)",
          "Bottled water"
        ],
        "exclusions": [
          "Lunch (~150-300 THB)",
          "Personal expenses",
          "Tips for guide",
          "Souvenirs at White Temple",
          "Photography fees at some sites",
          "Private guide upgrade (~2,500 THB)"
        ]
      },
      {
        "name": "Golden Triangle & Mekong River Day Tour",
        "about": "Full-day tour to the Golden Triangle where Thailand, Laos, and Myanmar meet at the confluence of the Mekong and Ruak rivers. Visit the Hall of Opium museum to learn about the region's history, take a boat ride to Don Sao Island in Laos (no visa required for day visits), enjoy panoramic views from Wat Phra That Phu Khao, and optionally visit a long-neck Karen village.",
        "duration": "8-10 hrs",
        "start": "07:00",
        "end": "17:00",
        "price": {
          "low": 6500,
          "shoulder": 7050,
          "peak": 7600
        },
        "priceLabel": {
          "low": "₹4,700–8,300",
          "shoulder": "₹5,100–9,000",
          "peak": "₹5,500–9,700"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned minivan",
          "Opium Museum entry",
          "Boat ride on Mekong River",
          "Visit to Don Sao Island (Laos, no visa needed)",
          "Golden Triangle viewpoint",
          "Wat Phra That Phu Khao",
          "Lunch at local restaurant",
          "Hotel pickup & drop-off",
          "Bottled water"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "Souvenirs from Laos",
          "Additional boat rides",
          "Long-neck Karen village (optional, ~300 THB)",
          "Private guide upgrade (~3,500 THB)"
        ]
      }
    ]
  },
  "Khon Kaen": {
    "name": "Khon Kaen",
    "code": "KHO",
    "icon": "🦕",
    "theme": "Culture & Nature",
    "pop": "Rising",
    "x": 62,
    "y": 28,
    "gatewayLabel": "Regional gateway · KKC airport",
    "hotels": {
      "3": {
        "names": [
          "B2 Khon Kaen Premier Hotel",
          "Glacier Hotel Khon Kaen",
          "Kosa Hotel & Shopping Mall",
          "Charoen Thani Hotel",
          "The Vista Hotel by Satit Group"
        ],
        "low": 1200,
        "high": 2200
      },
      "4": {
        "names": [
          "Centara Hotel & Convention Centre Khon Kaen",
          "B2 Khon Kaen Premier Hotel",
          "Glacier Hotel Khon Kaen",
          "Kosa Hotel & Shopping Mall",
          "Charoen Thani Hotel"
        ],
        "low": 2200,
        "high": 4000
      },
      "5": {
        "names": [
          "Pullman Khon Kaen Raja Orchid",
          "Centara Hotel & Convention Centre Khon Kaen",
          "B2 Khon Kaen Premier Hotel",
          "Glacier Hotel Khon Kaen",
          "Kosa Hotel & Shopping Mall"
        ],
        "low": 3500,
        "high": 6500
      }
    },
    "activities": [
      {
        "name": "Phu Wiang National Park Dinosaur Tour & Silk Village",
        "about": "Full-day cultural and natural history tour in Khon Kaen, the commercial hub of Isaan. Visit Phu Wiang National Park where dinosaur fossils from the Cretaceous period were discovered, including a 15-meter-long sauropod. See the impressive Phra Mahathat Kaen Nakhon — a 9-storey stupa with beautiful Isaan art, and visit Ban Phon Village to see traditional mudmee silk weaving, one of Thailand's finest silk traditions.",
        "duration": "6-8 hrs",
        "start": "08:00",
        "end": "16:00",
        "price": {
          "low": 3550,
          "shoulder": 3850,
          "peak": 4150
        },
        "priceLabel": {
          "low": "₹2,400–4,700",
          "shoulder": "₹2,600–5,100",
          "peak": "₹2,800–5,500"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned transport",
          "Phu Wiang National Park entry",
          "Dinosaur museum & fossil sites",
          "Phra Mahathat Kaen Nakhon (9-storey stupa)",
          "Ban Phon Silk Village",
          "Lunch at local restaurant",
          "Hotel pickup & drop-off",
          "Bottled water"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "Silk shopping",
          "Additional snacks",
          "Dinner",
          "Accommodation in Khon Kaen",
          "Private guide upgrade (~2,500 THB)"
        ]
      }
    ]
  },
  "Udon Thani": {
    "name": "Udon Thani",
    "code": "UDO",
    "icon": "🪷",
    "theme": "Nature & Culture",
    "pop": "Rising",
    "x": 66,
    "y": 24,
    "gatewayLabel": "Regional gateway · UTH airport",
    "hotels": {
      "3": {
        "names": [
          "Udon OK House",
          "B2 Udon Boutique & Budget Hotel",
          "Night Inn Hotel",
          "The Vareena Hotel",
          "Udon Signature Hotel"
        ],
        "low": 1000,
        "high": 1800
      },
      "4": {
        "names": [
          "The Vareena Hotel",
          "Udon Signature Hotel",
          "The Pannarai Hotel",
          "Paradise Hotel Udonthani",
          "The Bangkok Hotel"
        ],
        "low": 2000,
        "high": 3800
      },
      "5": {
        "names": [
          "Centara Hotel & Convention Centre Udon Thani",
          "Pullman Khon Kaen Raja Orchid",
          "Udon Thani Hotel",
          "The Vareena Hotel",
          "Udon Signature Hotel"
        ],
        "low": 3200,
        "high": 6000
      }
    },
    "activities": [
      {
        "name": "Red Lotus Sea (Talay Bua Daeng) Boat Tour",
        "about": "Early morning boat tour on Nong Han Lake to see the spectacular Red Lotus Sea (Talay Bua Daeng), where millions of pink lotus flowers bloom across the lake from November to February. Best visited at sunrise (6:00-10:00 AM) when the flowers are fully open. The lake turns into a sea of pink, creating one of Thailand's most photogenic natural wonders. Includes a visit to a local temple on the lake.",
        "duration": "3-4 hrs",
        "start": "05:30",
        "end": "10:00",
        "price": {
          "low": 2650,
          "shoulder": 2850,
          "peak": 3100
        },
        "priceLabel": {
          "low": "₹1,800–3,500",
          "shoulder": "₹1,900–3,800",
          "peak": "₹2,100–4,100"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned transport",
          "Longtail boat ride on Nong Han Lake",
          "Visit to Red Lotus Sea (millions of pink lotus flowers)",
          "Fresh coconut drink",
          "Local snacks",
          "Hotel pickup & drop-off",
          "Bottled water",
          "Small group (max 8 pax)"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "Additional food",
          "Photography drone permit (if applicable)",
          "Lunch",
          "Dinner",
          "Accommodation in Udon Thani",
          "Private guide upgrade (~2,000 THB)"
        ]
      }
    ]
  },
  "Buriram": {
    "name": "Buriram",
    "code": "BUR",
    "icon": "🏟️",
    "theme": "Culture & Sport",
    "pop": "Rising",
    "x": 70,
    "y": 38,
    "gatewayLabel": "Regional gateway · BFV airport",
    "hotels": {
      "3": {
        "names": [
          "B2 Buriram Premier Hotel",
          "The Crystal Hotel Buriram",
          "The One Hotel Buriram",
          "Hop Inn Buriram",
          "The Route Hotel Buriram"
        ],
        "low": 1000,
        "high": 1800
      },
      "4": {
        "names": [
          "X2 Vibe Buriram Hotel",
          "The Phoenix Hotel Buriram",
          "Buriram Hotel",
          "B2 Buriram Premier Hotel",
          "The Crystal Hotel Buriram"
        ],
        "low": 1800,
        "high": 3500
      },
      "5": {
        "names": [
          "Novotel Buriram",
          "X2 Vibe Buriram Hotel",
          "The Phoenix Hotel Buriram",
          "Buriram Hotel",
          "B2 Buriram Premier Hotel"
        ],
        "low": 3000,
        "high": 5500
      }
    },
    "activities": [
      {
        "name": "Phanom Rung Khmer Temple & Chang International Circuit Tour",
        "about": "Full-day tour to Buriram, Thailand's sports and Khmer heritage capital. Visit the magnificent Phanom Rung Historical Park, a Khmer temple complex perched on an extinct volcano with stunning architecture rivaling Angkor Wat. See the smaller but equally beautiful Prasat Muang Tam, visit the Chang International Circuit — Thailand's premier MotoGP and Superbike track, and hike up Khao Kradong — an extinct volcano with a giant golden Buddha at the summit. Buriram is also home to the famous Buriram United football club.",
        "duration": "6-8 hrs",
        "start": "07:00",
        "end": "16:00",
        "price": {
          "low": 4150,
          "shoulder": 4500,
          "peak": 4800
        },
        "priceLabel": {
          "low": "₹3,000–5,300",
          "shoulder": "₹3,200–5,800",
          "peak": "₹3,400–6,200"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned transport",
          "Phanom Rung Historical Park entry (UNESCO tentative site)",
          "Prasat Muang Tam (Khmer temple)",
          "Chang International Circuit (MotoGP track) visit",
          "Khao Kradong Forest Park (extinct volcano)",
          "Local snacks",
          "Lunch",
          "Hotel pickup & drop-off",
          "Bottled water"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "MotoGP tickets (if race scheduled)",
          "Souvenirs",
          "Additional snacks",
          "Dinner",
          "Accommodation in Buriram",
          "Private guide upgrade (~2,500 THB)"
        ]
      }
    ]
  },
  "Koh Samui": {
    "name": "Koh Samui",
    "code": "KOH",
    "icon": "🌴",
    "theme": "Romantic & Beach",
    "pop": "Very Popular",
    "x": 34,
    "y": 88,
    "gatewayLabel": "Regional gateway · USM airport",
    "hotels": {
      "3": {
        "names": [
          "Chaweng Cove Beach Resort",
          "New Hut Bungalows",
          "Samui First House",
          "Ark Bar Beach Resort",
          "Banana Fan Sea Resort"
        ],
        "low": 2800,
        "high": 5000
      },
      "4": {
        "names": [
          "Anantara Bophut Koh Samui Resort",
          "Centara Grand Beach Resort Samui",
          "Amari Koh Samui",
          "Nora Beach Resort & Spa",
          "Chaweng Regent Beach Resort"
        ],
        "low": 5500,
        "high": 10000
      },
      "5": {
        "names": [
          "Four Seasons Resort Koh Samui",
          "Banyan Tree Samui",
          "InterContinental Koh Samui",
          "Conrad Koh Samui",
          "W Koh Samui"
        ],
        "low": 11000,
        "high": 20000
      }
    },
    "activities": [
      {
        "name": "Koh Tao & Koh Nang Yuan Snorkeling Day Trip",
        "about": "Full-day speedboat excursion from Koh Samui to Koh Tao (Turtle Island) and the stunning Koh Nang Yuan sandbar. Snorkel at Shark Bay, Mango Bay, and Japanese Gardens — three of Thailand's best snorkeling spots with coral reefs, tropical fish, and occasional sea turtles. Climb to the Koh Nang Yuan viewpoint for iconic panoramic photos.",
        "duration": "8-9 hrs",
        "start": "07:30",
        "end": "16:30",
        "price": {
          "low": 7350,
          "shoulder": 8000,
          "peak": 8600
        },
        "priceLabel": {
          "low": "₹5,300–9,400",
          "shoulder": "₹5,800–10,200",
          "peak": "₹6,200–11,000"
        },
        "inclusions": [
          "Join-in tour with guide (basic English)",
          "Shared speedboat transfer to Koh Tao",
          "Snorkeling gear (mask, snorkel, fins)",
          "Lunch at local restaurant",
          "Fresh fruits",
          "Bottled water",
          "Life jackets",
          "National park fees",
          "Hotel pickup & drop-off"
        ],
        "exclusions": [
          "Alcoholic drinks",
          "Personal expenses",
          "Tips for crew",
          "Underwater camera rental",
          "Scuba diving upgrades",
          "Hotel on Koh Tao if overnight",
          "Private speedboat upgrade (~10,000 THB)"
        ]
      },
      {
        "name": "Ang Thong National Marine Park Kayaking & Hiking",
        "about": "Full-day tour to Ang Thong National Marine Park, an archipelago of 42 islands in the Gulf of Thailand. Kayak through sea caves and hidden lagoons, hike to the stunning Emerald Lake (Talay Nai) — a saltwater lake surrounded by limestone walls on all sides, snorkel at Wua Talap Island, and enjoy panoramic views from the park headquarters viewpoint. The park inspired Alex Garland's novel 'The Beach'.",
        "duration": "8-9 hrs",
        "start": "07:00",
        "end": "16:00",
        "price": {
          "low": 8250,
          "shoulder": 8950,
          "peak": 9650
        },
        "priceLabel": {
          "low": "₹5,900–10,600",
          "shoulder": "₹6,400–11,500",
          "peak": "₹6,900–12,400"
        },
        "inclusions": [
          "Join-in tour with guide (basic English)",
          "Shared speedboat to Ang Thong",
          "Kayaking through sea caves",
          "Hike to Emerald Lake (Talay Nai) viewpoint",
          "Snorkeling gear",
          "Lunch on boat",
          "Fresh fruits",
          "Bottled water",
          "National park fee (300 THB)",
          "Life jackets"
        ],
        "exclusions": [
          "Alcoholic drinks",
          "Personal expenses",
          "Tips for crew",
          "Additional kayaking time",
          "Accommodation on park islands (not available)",
          "Dinner",
          "Private speedboat upgrade (~10,000 THB)"
        ]
      }
    ]
  },
  "Krabi": {
    "name": "Krabi",
    "code": "KRA",
    "icon": "🏖️",
    "theme": "Beach & Adventure",
    "pop": "Very Popular",
    "x": 20,
    "y": 87,
    "gatewayLabel": "Regional gateway · KBV airport",
    "hotels": {
      "3": {
        "names": [
          "Ibis Styles Krabi Ao Nang",
          "Krabi P.N. Boutique House",
          "Chaw Ka Cher Tropicana Resort",
          "Aonang Eco Inn",
          "The Tama Hotel"
        ],
        "low": 2200,
        "high": 4200
      },
      "4": {
        "names": [
          "Centara Grand Beach Resort & Villas Krabi",
          "Deevana Plaza Krabi Ao Nang",
          "Aonang Cliff Beach Resort",
          "Holiday Inn Resort Krabi Ao Nang Beach",
          "Krabi Resort"
        ],
        "low": 4500,
        "high": 8500
      },
      "5": {
        "names": [
          "Rayavadee Krabi",
          "Phulay Bay, A Ritz-Carlton Reserve",
          "Sofitel Krabi Phokeethra Golf & Spa Resort",
          "Pimalai Resort & Spa",
          "The Tubkaak Krabi Boutique Resort"
        ],
        "low": 9000,
        "high": 17000
      }
    },
    "activities": [
      {
        "name": "4-Island Longtail Boat Tour with Snorkeling",
        "about": "Classic Krabi island-hopping tour visiting four stunning islands: Chicken Island (Koh Gai) with its unique rock formation, Tup Island connected by a sandbar at low tide, Poda Island with its long white-sand beach, and Phra Nang Cave Beach with its sacred shrine. Includes snorkeling stops and a Thai lunch.",
        "duration": "6-7 hrs",
        "start": "08:00",
        "end": "15:00",
        "price": {
          "low": 3550,
          "shoulder": 3850,
          "peak": 4150
        },
        "priceLabel": {
          "low": "₹2,400–4,700",
          "shoulder": "₹2,600–5,100",
          "peak": "₹2,800–5,500"
        },
        "inclusions": [
          "Join-in tour with boat crew (basic English)",
          "Shared longtail boat",
          "Snorkeling gear (mask & snorkel)",
          "Lunch box or buffet",
          "Fresh fruits",
          "Bottled water",
          "Life jackets",
          "National park fees",
          "Hotel pickup & drop-off (Ao Nang area)"
        ],
        "exclusions": [
          "Towel rental",
          "Tips for boat crew",
          "Alcoholic drinks",
          "Personal expenses",
          "Additional water sports",
          "Private longtail boat upgrade (~4,000 THB)",
          "Hotel pickup outside Ao Nang"
        ]
      },
      {
        "name": "Railay Beach Rock Climbing & Viewpoint Hike",
        "about": "World-class rock climbing experience on Railay's limestone cliffs, ranked among the best in Southeast Asia. Suitable for beginners and experienced climbers with routes graded 4a to 8c. Also includes a hike to the Railay Viewpoint for panoramic views of the peninsula, lagoon, and surrounding islands.",
        "duration": "4-6 hrs",
        "start": "08:00",
        "end": "14:00",
        "price": {
          "low": 5300,
          "shoulder": 5750,
          "peak": 6200
        },
        "priceLabel": {
          "low": "₹3,500–7,100",
          "shoulder": "₹3,800–7,700",
          "peak": "₹4,100–8,300"
        },
        "inclusions": [
          "Longtail boat transfer from Ao Nang (self-board)",
          "Professional climbing instructor",
          "All climbing gear (harness, shoes, chalk)",
          "Safety briefing",
          "Viewpoint hike",
          "Bottled water",
          "Small group session (max 6 pax)"
        ],
        "exclusions": [
          "Lunch",
          "National park fee (400 THB)",
          "Tips for instructor",
          "Personal expenses",
          "Travel insurance",
          "Private instructor upgrade (~3,000 THB)"
        ]
      }
    ]
  },
  "Phuket": {
    "name": "Phuket",
    "code": "PHU",
    "icon": "🏝️",
    "theme": "Beach & Adventure",
    "pop": "Very Popular",
    "x": 14,
    "y": 86,
    "gatewayLabel": "Regional gateway · HKT airport",
    "hotels": {
      "3": {
        "names": [
          "The Marina Phuket Hotel",
          "Avani+ Mai Khao Phuket",
          "Novotel Phuket Vintage Park",
          "Ibis Phuket Patong",
          "Red Planet Phuket Patong"
        ],
        "low": 2800,
        "high": 5200
      },
      "4": {
        "names": [
          "JW Marriott Phuket Resort & Spa",
          "Katathani Phuket Beach Resort",
          "Amari Phuket",
          "Centara Grand Beach Resort Phuket",
          "Novotel Phuket Resort"
        ],
        "low": 5500,
        "high": 10500
      },
      "5": {
        "names": [
          "Amanpuri Phuket",
          "Trisara Villas & Residences Phuket",
          "Rosewood Phuket",
          "Banyan Tree Phuket",
          "Anantara Layan Phuket Resort"
        ],
        "low": 12000,
        "high": 22000
      }
    },
    "activities": [
      {
        "name": "Phang Nga Bay Sea Canoe & James Bond Island Tour",
        "about": "Full-day tour to Phang Nga Bay National Marine Park (400 km²) featuring dramatic limestone karsts rising from emerald waters. Visit James Bond Island (Khao Phing Kan), paddle through sea caves (hongs) by canoe at low tide, and explore hidden lagoons. Departures from Ao Por pier.",
        "duration": "7-8 hrs",
        "start": "07:30",
        "end": "15:30",
        "price": {
          "low": 8850,
          "shoulder": 9600,
          "peak": 10350
        },
        "priceLabel": {
          "low": "₹6,500–11,200",
          "shoulder": "₹7,000–12,200",
          "peak": "₹7,600–13,100"
        },
        "inclusions": [
          "Join-in tour with guide (basic English)",
          "Shared speedboat or longtail boat",
          "Sea canoeing through caves & hongs",
          "Lunch",
          "National park fees",
          "Life jackets",
          "Bottled water",
          "Hotel pickup & drop-off (Patong/Kata/Karon)"
        ],
        "exclusions": [
          "Alcoholic drinks",
          "Personal expenses",
          "Kayak tips (~100 THB)",
          "Additional snacks",
          "Private speedboat upgrade (~10,000 THB)",
          "Hotel pickup outside Patong/Kata/Karon (extra charge)"
        ]
      },
      {
        "name": "Phi Phi Islands Speedboat Day Trip with Snorkeling",
        "about": "Full-day speedboat tour from Phuket to the Phi Phi Islands archipelago. Visit Maya Bay (where The Beach was filmed), snorkel at Bamboo Island and Monkey Beach, see Viking Cave, and swim in crystal-clear waters. Includes multiple snorkeling stops with vibrant coral reefs and tropical fish.",
        "duration": "8-9 hrs",
        "start": "07:00",
        "end": "16:00",
        "price": {
          "low": 10800,
          "shoulder": 11700,
          "peak": 12600
        },
        "priceLabel": {
          "low": "₹8,300–13,300",
          "shoulder": "₹9,000–14,400",
          "peak": "₹9,700–15,500"
        },
        "inclusions": [
          "Join-in tour with guide (basic English)",
          "Shared speedboat transfer",
          "Snorkeling gear (mask, snorkel, fins)",
          "Lunch buffet",
          "Fresh fruits",
          "Bottled water",
          "Life jackets",
          "National park fees",
          "Hotel pickup & drop-off (Patong/Kata/Karon)"
        ],
        "exclusions": [
          "Alcoholic drinks",
          "Personal expenses",
          "Tips for crew",
          "Underwater camera rental (~800 THB)",
          "Scuba diving upgrades",
          "Private speedboat upgrade (~12,000 THB)",
          "Hotel pickup outside Patong/Kata/Karon"
        ]
      },
      {
        "name": "Phuket Old Town Sino-Portuguese Food Walking Tour",
        "about": "Evening walking food tour through Phuket's charming Old Town with its colorful Sino-Portuguese shophouses. Taste legendary dishes like Mee Hokkien (stir-fried Hokkien noodles), Oh Tao (oyster omelette), dim sum, Phuket-style curry, and traditional Portuguese-Thai desserts like Ahpong. Visit the Thai Hua Museum, the photogenic Soi Romanee, and the Jui Tui Chinese shrine.",
        "duration": "3-4 hrs",
        "start": "16:00",
        "end": "20:00",
        "price": {
          "low": 3550,
          "shoulder": 3850,
          "peak": 4150
        },
        "priceLabel": {
          "low": "₹2,400–4,700",
          "shoulder": "₹2,600–5,100",
          "peak": "₹2,800–5,500"
        },
        "inclusions": [
          "Licensed food guide (walking tour specialist)",
          "6-8 food tastings (Hokkien noodles, dim sum, Phuket-style curry, desserts)",
          "Walking tour of Old Town",
          "Visit to Thai Hua Museum",
          "Soi Romanee (most photogenic street)",
          "Jui Tui Shrine",
          "Bottled water",
          "Wet wipes",
          "Meet at Old Town (self-transfer)"
        ],
        "exclusions": [
          "Additional food purchases",
          "Alcoholic drinks",
          "Personal shopping",
          "Tips for guide",
          "Hotel transfers (meet at Old Town)",
          "Private guide upgrade (~1,500 THB)"
        ]
      }
    ]
  },
  "Surat Thani": {
    "name": "Surat Thani",
    "code": "SUR",
    "icon": "🚤",
    "theme": "Gateway & Nature",
    "pop": "Rising",
    "x": 26,
    "y": 74,
    "gatewayLabel": "Regional gateway · URT airport",
    "hotels": {
      "3": {
        "names": [
          "Sunrise Resort",
          "River View Hotel",
          "Suratthani City Hotel",
          "My Place Hotel Surat Thani",
          "The Nine Hotel Surat Thani"
        ],
        "low": 1000,
        "high": 1800
      },
      "4": {
        "names": [
          "The Nine Hotel Surat Thani",
          "Kantary Hills Hotel",
          "Royal River Hotel Surat Thani",
          "Sunrise Resort",
          "River View Hotel"
        ],
        "low": 1800,
        "high": 3500
      },
      "5": {
        "names": [
          "Bandara Resort & Spa",
          "The Nine Hotel Surat Thani",
          "Kantary Hills Hotel",
          "Royal River Hotel Surat Thani",
          "Sunrise Resort"
        ],
        "low": 3000,
        "high": 5500
      }
    },
    "activities": [
      {
        "name": "Surat Thani City Tour & Khao Sok Gateway Transfer",
        "about": "Short city tour of Surat Thani, the main gateway to the Gulf Islands (Koh Samui, Koh Phangan, Koh Tao). Visit the City Pillar Shrine, the ancient Srivijaya-era Phra Borommathat Chaiya stupa (over 1,200 years old), and a local market. Most travelers use Surat Thani as a transit point, but the city has rich history as a former Srivijaya Empire trading port.",
        "duration": "4-5 hrs",
        "start": "09:00",
        "end": "14:00",
        "price": {
          "low": 2650,
          "shoulder": 2850,
          "peak": 3100
        },
        "priceLabel": {
          "low": "₹1,800–3,500",
          "shoulder": "₹1,900–3,800",
          "peak": "₹2,100–4,100"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned transport",
          "Surat Thani City Pillar Shrine",
          "Phra Borommathat Chaiya (ancient Srivijaya stupa)",
          "Wat Phra Borommathat Chaiya",
          "Local market visit",
          "Transfer to Khao Sok or ferry pier",
          "Bottled water"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "Additional food",
          "Ferry tickets to islands",
          "Accommodation",
          "Dinner",
          "Private guide upgrade (~1,500 THB)"
        ]
      }
    ]
  },
  "Hat Yai": {
    "name": "Hat Yai",
    "code": "HAT",
    "icon": "🍜",
    "theme": "Culture & Food",
    "pop": "Popular",
    "x": 24,
    "y": 96,
    "gatewayLabel": "Regional gateway · HDY airport",
    "hotels": {
      "3": {
        "names": [
          "B2 Hat Yai Boutique & Budget Hotel",
          "Hotel de Leaf",
          "Nara Hotel Hat Yai",
          "Siam Mansion Hat Yai",
          "Centara Hotel Hat Yai"
        ],
        "low": 1200,
        "high": 2200
      },
      "4": {
        "names": [
          "Hat Yai Garden Hotel",
          "Grand Plaza Hotel Hat Yai",
          "The Bed Hatyai",
          "B2 Hat Yai Boutique & Budget Hotel",
          "Hotel de Leaf"
        ],
        "low": 2200,
        "high": 4000
      },
      "5": {
        "names": [
          "Centara Hotel Hat Yai",
          "Lee Gardens Plaza Hotel",
          "The Four Points by Sheraton Hat Yai",
          "Hat Yai Garden Hotel",
          "Grand Plaza Hotel Hat Yai"
        ],
        "low": 3500,
        "high": 6500
      }
    },
    "activities": [
      {
        "name": "Hat Yai Night Market & Cable Car to Buddha Mountain",
        "about": "Half-day tour of Hat Yai, the commercial and shopping hub of southern Thailand near the Malaysian border. Take a cable car up to Wat Khao Rup Chang (Buddha Mountain) for panoramic views of the city and surrounding countryside, visit the bustling Kim Yong Market or ASEAN Night Bazaar for local snacks and shopping, and see the beautiful 7-tier Ton Nga Chang Waterfall. Hat Yai is famous for its vibrant night markets, delicious southern Thai cuisine, and duty-free shopping.",
        "duration": "5-6 hrs",
        "start": "15:00",
        "end": "21:00",
        "price": {
          "low": 2650,
          "shoulder": 2850,
          "peak": 3100
        },
        "priceLabel": {
          "low": "₹1,800–3,500",
          "shoulder": "₹1,900–3,800",
          "peak": "₹2,100–4,100"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned transport",
          "Cable car to Wat Khao Rup Chang (Buddha Mountain)",
          "Hat Yai Municipal Park",
          "Kim Yong Market (morning) or ASEAN Night Bazaar (evening)",
          "Ton Nga Chang Waterfall",
          "Local snacks",
          "Hotel pickup & drop-off",
          "Bottled water"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "Shopping at markets",
          "Additional food",
          "Dinner",
          "Accommodation in Hat Yai",
          "Private guide upgrade (~1,500 THB)"
        ]
      }
    ]
  },
  "Ayutthaya": {
    "name": "Ayutthaya",
    "code": "AYU",
    "icon": "🛕",
    "theme": "Culture & History",
    "pop": "Very Popular",
    "x": 50,
    "y": 37,
    "gateway": "Bangkok",
    "km": 80,
    "hopHours": 1.8,
    "hopLabel": "1.8 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 4000,
    "hopCostLabel": "₹3,000–5,000",
    "hotels": {
      "3": {
        "names": [
          "Natee The Riverfront Hotel",
          "Green Home Ayutthaya",
          "Baan Thai House",
          "Chommuang Guest House Ayutthaya",
          "Luang Chumni Village"
        ],
        "low": 1200,
        "high": 2500
      },
      "4": {
        "names": [
          "Classic Kameo Hotel Ayutthaya",
          "Krungsri River Hotel Ayutthaya",
          "Aya Boutique Hotel",
          "Ayutthaya Grand Hotel",
          "The Ayutthaya Heritage"
        ],
        "low": 2200,
        "high": 4200
      },
      "5": {
        "names": [
          "Sala Ayutthaya",
          "Kantary Hotel Ayutthaya",
          "The Grand Ayutthaya Hotel"
        ],
        "low": 3500,
        "high": 6500
      }
    },
    "activities": [
      {
        "name": "Ayutthaya Historical Park Temple Tour",
        "about": "Full-day tour to Ayutthaya, the ancient capital of Siam (1351-1767) and a UNESCO World Heritage Site. Explore the magnificent temple ruins including Wat Mahathat (famous Buddha head entwined in tree roots), Wat Phra Si Sanphet (the royal temple), Wat Chaiwatthanaram (Khmer-style prang), and Wat Yai Chai Mongkhon with its giant reclining Buddha.",
        "duration": "6-8 hrs",
        "start": "07:30",
        "end": "16:00",
        "price": {
          "low": 5000,
          "shoulder": 5400,
          "peak": 5850
        },
        "priceLabel": {
          "low": "₹3,500–6,500",
          "shoulder": "₹3,800–7,000",
          "peak": "₹4,100–7,600"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Air-conditioned minivan (shared, max 12 pax)",
          "Wat Mahathat entry",
          "Wat Phra Si Sanphet entry",
          "Wat Chaiwatthanaram entry",
          "Wat Yai Chai Mongkhon entry",
          "Boat ride around the island",
          "Lunch at local restaurant",
          "Central Bangkok pickup (Silom/Khao San area)",
          "Bottled water"
        ],
        "exclusions": [
          "Bicycle rental (optional ~100 THB)",
          "Elephant ride (not recommended, ~800 THB)",
          "Personal expenses",
          "Tips for guide",
          "Additional temple entries",
          "Private guide upgrade (~3,000 THB)",
          "Hotel pickup outside Silom/Khao San"
        ]
      }
    ]
  },
  "Kanchanaburi": {
    "name": "Kanchanaburi",
    "code": "KAN",
    "icon": "🌉",
    "theme": "Culture & Nature",
    "pop": "Popular",
    "x": 22,
    "y": 38,
    "gateway": "Bangkok",
    "km": 130,
    "hopHours": 2.7,
    "hopLabel": "2.7 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 5000,
    "hopCostLabel": "₹4,000–6,000",
    "hotels": {
      "3": {
        "names": [
          "Pongphen Guesthouse",
          "Blue Rice Resort",
          "Paradise Resort Kanchanaburi",
          "Sugar Cane Guest House",
          "Jolly Frog Backpackers"
        ],
        "low": 1500,
        "high": 2800
      },
      "4": {
        "names": [
          "U Inchantree Kanchanaburi",
          "Felix River Kwai Resort",
          "Royal River Kwai Resort & Spa",
          "Mida Resort Kanchanaburi",
          "River Kwai Resotel"
        ],
        "low": 3200,
        "high": 5500
      },
      "5": {
        "names": [
          "The FloatHouse River Kwai",
          "X2 River Kwai Resort",
          "Dheva Mantra Resort",
          "Felix River Kwai Resort",
          "U Inchantree Kanchanaburi"
        ],
        "low": 5500,
        "high": 9500
      }
    },
    "activities": [
      {
        "name": "River Kwai Bridge, Death Railway & Erawan Falls Tour",
        "about": "Full-day historical and nature tour to Kanchanaburi. Visit the iconic Bridge on the River Kwai (part of the WWII Death Railway), learn about the POW history at the JEATH War Museum, ride the scenic Death Railway train through the jungle and over the Wampo Viaduct, and hike to the stunning 7-tier Erawan Waterfall with its emerald pools perfect for swimming.",
        "duration": "10-12 hrs",
        "start": "06:30",
        "end": "18:00",
        "price": {
          "low": 6500,
          "shoulder": 7050,
          "peak": 7600
        },
        "priceLabel": {
          "low": "₹4,700–8,300",
          "shoulder": "₹5,100–9,000",
          "peak": "₹5,500–9,700"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Air-conditioned minivan (shared)",
          "Bridge on the River Kwai visit",
          "JEATH War Museum entry",
          "Death Railway train ride (Tham Krasae to Nam Tok)",
          "Erawan National Park entry",
          "7-tier Erawan Waterfall hike",
          "Lunch at local restaurant",
          "Central Bangkok pickup",
          "Bottled water"
        ],
        "exclusions": [
          "Bamboo rafting (optional ~300 THB)",
          "Elephant ride (not recommended)",
          "Tips for guide",
          "Personal expenses",
          "Additional snacks",
          "River Kwai floating raft hotel (if overnight)",
          "Private guide upgrade (~3,500 THB)"
        ]
      },
      {
        "name": "Erawan National Park 7-Tier Waterfall Trek",
        "about": "Full-day nature tour to Erawan National Park, home to Thailand's most famous waterfall. Trek through lush jungle to all seven tiers of the Erawan Waterfall, each with its own character — from the broad first tier to the secluded seventh tier. Swim in the emerald-green pools where fish give you a natural spa treatment by nibbling dead skin. The waterfall is named after the three-headed white elephant from Hindu mythology, and the seventh tier supposedly resembles the elephant's head.",
        "duration": "8-10 hrs",
        "start": "06:30",
        "end": "16:30",
        "price": {
          "low": 3550,
          "shoulder": 3850,
          "peak": 4150
        },
        "priceLabel": {
          "low": "₹2,400–4,700",
          "shoulder": "₹2,600–5,100",
          "peak": "₹2,800–5,500"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned van",
          "Erawan National Park entry (300 THB)",
          "7-tier waterfall hike",
          "Swimming at emerald pools",
          "Fish spa (natural)",
          "Lunch at park canteen",
          "Hotel pickup & drop-off",
          "Bottled water"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "Additional snacks",
          "Waterproof bag rental",
          "Dinner",
          "Accommodation in Kanchanaburi",
          "Private guide upgrade (~2,500 THB)"
        ]
      }
    ]
  },
  "Hua Hin": {
    "name": "Hua Hin",
    "code": "HUA",
    "icon": "🏖️",
    "theme": "Family & Romantic",
    "pop": "Popular",
    "x": 36,
    "y": 56,
    "gateway": "Bangkok",
    "km": 200,
    "hopHours": 4,
    "hopLabel": "4.0 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 6500,
    "hopCostLabel": "₹5,000–8,000",
    "hotels": {
      "3": {
        "names": [
          "Ibis Hua Hin",
          "Devasom Hua Hin Resort",
          "Sea Pines Resort",
          "G Hua Hin Resort & Mall",
          "The Rock Hua Hin Beachfront Spa Resort"
        ],
        "low": 2200,
        "high": 4000
      },
      "4": {
        "names": [
          "Anantara Hua Hin Resort",
          "Centara Grand Beach Resort & Villas Hua Hin",
          "Amari Hua Hin",
          "Devasom Hua Hin Resort",
          "Hua Hin Marriott Resort & Spa"
        ],
        "low": 4200,
        "high": 7500
      },
      "5": {
        "names": [
          "InterContinental Hua Hin Resort",
          "Hyatt Regency Hua Hin",
          "Anantara Hua Hin Resort",
          "Centara Grand Beach Resort & Villas Hua Hin",
          "Amari Hua Hin"
        ],
        "low": 7500,
        "high": 14000
      }
    },
    "activities": [
      {
        "name": "Hua Hin Beach, Cicada Market & Vana Nava Water Park",
        "about": "Full-day excursion from Bangkok to Hua Hin, Thailand's original beach resort town. Relax on the 5km white-sand beach, visit the iconic Hua Hin Railway Station built in 1921, explore the teakwood Maruekhathaiyawan Palace (summer residence of King Rama VI), and experience the vibrant Cicada Night Market with live music, art, and street food.",
        "duration": "8-10 hrs",
        "start": "07:00",
        "end": "19:00",
        "price": {
          "low": 4450,
          "shoulder": 4800,
          "peak": 5150
        },
        "priceLabel": {
          "low": "₹3,000–5,900",
          "shoulder": "₹3,200–6,400",
          "peak": "₹3,400–6,900"
        },
        "inclusions": [
          "Join-in tour with driver (basic English)",
          "Shared van from Bangkok",
          "Hua Hin beach time",
          "Vana Nava Water Park entry (if selected)",
          "Cicada Night Market visit",
          "Hua Hin Railway Station",
          "Maruekhathaiyawan Palace",
          "Bottled water",
          "Self-exploration time at beach & market"
        ],
        "exclusions": [
          "Lunch & dinner (~300-600 THB)",
          "Water park food & drinks",
          "Personal shopping at market",
          "Tips for guide",
          "Additional activities (kite surfing, horse riding on beach)",
          "Private van upgrade (~5,000 THB)"
        ]
      }
    ]
  },
  "Pattaya": {
    "name": "Pattaya",
    "code": "PTY",
    "icon": "🌃",
    "theme": "Nightlife & Beach",
    "pop": "Very Popular",
    "x": 58,
    "y": 48,
    "gateway": "Bangkok",
    "km": 150,
    "hopHours": 3.1,
    "hopLabel": "3.1 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 5000,
    "hopCostLabel": "₹4,000–6,000",
    "hotels": {
      "3": {
        "names": [
          "Red Planet Pattaya",
          "Ibis Pattaya",
          "LK President Pattaya",
          "Mike Garden Resort Hotel Pattaya",
          "A-One Star Hotel Pattaya"
        ],
        "low": 1800,
        "high": 3500
      },
      "4": {
        "names": [
          "Centara Grand Mirage Beach Resort Pattaya",
          "Holiday Inn Pattaya",
          "Mercure Pattaya",
          "Siam Bayshore Resort Pattaya",
          "LK The Empress Pattaya"
        ],
        "low": 3500,
        "high": 6500
      },
      "5": {
        "names": [
          "Hilton Pattaya",
          "Royal Cliff Beach Resort Pattaya",
          "Dusit Thani Pattaya",
          "InterContinental Pattaya Resort",
          "Cape Dara Resort Pattaya"
        ],
        "low": 6500,
        "high": 12000
      }
    },
    "activities": [
      {
        "name": "Pattaya Coral Island (Koh Larn) Speedboat & Water Sports",
        "about": "Full-day beach and water sports tour from Bangkok to Pattaya's Coral Island (Koh Larn). Enjoy pristine beaches with crystal-clear water, snorkel among colorful fish, and try thrilling water sports like parasailing, jet skiing, and banana boat rides. Return to Pattaya for optional evening entertainment at Walking Street or the famous Alcazar Cabaret Show.",
        "duration": "6-8 hrs",
        "start": "07:30",
        "end": "16:00",
        "price": {
          "low": 5300,
          "shoulder": 5750,
          "peak": 6200
        },
        "priceLabel": {
          "low": "₹3,500–7,100",
          "shoulder": "₹3,800–7,700",
          "peak": "₹4,100–8,300"
        },
        "inclusions": [
          "Join-in tour with driver (basic English)",
          "Shared van from Bangkok",
          "Speedboat to Koh Larn",
          "Snorkeling gear",
          "Beach chairs & umbrella",
          "Lunch at beach restaurant",
          "1 water sport (banana boat or jet ski)",
          "Bottled water",
          "Life jackets",
          "Self-guided beach time"
        ],
        "exclusions": [
          "Additional water sports (~300-800 THB each)",
          "Alcoholic drinks",
          "Personal expenses",
          "Tips for crew",
          "Walking Street nightlife (evening)",
          "Alcazar or Tiffany Show tickets (~800-1200 THB)",
          "Private speedboat upgrade (~8,000 THB)"
        ]
      }
    ]
  },
  "Pai": {
    "name": "Pai",
    "code": "PAI",
    "icon": "⛰️",
    "theme": "Nature & Culture",
    "pop": "Popular",
    "x": 35,
    "y": 10,
    "gateway": "Chiang Mai",
    "km": 135,
    "hopHours": 2.8,
    "hopLabel": "2.8 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 4000,
    "hopCostLabel": "₹3,000–5,000",
    "hotels": {
      "3": {
        "names": [
          "Pai Country Hut",
          "Pai Klang Na Cottage",
          "Pai Come Hideaway Resort",
          "Pai Vimaan Resort",
          "Pai Hotspring Spa Resort"
        ],
        "low": 1200,
        "high": 2200
      },
      "4": {
        "names": [
          "Pai Village Boutique Resort",
          "Reverie Siam Resort",
          "The Quarter Pai",
          "Pai Island Resort",
          "Pai Cherkaew Boutique House"
        ],
        "low": 2500,
        "high": 4500
      },
      "5": {
        "names": [
          "Pai Village Boutique Resort",
          "Reverie Siam Resort",
          "The Quarter Pai",
          "Pai Island Resort",
          "Pai Cherkaew Boutique House"
        ],
        "low": 3500,
        "high": 6500
      }
    },
    "activities": [
      {
        "name": "Pai Canyon, Hot Springs & Waterfall Tour",
        "about": "Full-day tour along the famous 762-curve mountain road from Chiang Mai to Pai, a laid-back hippie town in the mountains. Hike the dramatic Pai Canyon for stunning sunset views, soak in the Tha Pai Hot Springs (natural mineral water at 80°C), swim at Mo Paeng Waterfall, visit the Chinese Yunnan Village (Santichon) with its clay houses and tea culture, and see the historic WWII Memorial Bridge.",
        "duration": "8-10 hrs",
        "start": "07:00",
        "end": "17:00",
        "price": {
          "low": 5000,
          "shoulder": 5400,
          "peak": 5850
        },
        "priceLabel": {
          "low": "₹3,500–6,500",
          "shoulder": "₹3,800–7,000",
          "peak": "₹4,100–7,600"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned minivan from Chiang Mai",
          "Pai Canyon hike & sunset viewpoint",
          "Tha Pai Hot Springs entry",
          "Mo Paeng Waterfall swim",
          "Pai Walking Street (evening)",
          "Chinese Yunnan Village (Santichon)",
          "WWII Memorial Bridge",
          "Lunch",
          "Bottled water",
          "Small group (max 10 pax)"
        ],
        "exclusions": [
          "Dinner at Pai Walking Street (~200-400 THB)",
          "Hot spring private pool (if requested)",
          "Tips for guide",
          "Personal expenses",
          "Scooter rental in Pai (~150 THB/day)",
          "Accommodation in Pai if overnight",
          "Private van upgrade (~4,000 THB)"
        ]
      }
    ]
  },
  "Mae Hong Son": {
    "name": "Mae Hong Son",
    "code": "MHS",
    "icon": "🌲",
    "theme": "Nature & Adventure",
    "pop": "Rising",
    "x": 28,
    "y": 9,
    "gateway": "Chiang Mai",
    "km": 250,
    "hopHours": 4.9,
    "hopLabel": "4.9 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 7500,
    "hopCostLabel": "₹6,000–9,000",
    "hotels": {
      "3": {
        "names": [
          "Local guesthouses",
          "Mae Hong Son Riverside",
          "Pai Village Boutique Resort",
          "Pai Country Hut",
          "B2 Mae Hong Son"
        ],
        "low": 1200,
        "high": 2200
      },
      "4": {
        "names": [
          "Fern Resort Pai",
          "B2 Mae Hong Son",
          "Pai Country Hut",
          "Jongkam Village",
          "Mae Hong Son Mountain Inn"
        ],
        "low": 2500,
        "high": 4500
      },
      "5": {
        "names": [
          "Fern Resort Pai",
          "Ban Rak Thai Boutique",
          "The Blue Sky Resort",
          "B2 Mae Hong Son Premier Hotel",
          "Pai Country Hut"
        ],
        "low": 4000,
        "high": 7500
      }
    },
    "activities": [
      {
        "name": "Mae Hong Son Loop & Pang Ung Lake Tour",
        "about": "Full-day or overnight tour along the Mae Hong Son Loop, one of Thailand's most scenic drives. Visit Pang Ung Lake with its misty pine forests and swan boats (called the 'Switzerland of Thailand'), explore Ban Rak Thai — a Chinese Yunnan village with tea plantations and clay houses, visit a long-neck Karen village, and take a bamboo raft through Tham Lod Cave with its stunning stalactites and thousands of swifts.",
        "duration": "12-14 hrs",
        "start": "05:00",
        "end": "19:00",
        "price": {
          "low": 12950,
          "shoulder": 14050,
          "peak": 15150
        },
        "priceLabel": {
          "low": "₹9,400–16,500",
          "shoulder": "₹10,200–17,900",
          "peak": "₹11,000–19,300"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned minivan from Chiang Mai",
          "Pang Ung Lake (Switzerland of Thailand)",
          "Ban Rak Thai (Chinese Yunnan village)",
          "Long-neck Karen village",
          "Tham Lod Cave (bamboo raft)",
          "Lod Cave",
          "Lunch",
          "Bottled water",
          "Small group (max 8 pax)"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "Cave lantern rental (~50 THB)",
          "Souvenirs from hill tribe villages",
          "Accommodation in Mae Hong Son if overnight",
          "Dinner",
          "Private van upgrade (~6,000 THB)"
        ]
      }
    ]
  },
  "Sukhothai": {
    "name": "Sukhothai",
    "code": "SUK",
    "icon": "🏛️",
    "theme": "Culture & History",
    "pop": "Rising",
    "x": 38,
    "y": 22,
    "gateway": "Bangkok",
    "km": 430,
    "hopHours": 8.1,
    "hopLabel": "8.1 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 6500,
    "hopCostLabel": "₹5,000–8,000",
    "hotels": {
      "3": {
        "names": [
          "Thai Thai Sukhothai Guesthouse",
          "Ruean Thai Hotel Sukhothai",
          "Scent of Sukhothai Resort",
          "Foresto Sukhothai Guesthome",
          "Lotus Village Sukhothai"
        ],
        "low": 1200,
        "high": 2200
      },
      "4": {
        "names": [
          "Sukhothai Heritage Resort",
          "Sriwilai Sukhothai Resort & Spa",
          "The Legendha Sukhothai Hotel",
          "Thai Thai Sukhothai Guesthouse",
          "Ruean Thai Hotel Sukhothai"
        ],
        "low": 2200,
        "high": 4000
      },
      "5": {
        "names": [
          "Sukhothai Heritage Resort",
          "Sriwilai Sukhothai Resort & Spa",
          "The Legendha Sukhothai Hotel",
          "Thai Thai Sukhothai Guesthouse",
          "Ruean Thai Hotel Sukhothai"
        ],
        "low": 3500,
        "high": 6500
      }
    },
    "activities": [
      {
        "name": "Sukhothai Historical Park Bicycle Tour",
        "about": "Full-day tour to Sukhothai, the first capital of Siam (1238-1438) and a UNESCO World Heritage Site. Explore the well-preserved temple ruins by bicycle, including Wat Mahathat with its classic lotus bud chedis, Wat Si Chum with its 15-meter seated Buddha peeking through a narrow opening, and Wat Sa Si on an island in the middle of a reservoir. Visit the Ramkhamhaeng National Museum to learn about the Sukhothai Kingdom's art and history.",
        "duration": "6-8 hrs",
        "start": "07:00",
        "end": "16:00",
        "price": {
          "low": 3550,
          "shoulder": 3850,
          "peak": 4150
        },
        "priceLabel": {
          "low": "₹2,400–4,700",
          "shoulder": "₹2,600–5,100",
          "peak": "₹2,800–5,500"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned van from Chiang Mai or Bangkok",
          "Bicycle rental",
          "Sukhothai Historical Park entry (Central, North & West zones)",
          "Wat Mahathat",
          "Wat Si Chum (giant Buddha)",
          "Wat Sa Si",
          "Ramkhamhaeng National Museum",
          "Lunch",
          "Bottled water"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "Additional museum entries",
          "Souvenirs",
          "Dinner",
          "Accommodation in Sukhothai if overnight",
          "Private guide upgrade (~3,500 THB)"
        ]
      }
    ]
  },
  "Phi Phi Islands": {
    "name": "Phi Phi Islands",
    "code": "PPI",
    "icon": "🏝️",
    "theme": "Romantic & Adventure",
    "pop": "Very Popular",
    "x": 22,
    "y": 90,
    "gateway": "Krabi",
    "km": 45,
    "hopHours": 1.1,
    "hopLabel": "1.1 hr",
    "hopMode": "🚐+⛴️ Car + boat",
    "hopCost": 2000,
    "hopCostLabel": "₹1,500–2,500",
    "hotels": {
      "3": {
        "names": [
          "Phi Phi Harbor View",
          "Ibiza House Phi Phi",
          "Harmony House",
          "P.P. Casita Hotel",
          "Phi Phi Relax Beach Resort"
        ],
        "low": 2000,
        "high": 3800
      },
      "4": {
        "names": [
          "PP Princess Resort",
          "Phi Phi Villa Resort",
          "Phi Phi Andaman Beach Resort",
          "Phi Phi Harbour View Hotel",
          "Phi Phi Nice Beach Hotel"
        ],
        "low": 4000,
        "high": 7500
      },
      "5": {
        "names": [
          "Zeavola Resort Phi Phi",
          "Phi Phi Island Village Beach Resort",
          "SAii Phi Phi Island Village",
          "Holiday Inn Resort Phi Phi Island",
          "P.P. Blue Sky Resort"
        ],
        "low": 8000,
        "high": 15000
      }
    },
    "activities": [
      {
        "name": "Phi Phi Island-Hopping Speedboat Tour",
        "about": "Full-day speedboat tour exploring the Phi Phi archipelago. Visit Maya Bay (famous from The Beach movie), snorkel at Bamboo Island, see the Viking Cave with its ancient wall paintings, swim at Monkey Beach, and explore the turquoise lagoons of Phi Phi Leh. Multiple snorkeling stops with vibrant marine life.",
        "duration": "7-8 hrs",
        "start": "08:00",
        "end": "16:00",
        "price": {
          "low": 9450,
          "shoulder": 10250,
          "peak": 11050
        },
        "priceLabel": {
          "low": "₹7,100–11,800",
          "shoulder": "₹7,700–12,800",
          "peak": "₹8,300–13,800"
        },
        "inclusions": [
          "Join-in tour with guide (basic English)",
          "Shared speedboat transfer",
          "Snorkeling gear",
          "Lunch buffet",
          "Fresh fruits",
          "Bottled water",
          "Life jackets",
          "National park fees",
          "Hotel pickup & drop-off (Krabi/Phuket)"
        ],
        "exclusions": [
          "Alcoholic drinks",
          "Personal expenses",
          "Tips for crew",
          "Underwater camera rental",
          "Maya Bay entry fee (400 THB)",
          "Accommodation on Phi Phi if overnight",
          "Private speedboat upgrade (~10,000 THB)"
        ]
      }
    ]
  },
  "Koh Lanta": {
    "name": "Koh Lanta",
    "code": "KLN",
    "icon": "🌅",
    "theme": "Romantic & Quiet",
    "pop": "Popular",
    "x": 19,
    "y": 92,
    "gateway": "Krabi",
    "km": 70,
    "hopHours": 1.6,
    "hopLabel": "1.6 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 4000,
    "hopCostLabel": "₹3,000–5,000",
    "hotels": {
      "3": {
        "names": [
          "Lanta Sand Resort & Spa",
          "Lanta Resort",
          "The Houben Hotel",
          "SriLanta Resort",
          "Alama Sea Village Resort"
        ],
        "low": 2200,
        "high": 4200
      },
      "4": {
        "names": [
          "Rawi Warin Resort & Spa",
          "Twin Lotus Resort & Spa",
          "Lanta Sand Resort & Spa",
          "Lanta Resort",
          "The Houben Hotel"
        ],
        "low": 4800,
        "high": 9000
      },
      "5": {
        "names": [
          "Pimalai Resort & Spa",
          "Layana Resort & Spa",
          "Twin Lotus Resort & Spa",
          "Rawi Warin Resort & Spa",
          "Lanta Sand Resort & Spa"
        ],
        "low": 9500,
        "high": 18000
      }
    },
    "activities": [
      {
        "name": "Koh Lanta 4-Island Speedboat Tour with Emerald Cave",
        "about": "Full-day speedboat tour from Koh Lanta to the Trang Islands archipelago. The highlight is swimming through the 80-meter Emerald Cave (Tham Morakot) on Koh Mook to reach a hidden lagoon surrounded by high walls on all sides — like a scene from Jurassic Park. Also snorkel at Koh Kradan's pristine coral reef, relax on Koh Ngai's white beach, and kayak around Koh Cheuk.",
        "duration": "7-8 hrs",
        "start": "08:00",
        "end": "16:00",
        "price": {
          "low": 8250,
          "shoulder": 8950,
          "peak": 9650
        },
        "priceLabel": {
          "low": "₹5,900–10,600",
          "shoulder": "₹6,400–11,500",
          "peak": "₹6,900–12,400"
        },
        "inclusions": [
          "Join-in tour with guide (basic English)",
          "Shared speedboat from Saladan pier",
          "Snorkeling gear",
          "Visit to Koh Mook (Emerald Cave)",
          "Koh Kradan snorkeling",
          "Koh Ngai beach time",
          "Koh Cheuk kayaking",
          "Lunch on beach",
          "Fresh fruits",
          "Bottled water",
          "National park fee",
          "Life jackets"
        ],
        "exclusions": [
          "Alcoholic drinks",
          "Personal expenses",
          "Tips for crew",
          "Kayak rental (~200 THB)",
          "Accommodation on Koh Lanta",
          "Dinner",
          "Private speedboat upgrade (~8,000 THB)"
        ]
      }
    ]
  },
  "Similan Islands": {
    "name": "Similan Islands",
    "code": "SMI",
    "icon": "🐢",
    "theme": "Adventure & Diving",
    "pop": "Very Popular",
    "x": 10,
    "y": 78,
    "gateway": "Phuket",
    "km": 80,
    "hopHours": 1.8,
    "hopLabel": "1.8 hr",
    "hopMode": "🚐+⛴️ Car + boat",
    "hopCost": 4000,
    "hopCostLabel": "₹3,000–5,000",
    "hotels": {
      "3": {
        "names": [
          "The Leaf on The Sands",
          "Khaolak Bhandari Resort & Spa",
          "Apsara Beachfront Resort & Villa",
          "Moracea by Khao Lak Resort",
          "The Sands Khao Lak"
        ],
        "low": 2000,
        "high": 3800
      },
      "4": {
        "names": [
          "The Sands Khao Lak",
          "Khaolak Merlin Resort",
          "The Leaf on The Sands",
          "Khaolak Bhandari Resort & Spa",
          "Apsara Beachfront Resort & Villa"
        ],
        "low": 4000,
        "high": 7500
      },
      "5": {
        "names": [
          "The Sarojin (Khao Lak)",
          "JW Marriott Khao Lak Resort & Spa",
          "Pullman Khao Lak Resort",
          "Moracea by Khao Lak Resort",
          "The Sands Khao Lak"
        ],
        "low": 7500,
        "high": 14000
      }
    },
    "activities": [
      {
        "name": "Similan Islands Snorkeling & Beach Hopping Day Trip",
        "about": "Full-day speedboat tour to the Similan Islands, consistently ranked among the world's top 10 diving and snorkeling destinations. Visit islands #4 (Miang), #8 (Similan - highest viewpoint), and others. Snorkel with sea turtles, reef sharks, and vibrant coral gardens. Hike to the iconic Sail Rock viewpoint on Island #8 for breathtaking panoramas. Open October 15 to May 15 only.",
        "duration": "8-9 hrs",
        "start": "06:00",
        "end": "16:00",
        "price": {
          "low": 12350,
          "shoulder": 13400,
          "peak": 14450
        },
        "priceLabel": {
          "low": "₹9,400–15,300",
          "shoulder": "₹10,200–16,600",
          "peak": "₹11,000–17,900"
        },
        "inclusions": [
          "Join-in tour with guide (basic English)",
          "Shared speedboat transfer from Khao Lak/Phuket",
          "Snorkeling gear",
          "Visit to 4-5 islands",
          "Snorkeling at 3-4 spots",
          "Lunch buffet on boat",
          "Fresh fruits",
          "Bottled water",
          "National park fee (500 THB)",
          "Life jackets",
          "Towel"
        ],
        "exclusions": [
          "Alcoholic drinks",
          "Personal expenses",
          "Tips for crew",
          "Scuba diving (~3,500 THB for 2 dives)",
          "Underwater camera rental",
          "Accommodation (no hotels on Similan)",
          "Dinner",
          "Private speedboat upgrade (~15,000 THB)"
        ]
      }
    ]
  },
  "Khao Sok": {
    "name": "Khao Sok",
    "code": "KSK",
    "icon": "🌳",
    "theme": "Nature & Adventure",
    "pop": "Popular",
    "x": 18,
    "y": 78,
    "gateway": "Surat Thani",
    "km": 120,
    "hopHours": 2.5,
    "hopLabel": "2.5 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 5000,
    "hopCostLabel": "₹4,000–6,000",
    "hotels": {
      "3": {
        "names": [
          "Khao Sok Nature Resort",
          "Chiewlarn Lake Bungalows",
          "Khao Sok Evergreen Resort",
          "The Cliff & River Jungle Resort",
          "Our Jungle House"
        ],
        "low": 1800,
        "high": 3200
      },
      "4": {
        "names": [
          "Khao Sok River Lodge",
          "Panvaree The Greenery",
          "Khao Sok Paradise Resort",
          "Khao Sok Nature Resort",
          "Chiewlarn Lake Bungalows"
        ],
        "low": 3200,
        "high": 6000
      },
      "5": {
        "names": [
          "Elephant Hills Tented Camp",
          "Our Jungle House",
          "Khao Sok Riverside Cottages",
          "Khao Sok River Lodge",
          "Panvaree The Greenery"
        ],
        "low": 5500,
        "high": 10000
      }
    },
    "activities": [
      {
        "name": "Cheow Lan Lake Boat Tour & Jungle Hike",
        "about": "Full-day adventure in Khao Sok National Park, one of the world's oldest rainforests (160 million years). Cruise on Cheow Lan Lake's emerald waters surrounded by towering limestone cliffs, visit a floating raft house for lunch, hike through primary jungle to spot wildlife (gibbons, hornbills, macaques), and explore a limestone cave. Optional: overnight in a floating bungalow for a magical sunrise experience.",
        "duration": "8-10 hrs",
        "start": "08:00",
        "end": "17:00",
        "price": {
          "low": 8250,
          "shoulder": 8950,
          "peak": 9650
        },
        "priceLabel": {
          "low": "₹5,900–10,600",
          "shoulder": "₹6,400–11,500",
          "peak": "₹6,900–12,400"
        },
        "inclusions": [
          "Join-in English-speaking guide",
          "Shared longtail boat tour on Cheow Lan Lake",
          "Khao Sok National Park entry fee",
          "Jungle hike to viewpoint or cave",
          "Lunch at floating raft house",
          "Fresh fruits",
          "Bottled water",
          "Life jackets",
          "Small group (max 10 pax)"
        ],
        "exclusions": [
          "Overnight floating bungalow (if staying, ~1,500-3,000 THB)",
          "Kayak rental (~300 THB)",
          "Tips for guide",
          "Personal expenses",
          "Additional meals",
          "Wildlife spotting night safari (if overnight)",
          "Private longtail boat upgrade (~5,000 THB)"
        ]
      }
    ]
  },
  "Koh Yao Noi": {
    "name": "Koh Yao Noi",
    "code": "KYN",
    "icon": "🌴",
    "theme": "Romantic & Quiet",
    "pop": "Rising",
    "x": 16,
    "y": 83,
    "gateway": "Phuket",
    "km": 25,
    "hopHours": 0.8,
    "hopLabel": "47 min",
    "hopMode": "🚐+⛴️ Car + boat",
    "hopCost": 2500,
    "hopCostLabel": "₹2,000–3,000",
    "hotels": {
      "3": {
        "names": [
          "Patcharee Resort",
          "Koh Yao Yai Village",
          "Sea View Resort",
          "Paradise Koh Yao",
          "Cape Kudu Hotel"
        ],
        "low": 3000,
        "high": 5500
      },
      "4": {
        "names": [
          "Cape Kudu Hotel",
          "YaoYai Resort",
          "Koh Yao Island Resort",
          "Patcharee Resort",
          "Koh Yao Yai Village"
        ],
        "low": 6500,
        "high": 12000
      },
      "5": {
        "names": [
          "Six Senses Yao Noi",
          "Santhiya Koh Yao Yai Resort",
          "TreeHouse Villas",
          "Cape Kudu Hotel",
          "YaoYai Resort"
        ],
        "low": 14000,
        "high": 26000
      }
    },
    "activities": [
      {
        "name": "Koh Yao Noi Cycling, Fishing Village & Sunset Tour",
        "about": "Full-day eco-tour on Koh Yao Noi, a car-free, laid-back island between Phuket and Krabi. Cycle through rice paddies and rubber plantations, visit a traditional Muslim fishing village, learn about local crafts (batik, fishing nets), take a longtail boat to a hidden beach, and watch the sunset from a hilltop viewpoint. The island is known for sustainable tourism and authentic local culture.",
        "duration": "6-7 hrs",
        "start": "09:00",
        "end": "17:00",
        "price": {
          "low": 6500,
          "shoulder": 7050,
          "peak": 7600
        },
        "priceLabel": {
          "low": "₹4,700–8,300",
          "shoulder": "₹5,100–9,000",
          "peak": "₹5,500–9,700"
        },
        "inclusions": [
          "Shared speedboat transfer from Phuket/Krabi",
          "Bicycle rental",
          "English-speaking guide",
          "Local fishing village visit",
          "Rice paddy tour",
          "Traditional longtail boat ride",
          "Sunset viewpoint",
          "Lunch at local home",
          "Fresh fruits",
          "Bottled water",
          "Small group (max 8 pax)"
        ],
        "exclusions": [
          "Alcoholic drinks",
          "Personal expenses",
          "Tips for guide",
          "Additional activities (kayaking, cooking class)",
          "Accommodation on Koh Yao Noi",
          "Private speedboat upgrade (~6,000 THB)"
        ]
      }
    ]
  },
  "Koh Lipe": {
    "name": "Koh Lipe",
    "code": "LIP",
    "icon": "🐠",
    "theme": "Romantic & Diving",
    "pop": "Rising",
    "x": 20,
    "y": 98,
    "gateway": "Hat Yai",
    "km": 60,
    "hopHours": 1.4,
    "hopLabel": "1.4 hr",
    "hopMode": "🚐+⛴️ Car + boat",
    "hopCost": 8000,
    "hopCostLabel": "₹6,000–10,000",
    "hotels": {
      "3": {
        "names": [
          "8Box Seafront Lipe",
          "Castaway Resort",
          "Castaway Beach Resort",
          "Lipe Power Beach Resort",
          "Serendipity Beach Resort"
        ],
        "low": 2200,
        "high": 4200
      },
      "4": {
        "names": [
          "Bundhaya Resort",
          "Mali Resort Pattaya Beach",
          "The Reef Lipe",
          "Serendipity Beach Resort",
          "Castaway Resort"
        ],
        "low": 4800,
        "high": 9000
      },
      "5": {
        "names": [
          "Akira Lipe Resort",
          "Idyllic Concept Resort",
          "Adams Beach Resort",
          "Bundhaya Resort",
          "Mali Resort Pattaya Beach"
        ],
        "low": 9500,
        "high": 18000
      }
    },
    "activities": [
      {
        "name": "Koh Lipe Snorkeling & Tarutao National Park Island Hopping",
        "about": "Full-day speedboat tour from Koh Lipe exploring the Tarutao National Marine Park. Snorkel at pristine coral reefs around Koh Adang, Koh Rawi, and Koh Yang with visibility up to 20m. Hike to the Koh Adang viewpoint for panoramic views of Koh Lipe. Visit the historic Tarutao Island (former political prison). Koh Lipe is known as the 'Maldives of Thailand' with powdery white sand and turquoise water.",
        "duration": "7-8 hrs",
        "start": "08:00",
        "end": "16:00",
        "price": {
          "low": 8250,
          "shoulder": 8950,
          "peak": 9650
        },
        "priceLabel": {
          "low": "₹5,900–10,600",
          "shoulder": "₹6,400–11,500",
          "peak": "₹6,900–12,400"
        },
        "inclusions": [
          "Join-in tour with guide (basic English)",
          "Shared speedboat transfer from Pak Bara pier",
          "Snorkeling gear",
          "Visit to Koh Adang viewpoint",
          "Snorkeling at 3-4 spots",
          "Lunch on beach",
          "Fresh fruits",
          "Bottled water",
          "National park fee",
          "Life jackets"
        ],
        "exclusions": [
          "Alcoholic drinks",
          "Personal expenses",
          "Tips for crew",
          "Scuba diving (~2,500 THB for 2 dives)",
          "Kayak rental (~200 THB/hr)",
          "Accommodation on Koh Lipe",
          "Private speedboat upgrade (~8,000 THB)"
        ]
      }
    ]
  },
  "Koh Phangan": {
    "name": "Koh Phangan",
    "code": "KPN",
    "icon": "🌕",
    "theme": "Nightlife & Beach",
    "pop": "Popular",
    "x": 36,
    "y": 85,
    "gateway": "Koh Samui",
    "km": 15,
    "hopHours": 0.6,
    "hopLabel": "36 min",
    "hopMode": "🚐+⛴️ Car + boat",
    "hopCost": 2500,
    "hopCostLabel": "₹2,000–3,000",
    "hotels": {
      "3": {
        "names": [
          "Sea View Resort",
          "Sunset Hill Resort",
          "Phangan Beach Resort",
          "Lime n Soda Beachfront Resort",
          "Phangan Bayshore Resort"
        ],
        "low": 2000,
        "high": 3800
      },
      "4": {
        "names": [
          "Buri Rasa Village",
          "Panviman Resort",
          "Kupu Kupu Phangan",
          "Havana Beach Resort",
          "Sarikantang Resort & Spa"
        ],
        "low": 4200,
        "high": 7800
      },
      "5": {
        "names": [
          "Anantara Rasananda Koh Phangan Villas",
          "Santhiya Koh Phangan Resort & Spa",
          "The Coast Resort Koh Phangan",
          "Panviman Resort Koh Phangan",
          "Kupu Kupu Phangan Beach Villas & Spa"
        ],
        "low": 8500,
        "high": 16000
      }
    },
    "activities": [
      {
        "name": "Koh Phangan Island Discovery & Secret Beach Tour",
        "about": "Full-day 4WD jeep tour exploring Koh Phangan beyond the Full Moon Party. Visit the stunning Bottle Beach (Haad Khuat) accessible only by boat or hiking, swim at Than Sadet Waterfall (a favorite of King Rama V), hike to Phaeng Waterfall viewpoint, and relax at the twin bays of Thong Nai Pan. Discover the island's quieter, natural side with jungle trails and hidden beaches.",
        "duration": "6-7 hrs",
        "start": "09:00",
        "end": "16:00",
        "price": {
          "low": 5300,
          "shoulder": 5750,
          "peak": 6200
        },
        "priceLabel": {
          "low": "₹3,500–7,100",
          "shoulder": "₹3,800–7,700",
          "peak": "₹4,100–8,300"
        },
        "inclusions": [
          "Join-in tour with driver-guide (basic English)",
          "Shared 4WD jeep tour",
          "Ferry transfer from Koh Samui",
          "Bottle Beach viewpoint",
          "Than Sadet Waterfall",
          "Phaeng Waterfall National Park",
          "Thong Nai Pan beaches",
          "Lunch at local restaurant",
          "Bottled water",
          "Small group (max 10 pax)"
        ],
        "exclusions": [
          "Full Moon Party entry (if attending, ~100-200 THB)",
          "Alcohol",
          "Personal expenses",
          "Tips for guide",
          "Accommodation on Koh Phangan",
          "Private 4WD upgrade (~5,000 THB)"
        ]
      }
    ]
  },
  "Koh Tao": {
    "name": "Koh Tao",
    "code": "KTA",
    "icon": "🤿",
    "theme": "Adventure & Diving",
    "pop": "Popular",
    "x": 37,
    "y": 81,
    "gateway": "Koh Samui",
    "km": 60,
    "hopHours": 1.4,
    "hopLabel": "1.4 hr",
    "hopMode": "🚐+⛴️ Car + boat",
    "hopCost": 4000,
    "hopCostLabel": "₹3,000–5,000",
    "hotels": {
      "3": {
        "names": [
          "Koh Tao Royal Resort",
          "View Point Resort",
          "Sairee Cottage Resort",
          "Blue Diamond Resort",
          "AC2 Resort"
        ],
        "low": 1800,
        "high": 3200
      },
      "4": {
        "names": [
          "Simple Life Resort",
          "Koh Tao Cabana",
          "Koh Tao Montra Resort",
          "Sensi Paradise Beach Resort",
          "Dusit Buncha Resort"
        ],
        "low": 3500,
        "high": 6500
      },
      "5": {
        "names": [
          "The Place Luxury Boutique Villas",
          "Haadtien Beach Resort",
          "Jamahkiri Resort & Spa",
          "Sai Thong Resort & Spa",
          "Koh Tao Hillside Resort"
        ],
        "low": 6500,
        "high": 12000
      }
    },
    "activities": [
      {
        "name": "Koh Tao Scuba Diving Experience (2 Dives)",
        "about": "World-class scuba diving experience at Koh Tao, one of the cheapest and best places to learn to dive globally. Two guided boat dives at sites like Chumphon Pinnacle (chance of whale sharks), Shark Island, Green Rock, or Japanese Gardens. Visibility 15-30m. Water temperature 27-30°C year-round. Suitable for certified divers and beginners (Discover Scuba Diving option available).",
        "duration": "7-8 hrs",
        "start": "07:30",
        "end": "15:30",
        "price": {
          "low": 9450,
          "shoulder": 10250,
          "peak": 11050
        },
        "priceLabel": {
          "low": "₹7,100–11,800",
          "shoulder": "₹7,700–12,800",
          "peak": "₹8,300–13,800"
        },
        "inclusions": [
          "Shared ferry transfer from Koh Samui (or Chumphon)",
          "PADI-certified dive instructor",
          "2 boat dives at different sites",
          "All scuba equipment (BCD, regulator, wetsuit, fins, mask)",
          "Dive insurance",
          "Lunch on boat",
          "Drinking water",
          "Towel",
          "Small group (max 4 divers per instructor)"
        ],
        "exclusions": [
          "PADI Open Water certification (if not certified, ~12,000 THB for 3-day course)",
          "Additional dives (~1,000 THB each)",
          "Underwater photos (~800 THB)",
          "Tips for dive crew",
          "Nitrox (if requested, ~300 THB per tank)",
          "Accommodation on Koh Tao",
          "Private dive instructor upgrade (~5,000 THB)"
        ]
      }
    ]
  },
  "Koh Samet": {
    "name": "Koh Samet",
    "code": "KSM",
    "icon": "🏖️",
    "theme": "Romantic & Beach",
    "pop": "Popular",
    "x": 62,
    "y": 53,
    "gateway": "Bangkok",
    "km": 180,
    "hopHours": 3.6,
    "hopLabel": "3.6 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 7500,
    "hopCostLabel": "₹6,000–9,000",
    "hotels": {
      "3": {
        "names": [
          "Tubtim Resort",
          "Parichat Resort",
          "Samet Ville Resort",
          "Samed Villa Resort",
          "Vongdeuan Resort"
        ],
        "low": 2000,
        "high": 3800
      },
      "4": {
        "names": [
          "Sai Kaew Resort",
          "The Rocks Resort",
          "Baan Plee Resort",
          "Samed Club Resort",
          "Lima Coco Resort"
        ],
        "low": 4000,
        "high": 7500
      },
      "5": {
        "names": [
          "Ao Prao Resort",
          "Paradee Koh Samet",
          "Le Vimarn Cottages & Spa",
          "Sai Kaew Beach Resort",
          "Samed Club Resort"
        ],
        "low": 7500,
        "high": 14000
      }
    },
    "activities": [
      {
        "name": "Koh Samet Beach Day & Snorkeling Trip",
        "about": "Full-day beach escape from Bangkok to Koh Samet, the closest island getaway from the capital. Just 3 hours by road + speedboat. Relax on powdery white-sand beaches at Ao Prao or Sai Kaew, snorkel in clear waters with colorful fish, and enjoy a seafood lunch. Koh Samet is part of Khao Laem Ya-Mu Ko Samet National Park with 14 beaches to explore.",
        "duration": "8-10 hrs",
        "start": "07:00",
        "end": "17:00",
        "price": {
          "low": 5300,
          "shoulder": 5750,
          "peak": 6200
        },
        "priceLabel": {
          "low": "₹3,500–7,100",
          "shoulder": "₹3,800–7,700",
          "peak": "₹4,100–8,300"
        },
        "inclusions": [
          "Join-in tour with driver (basic English)",
          "Shared van from Bangkok to Ban Phe pier",
          "Shared speedboat transfer to Koh Samet",
          "Snorkeling gear",
          "Beach time at Ao Prao or Sai Kaew",
          "Lunch at beach restaurant",
          "National park fee",
          "Bottled water",
          "Beach chairs & umbrella",
          "Self-guided beach time"
        ],
        "exclusions": [
          "Alcoholic drinks",
          "Personal expenses",
          "Tips for boat crew",
          "Additional water sports (jet ski, banana boat)",
          "Accommodation on Koh Samet if overnight",
          "Dinner",
          "Private speedboat upgrade (~8,000 THB)"
        ]
      }
    ]
  },
  "Koh Chang": {
    "name": "Koh Chang",
    "code": "KCG",
    "icon": "🏝️",
    "theme": "Nature & Beach",
    "pop": "Popular",
    "x": 70,
    "y": 56,
    "gateway": "Bangkok",
    "km": 315,
    "hopHours": 6,
    "hopLabel": "5.5–6.5 hr",
    "hopMode": "🚐+⛴️ Car + boat via Trat",
    "hopCost": 7500,
    "hopCostLabel": "₹6,000–9,000",
    "hotels": {
      "3": {
        "names": [
          "Coconut Beach Resort",
          "Kacha Resort & Spa",
          "CHILLIN Beach Bar & Bungalows",
          "Siam Bay Resort",
          "Klong Prao Resort"
        ],
        "low": 1800,
        "high": 3500
      },
      "4": {
        "names": [
          "KC Grande Resort & Spa",
          "Centara Koh Chang Tropicana Resort",
          "The Emerald Cove Koh Chang",
          "Kacha Resort & Spa",
          "Chai Chet Resort"
        ],
        "low": 3800,
        "high": 7000
      },
      "5": {
        "names": [
          "The Dewa Koh Chang",
          "AANA Resort & Spa",
          "Treetops Lake Resort",
          "KC Grande Resort & Spa",
          "Centara Koh Chang Tropicana Resort"
        ],
        "low": 7000,
        "high": 13000
      }
    },
    "activities": [
      {
        "name": "Koh Chang Island Tour & Snorkeling at Coral Reefs",
        "about": "Full-day island tour of Koh Chang, Thailand's second-largest island and a UNESCO Biosphere Reserve. Snorkel at vibrant coral reefs near Koh Rang National Park, visit the fishing village of Bang Bao on stilts, see the Klong Plu Waterfall, and relax on White Sand Beach (Haad Sai Khao). Koh Chang is less developed than Phuket with 70% rainforest cover and stunning natural beauty.",
        "duration": "7-8 hrs",
        "start": "08:00",
        "end": "16:00",
        "price": {
          "low": 6500,
          "shoulder": 7050,
          "peak": 7600
        },
        "priceLabel": {
          "low": "₹4,700–8,300",
          "shoulder": "₹5,100–9,000",
          "peak": "₹5,500–9,700"
        },
        "inclusions": [
          "Join-in tour with driver-guide (basic English)",
          "Shared van from Trat Airport to pier",
          "Shared ferry transfer to Koh Chang",
          "Shared longtail boat to snorkeling spots",
          "Snorkeling gear",
          "Lunch on boat or beach",
          "Fresh fruits",
          "Bottled water",
          "National park fee",
          "Life jackets"
        ],
        "exclusions": [
          "Alcoholic drinks",
          "Personal expenses",
          "Tips for crew",
          "Additional water sports",
          "Kayak rental (~200 THB)",
          "Accommodation on Koh Chang",
          "Private longtail boat upgrade (~5,000 THB)"
        ]
      }
    ]
  },
  "Koh Kood": {
    "name": "Koh Kood",
    "code": "KKD",
    "icon": "🌊",
    "theme": "Romantic & Nature",
    "pop": "Rising",
    "x": 74,
    "y": 60,
    "gateway": "Bangkok",
    "km": 390,
    "hopHours": 7,
    "hopLabel": "6.5–7.5 hr",
    "hopMode": "🚐+⛴️ Car + boat via Trat",
    "hopCost": 8500,
    "hopCostLabel": "₹7,000–10,000",
    "hotels": {
      "3": {
        "names": [
          "Koh Kood Resort",
          "Away Koh Kood",
          "The Beach Natural Resort",
          "High Season Pool Villa & Spa",
          "Dusita Koh Kood Resort"
        ],
        "low": 2800,
        "high": 5200
      },
      "4": {
        "names": [
          "Cham's House Koh Kood Resort",
          "Koh Kood Resort",
          "Away Koh Kood",
          "The Beach Natural Resort",
          "High Season Pool Villa & Spa"
        ],
        "low": 6000,
        "high": 11000
      },
      "5": {
        "names": [
          "Soneva Kiri",
          "Peter Pan Resort",
          "Tinkerbell Privacy Resort",
          "Cham's House Koh Kood Resort",
          "Koh Kood Resort"
        ],
        "low": 13000,
        "high": 24000
      }
    },
    "activities": [
      {
        "name": "Koh Kood Waterfall Hike & Private Beach Escape",
        "about": "Full-day tour to Koh Kood, Thailand's fourth-largest island and one of its most pristine. Hike to the stunning 3-tier Khlong Chao Waterfall where you can swim in natural pools, visit the traditional Ao Yai fishing village, snorkel at coral reefs, and relax on secluded white-sand beaches like Ao Phrao and Ao Ta Khian. Koh Kood is known for its unspoiled nature, crystal-clear water, and luxury eco-resorts.",
        "duration": "8-10 hrs",
        "start": "08:00",
        "end": "17:00",
        "price": {
          "low": 6500,
          "shoulder": 7050,
          "peak": 7600
        },
        "priceLabel": {
          "low": "₹4,700–8,300",
          "shoulder": "₹5,100–9,000",
          "peak": "₹5,500–9,700"
        },
        "inclusions": [
          "Join-in tour with driver-guide (basic English)",
          "Shared van from Trat to Laem Sok pier",
          "Shared speedboat transfer to Koh Kood",
          "Visit to Khlong Chao Waterfall (3-tier)",
          "Ao Yai fishing village",
          "Private beach time at Ao Phrao",
          "Snorkeling gear",
          "Lunch at beach restaurant",
          "Fresh fruits",
          "Bottled water",
          "National park fee"
        ],
        "exclusions": [
          "Alcoholic drinks",
          "Personal expenses",
          "Tips for crew",
          "Kayak rental (~200 THB)",
          "Additional water sports",
          "Accommodation on Koh Kood",
          "Dinner",
          "Private speedboat upgrade (~10,000 THB)"
        ]
      }
    ]
  },
  "Koh Mak": {
    "name": "Koh Mak",
    "code": "KMK",
    "icon": "🌺",
    "theme": "Romantic & Quiet",
    "pop": "Hidden Gem",
    "x": 72,
    "y": 58,
    "gateway": "Bangkok",
    "km": 375,
    "hopHours": 6.5,
    "hopLabel": "6–7 hr",
    "hopMode": "🚐 Car / van via Trat",
    "hopCost": 7500,
    "hopCostLabel": "₹6,000–9,000",
    "hotels": {
      "3": {
        "names": [
          "Koh Mak Resort",
          "Cococape Resort",
          "Makathanee Resort",
          "The Cinnamon Art Resort & Spa",
          "Islanda Resort"
        ],
        "low": 1800,
        "high": 3500
      },
      "4": {
        "names": [
          "Seavana Beach Resort",
          "Ao Kao White Sand Beach Resort",
          "Koh Mak Resort",
          "Cococape Resort",
          "Makathanee Resort"
        ],
        "low": 3800,
        "high": 7000
      },
      "5": {
        "names": [
          "Mira Montra Resort Koh Mak",
          "Seavana Beach Resort",
          "Ao Kao White Sand Beach Resort",
          "Koh Mak Resort",
          "Cococape Resort"
        ],
        "low": 7000,
        "high": 13000
      }
    },
    "activities": [
      {
        "name": "Koh Mak Cycling, Organic Farm & Sunset Cruise",
        "about": "Full-day eco-tour on Koh Mak, a family-owned island with a strong focus on sustainable tourism. Cycle through coconut and rubber plantations, visit an organic farm, snorkel at tiny nearby islets, relax on the island's two main bays (Ao Kao and Ao Suan Yai), and enjoy a romantic sunset longtail boat cruise. Koh Mak has no cars, no Full Moon Parties, and a relaxed, community-based atmosphere.",
        "duration": "6-8 hrs",
        "start": "09:00",
        "end": "17:00",
        "price": {
          "low": 5000,
          "shoulder": 5400,
          "peak": 5850
        },
        "priceLabel": {
          "low": "₹3,500–6,500",
          "shoulder": "₹3,800–7,000",
          "peak": "₹4,100–7,600"
        },
        "inclusions": [
          "Join-in tour with guide (basic English)",
          "Shared speedboat transfer from Laem Ngop pier",
          "Bicycle rental",
          "Organic farm visit (coconut, rubber, fruit)",
          "Ao Kao & Ao Suan Yai beaches",
          "Sunset longtail boat cruise",
          "Snorkeling at nearby islets",
          "Lunch at local restaurant",
          "Fresh fruits",
          "Bottled water",
          "Small group (max 8 pax)"
        ],
        "exclusions": [
          "Alcoholic drinks",
          "Personal expenses",
          "Tips for guide",
          "Additional activities (kayaking, SUP)",
          "Accommodation on Koh Mak",
          "Dinner",
          "Private speedboat upgrade (~8,000 THB)"
        ]
      }
    ]
  },
  "Nong Khai": {
    "name": "Nong Khai",
    "code": "NKH",
    "icon": "🌅",
    "theme": "Culture & Nature",
    "pop": "Rising",
    "x": 66,
    "y": 18,
    "gateway": "Udon Thani",
    "km": 55,
    "hopHours": 1.3,
    "hopLabel": "1.3 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 2500,
    "hopCostLabel": "₹2,000–3,000",
    "hotels": {
      "3": {
        "names": [
          "Mut Mee Garden Guest House",
          "Pon Arena Hotel",
          "Panta Hotel",
          "Mekong Guesthouse",
          "Nong Khai City Hotel"
        ],
        "low": 1000,
        "high": 1800
      },
      "4": {
        "names": [
          "Nongkhai Resort",
          "White Inn Hotel Nongkhai",
          "Mut Mee Garden Guest House",
          "Pon Arena Hotel",
          "Panta Hotel"
        ],
        "low": 1800,
        "high": 3500
      },
      "5": {
        "names": [
          "Baan Rim Khong Resort",
          "Nongkhai Resort",
          "White Inn Hotel Nongkhai",
          "Mut Mee Garden Guest House",
          "Pon Arena Hotel"
        ],
        "low": 3000,
        "high": 5500
      }
    },
    "activities": [
      {
        "name": "Sala Keoku Sculpture Park & Mekong River Sunset Cruise",
        "about": "Half-day cultural tour in Nong Khai on the Mekong River border with Laos. Visit the surreal Sala Keoku (Wat Khaek) sculpture park with its massive concrete statues of Buddha, Shiva, and Hindu-Buddhist deities created by the mystic Luang Pu Bunleua Sulilat. Take a longtail boat cruise on the Mekong River at sunset with views of Vientiane, Laos on the opposite bank. Visit Tha Sadet Market for local Isaan snacks and handicrafts.",
        "duration": "5-6 hrs",
        "start": "14:00",
        "end": "20:00",
        "price": {
          "low": 3550,
          "shoulder": 3850,
          "peak": 4150
        },
        "priceLabel": {
          "low": "₹2,400–4,700",
          "shoulder": "₹2,600–5,100",
          "peak": "₹2,800–5,500"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned transport",
          "Sala Keoku (Wat Khaek) entry",
          "Giant Buddha sculptures & Hindu-Buddhist art",
          "Mekong River longtail boat cruise",
          "Tha Sadet Market visit",
          "Sunset over Laos",
          "Local snacks",
          "Hotel pickup & drop-off",
          "Bottled water"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "Souvenirs at Tha Sadet Market",
          "Additional food",
          "Dinner",
          "Accommodation in Nong Khai",
          "Laos visa (if crossing)",
          "Private guide upgrade (~2,000 THB)"
        ]
      }
    ]
  },
  "Chanthaburi": {
    "name": "Chanthaburi",
    "code": "CTI",
    "icon": "💎",
    "theme": "Culture & Food",
    "pop": "Hidden Gem",
    "x": 66,
    "y": 52,
    "gateway": "Bangkok",
    "km": 245,
    "hopHours": 4.8,
    "hopLabel": "4.8 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 7500,
    "hopCostLabel": "₹6,000–9,000",
    "hotels": {
      "3": {
        "names": [
          "B2 Chanthaburi Premier Hotel",
          "Chanthaburi Center",
          "The Tide Resort",
          "K.P. Grand Hotel Chanthaburi",
          "Namtok Phlio Resort"
        ],
        "low": 1500,
        "high": 2800
      },
      "4": {
        "names": [
          "Maneechan Resort & Hotel",
          "Kasemsarn Hotel Chanthaburi",
          "The River Resort Chanthaburi",
          "Sand Dunes Chaolao Beach Resort",
          "Chanthaburi Center"
        ],
        "low": 2800,
        "high": 5200
      },
      "5": {
        "names": [
          "Chatrium Golf Resort Soi Dao Chanthaburi",
          "Maneechan Resort & Hotel",
          "Kasemsarn Hotel Chanthaburi",
          "The River Resort Chanthaburi",
          "Sand Dunes Chaolao Beach Resort"
        ],
        "low": 4500,
        "high": 8500
      }
    },
    "activities": [
      {
        "name": "Chanthaburi Gem Market, Cathedral & Durian Orchard Tour",
        "about": "Full-day tour to Chanthaburi, the 'City of the Moon' and Thailand's gem capital. Visit the world's largest colored gem market (open Friday-Sunday mornings), see the stunning Cathedral of the Immaculate Conception with its Gothic Revival architecture, pay respects at the King Taksin the Great Shrine, visit a durian and tropical fruit orchard (Chanthaburi is Thailand's durian capital), and swim at the beautiful Namtok Phlio Waterfall.",
        "duration": "8-10 hrs",
        "start": "06:00",
        "end": "17:00",
        "price": {
          "low": 4150,
          "shoulder": 4500,
          "peak": 4800
        },
        "priceLabel": {
          "low": "₹3,000–5,300",
          "shoulder": "₹3,200–5,800",
          "peak": "₹3,400–6,200"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned van from Bangkok",
          "Chanthaburi Gem Market visit",
          "Cathedral of the Immaculate Conception",
          "King Taksin the Great Shrine",
          "Durian & fruit orchard visit",
          "Namtok Phlio National Park waterfall",
          "Lunch at local restaurant",
          "Hotel pickup & drop-off",
          "Bottled water"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "Gem purchases",
          "Additional fruit purchases",
          "Dinner",
          "Accommodation in Chanthaburi",
          "Private guide upgrade (~3,000 THB)"
        ]
      }
    ]
  },
  "Trang": {
    "name": "Trang",
    "code": "TRG",
    "icon": "🐚",
    "theme": "Nature & Quiet",
    "pop": "Hidden Gem",
    "x": 22,
    "y": 94,
    "gateway": "Krabi",
    "km": 50,
    "hopHours": 1.2,
    "hopLabel": "1.2 hr",
    "hopMode": "🚐+⛴️ Car + boat",
    "hopCost": 4000,
    "hopCostLabel": "₹3,000–5,000",
    "hotels": {
      "3": {
        "names": [
          "Punnada Resort & Spa",
          "Sugar Marina Resort",
          "Tongkah Harbour Resort",
          "Thumrin Thana Hotel",
          "Trang Hotel"
        ],
        "low": 1200,
        "high": 2200
      },
      "4": {
        "names": [
          "Trang Hotel",
          "Kantary House",
          "Villa Phra That",
          "Punnada Resort & Spa",
          "Sugar Marina Resort"
        ],
        "low": 2500,
        "high": 4500
      },
      "5": {
        "names": [
          "Anantara Si Kao Resort",
          "Kantary Beach Hotel Trang",
          "The Galleri by Katathani",
          "Villa Phra That",
          "Punnada Resort & Spa"
        ],
        "low": 4000,
        "high": 7500
      }
    },
    "activities": [
      {
        "name": "Trang Island-Hopping: Koh Mook Emerald Cave & Koh Kradan",
        "about": "Full-day longtail boat tour from Trang to the lesser-known islands of the Trang archipelago. The highlight is swimming through the 80-meter Emerald Cave (Tham Morakot) on Koh Mook to reach a hidden lagoon. Also snorkel at Koh Kradan's pristine coral reef, relax on Koh Ngai's white beach, and kayak around Koh Cheuk. Trang islands are far less crowded than Phuket or Krabi, offering a more authentic island experience.",
        "duration": "7-8 hrs",
        "start": "08:00",
        "end": "16:00",
        "price": {
          "low": 6500,
          "shoulder": 7050,
          "peak": 7600
        },
        "priceLabel": {
          "low": "₹4,700–8,300",
          "shoulder": "₹5,100–9,000",
          "peak": "₹5,500–9,700"
        },
        "inclusions": [
          "Join-in tour with guide (basic English)",
          "Shared longtail boat from Pak Meng pier",
          "Snorkeling gear",
          "Koh Mook Emerald Cave swim",
          "Koh Kradan snorkeling",
          "Koh Ngai beach time",
          "Koh Cheuk kayaking",
          "Lunch on beach",
          "Fresh fruits",
          "Bottled water",
          "National park fee",
          "Life jackets"
        ],
        "exclusions": [
          "Alcoholic drinks",
          "Personal expenses",
          "Tips for crew",
          "Kayak rental (~200 THB)",
          "Accommodation on islands",
          "Dinner",
          "Private longtail boat upgrade (~5,000 THB)"
        ]
      }
    ]
  },
  "Ko Tarutao": {
    "name": "Ko Tarutao",
    "code": "KTR",
    "icon": "🏴‍☠️",
    "theme": "Nature & History",
    "pop": "Hidden Gem",
    "x": 21,
    "y": 99,
    "gateway": "Hat Yai",
    "km": 140,
    "hopHours": 3.5,
    "hopLabel": "3–4 hr",
    "hopMode": "🚐 Car / van via Pak Bara pier",
    "hopCost": 5000,
    "hopCostLabel": "₹4,000–6,000",
    "hotels": {
      "3": {
        "names": [
          "B2 Satun Premier Hotel",
          "Green View Village Resort",
          "Satun Boutique Resort",
          "The Loft Resort Satun",
          "Marina Resort Satun"
        ],
        "low": 800,
        "high": 1500
      },
      "4": {
        "names": [
          "The Signature Hotel Airport",
          "The Lord Hotel Satun",
          "B2 Satun Premier Hotel",
          "Green View Village Resort",
          "Satun Boutique Resort"
        ],
        "low": 1500,
        "high": 2800
      },
      "5": {
        "names": [
          "The Signature Hotel Airport (Satun)",
          "The Lord Hotel Satun",
          "B2 Satun Premier Hotel",
          "Green View Village Resort",
          "Satun Boutique Resort"
        ],
        "low": 2500,
        "high": 4500
      }
    },
    "activities": [
      {
        "name": "Tarutao National Park Historical Prison & Jungle Trek",
        "about": "Full-day adventure to Ko Tarutao, the largest island in the Tarutao National Marine Park and a UNESCO Global Geopark. Explore the haunting historical prison site where political prisoners were held in the 1930s-40s, kayak through the Crocodile Cave mangrove tunnels, trek through pristine jungle to a panoramic viewpoint, and relax at Ao Son Bay's untouched beach. Tarutao is one of Thailand's most pristine and historically significant islands.",
        "duration": "8-10 hrs",
        "start": "08:00",
        "end": "17:00",
        "price": {
          "low": 5000,
          "shoulder": 5400,
          "peak": 5850
        },
        "priceLabel": {
          "low": "₹3,500–6,500",
          "shoulder": "₹3,800–7,000",
          "peak": "₹4,100–7,600"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared speedboat from Pak Bara pier",
          "Tarutao National Park entry (200 THB)",
          "Historical prison site tour",
          "Ao Son Bay mangrove walk",
          "Crocodile Cave kayak",
          "Jungle trek to viewpoint",
          "Lunch at park canteen",
          "Bottled water",
          "Life jackets",
          "Small group (max 10 pax)"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "Additional snacks",
          "Accommodation on Tarutao (basic bungalows available)",
          "Dinner",
          "Kayak rental (~200 THB)",
          "Private speedboat upgrade (~6,000 THB)"
        ]
      }
    ]
  },
  "Nakhon Si Thammarat": {
    "name": "Nakhon Si Thammarat",
    "code": "NST",
    "icon": "🛕",
    "theme": "Culture & History",
    "pop": "Hidden Gem",
    "x": 28,
    "y": 92,
    "gateway": "Surat Thani",
    "km": 120,
    "hopHours": 2.5,
    "hopLabel": "2.5 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 4000,
    "hopCostLabel": "₹3,000–5,000",
    "hotels": {
      "3": {
        "names": [
          "B2 Nakhon Si Thammarat Premier Hotel",
          "The Trend Hotel",
          "Pura Nakhon Hotel",
          "Nakhon Garden Hotel",
          "Khiang Le Resort"
        ],
        "low": 1000,
        "high": 1800
      },
      "4": {
        "names": [
          "Grand Park Hotel",
          "B2 Nakhon Si Thammarat Premier Hotel",
          "The Trend Hotel",
          "Pura Nakhon Hotel",
          "Nakhon Garden Hotel"
        ],
        "low": 1800,
        "high": 3200
      },
      "5": {
        "names": [
          "Twin Lotus Hotel",
          "Grand Park Hotel",
          "B2 Nakhon Si Thammarat Premier Hotel",
          "The Trend Hotel",
          "Pura Nakhon Hotel"
        ],
        "low": 2800,
        "high": 5200
      }
    },
    "activities": [
      {
        "name": "Wat Phra Mahathat & Shadow Puppet Museum Tour",
        "about": "Half-day cultural tour of Nakhon Si Thammarat, one of Thailand's oldest cities and a former Srivijaya Empire capital. Visit Wat Phra Mahathat Woramahawihan with its iconic Sri Lankan-style chedi and sacred Buddha relics, see a traditional Nang Talung (shadow puppet) performance at a local museum, walk the ancient city walls, and visit Kiriwong Village — known as Thailand's cleanest village with its lush rainforest setting and community-based tourism.",
        "duration": "5-6 hrs",
        "start": "09:00",
        "end": "15:00",
        "price": {
          "low": 2650,
          "shoulder": 2850,
          "peak": 3100
        },
        "priceLabel": {
          "low": "₹1,800–3,500",
          "shoulder": "₹1,900–3,800",
          "peak": "₹2,100–4,100"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned transport",
          "Wat Phra Mahathat Woramahawihan entry (UNESCO tentative site)",
          "Shadow puppet museum (Nang Talung)",
          "City wall & ancient gates",
          "Kiriwong Village (Thailand's cleanest village)",
          "Local snacks",
          "Hotel pickup & drop-off",
          "Bottled water"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "Shadow puppet purchases",
          "Additional food",
          "Lunch",
          "Dinner",
          "Accommodation in Nakhon Si Thammarat",
          "Private guide upgrade (~2,000 THB)"
        ]
      }
    ]
  },
  "Ratchaburi": {
    "name": "Ratchaburi",
    "code": "RCB",
    "icon": "🛶",
    "theme": "Culture & Food",
    "pop": "Popular",
    "x": 30,
    "y": 42,
    "gateway": "Bangkok",
    "km": 100,
    "hopHours": 2.1,
    "hopLabel": "2.1 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 3750,
    "hopCostLabel": "₹3,000–4,500",
    "hotels": {
      "3": {
        "names": [
          "Baan Suan Resort",
          "Royal Hotel Ratchaburi",
          "Pae Rim Khwae Resort",
          "River Kwai Jungle House",
          "Ratchaburi Grand Hotel"
        ],
        "low": 1200,
        "high": 2200
      },
      "4": {
        "names": [
          "Ratchaburi Hotel",
          "The Canal Hotel",
          "Baan Suan Resort",
          "Royal Hotel Ratchaburi",
          "Pae Rim Khwae Resort"
        ],
        "low": 2200,
        "high": 4000
      },
      "5": {
        "names": [
          "The Scenery Vintage Farm",
          "Ratchaburi Hotel",
          "The Canal Hotel",
          "Baan Suan Resort",
          "Royal Hotel Ratchaburi"
        ],
        "low": 3500,
        "high": 6500
      }
    },
    "activities": [
      {
        "name": "Damnoen Saduak Floating Market & Coconut Sugar Farm",
        "about": "Half-day tour to Damnoen Saduak, Thailand's most famous floating market located in Ratchaburi province. Cruise through the canal network on a longtail boat, watch vendors sell fresh produce, tropical fruits, and cooked food from wooden boats, visit a traditional coconut sugar farm to see how palm sugar is made, and taste freshly made Thai sweets. Best visited early morning (7:00-9:00 AM) when the market is most active.",
        "duration": "5-6 hrs",
        "start": "06:30",
        "end": "12:30",
        "price": {
          "low": 4150,
          "shoulder": 4500,
          "peak": 4800
        },
        "priceLabel": {
          "low": "₹3,000–5,300",
          "shoulder": "₹3,200–5,800",
          "peak": "₹3,400–6,200"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned van",
          "Longtail boat ride through canals",
          "Floating market visit",
          "Coconut sugar farm demonstration",
          "Traditional Thai sweet making",
          "Local snacks",
          "Hotel pickup & drop-off",
          "Bottled water"
        ],
        "exclusions": [
          "Meals (~200-400 THB)",
          "Paddle boat (150 THB extra)",
          "Personal shopping",
          "Tips for guide",
          "Additional snacks",
          "Private guide upgrade (~2,000 THB)"
        ]
      }
    ]
  },
  "Lopburi": {
    "name": "Lopburi",
    "code": "LOP",
    "icon": "🐒",
    "theme": "Culture & History",
    "pop": "Rising",
    "x": 54,
    "y": 32,
    "gateway": "Bangkok",
    "km": 150,
    "hopHours": 3.1,
    "hopLabel": "3.1 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 5000,
    "hopCostLabel": "₹4,000–6,000",
    "hotels": {
      "3": {
        "names": [
          "Noom Guesthouse",
          "Nett Hotel",
          "Patta House Hotel",
          "Lopburi Garden Hotel",
          "The Lopburi Hotel"
        ],
        "low": 800,
        "high": 1500
      },
      "4": {
        "names": [
          "Lopburi Residence Hotel",
          "The Rich Hotel Lopburi",
          "Noom Guesthouse",
          "Nett Hotel",
          "Patta House Hotel"
        ],
        "low": 1500,
        "high": 2800
      },
      "5": {
        "names": [
          "Lopburi Inn Hotel",
          "Lopburi Residence Hotel",
          "The Rich Hotel Lopburi",
          "Noom Guesthouse",
          "Nett Hotel"
        ],
        "low": 2500,
        "high": 4500
      }
    },
    "activities": [
      {
        "name": "Lopburi Monkey Temple & Khmer Ruins Tour",
        "about": "Full-day tour to Lopburi, the 'Monkey City' of Thailand. Visit Phra Prang Sam Yot, a Khmer-era temple overrun with thousands of crab-eating macaques who are considered sacred. Explore the 17th-century Phra Narai Ratchanivet Palace built by King Narai the Great with its blend of Thai, French, and Italian architecture, see Wat Phra Si Mahathat with its ancient Khmer prang, and feed the friendly (but mischievous) monkeys. Lopburi hosts an annual Monkey Buffet Festival in November.",
        "duration": "6-7 hrs",
        "start": "07:30",
        "end": "15:00",
        "price": {
          "low": 3550,
          "shoulder": 3850,
          "peak": 4150
        },
        "priceLabel": {
          "low": "₹2,400–4,700",
          "shoulder": "₹2,600–5,100",
          "peak": "₹2,800–5,500"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned van",
          "Phra Prang Sam Yot (Monkey Temple) entry",
          "Phra Narai Ratchanivet Palace",
          "Wat Phra Si Mahathat",
          "San Phra Kan Shrine",
          "Monkey feeding experience",
          "Lunch at local restaurant",
          "Hotel pickup & drop-off",
          "Bottled water"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "Additional monkey food",
          "Souvenirs",
          "Dinner",
          "Accommodation in Lopburi",
          "Private guide upgrade (~2,500 THB)"
        ]
      }
    ]
  },
  "Phetchaburi": {
    "name": "Phetchaburi",
    "code": "PBI",
    "icon": "🏰",
    "theme": "Culture & Nature",
    "pop": "Rising",
    "x": 34,
    "y": 52,
    "gateway": "Bangkok",
    "km": 130,
    "hopHours": 2.7,
    "hopLabel": "2.7 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 5000,
    "hopCostLabel": "₹4,000–6,000",
    "hotels": {
      "3": {
        "names": [
          "Phetchaburi Hotel",
          "Royal Diamond Hotel",
          "Baan Pantai Resort",
          "Chom Klao Resort",
          "Phetkasem Hotel"
        ],
        "low": 1200,
        "high": 2200
      },
      "4": {
        "names": [
          "Hotel des Artists Khao Wang",
          "Phra Nakhon Khiri Hotel",
          "Phetchaburi Hotel",
          "Royal Diamond Hotel",
          "Baan Pantai Resort"
        ],
        "low": 2500,
        "high": 4500
      },
      "5": {
        "names": [
          "The Beach Palace Cha-Am",
          "Hotel des Artists Khao Wang",
          "Phra Nakhon Khiri Hotel",
          "Phetchaburi Hotel",
          "Royal Diamond Hotel"
        ],
        "low": 4000,
        "high": 7500
      }
    },
    "activities": [
      {
        "name": "Phra Nakhon Khiri Palace & Tham Khao Luang Cave Tour",
        "about": "Full-day tour to Phetchaburi, a historic royal city with a blend of Thai, Khmer, and European architecture. Take a cable car up to Phra Nakhon Khiri (Khao Wang) — the 'Palace on the Hill' built by King Rama IV with its mix of Thai, Chinese, and Western styles. Visit Tham Khao Luang, a stunning cave temple with Buddha images illuminated by natural light from above. Taste khanom mo kaeng, Phetchaburi's famous coconut custard dessert.",
        "duration": "6-8 hrs",
        "start": "07:30",
        "end": "15:30",
        "price": {
          "low": 4150,
          "shoulder": 4500,
          "peak": 4800
        },
        "priceLabel": {
          "low": "₹3,000–5,300",
          "shoulder": "₹3,200–5,800",
          "peak": "₹3,400–6,200"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned van",
          "Cable car to Phra Nakhon Khiri (Khao Wang) Palace",
          "Tham Khao Luang Cave temple",
          "Wat Mahathat Worawihan",
          "Khao Bandai It viewpoint",
          "Local sweets tasting (khanom mo kaeng)",
          "Lunch",
          "Hotel pickup & drop-off",
          "Bottled water"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "Additional sweets purchases",
          "Souvenirs",
          "Dinner",
          "Accommodation in Phetchaburi",
          "Private guide upgrade (~2,500 THB)"
        ]
      }
    ]
  },
  "Nan": {
    "name": "Nan",
    "code": "NAN",
    "icon": "🏔️",
    "theme": "Culture & Nature",
    "pop": "Hidden Gem",
    "x": 52,
    "y": 10,
    "gateway": "Chiang Mai",
    "km": 330,
    "hopHours": 6.3,
    "hopLabel": "6.3 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 6500,
    "hopCostLabel": "₹5,000–8,000",
    "hotels": {
      "3": {
        "names": [
          "Nan Garden Hotel",
          "Nan Valley Resort",
          "De River Boutique Resort",
          "Nan Noble House Garden Resort",
          "Nan Sabaidee Resort"
        ],
        "low": 1000,
        "high": 1800
      },
      "4": {
        "names": [
          "Nantrungjai Boutique Hotel",
          "Srinan Place Hotel",
          "Nan Garden Hotel",
          "Nan Valley Resort",
          "De River Boutique Resort"
        ],
        "low": 2000,
        "high": 3800
      },
      "5": {
        "names": [
          "Nan Boutique Hotel",
          "Nantrungjai Boutique Hotel",
          "Srinan Place Hotel",
          "Nan Garden Hotel",
          "Nan Valley Resort"
        ],
        "low": 3200,
        "high": 6000
      }
    },
    "activities": [
      {
        "name": "Nan Old Town Temples & Bo Kluea Salt Wells Tour",
        "about": "Full-day cultural tour to Nan, one of Thailand's most charming and least-visited provinces. Visit Wat Phumin with its famous 'Whispering' mural depicting 19th-century Lanna life, see the golden chedi of Wat Phra That Chae Haeng, explore the excellent Nan National Museum, visit the ancient salt wells at Bo Kluea where salt has been harvested for over 800 years, and enjoy panoramic views from Doi Phu Kha National Park. Nan is known for its distinctive Lanna-Tai Lue culture and stunning mountain scenery.",
        "duration": "10-12 hrs",
        "start": "06:00",
        "end": "18:00",
        "price": {
          "low": 5000,
          "shoulder": 5400,
          "peak": 5850
        },
        "priceLabel": {
          "low": "₹3,500–6,500",
          "shoulder": "₹3,800–7,000",
          "peak": "₹4,100–7,600"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned van",
          "Wat Phumin (famous 'Whispering' mural)",
          "Wat Phra That Chae Haeng",
          "Nan National Museum",
          "Bo Kluea ancient salt wells",
          "Doi Phu Kha National Park viewpoint",
          "Local snacks",
          "Lunch",
          "Hotel pickup & drop-off",
          "Bottled water"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "Salt purchases",
          "Additional snacks",
          "Dinner",
          "Accommodation in Nan",
          "Private guide upgrade (~3,000 THB)"
        ]
      }
    ]
  },
  "Phrae": {
    "name": "Phrae",
    "code": "PHR",
    "icon": "🪵",
    "theme": "Culture & History",
    "pop": "Hidden Gem",
    "x": 46,
    "y": 18,
    "gateway": "Chiang Mai",
    "km": 200,
    "hopHours": 4,
    "hopLabel": "4.0 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 5000,
    "hopCostLabel": "₹4,000–6,000",
    "hotels": {
      "3": {
        "names": [
          "Phrae Villa",
          "Phrae City Hotel",
          "Phuglong Hotel",
          "Maeyom Palace Hotel",
          "The Palm Garden Hotel"
        ],
        "low": 1000,
        "high": 1800
      },
      "4": {
        "names": [
          "Huern Na Na Boutique Hotel",
          "Phoom Thai Garden Hotel",
          "Phrae Villa",
          "Phrae City Hotel",
          "Phuglong Hotel"
        ],
        "low": 1800,
        "high": 3200
      },
      "5": {
        "names": [
          "Phrae Nakara Hotel",
          "Huern Na Na Boutique Hotel",
          "Phoom Thai Garden Hotel",
          "Phrae Villa",
          "Phrae City Hotel"
        ],
        "low": 2800,
        "high": 5200
      }
    },
    "activities": [
      {
        "name": "Phrae Teak Mansions & Traditional Lanna Village Tour",
        "about": "Full-day cultural tour to Phrae, a historic teak-trading town in northern Thailand. Visit Khum Chao Luang, a magnificent teak mansion built in 1892 for the last Lord of Phrae, see Wongburi House with its blend of European and Lanna architecture, visit the sacred Wat Phra That Cho Hae with its golden chedi, and explore Ban Thung Hong village famous for traditional indigo-dyeing (mo hom) and cotton weaving. Phrae is one of Thailand's best-preserved Lanna towns.",
        "duration": "6-8 hrs",
        "start": "07:30",
        "end": "16:00",
        "price": {
          "low": 3550,
          "shoulder": 3850,
          "peak": 4150
        },
        "priceLabel": {
          "low": "₹2,400–4,700",
          "shoulder": "₹2,600–5,100",
          "peak": "₹2,800–5,500"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned van",
          "Khum Chao Luang (teak mansion)",
          "Wongburi House",
          "Wat Phra That Cho Hae",
          "Ban Thung Hong (indigo-dyeing village)",
          "Local snacks",
          "Lunch at traditional restaurant",
          "Hotel pickup & drop-off",
          "Bottled water"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "Indigo fabric purchases",
          "Additional snacks",
          "Dinner",
          "Accommodation in Phrae",
          "Private guide upgrade (~2,500 THB)"
        ]
      }
    ]
  },
  "Lampang": {
    "name": "Lampang",
    "code": "LPG",
    "icon": "🚂",
    "theme": "Culture & History",
    "pop": "Rising",
    "x": 44,
    "y": 19,
    "gateway": "Chiang Mai",
    "km": 100,
    "hopHours": 2.1,
    "hopLabel": "2.1 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 4000,
    "hopCostLabel": "₹3,000–5,000",
    "hotels": {
      "3": {
        "names": [
          "B2 Lampang Premier Hotel",
          "Tipchang Lampang Hotel",
          "The Coconut Hotel",
          "Riverside Guesthouse",
          "B2 Lampang Boutique & Budget Hotel"
        ],
        "low": 1000,
        "high": 1800
      },
      "4": {
        "names": [
          "The Empress Premier Lampang",
          "Lampang Ratchada Hotel",
          "Lampang Wiengthong Hotel",
          "B2 Lampang Premier Hotel",
          "Tipchang Lampang Hotel"
        ],
        "low": 1800,
        "high": 3500
      },
      "5": {
        "names": [
          "Lampang River Lodge",
          "The Empress Premier Lampang",
          "Lampang Ratchada Hotel",
          "Lampang Wiengthong Hotel",
          "B2 Lampang Premier Hotel"
        ],
        "low": 3000,
        "high": 5500
      }
    },
    "activities": [
      {
        "name": "Lampang Horse Carriage, Ceramics & Wat Phra That Lampang Luang",
        "about": "Full-day cultural tour to Lampang, the only Thai city still using horse-drawn carriages as public transport. Take a charming horse carriage ride through the old town's teakwood houses and temples, visit Wat Phra That Lampang Luang — one of the best-preserved Lanna temples with its massive chedi and ancient murals, see the Dhanabadee Ceramic Museum to learn about Lampang's famous chicken-pattern ceramics, and visit Baan Sao Nak, a stunning teak house built on 116 pillars.",
        "duration": "6-8 hrs",
        "start": "07:30",
        "end": "16:00",
        "price": {
          "low": 3550,
          "shoulder": 3850,
          "peak": 4150
        },
        "priceLabel": {
          "low": "₹2,400–4,700",
          "shoulder": "₹2,600–5,100",
          "peak": "₹2,800–5,500"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned van",
          "Horse carriage ride through old town",
          "Wat Phra That Lampang Luang (ancient Lanna temple)",
          "Dhanabadee Ceramic Museum",
          "Baan Sao Nak (teak house on 116 pillars)",
          "Local snacks",
          "Lunch",
          "Hotel pickup & drop-off",
          "Bottled water"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "Ceramic purchases",
          "Additional snacks",
          "Dinner",
          "Accommodation in Lampang",
          "Private guide upgrade (~2,500 THB)"
        ]
      }
    ]
  },
  "Phetchabun": {
    "name": "Phetchabun",
    "code": "PCB",
    "icon": "☁️",
    "theme": "Nature & Adventure",
    "pop": "Rising",
    "x": 58,
    "y": 28,
    "gateway": "Bangkok",
    "km": 400,
    "hopHours": 7.6,
    "hopLabel": "7.6 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 7500,
    "hopCostLabel": "₹6,000–9,000",
    "hotels": {
      "3": {
        "names": [
          "Khao Kho Windmill Resort",
          "Imperial Phukaew Hill Resort",
          "Khao Kho Boutique Camp",
          "Khao Kho Sai Fah Resort",
          "The Iconic Peak Resort"
        ],
        "low": 1200,
        "high": 2200
      },
      "4": {
        "names": [
          "Khao Kho Heritage",
          "Khao Kho View Resort",
          "Khao Kho Windmill Resort",
          "Imperial Phukaew Hill Resort",
          "Khao Kho Boutique Camp"
        ],
        "low": 2200,
        "high": 4000
      },
      "5": {
        "names": [
          "The Bluesky Resort Khao Kho",
          "Khao Kho Heritage",
          "Khao Kho View Resort",
          "Khao Kho Windmill Resort",
          "Imperial Phukaew Hill Resort"
        ],
        "low": 3500,
        "high": 6500
      }
    },
    "activities": [
      {
        "name": "Khao Kho 'Thai Alps' Mountain & Sea of Clouds Tour",
        "about": "Full-day tour to Khao Kho, known as the 'Thai Alps' for its misty mountain scenery and cool climate. Drive up winding mountain roads to viewpoints above the sea of clouds, visit the Khao Kho Memorial with its collection of military weapons and vehicles, see the stunning Wat Phra That Pha Son Kaew with its colorful mosaic tiles and Buddha statues, and explore Phu Hin Rong Kla National Park — a former communist stronghold with dramatic cliff views. Best visited during the cool season (November-February) when the sea of clouds is most spectacular.",
        "duration": "10-12 hrs",
        "start": "04:00",
        "end": "18:00",
        "price": {
          "low": 6500,
          "shoulder": 7050,
          "peak": 7600
        },
        "priceLabel": {
          "low": "₹4,700–8,300",
          "shoulder": "₹5,100–9,000",
          "peak": "₹5,500–9,700"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned van",
          "Khao Kho mountain drive",
          "Sea of clouds viewpoint",
          "Khao Kho Memorial (weapons museum)",
          "Wat Phra That Pha Son Kaew (colorful temple)",
          "Phu Hin Rong Kla National Park",
          "Local snacks",
          "Lunch",
          "Hotel pickup & drop-off",
          "Bottled water"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "Additional snacks",
          "Warm clothing rental (it gets cold!)",
          "Dinner",
          "Accommodation in Khao Kho",
          "Private guide upgrade (~3,500 THB)"
        ]
      }
    ]
  },
  "Surin": {
    "name": "Surin",
    "code": "SRN",
    "icon": "🐘",
    "theme": "Culture & Nature",
    "pop": "Rising",
    "x": 74,
    "y": 40,
    "gateway": "Buriram",
    "km": 120,
    "hopHours": 2.5,
    "hopLabel": "2.5 hr",
    "hopMode": "🚐 Car / van",
    "hopCost": 4000,
    "hopCostLabel": "₹3,000–5,000",
    "hotels": {
      "3": {
        "names": [
          "B2 Surin Premier Hotel",
          "The Moon River Hotel",
          "Surin Majestic Hotel",
          "Surin Sunset Hotel",
          "The Grace Hotel Surin"
        ],
        "low": 800,
        "high": 1500
      },
      "4": {
        "names": [
          "Petchkasem Hotel Surin",
          "Martina Hotel Surin",
          "B2 Surin Premier Hotel",
          "The Moon River Hotel",
          "Surin Majestic Hotel"
        ],
        "low": 1500,
        "high": 2800
      },
      "5": {
        "names": [
          "Thong Tarin Hotel",
          "Petchkasem Hotel Surin",
          "Martina Hotel Surin",
          "B2 Surin Premier Hotel",
          "The Moon River Hotel"
        ],
        "low": 2500,
        "high": 4500
      }
    },
    "activities": [
      {
        "name": "Surin Elephant Village & Khmer Temple Tour",
        "about": "Full-day cultural tour to Surin, the 'Elephant Capital' of Thailand. Visit Ban Ta Klang Elephant Village where the Kuy people have lived with elephants for centuries, watch elephants bathe in the river and learn about their care, see the 12th-century Prasat Sikorapum Khmer temple with its unique blend of Hindu and Buddhist art, visit the Surin National Museum, and see traditional silk weaving at a local village. If visiting in November, witness the world-famous Surin Elephant Round-up festival.",
        "duration": "6-8 hrs",
        "start": "07:30",
        "end": "16:00",
        "price": {
          "low": 4150,
          "shoulder": 4500,
          "peak": 4800
        },
        "priceLabel": {
          "low": "₹3,000–5,300",
          "shoulder": "₹3,200–5,800",
          "peak": "₹3,400–6,200"
        },
        "inclusions": [
          "Join-in English-speaking tour escort",
          "Shared air-conditioned van",
          "Ban Ta Klang Elephant Village",
          "Elephant bathing experience",
          "Prasat Sikorapum (Khmer temple)",
          "Surin National Museum",
          "Local silk weaving village",
          "Lunch",
          "Hotel pickup & drop-off",
          "Bottled water"
        ],
        "exclusions": [
          "Tips for guide",
          "Personal expenses",
          "Elephant riding (not recommended)",
          "Silk purchases",
          "Additional snacks",
          "Dinner",
          "Accommodation in Surin",
          "Private guide upgrade (~2,500 THB)"
        ]
      }
    ]
  }
};

export const SATELLITES_BY_GATEWAY: Record<string, string[]> = (() => {
  const out: Record<string, string[]> = {};
  for (const gw of GATEWAY_ORDER) out[gw] = [];
  for (const c of Object.values(CITIES)) {
    if (c.gateway && out[c.gateway]) out[c.gateway].push(c.name);
  }
  for (const gw of GATEWAY_ORDER) {
    out[gw].sort((a, b) => (CITIES[a].km ?? 0) - (CITIES[b].km ?? 0));
  }
  return out;
})();
