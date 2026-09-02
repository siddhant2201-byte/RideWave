import React from 'react';
import { useRideWave } from '../../context/RideWaveContext';
import { VEHICLE_TIERS, calculateFare, calculateDistance } from '../../utils/pricing';
import { POPULAR_LOCATIONS } from '../../utils/mockLocations';
import { MapPin, Navigation, ArrowUpDown, Users, Car, Sparkles, Truck, Crown } from 'lucide-react';

export default function RideBookingPanel() {
  const {
    pickup,
    setPickup,
    dropoff,
    setDropoff,
    setMapSelectionMode,
    selectedTier,
    setSelectedTier,
    surgeMultiplier,
    requestRide,
    activeTrip,
  } = useRideWave();

  const distanceKm = calculateDistance(pickup, dropoff);

  const calculatedFare = calculateFare({
    distanceKm,
    tierId: selectedTier,
    surgeMultiplier,
  });

  const swapLocations = () => {
    const temp = pickup;
    setPickup(dropoff);
    setDropoff(temp);
  };

  const getTierIcon = (iconName, isSelected) => {
    const color = isSelected ? 'text-black' : 'text-white';
    switch (iconName) {
      case 'Sparkles': return <Sparkles className={`w-5 h-5 ${color}`} />;
      case 'Truck': return <Truck className={`w-5 h-5 ${color}`} />;
      case 'Crown': return <Crown className={`w-5 h-5 ${color}`} />;
      default: return <Car className={`w-5 h-5 ${color}`} />;
    }
  };

  if (activeTrip) return null; // Hide booking panel when active trip is in progress

  return (
    <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl flex flex-col space-y-4 max-h-[85vh] overflow-y-auto w-full font-sans">
      {/* Header Title */}
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">Request a ride</h2>
        <p className="text-xs text-zinc-400 font-medium mt-0.5">
          Est. distance: <span className="text-white font-bold">{distanceKm} km</span>
        </p>
      </div>

      {/* Pickup & Destination Locations Container */}
      <div className="relative flex flex-col space-y-2 bg-zinc-900/90 p-3 rounded-xl border border-white/10">
        {/* Visual Line */}
        <div className="absolute left-5 top-7 bottom-7 w-0.5 bg-zinc-600 z-0" />

        {/* Pickup Location */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-white flex-shrink-0 ml-0.5" />
          <div className="flex-1">
            <select
              value={pickup.name}
              onChange={(e) => {
                const found = POPULAR_LOCATIONS.find((loc) => loc.name === e.target.value);
                if (found) setPickup(found);
              }}
              className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer py-1"
            >
              <option value={pickup.name} className="bg-zinc-900 text-white">{pickup.name}</option>
              {POPULAR_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name} className="bg-zinc-900 text-white">
                  {loc.name} ({loc.category})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setMapSelectionMode('PICKUP')}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
            title="Choose on map"
          >
            <MapPin className="w-4 h-4" />
          </button>
        </div>

        {/* Swap Icon */}
        <div className="flex justify-end pr-1 z-10 -my-1">
          <button
            onClick={swapLocations}
            className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors"
            title="Swap locations"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination Location */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-white flex-shrink-0 ml-0.5" />
          <div className="flex-1">
            <select
              value={dropoff.name}
              onChange={(e) => {
                const found = POPULAR_LOCATIONS.find((loc) => loc.name === e.target.value);
                if (found) setDropoff(found);
              }}
              className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer py-1"
            >
              <option value={dropoff.name} className="bg-zinc-900 text-white">{dropoff.name}</option>
              {POPULAR_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name} className="bg-zinc-900 text-white">
                  {loc.name} ({loc.category})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setMapSelectionMode('DROPOFF')}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors"
            title="Choose on map"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Vehicle Option Options */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-400">Available Options</label>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {VEHICLE_TIERS.map((tier) => {
            const fare = calculateFare({
              distanceKm,
              tierId: tier.id,
              surgeMultiplier,
            });
            const isSelected = selectedTier === tier.id;

            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between border ${
                  isSelected
                    ? 'bg-white text-black border-white'
                    : 'bg-zinc-900/60 hover:bg-zinc-800 text-white border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isSelected ? 'bg-black/10' : 'bg-white/10'}`}>
                    {getTierIcon(tier.icon, isSelected)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{tier.name}</span>
                      <span className={`text-[11px] font-medium flex items-center gap-0.5 opacity-80`}>
                        <Users className="w-3 h-3" /> {tier.capacity}
                      </span>
                    </div>
                    <p className={`text-xs ${isSelected ? 'text-zinc-700' : 'text-zinc-400'}`}>
                      {tier.description}
                    </p>
                    <p className={`text-[11px] font-medium ${isSelected ? 'text-zinc-800' : 'text-zinc-500'}`}>
                      {tier.etaOffsetMin} min away
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-extrabold">
                    ₹{fare.finalFare.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Request CTA Button */}
      <button
        onClick={requestRide}
        className="w-full bg-white hover:bg-zinc-200 text-black font-black py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
      >
        Choose {selectedTier} • ₹{calculatedFare.finalFare.toFixed(2)}
      </button>
    </div>
  );
}

