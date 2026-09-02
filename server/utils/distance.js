const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Calculates Haversine distance between two coordinates in kilometers.
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = 6371 * c;
  return Math.round(distanceKm * 100) / 100;
}

/**
 * Calculates heading bearing (0-360 deg) from point A to B.
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dLon = toRad(lon2 - lon1);

  const y = Math.sin(dLon) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon);

  const bearing = (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
  return Math.round(bearing);
}

/**
 * Densifies road geometry points strictly along actual street line segments
 * to guarantee that intermediate waypoints never cut across buildings or off-road blocks.
 */
export function densifyRoadPoints(points, targetCount = 60) {
  if (!points || points.length === 0) return [];
  if (points.length === 1) return Array(targetCount).fill(points[0]);

  let totalDistance = 0;
  const segmentLengths = [];
  for (let i = 0; i < points.length - 1; i++) {
    const dist = calculateHaversineDistance(
      points[i].lat,
      points[i].lng,
      points[i + 1].lat,
      points[i + 1].lng
    );
    segmentLengths.push(dist);
    totalDistance += dist;
  }

  if (totalDistance === 0) return Array(targetCount).fill(points[0]);

  const densified = [];
  const stepDist = totalDistance / (targetCount - 1);

  let currentSegIdx = 0;
  let distCoveredInSeg = 0;

  for (let i = 0; i < targetCount; i++) {
    const targetDist = i * stepDist;

    while (
      currentSegIdx < segmentLengths.length - 1 &&
      targetDist > distCoveredInSeg + segmentLengths[currentSegIdx]
    ) {
      distCoveredInSeg += segmentLengths[currentSegIdx];
      currentSegIdx++;
    }

    const segLen = segmentLengths[currentSegIdx];
    const segStart = points[currentSegIdx];
    const segEnd = points[currentSegIdx + 1];

    if (segLen === 0) {
      densified.push(segStart);
    } else {
      const segT = Math.min(1, Math.max(0, (targetDist - distCoveredInSeg) / segLen));
      densified.push({
        lat: segStart.lat + (segEnd.lat - segStart.lat) * segT,
        lng: segStart.lng + (segEnd.lng - segStart.lng) * segT,
      });
    }
  }

  return densified;
}

/**
 * Grid-aligned street step fallback (moves along lat then lng roads) when OSRM is unreachable.
 */
export function interpolateRoadFallback(start, end, numSteps = 20) {
  const path = [];
  const halfSteps = Math.floor(numSteps / 2);

  for (let i = 0; i <= halfSteps; i++) {
    const t = i / halfSteps;
    path.push({
      lat: start.lat + (end.lat - start.lat) * t,
      lng: start.lng,
    });
  }

  for (let i = 1; i <= numSteps - halfSteps; i++) {
    const t = i / (numSteps - halfSteps);
    path.push({
      lat: end.lat,
      lng: start.lng + (end.lng - start.lng) * t,
    });
  }

  return path;
}

/**
 * Fetches actual road route waypoints from OSRM driving API with street segment densification.
 */
export async function fetchRoadRoute(start, end, maxWaypoints = 60) {
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    const response = await fetch(osrmUrl);

    if (response.ok) {
      const data = await response.json();
      const coordinates = data.routes?.[0]?.geometry?.coordinates;

      if (coordinates && coordinates.length > 0) {
        const rawPoints = coordinates.map(([lng, lat]) => ({ lat, lng }));
        return densifyRoadPoints(rawPoints, maxWaypoints);
      }
    }
  } catch (error) {
    console.error('OSRM route fetch fallback to grid roads:', error.message);
  }

  return interpolateRoadFallback(start, end, maxWaypoints);
}

/**
 * Finds nearest available driver to pickup location.
 */
export function findNearestDriver(pickupLocation, driverFleet) {
  const availableDrivers = driverFleet.filter(
    (driver) => driver.status === 'AVAILABLE'
  );

  if (!availableDrivers.length) return null;

  return availableDrivers.reduce((nearestDriver, currentDriver) => {
    const distanceToPickup = calculateHaversineDistance(
      pickupLocation.lat,
      pickupLocation.lng,
      currentDriver.location.lat,
      currentDriver.location.lng
    );

    if (!nearestDriver || distanceToPickup < nearestDriver.distanceToPickup) {
      return { ...currentDriver, distanceToPickup };
    }

    return nearestDriver;
  }, null);
}
