import React from 'react';
import { useRideWave } from './context/RideWaveContext';
import Navbar from './components/Navbar';
import RideWaveMap from './components/Map/RideWaveMap';
import RideBookingPanel from './components/Booking/RideBookingPanel';
import ActiveTripPanel from './components/Trip/ActiveTripPanel';
import TripCompletedModal from './components/Trip/TripCompletedModal';
import RideHistoryPanel from './components/History/RideHistoryPanel';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function App() {
  const { activeTab, toast, activeTrip } = useRideWave();

  return (
    <div className="relative w-screen h-screen flex flex-col overflow-hidden bg-black font-sans">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Layout Area */}
      <main className="relative flex-1 w-full h-full">
        {/* Full-bleed Leaflet Map Background */}
        <RideWaveMap />

        {/* Floating Controls Overlay Side Panel (Passenger Ride Booking) */}
        {activeTab === 'PASSENGER' && (
          <div className="absolute top-6 left-6 z-10 w-full max-w-md pointer-events-auto">
            {activeTrip ? <ActiveTripPanel /> : <RideBookingPanel />}
          </div>
        )}

        {/* Modal Overlay Views */}
        {activeTab === 'HISTORY' && (
          <div className="absolute inset-0 z-20 p-6 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center">
            <RideHistoryPanel />
          </div>
        )}

        {/* Post-Trip Completion Modal Receipt */}
        <TripCompletedModal />

        {/* Floating Toast Notification Banner */}
        {toast && (
          <div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full flex items-center gap-3 border shadow-2xl bg-zinc-900 text-white border-white/20`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400" />
            ) : toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <Info className="w-4 h-4 text-zinc-300" />
            )}
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
        )}
      </main>
    </div>
  );
}

