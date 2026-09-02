import React, { useState } from 'react';
import { useRideWave } from '../../context/RideWaveContext';
import { CheckCircle2, X } from 'lucide-react';

export default function TripCompletedModal() {
  const { completedTripReceipt, setCompletedTripReceipt, showToast } = useRideWave();
  const [tip, setTip] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  if (!completedTripReceipt) return null;

  const handleFinish = () => {
    setSubmitted(true);
    showToast(tip > 0 ? `Tip (₹${tip}) submitted` : 'Trip feedback submitted', 'success');
    setTimeout(() => {
      setCompletedTripReceipt(null);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 shadow-2xl max-w-md w-full relative space-y-5 font-sans">
        {/* Close Button */}
        <button
          onClick={() => setCompletedTripReceipt(null)}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-full bg-white text-black mx-auto flex items-center justify-center font-bold">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">You've arrived!</h2>
          <p className="text-xs text-zinc-400">Trip with {completedTripReceipt.driverName}</p>
        </div>

        {/* Receipt details */}
        <div className="bg-black/50 p-4 rounded-xl border border-white/10 space-y-2 text-xs">
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-zinc-400">Trip ID</span>
            <span className="text-white font-mono font-semibold">{completedTripReceipt.id}</span>
          </div>

          <div className="space-y-1 text-zinc-300 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span className="truncate">{completedTripReceipt.pickupName}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white" />
              <span className="truncate">{completedTripReceipt.dropoffName}</span>
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold text-white">
            <span>Total</span>
            <span>₹{(completedTripReceipt.fare + tip).toFixed(2)}</span>
          </div>
        </div>

        {/* Add Driver Tip */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 block text-center">Add a tip</label>
          <div className="grid grid-cols-4 gap-2">
            {[0, 20, 50, 100].map((amount) => (
              <button
                key={amount}
                onClick={() => setTip(amount)}
                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                  tip === amount
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10'
                }`}
              >
                {amount === 0 ? 'No tip' : `₹${amount}`}
              </button>
            ))}
          </div>
        </div>

        {/* Submit CTA */}
        <button
          onClick={handleFinish}
          disabled={submitted}
          className="w-full bg-white hover:bg-zinc-200 text-black font-black py-3 rounded-xl transition-all"
        >
          {submitted ? 'Submitted!' : 'Done'}
        </button>
      </div>
    </div>
  );
}

