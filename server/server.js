import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  calculateHaversineDistance,
  calculateBearing,
  findNearestDriver,
  interpolatePath,
  fetchRoadRoute,
} from './utils/distance.js';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Central Metro Initial Position (Dehradun, Uttarakhand, India)
const CITY_CENTER = { lat: 30.3165, lng: 78.0322 };

// Initial Simulated Driver Fleet in Dehradun (7 drivers)
let drivers = [
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

let globalSurgeMultiplier = 1.0;
let activeTripsMap = new Map(); // socketId -> active trip interval timer info

// Pre-defined Dehradun Major Street Corridors
const ROAD_CORRIDOR_WAYPOINTS = [
  // Corridor 0: Rajpur Road (Clock Tower <-> DILNET <-> Hathibarkala <-> Pacific Mall)
  [
    { lat: 30.3256, lng: 78.0437 },
    { lat: 30.3340, lng: 78.0485 },
    { lat: 30.3470, lng: 78.0560 },
    { lat: 30.3642, lng: 78.0694 },
  ],
  // Corridor 1: Saharanpur Road & Patel Nagar (ISBT <-> Patel Nagar <-> Railway Station <-> Clock Tower)
  [
    { lat: 30.2863, lng: 78.0076 },
    { lat: 30.2980, lng: 78.0140 },
    { lat: 30.3050, lng: 78.0210 },
    { lat: 30.3155, lng: 78.0332 },
    { lat: 30.3220, lng: 78.0410 },
    { lat: 30.3256, lng: 78.0437 },
  ],
  // Corridor 2: EC Road & Dalanwala (Clock Tower <-> Survey Chowk <-> Dalanwala <-> Railway Station)
  [
    { lat: 30.3256, lng: 78.0437 },
    { lat: 30.3270, lng: 78.0510 },
    { lat: 30.3220, lng: 78.0540 },
    { lat: 30.3120, lng: 78.0450 },
    { lat: 30.3155, lng: 78.0332 },
  ],
  // Corridor 3: Chakrata Road (Clock Tower <-> Bindal Bridge <-> FRI)
  [
    { lat: 30.3256, lng: 78.0437 },
    { lat: 30.3290, lng: 78.0320 },
    { lat: 30.3340, lng: 78.0200 },
    { lat: 30.3426, lng: 77.9995 },
  ],
  // Corridor 4: Clement Town / ISBT Loop
  [
    { lat: 30.2863, lng: 78.0076 },
    { lat: 30.2684, lng: 78.0074 },
    { lat: 30.2863, lng: 78.0076 },
    { lat: 30.3050, lng: 78.0210 },
  ],
];

let precomputedCorridors = [];

// Initialize pre-computed street-accurate road paths on startup
async function initDriverCorridors() {
  console.log('🛣️  [Server] Pre-fetching verified street-accurate road corridors from OSRM...');
  for (let i = 0; i < ROAD_CORRIDOR_WAYPOINTS.length; i++) {
    const waypoints = ROAD_CORRIDOR_WAYPOINTS[i];
    let fullPath = [];
    for (let j = 0; j < waypoints.length - 1; j++) {
      const segRoute = await fetchRoadRoute(waypoints[j], waypoints[j + 1], 20);
      fullPath.push(...segRoute);
    }
    precomputedCorridors.push(fullPath);
  }

  // Position driver fleet on verified street locations
  drivers.forEach((driver, idx) => {
    const corridorIdx = idx % precomputedCorridors.length;
    const corridor = precomputedCorridors[corridorIdx];
    if (corridor && corridor.length > 0) {
      const startIdx = Math.floor(Math.random() * (corridor.length - 1));
      driver.corridorIdx = corridorIdx;
      driver.pathIdx = startIdx;
      driver.direction = 1;
      driver.location = corridor[startIdx];
    }
  });

  console.log(`✅ [Server] ${precomputedCorridors.length} road corridors initialized.`);
}

initDriverCorridors();

// Synchronous Background Driver Idle Roaming Loop (every 1.5 seconds)
setInterval(() => {
  drivers.forEach((driver) => {
    if (driver.status === 'AVAILABLE') {
      const corridorIdx = driver.corridorIdx ?? 0;
      const corridor = precomputedCorridors[corridorIdx % precomputedCorridors.length];

      if (corridor && corridor.length > 1) {
        let currentIdx = driver.pathIdx ?? 0;
        let direction = driver.direction ?? 1;

        let nextIdx = currentIdx + direction;
        if (nextIdx >= corridor.length) {
          direction = -1;
          nextIdx = corridor.length - 2;
        } else if (nextIdx < 0) {
          direction = 1;
          nextIdx = 1;
        }

        const nextPos = corridor[nextIdx];
        const heading = calculateBearing(
          driver.location.lat,
          driver.location.lng,
          nextPos.lat,
          nextPos.lng
        );

        driver.heading = heading;
        driver.location = nextPos;
        driver.pathIdx = nextIdx;
        driver.direction = direction;
        driver.speedKmH = Math.floor(25 + Math.random() * 15);
      }
    }
  });

  // Broadcast updated driver positions to all connected WebSocket clients
  io.emit('fleet_update', {
    drivers,
    surgeMultiplier: globalSurgeMultiplier,
    timestamp: Date.now(),
  });
}, 1500);

// WebSocket Socket.io Handlers
io.on('connection', (socket) => {
  console.log(`[WS] Client Connected: ${socket.id}`);

  // Send immediate initial state
  socket.emit('init_state', {
    drivers,
    surgeMultiplier: globalSurgeMultiplier,
    cityCenter: CITY_CENTER,
  });

  // Client requests a ride booking
  socket.on('request_ride', async (rideData) => {
    const { pickup, dropoff, tier = 'RideWaveX', fare = 0 } = rideData;
    console.log(`[WS] Ride Request from ${socket.id}:`, pickup.address, '->', dropoff.address);

    const assignedDriver = findNearestDriver(pickup, drivers);

    if (!assignedDriver) {
      return socket.emit('ride_error', {
        message: 'No available drivers nearby. Please try again shortly.',
      });
    }

    // Lock chosen driver and clear idle route
    const driverIndex = drivers.findIndex((d) => d.id === assignedDriver.id);
    if (driverIndex !== -1) {
      drivers[driverIndex].status = 'EN_ROUTE';
      idleRouteMap.delete(assignedDriver.id);
    }

    const tripId = `TRIP-${Math.floor(100000 + Math.random() * 900000)}`;
    const safetyPin = Math.floor(1000 + Math.random() * 9000).toString();
    const distanceKm = calculateHaversineDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);

    const tripDetails = {
      tripId,
      status: 'EN_ROUTE_TO_PICKUP',
      driver: { ...drivers[driverIndex] },
      pickup,
      dropoff,
      distanceKm,
      fare,
      tier,
      safetyPin,
      etaMinutes: Math.ceil(assignedDriver.distanceToPickup * 2) + 1,
      startTime: Date.now(),
    };

    socket.emit('ride_dispatched', tripDetails);

    // Cancel existing trip loop if any
    if (activeTripsMap.has(socket.id)) {
      clearInterval(activeTripsMap.get(socket.id).interval);
    }

    // Phase 1: Move Driver to Pickup along real road network at a realistic, relaxed speed
    const pickupWaypoints = await fetchRoadRoute(drivers[driverIndex].location, pickup, 60);
    let waypointIdx = 0;

    const interval = setInterval(() => {
      if (waypointIdx < pickupWaypoints.length) {
        const nextPos = pickupWaypoints[waypointIdx];
        const heading = calculateBearing(
          drivers[driverIndex].location.lat,
          drivers[driverIndex].location.lng,
          nextPos.lat,
          nextPos.lng
        );

        drivers[driverIndex].location = nextPos;
        drivers[driverIndex].heading = heading;
        drivers[driverIndex].speedKmH = 26;

        socket.emit('trip_telemetry', {
          tripId,
          status: 'EN_ROUTE_TO_PICKUP',
          driverLocation: nextPos,
          heading,
          speedKmH: 26,
          waypointsRemaining: pickupWaypoints.length - waypointIdx,
        });

        waypointIdx++;
      } else {
        // Driver arrived at pickup!
        clearInterval(interval);
        drivers[driverIndex].status = 'ARRIVED';
        socket.emit('driver_arrived', {
          tripId,
          status: 'ARRIVED',
          message: `${drivers[driverIndex].name} has arrived at your pickup location!`,
        });

        // Phase 2: Start Trip after 4 second delay along real road network
        setTimeout(async () => {
          drivers[driverIndex].status = 'IN_TRIP';
          socket.emit('trip_started', {
            tripId,
            status: 'IN_TRIP',
            message: 'Trip started! Heading to your destination.',
          });

          const dropoffWaypoints = await fetchRoadRoute(pickup, dropoff, 80);
          let dropIdx = 0;

          const tripInterval = setInterval(() => {
            if (dropIdx < dropoffWaypoints.length) {
              const currentPos = dropoffWaypoints[dropIdx];
              const heading = calculateBearing(
                drivers[driverIndex].location.lat,
                drivers[driverIndex].location.lng,
                currentPos.lat,
                currentPos.lng
              );

              drivers[driverIndex].location = currentPos;
              drivers[driverIndex].heading = heading;
              drivers[driverIndex].speedKmH = 28;

              const remainingRatio = 1 - dropIdx / dropoffWaypoints.length;
              const remainingKm = Math.round(distanceKm * remainingRatio * 10) / 10;
              const etaSec = Math.ceil((dropoffWaypoints.length - dropIdx) * 1.4);

              socket.emit('trip_telemetry', {
                tripId,
                status: 'IN_TRIP',
                driverLocation: currentPos,
                heading,
                speedKmH: 28,
                distanceRemainingKm: remainingKm,
                etaSecondsRemaining: etaSec,
              });

              dropIdx++;
            } else {
              // Trip Completed!
              clearInterval(tripInterval);
              activeTripsMap.delete(socket.id);

              drivers[driverIndex].status = 'AVAILABLE';
              drivers[driverIndex].earningsToday += fare;
              drivers[driverIndex].totalTrips += 1;

              socket.emit('trip_completed', {
                tripId,
                status: 'COMPLETED',
                driver: drivers[driverIndex],
                fare,
                distanceKm,
                completedAt: Date.now(),
              });
            }
          }, 1400);

          activeTripsMap.set(socket.id, { interval: tripInterval, driverId: drivers[driverIndex].id });
        }, 4000);
      }
    }, 1400);

    activeTripsMap.set(socket.id, { interval, driverId: drivers[driverIndex].id });
  });

  // Cancel ride handler
  socket.on('cancel_ride', (data) => {
    console.log(`[WS] Ride Cancelled by ${socket.id}`);
    if (activeTripsMap.has(socket.id)) {
      const activeObj = activeTripsMap.get(socket.id);
      clearInterval(activeObj.interval);
      
      const dIdx = drivers.findIndex(d => d.id === activeObj.driverId);
      if (dIdx !== -1) {
        drivers[dIdx].status = 'AVAILABLE';
      }
      activeTripsMap.delete(socket.id);
    }
    socket.emit('ride_cancelled', { message: 'Ride was successfully cancelled.' });
  });

  // Admin Fleet Controls via WebSockets
  socket.on('update_surge', (newSurge) => {
    globalSurgeMultiplier = Math.max(1.0, Math.min(3.5, parseFloat(newSurge) || 1.0));
    io.emit('surge_updated', { surgeMultiplier: globalSurgeMultiplier });
  });

  socket.on('spawn_driver', (customData = {}) => {
    const newId = `drv-${Date.now().toString().slice(-4)}`;
    const names = ['Jordan Reed', 'Taylor Smith', 'Chris Morgan', 'Sam Wilson', 'Pat Kelly'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    
    const newDriver = {
      id: newId,
      name: customData.name || randomName,
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      carModel: customData.carModel || 'Toyota Prius (Blue)',
      licensePlate: `${Math.floor(100 + Math.random() * 900)}WAVE`,
      rating: 4.90,
      totalTrips: 150,
      status: 'AVAILABLE',
      location: {
        lat: CITY_CENTER.lat + (Math.random() - 0.5) * 0.03,
        lng: CITY_CENTER.lng + (Math.random() - 0.5) * 0.03,
      },
      heading: Math.floor(Math.random() * 360),
      speedKmH: 30,
      earningsToday: 0,
    };

    drivers.push(newDriver);
    io.emit('fleet_update', { drivers, surgeMultiplier: globalSurgeMultiplier });
  });

  socket.on('disconnect', () => {
    console.log(`[WS] Client Disconnected: ${socket.id}`);
    if (activeTripsMap.has(socket.id)) {
      const activeObj = activeTripsMap.get(socket.id);
      clearInterval(activeObj.interval);
      const dIdx = drivers.findIndex(d => d.id === activeObj.driverId);
      if (dIdx !== -1) drivers[dIdx].status = 'AVAILABLE';
      activeTripsMap.delete(socket.id);
    }
  });
});

// REST Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    activeDrivers: drivers.length,
    surgeMultiplier: globalSurgeMultiplier,
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 [RideWave WebSocket Server] Running on http://localhost:${PORT}`);
});
