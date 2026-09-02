import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useRideWave } from '../../context/RideWaveContext';
import { MousePointerClick, Navigation, Crosshair } from 'lucide-react';
import '../../styles/map.css';

// SVG Vehicle Marker Generator (Realistic top-down 2D Cab/Car Icon)
const createCarIcon = (heading = 0, isAssigned = false, status = 'AVAILABLE') => {
  const carBodyColor = isAssigned ? '#ffffff' : '#facc15'; // White for assigned, Yellow cab for available
  const strokeColor = isAssigned ? '#ffffff' : '#eab308';
  const windowColor = '#18181b';
  const taxiSignColor = isAssigned ? '#22c55e' : '#000000';

  const svgHtml = `
    <div style="transform: rotate(${heading}deg); transition: transform 0.4s ease-out;" class="driver-car-marker ${isAssigned ? 'driver-assigned' : ''}">
      <svg width="26" height="44" viewBox="0 0 26 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Shadow -->
        <rect x="3" y="3" width="20" height="38" rx="6" fill="#000000" opacity="0.5"/>
        <!-- Side Mirrors -->
        <rect x="1" y="12" width="2" height="5" rx="1" fill="${carBodyColor}"/>
        <rect x="23" y="12" width="2" height="5" rx="1" fill="${carBodyColor}"/>
        <!-- Main Car Body -->
        <rect x="3" y="2" width="20" height="40" rx="6" fill="${carBodyColor}" stroke="${strokeColor}" stroke-width="1.5"/>
        <!-- Front Hood Accent -->
        <rect x="6" y="4" width="14" height="3" rx="1" fill="#000000" opacity="0.2"/>
        <!-- Front Windshield -->
        <path d="M5 14 C5 11, 7 9, 13 9 C19 9, 21 11, 21 14 L20 18 H6 Z" fill="${windowColor}"/>
        <!-- Cabin Roof / Taxi Light -->
        <rect x="7" y="20" width="12" height="8" rx="2" fill="#18181b"/>
        <rect x="9" y="22" width="8" height="4" rx="1" fill="${taxiSignColor}"/>
        <!-- Rear Windshield -->
        <path d="M6 30 H20 L21 33 C21 35, 19 36, 13 36 C7 36, 5 35, 5 33 Z" fill="${windowColor}"/>
        <!-- Rear Tail Lights -->
        <rect x="4" y="40" width="4" height="2" rx="0.5" fill="#ef4444"/>
        <rect x="18" y="40" width="4" height="2" rx="0.5" fill="#ef4444"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    html: svgHtml,
    className: 'custom-car-icon',
    iconSize: [26, 44],
    iconAnchor: [13, 22],
  });
};

// Uber Pin Marker for Pickup (Dot) & Dropoff (Square)
const createPulsePinIcon = (type = 'PICKUP') => {
  const isPickup = type === 'PICKUP';
  const shape = isPickup
    ? `<div style="width: 14 h-14; width: 14px; height: 14px; background: #ffffff; border-radius: 50%; border: 3px solid #000000; box-shadow: 0 2px 8px rgba(0,0,0,0.5);"></div>`
    : `<div style="width: 14px; height: 14px; background: #000000; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.5);"></div>`;

  const html = `
    <div class="uber-map-pin" style="display: flex; flex-direction: column; align-items: center;">
      ${shape}
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-uber-pin',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

export default function RideWaveMap() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(new Map());
  const routePolylineRef = useRef(null);
  const dispatchPolylineRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  const {
    mapCenter,
    pickup,
    setPickup,
    dropoff,
    setDropoff,
    mapSelectionMode,
    setMapSelectionMode,
    drivers,
    activeTrip,
    showToast,
  } = useRideWave();

  // Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [mapCenter.lat, mapCenter.lng],
      zoom: 14,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Keyless OpenStreetMap Tile Layer (Rendered in Dark Mode via CSS filter)
    const tileUrl = import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const attribution = import.meta.env.VITE_MAP_TILE_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abc',
      attribution,
    }).addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    // Handle zoom and move events to disable marker CSS transitions during zooming/panning
    let zoomTimeout;
    const handleMoveStart = () => {
      if (zoomTimeout) clearTimeout(zoomTimeout);
      map.getContainer().classList.add('leaflet-zooming');
    };

    const handleMoveEnd = () => {
      if (zoomTimeout) clearTimeout(zoomTimeout);
      zoomTimeout = setTimeout(() => {
        if (mapContainerRef.current) {
          map.getContainer().classList.remove('leaflet-zooming');
        }
      }, 100);
    };

    map.on('zoomstart movestart', handleMoveStart);
    map.on('zoomend moveend', handleMoveEnd);

    return () => {
      if (zoomTimeout) clearTimeout(zoomTimeout);
      map.off('zoomstart movestart', handleMoveStart);
      map.off('zoomend moveend', handleMoveEnd);
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Handle Map Clicks for Selecting Pickup/Dropoff
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;
      const formattedCoord = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

      if (mapSelectionMode === 'PICKUP') {
        setPickup({
          name: `Custom Location (${formattedCoord})`,
          address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
          lat,
          lng,
        });
        setMapSelectionMode(null);
        showToast('Pickup location updated!', 'success');
      } else if (mapSelectionMode === 'DROPOFF') {
        setDropoff({
          name: `Custom Destination (${formattedCoord})`,
          address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
          lat,
          lng,
        });
        setMapSelectionMode(null);
        showToast('Destination location updated!', 'success');
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [mapSelectionMode, mapReady]);

  // Update Pickup & Dropoff Markers & Route Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    // Pickup Marker
    if (pickup) {
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setLatLng([pickup.lat, pickup.lng]);
      } else {
        pickupMarkerRef.current = L.marker([pickup.lat, pickup.lng], {
          icon: createPulsePinIcon('PICKUP'),
        }).addTo(map);
      }
    }

    // Dropoff Marker
    if (dropoff) {
      if (dropoffMarkerRef.current) {
        dropoffMarkerRef.current.setLatLng([dropoff.lat, dropoff.lng]);
      } else {
        dropoffMarkerRef.current = L.marker([dropoff.lat, dropoff.lng], {
          icon: createPulsePinIcon('DROPOFF'),
        }).addTo(map);
      }
    }

    // Route Polyline (Pickup -> Dropoff along real streets)
    if (pickup && dropoff) {
      let isCancelled = false;
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`;

      fetch(osrmUrl)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (isCancelled || !mapInstanceRef.current) return;
          let pathPoints = [
            [pickup.lat, pickup.lng],
            [dropoff.lat, dropoff.lng],
          ];

          if (data && data.routes && data.routes[0] && data.routes[0].geometry) {
            pathPoints = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          }

          if (routePolylineRef.current) {
            routePolylineRef.current.setLatLngs(pathPoints);
          } else {
            // High contrast multi-layer route path
            const poly = L.polyline(pathPoints, {
              color: '#ffffff',
              weight: 5,
              opacity: 0.95,
              lineCap: 'round',
              lineJoin: 'round',
            }).addTo(map);

            routePolylineRef.current = poly;
          }

          // Fit map view smoothly around pickup and destination route
          const bounds = L.latLngBounds(pathPoints);
          mapInstanceRef.current.fitBounds(bounds, {
            padding: [80, 80],
            maxZoom: 15,
            animate: true,
          });
        })
        .catch(() => {
          if (isCancelled || !mapInstanceRef.current) return;
          const fallbackPoints = [
            [pickup.lat, pickup.lng],
            [dropoff.lat, dropoff.lng],
          ];
          if (routePolylineRef.current) {
            routePolylineRef.current.setLatLngs(fallbackPoints);
          } else {
            routePolylineRef.current = L.polyline(fallbackPoints, {
              color: '#ffffff',
              weight: 5,
              opacity: 0.95,
            }).addTo(map);
          }

          const bounds = L.latLngBounds(fallbackPoints);
          mapInstanceRef.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
        });

      return () => {
        isCancelled = true;
      };
    }
  }, [pickup, dropoff, mapReady]);

  // Render & Animate Roaming Driver Vehicle Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const currentDriverIds = new Set();

    drivers.forEach((driver) => {
      if (!driver || !driver.location || typeof driver.location.lat !== 'number' || typeof driver.location.lng !== 'number') return;
      currentDriverIds.add(driver.id);
      const isAssigned = activeTrip && activeTrip.driver && activeTrip.driver.id === driver.id;

      if (markersRef.current.has(driver.id)) {
        // Update Marker Position & Heading Angle
        const marker = markersRef.current.get(driver.id);
        marker.setLatLng([driver.location.lat, driver.location.lng]);
        marker.setIcon(createCarIcon(driver.heading || 0, isAssigned, driver.status));
      } else {
        // Create New Marker
        const marker = L.marker([driver.location.lat, driver.location.lng], {
          icon: createCarIcon(driver.heading || 0, isAssigned, driver.status),
          zIndexOffset: 500,
        }).addTo(map);

        marker.bindPopup(`
          <div style="padding: 4px; font-family: -apple-system, sans-serif;">
            <div style="font-weight: 700; font-size: 13px; color: #ffffff;">${driver.name}</div>
            <div style="font-size: 11px; color: #a1a1aa; margin-top: 2px;">${driver.carModel}</div>
          </div>
        `);

        markersRef.current.set(driver.id, marker);
      }
    });

    // Clean up stale markers
    markersRef.current.forEach((marker, id) => {
      if (!currentDriverIds.has(id)) {
        map.removeLayer(marker);
        markersRef.current.delete(id);
      }
    });
  }, [drivers, activeTrip, mapReady]);

  // Dispatch Polyline (Assigned Driver -> Pickup)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    if (activeTrip && activeTrip.driver && activeTrip.status === 'EN_ROUTE_TO_PICKUP') {
      const driverLoc = activeTrip.driverLocation || activeTrip.driver.location;
      const points = [
        [driverLoc.lat, driverLoc.lng],
        [pickup.lat, pickup.lng],
      ];

      if (dispatchPolylineRef.current) {
        dispatchPolylineRef.current.setLatLngs(points);
      } else {
        dispatchPolylineRef.current = L.polyline(points, {
          color: '#000000',
          weight: 4,
          opacity: 0.9,
          dashArray: '6, 8',
        }).addTo(map);
      }
    } else {
      if (dispatchPolylineRef.current) {
        map.removeLayer(dispatchPolylineRef.current);
        dispatchPolylineRef.current = null;
      }
    }
  }, [activeTrip, pickup, mapReady]);

  const centerOnCity = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([mapCenter.lat, mapCenter.lng], 14, { duration: 1.5 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Selection Mode Overlay Banner */}
      {mapSelectionMode && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-black/90 text-white px-5 py-2.5 rounded-full flex items-center gap-3 border border-white/20 shadow-xl">
          <MousePointerClick className="w-4 h-4 text-white" />
          <span className="text-xs font-semibold">
            Click map to set {mapSelectionMode === 'PICKUP' ? 'pickup' : 'destination'}
          </span>
          <button
            onClick={() => setMapSelectionMode(null)}
            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full font-medium"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Recenter Map Floating Action Button */}
      <div className="absolute bottom-6 right-6 z-20">
        <button
          onClick={centerOnCity}
          className="bg-black/90 hover:bg-black text-white w-10 h-10 rounded-full flex items-center justify-center border border-white/20 shadow-xl transition-all"
          title="Recenter Map"
        >
          <Crosshair className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
