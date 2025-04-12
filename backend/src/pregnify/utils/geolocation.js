/**
 * Calculate distance between two points using Haversine formula
 * @param {Object} point1 - First point with latitude and longitude
 * @param {Object} point2 - Second point with latitude and longitude
 * @returns {number} - Distance in kilometers
 */
export const calculateDistance = (point1, point2) => {
  const lat1 = point1.latitude;
  const lon1 = point1.longitude;
  const lat2 = point2.latitude;
  const lon2 = point2.longitude;

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

/**
 * Convert degrees to radians
 * @param {number} deg - Degrees
 * @returns {number} - Radians
 */
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Find nearby locations within a given radius
 * @param {Object} centerPoint - Center point with latitude and longitude
 * @param {Array} points - Array of points with latitude and longitude
 * @param {number} radius - Radius in kilometers
 * @returns {Array} - Points within the radius, sorted by distance
 */
export const findNearbyLocations = (centerPoint, points, radius) => {
  return points
    .map(point => ({
      ...point,
      distance: calculateDistance(centerPoint, point)
    }))
    .filter(point => point.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Estimate travel time based on distance
 * @param {number} distance - Distance in kilometers
 * @param {number} averageSpeed - Average speed in km/h (default: 30)
 * @returns {number} - Estimated travel time in minutes
 */
export const estimateTravelTime = (distance, averageSpeed = 30) => {
  return Math.ceil((distance / averageSpeed) * 60);
}; 