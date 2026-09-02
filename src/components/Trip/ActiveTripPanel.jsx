import React from 'react';
import { useRideWave } from '../../context/RideWaveContext';
import { ShieldCheck, Car, Phone, XCircle } from 'lucide-react';

export default function ActiveTripPanel() {
  const { activeTrip, cancelRide } = useRideWave();

  if (!activeTrip) return null;

  const driver = activeTrip.driver || {};
  const status = activeTrip.status;

  const getStatusText = () => {
    switch (status) {
      case 'EN_ROUTE_TO_PICKUP':
        return 'Driver is on the way';
      case 'ARRIVED':
        return 'Driver has arrived';
      case 'IN_TRIP':
        return 'On the way to destination';
      default:
        return 'Connecting you to a driver';
    }
  };

  return (
    <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl space-y-4 max-w-md w-full font-sans">
      {/* Top Status & PIN */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-white tracking-tight">{getStatusText()}</h3>
          <p className="text-xs text-zinc-400">ETA approx. {activeTrip.etaMinutes || 3} min</p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-300 bg-zinc-800 px-3 py-1.5 rounded-lg border border-white/10">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>PIN: <strong className="text-white tracking-wider">{activeTrip.safetyPin || '4821'}</strong></span>
        </div>
      </div>

      {/* Driver Info Card */}
      <div className="flex items-center gap-4 bg-zinc-900/80 p-3.5 rounded-xl border border-white/10">
        <img
          src={driver.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
          alt={driver.name}
          className="w-14 h-14 rounded-full object-cover border border-white/20"
        />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-white">{driver.name || 'Driver'}</h4>
          </div>

          <p className="text-xs text-zinc-300 mt-0.5 flex items-center gap-1">
            <Car className="w-3.5 h-3.5 text-zinc-400" />
            {driver.carModel || 'Toyota Camry'}
          </p>

          <span className="inline-block mt-1 bg-zinc-800 text-zinc-200 text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-white/10">
            {driver.licensePlate || '7XYZ890'}
          </span>
        </div>

        <button
          onClick={() => alert(`Calling driver ${driver.name}...`)}
          className="w-9 h-9 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center transition-all"
          title="Contact Driver"
        >
          <Phone className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-700"
            style={{
              width: status === 'ARRIVED' ? '50%' : status === 'IN_TRIP' ? '85%' : '25%',
            }}
          />
        </div>
      </div>

      {/* Cancel Button */}
      <button
        onClick={cancelRide}
        className="w-full bg-zinc-900 hover:bg-zinc-800 text-red-400 font-semibold py-2.5 px-4 rounded-xl border border-red-500/20 transition-all text-xs flex items-center justify-center gap-1.5"
      >
        <XCircle className="w-4 h-4" />
        Cancel Ride
      </button>
    </div>
  );
}

