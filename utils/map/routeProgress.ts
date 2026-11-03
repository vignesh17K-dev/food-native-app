export type LatLng = {
  latitude: number;
  longitude: number;
};

function distanceSq(a: LatLng, b: LatLng) {
  const dLat = a.latitude - b.latitude;
  const dLng = a.longitude - b.longitude;
  return dLat * dLat + dLng * dLng;
}

/** Index of the polyline point closest to `point`. */
export function nearestRouteIndex(
  route: LatLng[],
  point: LatLng,
): number {
  if (route.length === 0) {
    return 0;
  }

  let bestIndex = 0;
  let bestDist = Number.POSITIVE_INFINITY;

  for (let i = 0; i < route.length; i += 1) {
    const dist = distanceSq(route[i], point);
    if (dist < bestDist) {
      bestDist = dist;
      bestIndex = i;
    }
  }

  return bestIndex;
}

/** Remaining path from nearest point on route through the end (customer). */
export function remainingRouteFrom(
  route: LatLng[],
  point: LatLng,
): LatLng[] {
  if (route.length === 0) {
    return [];
  }

  const index = nearestRouteIndex(route, point);
  const remaining = route.slice(index);
  if (remaining.length === 0) {
    return [route[route.length - 1]];
  }

  // Ensure the courier's live position is the start of the remaining trace.
  if (
    remaining[0].latitude !== point.latitude ||
    remaining[0].longitude !== point.longitude
  ) {
    return [point, ...remaining];
  }

  return remaining;
}
