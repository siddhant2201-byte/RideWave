import React from 'react';
import { useRideWave } from '../context/RideWaveContext';
import { Car, History } from 'lucide-react';

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    activeTrip,
  } = useRideWave();

  return (
    <header className="sticky top-0 z-50 w-full bg-black/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center space-x-8">
        <button
          onClick={() => setActiveTab('PASSENGER')}
          className="flex items-center space-x-2 text-left focus:outline-none"
        >
          <span className="text-2xl font-black tracking-tight text-white font-sans">
            RideWave
          </span>
        </button>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('PASSENGER')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'PASSENGER'
                ? 'bg-white text-black'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Car className="w-4 h-4" />
            Ride
            {activeTrip && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'HISTORY'
                ? 'bg-white text-black'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <History className="w-4 h-4" />
            Activity
          </button>
        </nav>
      </div>
    </header>
  );
}

