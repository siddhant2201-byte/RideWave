import React from 'react';
import { useRideWave } from '../../context/RideWaveContext';
import { History, MapPin, Navigation, Car } from 'lucide-react';

export default function RideHistoryPanel() {
  const { rideHistory } = useRideWave();

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 shadow-2xl space-y-5 max-w-3xl w-full mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-white" />
            Activity
          </h2>
          <p className="text-xs text-zinc-400">Past trips</p>
        </div>
      </div>

      {/* Ride History Items */}
      <div className="space-y-3">
        {rideHistory.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-black border border-white/10 hover:border-white/20 transition-all space-y-2.5"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">
                {item.date} • <strong className="text-white font-mono">{item.id}</strong>
              </span>
              <span className="text-sm font-black text-white">₹{item.fare.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <MapPin className="w-3.5 h-3.5 text-white flex-shrink-0" />
                <span className="truncate">{item.pickupName}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Navigation className="w-3.5 h-3.5 text-white flex-shrink-0" />
                <span className="truncate">{item.dropoffName}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <div className="flex items-center gap-2 text-zinc-400">
                <Car className="w-3.5 h-3.5" />
                <span>{item.driverName} ({item.carModel})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

