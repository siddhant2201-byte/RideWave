import React, { createContext, useContext, useState, useEffect } from 'react';
import { socketService } from '../services/socket';
import { VEHICLE_TIERS, calculateFare, calculateDistance } from '../utils/pricing';
import { POPULAR_LOCATIONS } from '../utils/mockLocations';
import { sounds } from '../utils/audio';

const RideWaveContext = createContext(null);

// Default Central Location (Dehradun, Uttarakhand)
const DEFAULT_CENTER = { lat: 30.3165, lng: 78.0322 };

// Initial Fallback Driver Fleet in Dehradun (7 drivers)
const INITIAL_MOCK_DRIVERS = [
  {
    id: 'drv-101',
    name: 'Rajesh Kumar',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    carModel: 'Maruti Suzuki Dzire (White)',
    licensePlate: 'UK 07 AB 1042',
    rating: 4.92,
    totalTrips: 1420,
    status: 'AVAILABLE',
    location: { lat: 30.3200, lng: 78.0380 },
    heading: 45,
    speedKmH: 35,
    earningsToday: 1850.00,
  },
  {
    id: 'drv-102',
    name: 'Amit Rawat',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    carModel: 'Hyundai Aura (Silver)',
    licensePlate: 'UK 07 CD 5891',
    rating: 4.98,
    totalTrips: 2890,
    status: 'AVAILABLE',
    location: { lat: 30.3120, lng: 78.0280 },
    heading: 120,
    speedKmH: 42,
    earningsToday: 2400.00,
  },
  {
    id: 'drv-103',
    name: 'Pooja Sharma',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    carModel: 'Honda Amaze (Grey)',
    licensePlate: 'UK 07 EF 3412',
    rating: 4.88,
    totalTrips: 980,
    status: 'AVAILABLE',
    location: { lat: 30.3280, lng: 78.0460 },
    heading: 270,
    speedKmH: 28,
    earningsToday: 1300.00,
  },
  {
    id: 'drv-104',
    name: 'Vikas Negi',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    carModel: 'Toyota Ertiga (White)',
    licensePlate: 'UK 07 GH 9901',
    rating: 4.95,
    totalTrips: 1650,
    status: 'AVAILABLE',
    location: { lat: 30.3050, lng: 78.0210 },
    heading: 180,
    speedKmH: 38,
    earningsToday: 2100.00,
  },
  {
    id: 'drv-105',
    name: 'Sanjay Bisht',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    carModel: 'Mahindra Scorpio (Black)',
    licensePlate: 'UK 07 JK 7777',
    rating: 4.99,
    totalTrips: 3410,
    status: 'AVAILABLE',
    location: { lat: 30.3350, lng: 78.0550 },
    heading: 90,
    speedKmH: 45,
    earningsToday: 3150.00,
  },
  {
    id: 'drv-106',
    name: 'Deepak Joshi',
    photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
    carModel: 'Tata Tigor EV (Teal)',
    licensePlate: 'UK 07 EV 2024',
    rating: 4.91,
    totalTrips: 840,
    status: 'AVAILABLE',
    location: { lat: 30.3450, lng: 78.0620 },
    heading: 310,
    speedKmH: 32,
    earningsToday: 1600.00,
  },
  {
    id: 'drv-107',
    name: 'Gurpreet Singh',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    carModel: 'Toyota Innova Crysta (White)',
    licensePlate: 'UK 07 LM 4501',
    rating: 4.96,
    totalTrips: 2150,
    status: 'AVAILABLE',
    location: { lat: 30.2920, lng: 78.0120 },
    heading: 140,
    speedKmH: 40,
    earningsToday: 2800.00,
  },
];

export function RideWaveProvider({ children }) {
  // Navigation View State
  const [activeTab, setActiveTab] = useState('PASSENGER'); // 'PASSENGER' | 'FLEET_ADMIN' | 'HISTORY' | 'WALLET'

  // Map & Location State
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [pickup, setPickup] = useState({
    name: POPULAR_LOCATIONS[1].name,
    address: POPULAR_LOCATIONS[1].address,
    lat: POPULAR_LOCATIONS[1].lat,
    lng: POPULAR_LOCATIONS[1].lng,
  });
  const [dropoff, setDropoff] = useState({
    name: POPULAR_LOCATIONS[0].name,
    address: POPULAR_LOCATIONS[0].address,
    lat: POPULAR_LOCATIONS[0].lat,
    lng: POPULAR_LOCATIONS[0].lng,
  });

  const [mapSelectionMode, setMapSelectionMode] = useState(null); // null | 'PICKUP' | 'DROPOFF'
  const [selectedTier, setSelectedTier] = useState('RideWaveX');

  // Driver Fleet & Surge State
  const [drivers, setDrivers] = useState(INITIAL_MOCK_DRIVERS);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [wsConnected, setWsConnected] = useState(false);

  // Active Trip Telemetry State
  const [activeTrip, setActiveTrip] = useState(null);
  const [completedTripReceipt, setCompletedTripReceipt] = useState(null);

  // User History State
  const [rideHistory, setRideHistory] = useState([
    {
      id: 'TRIP-981240',
      date: '2026-08-29 14:20',
      pickupName: 'Clock Tower (Ghanta Ghar)',
      dropoffName: 'Jolly Grant Airport (DED)',
      driverName: 'Rajesh Kumar',
      carModel: 'Maruti Suzuki Dzire',
      fare: 480.00,
      tier: 'RideWaveX',
      rating: 5,
    },
    {
      id: 'TRIP-771923',
      date: '2026-08-25 09:15',
      pickupName: 'ISBT Dehradun',
      dropoffName: 'Pacific Mall (Rajpur Road)',
      driverName: 'Sanjay Bisht',
      carModel: 'Mahindra Scorpio',
      fare: 290.00,
      tier: 'RideWave Black',
      rating: 5,
    }
  ]);

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Socket Connection & Events Hook
  useEffect(() => {
    socketService.connect();

    const unsubConn = socketService.subscribe('connection_change', (connected) => {
      setWsConnected(connected);
    });

    const unsubInit = socketService.subscribe('init_state', (data) => {
      if (data.drivers) setDrivers(data.drivers);
      if (data.surgeMultiplier) setSurgeMultiplier(data.surgeMultiplier);
    });

    const unsubFleet = socketService.subscribe('fleet_update', (data) => {
      if (data.drivers) setDrivers(data.drivers);
      if (data.surgeMultiplier) setSurgeMultiplier(data.surgeMultiplier);
    });

    const unsubSurge = socketService.subscribe('surge_updated', (data) => {
      setSurgeMultiplier(data.surgeMultiplier);
    });

    // Real-Time Trip Dispatched Handler
    const unsubDispatched = socketService.subscribe('ride_dispatched', (tripData) => {
      sounds.playDispatchPing();
      setActiveTrip(tripData);
      showToast(`Driver ${tripData.driver.name} is on the way (PIN: ${tripData.safetyPin})`, 'success');
    });

    // Real-Time Trip Telemetry Handler
    const unsubTelemetry = socketService.subscribe('trip_telemetry', (data) => {
      setActiveTrip((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: data.status,
          driverLocation: data.driverLocation || prev.driverLocation,
          heading: data.heading ?? prev.heading,
          speedKmH: data.speedKmH ?? prev.speedKmH,
          distanceRemainingKm: data.distanceRemainingKm ?? prev.distanceRemainingKm,
          etaSecondsRemaining: data.etaSecondsRemaining ?? prev.etaSecondsRemaining,
        };
      });
    });

    // Driver Arrived Handler
    const unsubArrived = socketService.subscribe('driver_arrived', (data) => {
      sounds.playDriverArrivedChime();
      showToast(`${data.message || 'Driver has arrived'}`, 'success');
      setActiveTrip((prev) => prev ? { ...prev, status: 'ARRIVED' } : null);
    });

    // Trip Started Handler
    const unsubStarted = socketService.subscribe('trip_started', (data) => {
      showToast('On the way to your destination', 'info');
      setActiveTrip((prev) => prev ? { ...prev, status: 'IN_TRIP' } : null);
    });

    // Trip Completed Handler
    const unsubCompleted = socketService.subscribe('trip_completed', (data) => {
      sounds.playTripCompletedFanfare();
      showToast(`Trip complete! Charged ₹${data.fare.toFixed(2)}`, 'success');

      const newHistoryItem = {
        id: data.tripId,
        date: new Date().toLocaleString(),
        pickupName: pickup.name || 'Pickup',
        dropoffName: dropoff.name || 'Dropoff',
        driverName: data.driver.name,
        carModel: data.driver.carModel,
        fare: data.fare,
        tier: selectedTier,
        rating: 5,
      };

      setRideHistory((prev) => [newHistoryItem, ...prev]);
      setCompletedTripReceipt(newHistoryItem);
      setActiveTrip(null);
    });

    return () => {
      unsubConn();
      unsubInit();
      unsubFleet();
      unsubSurge();
      unsubDispatched();
      unsubTelemetry();
      unsubArrived();
      unsubStarted();
      unsubCompleted();
    };
  }, [pickup, dropoff, selectedTier]);

  // Handle Requesting Ride via WebSockets or Standalone Fallback
  const requestRide = () => {
    if (!pickup || !dropoff) {
      return showToast('Please select pickup and dropoff locations', 'error');
    }

    const distanceKm = calculateDistance(pickup, dropoff);

    const calculatedFareObj = calculateFare({
      distanceKm,
      tierId: selectedTier,
      surgeMultiplier,
    });

    const payload = {
      pickup,
      dropoff,
      tier: selectedTier,
      fare: calculatedFareObj.finalFare,
    };

    if (wsConnected) {
      socketService.emit('request_ride', payload);
    } else {
      // Standalone Fallback Dispatch Simulation
      showToast('Dispatching nearest driver via local algorithm...', 'info');
      sounds.playDispatchPing();
      
      const assignedDriver = drivers[0];
      const mockTrip = {
        tripId: `TRIP-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'EN_ROUTE_TO_PICKUP',
        driver: assignedDriver,
        pickup,
        dropoff,
        fare: calculatedFareObj.finalFare,
        tier: selectedTier,
        safetyPin: '4821',
        speedKmH: 26,
        distanceRemainingKm: 3.5,
        etaSecondsRemaining: 300,
      };
      setActiveTrip(mockTrip);

      // Simulate completion with relaxed realistic timing in standalone mode
      setTimeout(() => {
        sounds.playDriverArrivedChime();
        showToast('Driver has arrived at pickup point!', 'success');
        setActiveTrip((prev) => prev ? { ...prev, status: 'ARRIVED' } : null);

        setTimeout(() => {
          showToast('Trip started! On the way to destination.', 'info');
          setActiveTrip((prev) => prev ? { ...prev, status: 'IN_TRIP', speedKmH: 28 } : null);

          setTimeout(() => {
            sounds.playTripCompletedFanfare();
            showToast(`Trip Completed! Charged ₹${calculatedFareObj.finalFare.toFixed(2)}`, 'success');
            setCompletedTripReceipt({
              id: mockTrip.tripId,
              date: new Date().toLocaleString(),
              pickupName: pickup.name,
              dropoffName: dropoff.name,
              driverName: assignedDriver.name,
              carModel: assignedDriver.carModel,
              fare: calculatedFareObj.finalFare,
              tier: selectedTier,
              rating: 5,
            });
            setActiveTrip(null);
          }, 12000);
        }, 4000);
      }, 7000);
    }
  };

  const cancelRide = () => {
    if (wsConnected) {
      socketService.emit('cancel_ride', {});
    }
    setActiveTrip(null);
    showToast('Ride cancelled.', 'info');
  };

  const updateSurgeAdmin = (newMultiplier) => {
    if (wsConnected) {
      socketService.emit('update_surge', newMultiplier);
    } else {
      setSurgeMultiplier(newMultiplier);
      showToast(`Surge updated to ${newMultiplier}x`, 'info');
    }
  };

  const spawnDriverAdmin = () => {
    if (wsConnected) {
      socketService.emit('spawn_driver', {});
      showToast('New driver spawned on map via WebSockets!', 'success');
    } else {
      const newD = {
        id: `drv-${Date.now().toString().slice(-4)}`,
        name: 'Jordan Smith',
        photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        carModel: 'Hyundai Ioniq 6 (Silver)',
        licensePlate: '9EV123',
        rating: 4.95,
        totalTrips: 340,
        status: 'AVAILABLE',
        location: { lat: DEFAULT_CENTER.lat + (Math.random() - 0.5) * 0.02, lng: DEFAULT_CENTER.lng + (Math.random() - 0.5) * 0.02 },
        heading: 90,
        speedKmH: 35,
        earningsToday: 50.00,
      };
      setDrivers((prev) => [...prev, newD]);
      showToast('Driver spawned on map!', 'success');
    }
  };

  return (
    <RideWaveContext.Provider
      value={{
        activeTab,
        setActiveTab,
        mapCenter,
        setMapCenter,
        pickup,
        setPickup,
        dropoff,
        setDropoff,
        mapSelectionMode,
        setMapSelectionMode,
        selectedTier,
        setSelectedTier,
        drivers,
        surgeMultiplier,
        wsConnected,
        activeTrip,
        completedTripReceipt,
        setCompletedTripReceipt,
        rideHistory,
        toast,
        showToast,
        requestRide,
        cancelRide,
        updateSurgeAdmin,
        spawnDriverAdmin,
      }}
    >
      {children}
    </RideWaveContext.Provider>
  );
}

export const useRideWave = () => {
  const context = useContext(RideWaveContext);
  if (!context) throw new Error('useRideWave must be used within a RideWaveProvider');
  return context;
};
