/* Bali FIT dataset — generated from "Bali_excel_-_extended db.xlsx"
   (zuumm-frontend-live) joined with the scenario2 prototype's curated
   durations. Prices are INR, per person, flat across seasons (the Bali rate
   card carries no seasonal pricing yet — when it does, regenerate).
   Hotel rates are per room per night, double occupancy, from the prototype's
   rack rates. `travelHours` is the 2-way drive from the hub, `transferCost`
   the per-person 2-way SIC fare for activities without hotel pickup — both
   feed the 14h/day scheduling budget (dayBudgetHours). Generated file — do
   not hand-edit; regenerate with node scripts/bali-data/generate.mjs. */

import type { City } from "./thailand-data";

/** Airport hub first — the visit order used to sequence Bali routes. */
export const BALI_GATEWAY_ORDER: string[] = ["Kuta", "Ubud"];

export const BALI_CITIES: Record<string, City> = {
  "Kuta": {
    "name": "Kuta",
    "code": "DPS",
    "icon": "🏖️",
    "theme": "Beach & Nightlife",
    "pop": "Very Popular",
    "x": 40,
    "y": 76,
    "country": "Bali",
    "gatewayLabel": "International gateway · DPS (Denpasar) airport",
    "dayBudgetHours": 14,
    "landCrossing": {
      "mode": "🚐 Private car",
      "label": "🚐 Private car · ~1 hr 15 min",
      "cost": 1890
    },
    "hotels": {
      "3": {
        "names": [
          "Ramayana Suites & Resort",
          "Febri's Hotel & Spa",
          "Fourteen Roses Boutique Hotel",
          "Adi Dharma Hotel Kuta",
          "Kuta Beach Club Hotel"
        ],
        "low": 3200,
        "high": 3200
      },
      "4": {
        "names": [
          "Anathera Resort Kuta",
          "Bali Dynasty Resort Hotel",
          "Amnaya Resort Kuta",
          "Truntum Kuta",
          "Novotel Bali Ngurah Rai Airport"
        ],
        "low": 5800,
        "high": 5800
      },
      "5": {
        "names": [
          "The Anvaya Beach Resort Bali",
          "Discovery Kartika Plaza Hotel",
          "Kuta Paradiso Hotel",
          "ARYADUTA Bali",
          "Holiday Inn Express Baruna Bali"
        ],
        "low": 12500,
        "high": 12500
      }
    },
    "activities": [
      {
        "name": "Sunset Cocktails at Potato Head Beach Club",
        "about": "Bali's most iconic beach club — infinity pool, world-class DJs and spectacular sunsets.",
        "duration": "4 hrs",
        "start": "17:00",
        "end": "21:00",
        "price": {
          "low": 1080,
          "shoulder": 1080,
          "peak": 1080
        },
        "priceLabel": {
          "low": "₹1,080",
          "shoulder": "₹1,080",
          "peak": "₹1,080"
        },
        "inclusions": [
          "Beach club daybed or lounger reservation",
          "Pool and beach access",
          "Welcome drink",
          "Live DJ entertainment",
          "Sunset viewing access"
        ],
        "exclusions": [
          "Food and beverages (minimum spend applies)",
          "Bottle service",
          "Hotel pickup and drop-off",
          "Personal expenses",
          "Tips and gratuities"
        ],
        "travelHours": 0.5,
        "transferCost": 540
      },
      {
        "name": "Cocktails & Sunset at Rock Bar Ayana",
        "about": "A cliffside bar perched 14 meters above the Indian Ocean — voted one of the world's best bars.",
        "duration": "3 hrs",
        "start": "17:00",
        "end": "20:00",
        "price": {
          "low": 810,
          "shoulder": 810,
          "peak": 810
        },
        "priceLabel": {
          "low": "₹810",
          "shoulder": "₹810",
          "peak": "₹810"
        },
        "inclusions": [
          "Rock Bar entry reservation",
          "Sunset viewing seat (subject to availability)",
          "Complimentary welcome snack",
          "Live acoustic music"
        ],
        "exclusions": [
          "Food and beverages (minimum spend applies)",
          "Hotel pickup and drop-off",
          "Personal expenses",
          "Tips and gratuities",
          "Priority queue access (for non-resort guests)"
        ],
        "travelHours": 0.75,
        "transferCost": 1080
      },
      {
        "name": "GWK Cultural Park and Garuda Wisnu Kencana Statue",
        "about": "Marvel at the towering 121-meter Vishnu statue and enjoy traditional dance performances.",
        "duration": "3 hrs",
        "start": "09:00",
        "end": "12:00",
        "price": {
          "low": 810,
          "shoulder": 810,
          "peak": 810
        },
        "priceLabel": {
          "low": "₹810",
          "shoulder": "₹810",
          "peak": "₹810"
        },
        "inclusions": [
          "Entrance to GWK Cultural Park",
          "Access to ASANA Artseum",
          "Cultural performance viewing",
          "Insurance"
        ],
        "exclusions": [
          "Top of Statue Tour",
          "Barong Performance (separate ticket)",
          "Food and beverages",
          "Hotel pickup and drop-off",
          "Personal expenses"
        ],
        "travelHours": 1.25,
        "transferCost": 1080
      },
      {
        "name": "Beach Club & Surfing Lessons",
        "about": "Learn to ride Bali's famous waves with professional instructors at a trendy beach club.",
        "duration": "3 hrs",
        "start": "17:00",
        "end": "20:00",
        "price": {
          "low": 1890,
          "shoulder": 1890,
          "peak": 1890
        },
        "priceLabel": {
          "low": "₹1,890",
          "shoulder": "₹1,890",
          "peak": "₹1,890"
        },
        "inclusions": [
          "Surfboard rental",
          "Rashguard rental",
          "Certified surf instructor",
          "Basic insurance coverage",
          "Drinking water",
          "Beach facilities access"
        ],
        "exclusions": [
          "Hotel pickup and drop-off (if not selected)",
          "Photos and videos",
          "Tips and gratuities",
          "Personal expenses",
          "Meals and snacks"
        ],
        "travelHours": 0.75
      },
      {
        "name": "Jimbaran Seafood Beach Dinner",
        "about": "Freshly grilled seafood served at candlelit tables on the sand with ocean waves lapping nearby.",
        "duration": "3 hrs",
        "start": "17:00",
        "end": "20:00",
        "price": {
          "low": 2160,
          "shoulder": 2160,
          "peak": 2160
        },
        "priceLabel": {
          "low": "₹2,160",
          "shoulder": "₹2,160",
          "peak": "₹2,160"
        },
        "inclusions": [
          "Set seafood dinner package",
          "Beachfront table reservation",
          "Balinese side dishes and rice"
        ],
        "exclusions": [
          "Alcoholic beverages",
          "Hotel pickup and drop-off",
          "Tips and gratuities",
          "Personal expenses",
          "Additional menu items outside set package"
        ],
        "travelHours": 0.75,
        "transferCost": 810
      },
      {
        "name": "Nusa Dua Water Sports Adventure",
        "about": "An action-packed water sports package at Bali's premier beach resort area.",
        "duration": "3 hrs",
        "start": "09:00",
        "end": "12:00",
        "price": {
          "low": 1080,
          "shoulder": 1080,
          "peak": 1080
        },
        "priceLabel": {
          "low": "₹1,080",
          "shoulder": "₹1,080",
          "peak": "₹1,080"
        },
        "inclusions": [
          "Water sports activity (as selected)",
          "Safety equipment (life jacket, helmet)",
          "Professional instructor",
          "Insurance coverage",
          "Shower and changing facilities"
        ],
        "exclusions": [
          "Hotel pickup and drop-off (if not selected)",
          "Photos and videos",
          "Tips and gratuities",
          "Personal expenses",
          "Additional water sports activities"
        ],
        "travelHours": 1.25
      },
      {
        "name": "East & West Highlights Full-Day Tour in Nusa Penida",
        "about": "See the best of Nusa Penida in one day — Kelingking Beach, Broken Beach, Angel's Billabong and Crystal Bay.",
        "duration": "10 hrs",
        "start": "09:00",
        "end": "20:00",
        "price": {
          "low": 11315,
          "shoulder": 11315,
          "peak": 11315
        },
        "priceLabel": {
          "low": "₹11,315",
          "shoulder": "₹11,315",
          "peak": "₹11,315"
        },
        "inclusions": [
          "Hotel pickup and drop-off (depending on option selected)",
          "Round trip public ferry ticket to Nusa Penida (if option selected)",
          "Entrance fees included (except for photos fees at the treehouse).",
          "Transportation by air-conditioned van",
          "Mineral water",
          "Local host",
          "Drone footage (if add-on selected)",
          "Polaroid camera, 10 photographs (if add-on selected)",
          "1-hour traditional massage (if add-on selected)",
          "Professional photographer (if add-on selected)",
          "Tour in German (if add-on selected)",
          "Tour in Korean (if add-on selected)",
          "Tour in Japanese (if add-on selected)"
        ],
        "exclusions": [
          "Food and drinks (except water)"
        ],
        "travelHours": 2.25
      },
      {
        "name": "Nusa Penida: East & West Highlights Full-Day Tour",
        "about": "Comprehensive island tour covering all major viewpoints and beaches on both coasts.",
        "duration": "10 hrs",
        "start": "09:00",
        "end": "20:00",
        "price": {
          "low": 2941,
          "shoulder": 2941,
          "peak": 2941
        },
        "priceLabel": {
          "low": "₹2,941",
          "shoulder": "₹2,941",
          "peak": "₹2,941"
        },
        "inclusions": [
          "Hotel pickup and drop-off (depending on option selected)",
          "Round trip public ferry ticket to Nusa Penida (if option selected)",
          "Entrance fees included (except for photos fees at the treehouse).",
          "Transportation by air-conditioned van",
          "Mineral water",
          "Local host",
          "Drone footage (if add-on selected)",
          "Polaroid camera, 10 photographs (if add-on selected)",
          "1-hour traditional massage (if add-on selected)",
          "Professional photographer (if add-on selected)",
          "Tour in German (if add-on selected)",
          "Tour in Korean (if add-on selected)",
          "Tour in Japanese (if add-on selected)"
        ],
        "exclusions": [
          "Food and drinks (except water)"
        ],
        "travelHours": 2.25
      },
      {
        "name": "Live Music & Drinks at La Favela Seminyak",
        "about": "A whimsical jungle-themed bar with vintage decor, live bands and an enchanting garden.",
        "duration": "4 hrs",
        "start": "17:00",
        "end": "21:00",
        "price": {
          "low": 810,
          "shoulder": 810,
          "peak": 810
        },
        "priceLabel": {
          "low": "₹810",
          "shoulder": "₹810",
          "peak": "₹810"
        },
        "inclusions": [
          "Venue entry reservation",
          "Live music access",
          "Garden and indoor seating",
          "Dance floor access"
        ],
        "exclusions": [
          "Food and beverages",
          "Bottle service",
          "VIP table reservation",
          "Hotel pickup and drop-off",
          "Personal expenses",
          "Tips and gratuities"
        ],
        "travelHours": 0.5,
        "transferCost": 540
      },
      {
        "name": "Uluwatu Kecak and Fire Dance Show Entry Ticket",
        "about": "Witness the hypnotic chanting and fire performance based on the Ramayana epic.",
        "duration": "2 hrs",
        "start": "17:00",
        "end": "19:00",
        "price": {
          "low": 893,
          "shoulder": 893,
          "peak": 893
        },
        "priceLabel": {
          "low": "₹893",
          "shoulder": "₹893",
          "peak": "₹893"
        },
        "inclusions": [
          "Show entry ticket",
          "Raincoat (if raining)"
        ],
        "exclusions": [
          "Hotel pickup and drop-off",
          "Uluwatu Temple entry ticket (adults: IDR 50,000/children: IDR 30,000)"
        ],
        "travelHours": 1.5,
        "transferCost": 1080
      },
      {
        "name": "Nusa Penida Private Snorkeling Tour with Lunch",
        "about": "Your own private boat to the best snorkeling spots around Nusa Penida with a delicious lunch.",
        "duration": "8 hrs",
        "start": "09:00",
        "end": "18:00",
        "price": {
          "low": 9234,
          "shoulder": 9234,
          "peak": 9234
        },
        "priceLabel": {
          "low": "₹9,234",
          "shoulder": "₹9,234",
          "peak": "₹9,234"
        },
        "inclusions": [
          "Roundtrip cruise to Nusa Penida",
          "Private fast boat transportation",
          "Guide",
          "Snorkeling gear",
          "Towels",
          "Underwater photos and videos with GoPro",
          "Lunch",
          "Drinking water"
        ],
        "exclusions": [
          "Breakfast"
        ],
        "travelHours": 2.25
      },
      {
        "name": "Beachfront Day Club Party at Savaya Uluwatu",
        "about": "Ultra-luxury day club built into a cliff with infinity pool and international DJ residencies.",
        "duration": "5 hrs",
        "start": "17:00",
        "end": "22:00",
        "price": {
          "low": 1620,
          "shoulder": 1620,
          "peak": 1620
        },
        "priceLabel": {
          "low": "₹1,620",
          "shoulder": "₹1,620",
          "peak": "₹1,620"
        },
        "inclusions": [
          "Day club entry",
          "Pool and beach club access",
          "Sunset viewing deck",
          "Live DJ entertainment",
          "Complimentary welcome drink"
        ],
        "exclusions": [
          "Food and beverages (minimum spend applies)",
          "Bottle service",
          "VIP cabana rental",
          "Hotel pickup and drop-off",
          "Personal expenses",
          "Tips and gratuities"
        ],
        "travelHours": 1,
        "transferCost": 1080
      },
      {
        "name": "Night Out at Sky Garden Rooftop Club",
        "about": "Multi-level rooftop nightclub in the heart of Kuta with international DJs and laser shows.",
        "duration": "4 hrs",
        "start": "17:00",
        "end": "21:00",
        "price": {
          "low": 540,
          "shoulder": 540,
          "peak": 540
        },
        "priceLabel": {
          "low": "₹540",
          "shoulder": "₹540",
          "peak": "₹540"
        },
        "inclusions": [
          "Club entry ticket",
          "Rooftop access",
          "Live DJ performances",
          "Dance floor access",
          "Basic insurance"
        ],
        "exclusions": [
          "Food and beverages (except buffet nights)",
          "VIP table reservation",
          "Bottle service",
          "Hotel pickup and drop-off",
          "Personal expenses",
          "Tips and gratuities"
        ],
        "travelHours": 0.25,
        "transferCost": 270
      },
      {
        "name": "Kecak Fire Dance Show & Uluwatu Temple Entry",
        "about": "All-inclusive evening tour to Uluwatu Temple with the famous Kecak fire dance at sunset.",
        "duration": "2 hrs",
        "start": "17:00",
        "end": "19:00",
        "price": {
          "low": 824,
          "shoulder": 824,
          "peak": 824
        },
        "priceLabel": {
          "low": "₹824",
          "shoulder": "₹824",
          "peak": "₹824"
        },
        "inclusions": [
          "Transfers (if option selected)",
          "Uluwatu entry ticket (if option selected)",
          "Kecak performance"
        ],
        "exclusions": [
          "Guide tips"
        ],
        "travelHours": 1.5
      },
      {
        "name": "Manta Point Snorkeling & West Coast Tour",
        "about": "Swim alongside majestic manta rays and explore vibrant coral reefs off Nusa Penida's west coast.",
        "duration": "8 hrs",
        "start": "09:00",
        "end": "18:00",
        "price": {
          "low": 8639,
          "shoulder": 8639,
          "peak": 8639
        },
        "priceLabel": {
          "low": "₹8,639",
          "shoulder": "₹8,639",
          "peak": "₹8,639"
        },
        "inclusions": [
          "Hotel pickup and drop-off",
          "Private car vehicle (if island tour option selected)",
          "Private guide (for island tour)",
          "Mineral water",
          "Private professional photographer (if add-on selected)",
          "Drone package (if add-on selected)",
          "Snorkeling boat, snorkeling guide, snorkel, mask, life jacket, fins, GoPro camera, towel, shower",
          "Taxes and fees",
          "Insurance Covered"
        ],
        "exclusions": [
          "Food and drinks",
          "Gratuities"
        ],
        "travelHours": 2.25
      },
      {
        "name": "Waterbom Bali Entry Ticket",
        "about": "Asia's #1 water park featuring world-class slides and lazy rivers in the heart of Kuta.",
        "duration": "4 hrs",
        "start": "09:00",
        "end": "13:00",
        "price": {
          "low": 1806,
          "shoulder": 1806,
          "peak": 1806
        },
        "priceLabel": {
          "low": "₹1,806",
          "shoulder": "₹1,806",
          "peak": "₹1,806"
        },
        "inclusions": [
          "Shower room",
          "Access to the entire park and all slides from 9:00 AM - 6:00 PM"
        ],
        "exclusions": [
          "Gazebo rental",
          "Towel and locker",
          "Euro-Bungy and Flowrider",
          "Food and beverages",
          "Digi photos",
          "Spa facilities"
        ],
        "travelHours": 0.25,
        "transferCost": 430
      },
      {
        "name": "Snorkeling 3 Spots with GoPro & West Penida Tour",
        "about": "Visit three premier snorkeling sites with professional gear and underwater photography included.",
        "duration": "8 hrs",
        "start": "09:00",
        "end": "18:00",
        "price": {
          "low": 2858,
          "shoulder": 2858,
          "peak": 2858
        },
        "priceLabel": {
          "low": "₹2,858",
          "shoulder": "₹2,858",
          "peak": "₹2,858"
        },
        "inclusions": [
          "Shared Hotel pickup and drop-off (depend on the option selected)",
          "Round trip speedboat transfer",
          "Shared Car vehicle for Land Tour",
          "Guide for Land Tour",
          "Mineral water",
          "Private professional photographer (if add-on selected)",
          "Drone package (if add-on selected)",
          "Snorkeling boat, snorkel, mask, life jacket, fins, GoPro camera, towel, shower",
          "Taxes and fees",
          "Retribution ticket",
          "Insurance Covered"
        ],
        "exclusions": [
          "Personal expenses",
          "Gratuities"
        ],
        "travelHours": 2.25
      },
      {
        "name": "Day Trip to East Nusa Penida, Atuh & Diamond Beach",
        "about": "Explore the dramatic cliff formations and pristine beaches of East Nusa Penida with a local guide.",
        "duration": "10 hrs",
        "start": "09:00",
        "end": "20:00",
        "price": {
          "low": 14713,
          "shoulder": 14713,
          "peak": 14713
        },
        "priceLabel": {
          "low": "₹14,713",
          "shoulder": "₹14,713",
          "peak": "₹14,713"
        },
        "inclusions": [
          "Entrance fees",
          "Round-trip ferry tickets",
          "Hotel pickup and drop off",
          "English-speaking tour guide",
          "Air-conditioned vehicle",
          "Drinking water",
          "Insurance"
        ],
        "exclusions": [
          "Food and additional drinks"
        ],
        "travelHours": 2.25
      },
      {
        "name": "Melasti Beach Kecak Dance Show Tickets",
        "about": "An intimate cultural performance on the pristine white sands of Melasti Beach.",
        "duration": "2 hrs",
        "start": "17:00",
        "end": "19:00",
        "price": {
          "low": 824,
          "shoulder": 824,
          "peak": 824
        },
        "priceLabel": {
          "low": "₹824",
          "shoulder": "₹824",
          "peak": "₹824"
        },
        "inclusions": [
          "Entry Ticket"
        ],
        "exclusions": [
          "Admission to Melasti Beach"
        ],
        "travelHours": 1.5,
        "transferCost": 1080
      },
      {
        "name": "Mud ATV Quad Bike Adventure in Uluwatu",
        "about": "Tackle muddy jungle tracks and steep terrain on a thrilling ATV expedition through Uluwatu's backcountry.",
        "duration": "2.5 hrs",
        "start": "09:00",
        "end": "12:00",
        "price": {
          "low": 8575,
          "shoulder": 8575,
          "peak": 8575
        },
        "priceLabel": {
          "low": "₹8,575",
          "shoulder": "₹8,575",
          "peak": "₹8,575"
        },
        "inclusions": [
          "Professional guide",
          "Lunch & Coconut Water",
          "All necessary equipment",
          "All necessary safety materials",
          "Insurance provided by the operator",
          "1 ATV per person for Single Option and 1 ATV for 2 person for Tandem Option",
          "Locker and shower room facilities",
          "Safety orientation",
          "Approximately 1-1.5 hour ATV ride"
        ],
        "exclusions": [
          "Hotel pickup and drop-off",
          "Other personal expenses",
          "Tips and gratuities",
          "Add-on: Swing (swing is located in the same location with the ATV)"
        ],
        "travelHours": 1.5
      },
      {
        "name": "Kecak Fire Dance Entry Ticket and Uluwatu Temple",
        "about": "Watch the dramatic Kecak fire dance at sunset with the Indian Ocean as your backdrop.",
        "duration": "2 hrs",
        "start": "17:00",
        "end": "19:00",
        "price": {
          "low": 824,
          "shoulder": 824,
          "peak": 824
        },
        "priceLabel": {
          "low": "₹824",
          "shoulder": "₹824",
          "peak": "₹824"
        },
        "inclusions": [
          "Kecak Dance performance ticket",
          "Uluwatu Temple Entrance Ticket (if tour option selected)",
          "Driver / Guide (if option selected)"
        ],
        "exclusions": [
          "Uluwatu Temple Entrance Ticket (If you choose Kecak Dance Ticket Only, you need to exchange it inside the temple, so it is still necessary to buy a temple ticket, or you can choose the temple tour which includes this ticket)",
          "Personal expenses",
          "Transport (if option selected)"
        ],
        "travelHours": 1.5
      },
      {
        "name": "Taman Beji Griya Waterfall: Holy Bathing/Soul Retreat Ritual",
        "about": "Participate in an authentic Balinese water blessing ceremony at a sacred waterfall temple.",
        "duration": "5 hrs",
        "start": "09:00",
        "end": "14:00",
        "price": {
          "low": 2647,
          "shoulder": 2647,
          "peak": 2647
        },
        "priceLabel": {
          "low": "₹2,647",
          "shoulder": "₹2,647",
          "peak": "₹2,647"
        },
        "inclusions": [
          "Round hotel transfer (if option selected)",
          "Melukat ritual at Taman Beji Griya Waterfall",
          "Spiritual guide for the ceremony",
          "Holy water for purification",
          "Prayer equipment and offerings",
          "Admission fees",
          "Sarong for deep purification (included)",
          "Private locker with key",
          "Towel",
          "Jamu / herbal drink",
          "Parking fees",
          "Polaroid (if add-ons selected)",
          "Photographer (if add-ons selected)"
        ],
        "exclusions": [
          "Personal expenses"
        ],
        "travelHours": 3
      },
      {
        "name": "Tanah Lot-Nung Nung Waterfall-Jatiluwih and Bedugul",
        "about": "A curated full-day tour covering sea temples, towering waterfalls and UNESCO-recognized rice terraces.",
        "duration": "10 hrs",
        "start": "09:00",
        "end": "20:00",
        "price": {
          "low": 7525,
          "shoulder": 7525,
          "peak": 7525
        },
        "priceLabel": {
          "low": "₹7,525",
          "shoulder": "₹7,525",
          "peak": "₹7,525"
        },
        "inclusions": [
          "Hotel pick up and drop off",
          "Transport in a private airâ€“conditioned vehicle",
          "Englishâ€“speaking guide",
          "Private and exclusive tour"
        ],
        "exclusions": [
          "Lunch",
          "Entrance Ticket (Please bring cash money becuase the ticket not included)"
        ],
        "travelHours": 3.5
      },
      {
        "name": "3 Fun Dives to Manta Point, Mola & Reef",
        "about": "Certified divers explore Manta Point, search for rare Mola-Mola sunfish and vibrant reef ecosystems.",
        "duration": "8 hrs",
        "start": "09:00",
        "end": "18:00",
        "price": {
          "low": 15225,
          "shoulder": 15225,
          "peak": 15225
        },
        "priceLabel": {
          "low": "₹15,225",
          "shoulder": "₹15,225",
          "peak": "₹15,225"
        },
        "inclusions": [
          "3 guided fun dives at Nusa Penida",
          "Certified dive guide (PADI or equivalent)",
          "Tanks, weights, and belt",
          "Hotel pickup and drop-off (Sanur, Kuta, Seminyak, Jimbaran, Additional charge outside these areas.",
          "Option to meet at the dive center in Sanur",
          "Shared boat transfer to/from Nusa Penida",
          "Bottled water and light snacks onboard",
          "Snack on Boat",
          "Marine park and site entry fees"
        ],
        "exclusions": [
          "Dive insurance (recommended, book separately)",
          "Personal expenses and gratuities",
          "Dive certification (for non-certified divers)",
          "Optional equipment: IDR 400,000 / person for a full set: BCD, regulator, wetsuit, fins/boots, mask/snorkel & dive computer."
        ],
        "travelHours": 2.25
      },
      {
        "name": "From Bali: 1-Way Speedboat Transfer to Gili Trawangan",
        "about": "Direct speedboat service from Padang Bai to the car-free paradise of Gili Trawangan.",
        "duration": "4 hrs",
        "start": "09:00",
        "end": "13:00",
        "price": {
          "low": 2363,
          "shoulder": 2363,
          "peak": 2363
        },
        "priceLabel": {
          "low": "₹2,363",
          "shoulder": "₹2,363",
          "peak": "₹2,363"
        },
        "inclusions": [
          "1-way speedboat transfer",
          "88 lb (40 kg) per person baggage allowance",
          "Insurance"
        ],
        "exclusions": [
          "Padangbai Harbor Fees IDR 10k/person (paid on site)",
          "Gili Islands Entry Ticket IDR 20k/person (paid on site)",
          "Gili Islands Harbor Fees IDR 20k/person (paid on site)",
          "Hotel pickup (optional)"
        ],
        "travelHours": 3.25,
        "transferCost": 2430
      },
      {
        "name": "Speedboat Transfer to Lembongan",
        "about": "Fast and comfortable speedboat transfer from Sanur to the idyllic island of Nusa Lembongan.",
        "duration": "2 hrs",
        "start": "09:00",
        "end": "11:00",
        "price": {
          "low": 1332,
          "shoulder": 1332,
          "peak": 1332
        },
        "priceLabel": {
          "low": "₹1,332",
          "shoulder": "₹1,332",
          "peak": "₹1,332"
        },
        "inclusions": [
          "Porter assistance",
          "1-way or round-trip fast boat ticket (depending on option selected)",
          "Room for 2 pieces of luggage",
          "Safety equipment",
          "Insurance"
        ],
        "exclusions": [
          "Personal expenses",
          "Tips"
        ],
        "travelHours": 1.75
      },
      {
        "name": "FASTFERRY: Nusa Penida- Sanur,- Padang Bai,- Kusamba- Gili",
        "about": "Flexible island-hopping ferry pass connecting Bali, Nusa Penida and the Gili Islands.",
        "duration": "3 hrs",
        "start": "09:00",
        "end": "12:00",
        "price": {
          "low": 962,
          "shoulder": 962,
          "peak": 962
        },
        "priceLabel": {
          "low": "₹962",
          "shoulder": "₹962",
          "peak": "₹962"
        },
        "inclusions": [
          "Boarding tax entrance",
          "assurance"
        ],
        "exclusions": [
          "Food and drinks",
          "Retribution cash at each port"
        ],
        "travelHours": 5.5,
        "transferCost": 3240
      }
    ]
  },
  "Ubud": {
    "name": "Ubud",
    "code": "DPS",
    "icon": "🌾",
    "theme": "Culture & Nature",
    "pop": "Very Popular",
    "x": 56,
    "y": 44,
    "country": "Bali",
    "dayBudgetHours": 14,
    "landCrossing": {
      "mode": "🚐 Private car",
      "label": "🚐 Private car · ~1 hr 15 min",
      "cost": 1890
    },
    "hotels": {
      "3": {
        "names": [
          "Bambu Indah Resort",
          "Tegal Sari Accommodation",
          "Hotel Tjampuhan & Spa",
          "The Artini Dijiwa Ubud",
          "Junjungan Ubud Hotel & Spa"
        ],
        "low": 3200,
        "high": 3200
      },
      "4": {
        "names": [
          "Ubud Village Hotel",
          "The Udaya Resorts & Spa",
          "Dwaraka The Royal Villas",
          "Adiwana Resort Jembawan",
          "Komaneka at Rasa Sayang"
        ],
        "low": 5800,
        "high": 5800
      },
      "5": {
        "names": [
          "Maya Ubud Resort & Spa",
          "Adiwana Resort Jembawan",
          "Arkamara Dijiwa Ubud",
          "Alaya Resort Ubud",
          "Visesa Ubud Resort"
        ],
        "low": 12500,
        "high": 12500
      }
    },
    "activities": [
      {
        "name": "Sacred Monkey Forest Sanctuary in Ubud",
        "about": "Wander through a lush jungle sanctuary home to hundreds of playful long-tailed macaques.",
        "duration": "2 hrs",
        "start": "09:00",
        "end": "11:00",
        "price": {
          "low": 702,
          "shoulder": 702,
          "peak": 702
        },
        "priceLabel": {
          "low": "₹702",
          "shoulder": "₹702",
          "peak": "₹702"
        },
        "inclusions": [
          "Entrance ticket to Sacred Monkey Forest Sanctuary",
          "Insurance coverage",
          "Sarong rental (if needed)"
        ],
        "exclusions": [
          "Hotel pickup and drop-off",
          "Food and beverages",
          "Personal expenses",
          "Guide services"
        ],
        "travelHours": 0.25,
        "transferCost": 430
      },
      {
        "name": "Holy Water Purification at Tirta Empul Temple",
        "about": "Experience a traditional Balinese purification ritual in the sacred spring water pools.",
        "duration": "2 hrs",
        "start": "09:00",
        "end": "11:00",
        "price": {
          "low": 405,
          "shoulder": 405,
          "peak": 405
        },
        "priceLabel": {
          "low": "₹405",
          "shoulder": "₹405",
          "peak": "₹405"
        },
        "inclusions": [
          "Entrance ticket to Tirta Empul Temple",
          "Sarong and sash rental",
          "Access to temple grounds and purification pools"
        ],
        "exclusions": [
          "Melukat ceremony fee",
          "Guide services",
          "Hotel pickup and drop-off",
          "Personal expenses",
          "Locker rental"
        ],
        "travelHours": 1,
        "transferCost": 1080
      },
      {
        "name": "Tegalalang Rice Terrace Scenic Walk",
        "about": "Stroll through the iconic layered rice terraces and capture postcard-perfect photographs.",
        "duration": "2 hrs",
        "start": "09:00",
        "end": "11:00",
        "price": {
          "low": 135,
          "shoulder": 135,
          "peak": 135
        },
        "priceLabel": {
          "low": "₹135",
          "shoulder": "₹135",
          "peak": "₹135"
        },
        "inclusions": [
          "Entrance to Tegalalang Rice Terrace walking paths",
          "Access to main viewpoint and valley trails"
        ],
        "exclusions": [
          "Bali swing rides",
          "Photo spot fees",
          "Parking fees",
          "Hotel pickup and drop-off",
          "Guide services"
        ],
        "travelHours": 0.75,
        "transferCost": 810
      },
      {
        "name": "Bali Safari & Marine Park Entrance Ticket",
        "about": "An African-style safari experience with over 100 species, aquarium and live animal shows.",
        "duration": "5 hrs",
        "start": "09:00",
        "end": "14:00",
        "price": {
          "low": 864,
          "shoulder": 864,
          "peak": 864
        },
        "priceLabel": {
          "low": "₹864",
          "shoulder": "₹864",
          "peak": "₹864"
        },
        "inclusions": [
          "Park entrance ticket",
          "Safari Journey (1x)",
          "Animal education presentations",
          "Marine shows",
          "Insurance"
        ],
        "exclusions": [
          "Animal feeding experiences",
          "Night safari",
          "Lunch (unless package selected)",
          "Hotel pickup and drop-off",
          "Personal expenses",
          "Professional photography"
        ],
        "travelHours": 1.25,
        "transferCost": 1080
      },
      {
        "name": "Sunrise Mount Batur Hike with Breakfast",
        "about": "The most popular trek in Bali with experienced guides, trekking poles and a well-deserved breakfast.",
        "duration": "6 hrs",
        "start": "04:00",
        "end": "11:00",
        "price": {
          "low": 2285,
          "shoulder": 2285,
          "peak": 2285
        },
        "priceLabel": {
          "low": "₹2,285",
          "shoulder": "₹2,285",
          "peak": "₹2,285"
        },
        "inclusions": [
          "Hotel pickup and drop-off (if option selected)",
          "Exclusive use of Mt. Batur Lounge",
          "Modern toilets at the lounge",
          "Access to shower facilities (limited availability)",
          "Trek",
          "Expert trekking guide",
          "Breakfast",
          "Beverage (tea, coffee, mineral water)",
          "Flashlight",
          "Trekking pole",
          "Kintamani Ticket (with transfer options selected)",
          "Insurance"
        ],
        "exclusions": [
          "Personal expenses",
          "Tips"
        ],
        "travelHours": 2
      },
      {
        "name": "Ubud Gorilla Face ATV and Ayung Rafting Trip",
        "about": "Two iconic Ubud adventures in one day — jungle ATV followed by white water rafting.",
        "duration": "5 hrs",
        "start": "09:00",
        "end": "14:00",
        "price": {
          "low": 1924,
          "shoulder": 1924,
          "peak": 1924
        },
        "priceLabel": {
          "low": "₹1,924",
          "shoulder": "₹1,924",
          "peak": "₹1,924"
        },
        "inclusions": [
          "Guide",
          "Solo or Tandem 1.5-hour ATV tour (if option selected)",
          "2.5-hour rafting tour",
          "Safety equipment",
          "Shower and changing room access",
          "Lockers",
          "Towels",
          "Bottled water",
          "Lunch (fried rice or fried noodles)"
        ],
        "exclusions": [
          "Tips",
          "Photos and videos"
        ],
        "travelHours": 0.75
      },
      {
        "name": "Mount Batur Sunrise Trek With Guide and Breakfast",
        "about": "A classic Bali experience — trek to the summit in time for sunrise with a light breakfast served at the top.",
        "duration": "6 hrs",
        "start": "04:00",
        "end": "11:00",
        "price": {
          "low": 2285,
          "shoulder": 2285,
          "peak": 2285
        },
        "priceLabel": {
          "low": "₹2,285",
          "shoulder": "₹2,285",
          "peak": "₹2,285"
        },
        "inclusions": [
          "Hotel transfer (depending on options)",
          "English speaking driver",
          "English-speaking trekking guide",
          "Breakfast",
          "Coffee/tea at the starting point and in the lounge",
          "Bottled water",
          "Headlamp and trekking pole",
          "Access to Mt. Batur Lounge",
          "Modern toilets in the lounge",
          "Shower facilities (limited availability)",
          "Kintamani ticket (if transfer option selected)",
          "Insurance"
        ],
        "exclusions": [
          "Lunch"
        ],
        "travelHours": 2
      },
      {
        "name": "Private Sunrise Jeep Tour & Hot Spring in Mount Batur",
        "about": "Witness the magical sunrise from Mount Batur in a 4x4 jeep, followed by a relaxing dip in natural hot springs.",
        "duration": "6 hrs",
        "start": "04:00",
        "end": "11:00",
        "price": {
          "low": 8874,
          "shoulder": 8874,
          "peak": 8874
        },
        "priceLabel": {
          "low": "₹8,874",
          "shoulder": "₹8,874",
          "peak": "₹8,874"
        },
        "inclusions": [
          "Hotel pickup and drop-off (depending on option)",
          "Private tour guide/driver",
          "Brunch",
          "Mineral water",
          "Kintamani entrance fees (depending on option)",
          "Transportation by 4WD jeep",
          "Access to Mt. Batur Lounge",
          "Modern toilets at the lounge",
          "Hot drinks at Mt. Batur Lounge",
          "Shower facilities (limited availability)"
        ],
        "exclusions": [
          "Souvenirs",
          "Personal expenses"
        ],
        "travelHours": 2
      },
      {
        "name": "Ayung River Guided Rafting Adventure with Lunch",
        "about": "Paddle through Class II-III rapids surrounded by rainforest and cascading waterfalls.",
        "duration": "3 hrs",
        "start": "09:00",
        "end": "12:00",
        "price": {
          "low": 2235,
          "shoulder": 2235,
          "peak": 2235
        },
        "priceLabel": {
          "low": "₹2,235",
          "shoulder": "₹2,235",
          "peak": "₹2,235"
        },
        "inclusions": [
          "Pickup and transfer service (if option chosen)",
          "Service charge and government tax",
          "Drinking water",
          "Rafting equipment",
          "Professional rafting guide",
          "Shower facilities and fresh towels",
          "Changing rooms and restroom",
          "Indonesian buffet-style lunch",
          "Insurance coverage"
        ],
        "exclusions": [
          "Personal expenses"
        ],
        "travelHours": 0.75
      },
      {
        "name": "ATV Quad Bike & White Water Rafting Adventure",
        "about": "The ultimate adrenaline combo — conquer jungle trails on an ATV then tackle the Ayung River rapids.",
        "duration": "5 hrs",
        "start": "09:00",
        "end": "14:00",
        "price": {
          "low": 1594,
          "shoulder": 1594,
          "peak": 1594
        },
        "priceLabel": {
          "low": "₹1,594",
          "shoulder": "₹1,594",
          "peak": "₹1,594"
        },
        "inclusions": [
          "Hotel pickup and drop-off (If option selected)",
          "Guide",
          "Solo or Tandem ATV tour (if option selected)",
          "2.5-hour rafting tour",
          "Safety equipment",
          "Shower and changing room access",
          "Lockers",
          "Towels",
          "Bottled water",
          "Lunch (fried rice or fried noodles)",
          "Insurance"
        ],
        "exclusions": [
          "Tips",
          "Photos and videos"
        ],
        "travelHours": 0.75
      },
      {
        "name": "Gorilla Face ATV Quad Bike Adventure with Lunch in Ubud",
        "about": "Ride through jungle trails, rice paddies and river crossings on a powerful quad bike. Includes a traditional Balinese lunch.",
        "duration": "3 hrs",
        "start": "09:00",
        "end": "12:00",
        "price": {
          "low": 10312,
          "shoulder": 10312,
          "peak": 10312
        },
        "priceLabel": {
          "low": "₹10,312",
          "shoulder": "₹10,312",
          "peak": "₹10,312"
        },
        "inclusions": [
          "Hotel pickup and drop-off (if option selected)",
          "Professional Certified Guide",
          "Single or Tandem ATV ride",
          "Safety gear( Helmet, Boots, Elbow gear, Knee gear )",
          "Towel",
          "Bottled water",
          "Lunch ( Fried rice or Fried Noodles",
          "Shower room",
          "Changing room",
          "Locker",
          "Insurance"
        ],
        "exclusions": [
          "Tips",
          "Photography/videography",
          "Personal expenses"
        ],
        "travelHours": 0.75
      },
      {
        "name": "Mount Batur Hiking With Hotspring",
        "about": "Climb an active volcano for sunrise and soothe your muscles in natural hot springs afterwards.",
        "duration": "6 hrs",
        "start": "09:00",
        "end": "16:00",
        "price": {
          "low": 2167,
          "shoulder": 2167,
          "peak": 2167
        },
        "priceLabel": {
          "low": "₹2,167",
          "shoulder": "₹2,167",
          "peak": "₹2,167"
        },
        "inclusions": [
          "Hotel Transfer (if options selected)",
          "Kintamani ticket (if including transfer)",
          "Hot drink and snack at starting point",
          "Trekking equipment",
          "Trekking guide",
          "Light breakfast on top",
          "Hot spring ticket",
          "Insurance"
        ],
        "exclusions": [
          "Guide Tips",
          "Souvenir"
        ],
        "travelHours": 2
      },
      {
        "name": "Ubud: Quad ATV Waterfalls & Barong Caves",
        "about": "Navigate through jungle, waterfalls and ancient cave systems on a quad bike adventure.",
        "duration": "3 hrs",
        "start": "09:00",
        "end": "12:00",
        "price": {
          "low": 4434,
          "shoulder": 4434,
          "peak": 4434
        },
        "priceLabel": {
          "low": "₹4,434",
          "shoulder": "₹4,434",
          "peak": "₹4,434"
        },
        "inclusions": [
          "1-hour Ride ( depending your skill )",
          "Lunch",
          "Insurance",
          "Equipment ( Boots & helm )",
          "Lockers",
          "Shower Room"
        ],
        "exclusions": [
          "Hotel pickup & drop-off"
        ],
        "travelHours": 0.75
      },
      {
        "name": "Bali Zoo Entrance Ticket",
        "about": "Get up close with exotic animals, enjoy the water playground and interactive feeding sessions.",
        "duration": "3 hrs",
        "start": "09:00",
        "end": "12:00",
        "price": {
          "low": 4320,
          "shoulder": 4320,
          "peak": 4320
        },
        "priceLabel": {
          "low": "₹4,320",
          "shoulder": "₹4,320",
          "peak": "₹4,320"
        },
        "inclusions": [
          "Entrance to Bali Zoo",
          "Animal encounters and shows",
          "Miniapolis Jungle Waterplay",
          "Insurance",
          "Breakfast with Orangutan (optional)",
          "Mud fun with Elephants, elephant feeding, lunch & snack (optional)"
        ],
        "exclusions": [
          "Hotel pickup and drop-off"
        ],
        "travelHours": 0.75,
        "transferCost": 810
      },
      {
        "name": "Ubud Swing, Zipline, SkyBike in Private Rice Terrace",
        "about": "Experience the famous Bali Swing, soar across rice terraces on a zipline and cycle the sky bike.",
        "duration": "2 hrs",
        "start": "09:00",
        "end": "11:00",
        "price": {
          "low": 5323,
          "shoulder": 5323,
          "peak": 5323
        },
        "priceLabel": {
          "low": "₹5,323",
          "shoulder": "₹5,323",
          "peak": "₹5,323"
        },
        "inclusions": [
          "Entry Ticket to U Fun Field",
          "Rides & Activities access",
          "Safety tools and Insurance",
          "7 photo booths: Wings of Bali, Bee Nest, Bird Nest, Hanging Chair, Bamboo bridge across the waterfall, Traditional farmer's hut, and Rice Field background with Accessories (Basket & Farmer's hat)",
          "Rice Terrace access to our private hiking tracks",
          "Transportation is included based on the option selected"
        ],
        "exclusions": [
          "Food & Beverage",
          "Floating Dress Rental",
          "Photographer Service"
        ],
        "travelHours": 0.75
      },
      {
        "name": "Besakih Temple & Lempuyang Gates of Heaven Tour",
        "about": "Visit Bali's mother temple at Besakih and capture the iconic Instagram shot at Lempuyang's Gates of Heaven.",
        "duration": "8 hrs",
        "start": "09:00",
        "end": "18:00",
        "price": {
          "low": 4672,
          "shoulder": 4672,
          "peak": 4672
        },
        "priceLabel": {
          "low": "₹4,672",
          "shoulder": "₹4,672",
          "peak": "₹4,672"
        },
        "inclusions": [
          "Private tour guide",
          "Return hotel transfer",
          "All entrance fees",
          "Icebox filled with soft drinks (if premium option selected)",
          "Buffet lunch (If add-on selected)",
          "Jungle swing and coffee (if add-on selected)",
          "Full-body traditional massage 1/2H (if add-on selected)",
          "Polaroid camera (10 Photos) (if add-on selected)",
          "Professional photographer (if add-on selected)",
          "Luwak coffee tasting (if add-on selected)",
          "Female guide (if add-on selected)",
          "German/Japanese/Korean speaking Guide (if add-on selected)"
        ],
        "exclusions": [
          "Personal expenses",
          "Tips"
        ],
        "travelHours": 4
      },
      {
        "name": "Lempuyang Quick Access, Waterfall, Water Palace",
        "about": "Skip the line at Lempuyang Temple and explore nearby Tirta Gangga water palace and waterfalls.",
        "duration": "8 hrs",
        "start": "09:00",
        "end": "18:00",
        "price": {
          "low": 3050,
          "shoulder": 3050,
          "peak": 3050
        },
        "priceLabel": {
          "low": "₹3,050",
          "shoulder": "₹3,050",
          "peak": "₹3,050"
        },
        "inclusions": [
          "Hotel pickup and drop off",
          "Transportation by air-conditioned vehicle",
          "Tour guide",
          "Entry tickets",
          "Drinking water"
        ],
        "exclusions": [
          "Lempuyang Temple shuttle (45,000 IDR)",
          "Optional jungle swing (200,000 IDR)",
          "Lunch"
        ],
        "travelHours": 4
      },
      {
        "name": "Explore North Bali Customized Day Tour",
        "about": "Design your own North Bali adventure with a private driver to hidden gems and scenic lookouts.",
        "duration": "10 hrs",
        "start": "09:00",
        "end": "20:00",
        "price": {
          "low": 5560,
          "shoulder": 5560,
          "peak": 5560
        },
        "priceLabel": {
          "low": "₹5,560",
          "shoulder": "₹5,560",
          "peak": "₹5,560"
        },
        "inclusions": [
          "Hotel pickup and drop-off",
          "Driver with speaking English",
          "Petrol",
          "Mineral water",
          "Parking fee"
        ],
        "exclusions": [
          "All the tickets are not included from the price",
          "Personal expenses",
          "Tip"
        ],
        "travelHours": 5
      },
      {
        "name": "Munduk Waterfalls Trek, Twin Lakes and Temple Tour",
        "about": "Trek through Munduk's cloud forest to discover hidden waterfalls and panoramic twin lake views.",
        "duration": "8 hrs",
        "start": "09:00",
        "end": "18:00",
        "price": {
          "low": 5462,
          "shoulder": 5462,
          "peak": 5462
        },
        "priceLabel": {
          "low": "₹5,462",
          "shoulder": "₹5,462",
          "peak": "₹5,462"
        },
        "inclusions": [
          "Hotel pickup and drop-off (if option selected)",
          "Trekking guide",
          "Entry tickets",
          "Lunch (if add on selected)",
          "Drinks (tea, coffee, mineral water)",
          "Insurance"
        ],
        "exclusions": [
          "Personal expenses",
          "Tips"
        ],
        "travelHours": 4
      },
      {
        "name": "Sekumpul Waterfalls and Ulun Danu Temple Tour",
        "about": "Hike to Bali's most beautiful waterfall cascade and visit the floating temple on Lake Beratan.",
        "duration": "10 hrs",
        "start": "09:00",
        "end": "20:00",
        "price": {
          "low": 7847,
          "shoulder": 7847,
          "peak": 7847
        },
        "priceLabel": {
          "low": "₹7,847",
          "shoulder": "₹7,847",
          "peak": "₹7,847"
        },
        "inclusions": [
          "Pickup and drop-off at your accommodation in Kuta, Legian, Seminyak, Jimbaran, Sanur, Krobokan, Canggu, Nusa Dua, or Ubud",
          "Transport by air-conditioned car",
          "Professional English-speaking tour guide",
          "Entrance Fees (for private and small group tour with entrance fee options only)",
          "Mineral water",
          "Insurance",
          "Fuel and toll charges"
        ],
        "exclusions": [
          "Meals and additional drinks",
          "Personal expenses",
          "Entrance fees (for standard small group tour)",
          "Sekumpul and trekking guide feeÂ (medium trek IDR 150K per person; long trekk IDR 250K per person)"
        ],
        "travelHours": 5
      },
      {
        "name": "Munduk: Twin Lake Jungle Hike, Ulun Danu Temple, & Waterfall",
        "about": "A comprehensive nature tour combining jungle trekking, canoeing and waterfall exploration.",
        "duration": "8 hrs",
        "start": "09:00",
        "end": "18:00",
        "price": {
          "low": 2858,
          "shoulder": 2858,
          "peak": 2858
        },
        "priceLabel": {
          "low": "₹2,858",
          "shoulder": "₹2,858",
          "peak": "₹2,858"
        },
        "inclusions": [
          "Professional trekking guide",
          "Traditional canoeing",
          "Entrance ticket",
          "Mineral water",
          "Walking stick",
          "Coffe or tea",
          "Sticky rice",
          "Lunch (if add-ons selected)"
        ],
        "exclusions": [
          "Personal expenses",
          "Tip"
        ],
        "travelHours": 4
      },
      {
        "name": "Dolphin, Ulun Danu Temple, & Banyumala Waterfall",
        "about": "Start with dolphin watching at sunrise, then visit the iconic lake temple and hidden twin waterfalls.",
        "duration": "8 hrs",
        "start": "09:00",
        "end": "18:00",
        "price": {
          "low": 5091,
          "shoulder": 5091,
          "peak": 5091
        },
        "priceLabel": {
          "low": "₹5,091",
          "shoulder": "₹5,091",
          "peak": "₹5,091"
        },
        "inclusions": [
          "All Entrance ticket",
          "Pickup and drop off to/from the hotel",
          "Boat Tour",
          "Life Jacket",
          "Mineral water",
          "Coffee or Tea and Balinese snack (Self-service at the basecamp)"
        ],
        "exclusions": [
          "Personal expenses"
        ],
        "travelHours": 5
      },
      {
        "name": "Pakerisan Jungle River Tubing Adventure with Lunch",
        "about": "Float down the Pakerisan River on an inflatable tube through lush jungle scenery.",
        "duration": "3 hrs",
        "start": "09:00",
        "end": "12:00",
        "price": {
          "low": 5853,
          "shoulder": 5853,
          "peak": 5853
        },
        "priceLabel": {
          "low": "₹5,853",
          "shoulder": "₹5,853",
          "peak": "₹5,853"
        },
        "inclusions": [
          "Welcome Drink On Arrival",
          "River Tubing Safety Approved Equipment",
          "Professional River Tubing Guides",
          "River Tubing Safety Approved Equipment",
          "Towels And Shower Facilities",
          "Changing Room And Toilet Facilities",
          "Locker",
          "Lunch and Mineral Water",
          "Insurance Coverage",
          "Government Tax and Service Charge"
        ],
        "exclusions": [
          "Documentation (Additional Fee for Photos by Photographer, Pay at the counter)",
          "Change of Clothes"
        ],
        "travelHours": 0.75
      },
      {
        "name": "Purification Journey at Taman Beji Waterfall",
        "about": "A sacred Balinese melukat purification ceremony conducted by a local spiritual guide at a secluded waterfall.",
        "duration": "3 hrs",
        "start": "09:00",
        "end": "12:00",
        "price": {
          "low": 6689,
          "shoulder": 6689,
          "peak": 6689
        },
        "priceLabel": {
          "low": "₹6,689",
          "shoulder": "₹6,689",
          "peak": "₹6,689"
        },
        "inclusions": [
          "Hotel pick up & drop-off",
          "Spiritual guide for the ceremony",
          "Holy water for purification",
          "Prayer equipment and offerings",
          "All admission for Purification activity",
          "Sarong for deep purify",
          "Private Locker with Key",
          "Clean Towel",
          "Jamu / Herbal drink",
          "Parking fees"
        ],
        "exclusions": [
          "Other Packages",
          "Meals and additional drinks",
          "Personal expenses"
        ],
        "travelHours": 1
      }
    ]
  }
};
