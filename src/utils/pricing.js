/**
 * Vehicle Tier Definitions with Base Fares & Multipliers (INR Pricing)
 */
export const VEHICLE_TIERS = [
  {
    id: 'RideWaveX',
    name: 'RideWaveX',
    description: 'Affordable, everyday rides',
    capacity: 4,
    baseFare: 50.00,
    perKmRate: 14.00,
    perMinRate: 2.00,
    multiplier: 1.0,
    etaOffsetMin: 2,
    icon: 'Car',
    badge: 'Popular',
  },
  {
    id: 'Comfort',
    name: 'Comfort',
    description: 'Newer cars with extra legroom',
    capacity: 4,
    baseFare: 80.00,
    perKmRate: 18.00,
    perMinRate: 3.00,
    multiplier: 1.25,
    etaOffsetMin: 3,
    icon: 'Sparkles',
    badge: 'Top Rated',
  },
  {
    id: 'RideWaveXL',
    name: 'RideWaveXL',
    description: 'Spacious SUVs for groups up to 6',
    capacity: 6,
    baseFare: 120.00,
    perKmRate: 25.00,
    perMinRate: 4.00,
    multiplier: 1.5,
    etaOffsetMin: 4,
    icon: 'Truck',
    badge: 'Extra Space',
  },
  {
    id: 'RideWaveBlack',
    name: 'RideWave Black',
    description: 'Premium luxury rides with professional drivers',
    capacity: 4,
    baseFare: 200.00,
    perKmRate: 40.00,
    perMinRate: 6.00,
    multiplier: 2.0,
    etaOffsetMin: 5,
    icon: 'Crown',
    badge: 'VIP Luxury',
  },
];

/**
 * Calculates estimated driving distance between pickup and dropoff coordinates in kilometers.
 */
const toRad = (deg) => (deg * Math.PI) / 180;

export function calculateDistance(pickup, dropoff) {
  if (!pickup || !dropoff || typeof pickup.lat !== 'number' || typeof dropoff.lat !== 'number') {
    return 4.8;
  }

  const dLat = toRad(dropoff.lat - pickup.lat);
  const dLon = toRad(dropoff.lng - pickup.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(pickup.lat)) * Math.cos(toRad(dropoff.lat)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = 6371 * c;

  // Driving routes are approx ~1.35x straight line distance
  const drivingKm = Math.max(1.2, Math.round(straightKm * 1.35 * 10) / 10);
  return drivingKm;
}

/**
 * Calculates complete itemized fare calculation in INR based on dynamic distance & duration
 */
export function calculateFare({
  distanceKm = 5.0,
  estimatedMinutes,
  tierId = 'RideWaveX',
  surgeMultiplier = 1.0,
  tipAmount = 0,
}) {
  const tier = VEHICLE_TIERS.find((t) => t.id === tierId) || VEHICLE_TIERS[0];
  const estMin = estimatedMinutes ?? Math.max(4, Math.ceil(distanceKm * 2.2));
  
  const distanceCost = distanceKm * tier.perKmRate;
  const timeCost = estMin * tier.perMinRate;
  const subtotalBeforeSurge = (tier.baseFare + distanceCost + timeCost);
  const totalWithSurge = subtotalBeforeSurge * surgeMultiplier;
  
  const finalFare = Math.max(50.00, Math.round((totalWithSurge + tipAmount) * 100) / 100);

  return {
    tier,
    distanceKm,
    estimatedMinutes: estMin,
    baseFare: tier.baseFare,
    distanceCost: Math.round(distanceCost * 100) / 100,
    timeCost: Math.round(timeCost * 100) / 100,
    subtotal: Math.round(subtotalBeforeSurge * 100) / 100,
    surgeMultiplier,
    surgeAmount: Math.round((totalWithSurge - subtotalBeforeSurge) * 100) / 100,
    discount: 0,
    tipAmount,
    finalFare,
  };
}

