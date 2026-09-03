/* Real-world coordinates for the 3D trip globe.

   The dataset's x/y are stylized SVG-map positions, so the globe carries its
   own lat/lng table: every city in the Thailand dataset plus every departure
   city the wizard offers. Approximate town-center coordinates — plenty at
   globe scale. */

export interface GeoPoint {
  lat: number;
  lng: number;
}

export const THAI_GEO: Record<string, GeoPoint> = {
  Bangkok: { lat: 13.7563, lng: 100.5018 },
  "Chiang Mai": { lat: 18.7883, lng: 98.9853 },
  "Chiang Rai": { lat: 19.9105, lng: 99.8406 },
  "Khon Kaen": { lat: 16.4419, lng: 102.836 },
  "Udon Thani": { lat: 17.4138, lng: 102.787 },
  Buriram: { lat: 14.993, lng: 103.1029 },
  "Koh Samui": { lat: 9.512, lng: 100.0136 },
  Krabi: { lat: 8.0863, lng: 98.9063 },
  Phuket: { lat: 7.8804, lng: 98.3923 },
  "Surat Thani": { lat: 9.1382, lng: 99.3215 },
  "Hat Yai": { lat: 7.0086, lng: 100.4747 },
  Ayutthaya: { lat: 14.3532, lng: 100.5689 },
  Kanchanaburi: { lat: 14.0227, lng: 99.5328 },
  "Hua Hin": { lat: 12.5684, lng: 99.9577 },
  Pattaya: { lat: 12.9236, lng: 100.8825 },
  Pai: { lat: 19.3583, lng: 98.4418 },
  "Mae Hong Son": { lat: 19.302, lng: 97.9654 },
  Sukhothai: { lat: 17.0078, lng: 99.8237 },
  "Phi Phi Islands": { lat: 7.7407, lng: 98.7784 },
  "Koh Lanta": { lat: 7.6244, lng: 99.0733 },
  "Similan Islands": { lat: 8.653, lng: 97.644 },
  "Khao Sok": { lat: 8.9174, lng: 98.5286 },
  "Koh Yao Noi": { lat: 8.1076, lng: 98.6055 },
  "Koh Lipe": { lat: 6.4884, lng: 99.3038 },
  "Koh Phangan": { lat: 9.75, lng: 100.0322 },
  "Koh Tao": { lat: 10.0956, lng: 99.8404 },
  "Koh Samet": { lat: 12.5674, lng: 101.4514 },
  "Koh Chang": { lat: 12.0455, lng: 102.3204 },
  "Koh Kood": { lat: 11.655, lng: 102.547 },
  "Koh Mak": { lat: 11.815, lng: 102.477 },
  "Nong Khai": { lat: 17.8783, lng: 102.742 },
  Chanthaburi: { lat: 12.6113, lng: 102.1039 },
  Trang: { lat: 7.5563, lng: 99.6114 },
  "Ko Tarutao": { lat: 6.592, lng: 99.651 },
  "Nakhon Si Thammarat": { lat: 8.4304, lng: 99.9631 },
  Ratchaburi: { lat: 13.5282, lng: 99.8134 },
  Lopburi: { lat: 14.7995, lng: 100.6534 },
  Phetchaburi: { lat: 13.1119, lng: 99.9399 },
  Nan: { lat: 18.7756, lng: 100.773 },
  Phrae: { lat: 18.1445, lng: 100.1405 },
  Lampang: { lat: 18.2854, lng: 99.5122 },
  Phetchabun: { lat: 16.419, lng: 101.1591 },
  Surin: { lat: 14.8818, lng: 103.4936 },
  // Bali
  Kuta: { lat: -8.7205, lng: 115.1693 },
  Ubud: { lat: -8.5069, lng: 115.2625 },
};

export const ORIGIN_GEO: Record<string, GeoPoint> = {
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Delhi: { lat: 28.6139, lng: 77.209 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Kochi: { lat: 9.9312, lng: 76.2673 },
  Goa: { lat: 15.4909, lng: 73.8278 },
  Lucknow: { lat: 26.8467, lng: 80.9462 },
};

export const cityGeo = (name: string): GeoPoint | null =>
  THAI_GEO[name] ?? ORIGIN_GEO[name] ?? null;
