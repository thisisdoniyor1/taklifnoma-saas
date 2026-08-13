/**
 * Utility functions for parsing map URLs and generating native coordinates links
 */

export function parseCoordinates(url) {
  if (!url) return null;
  try {
    const decoded = decodeURIComponent(url);

    // 1. Check for Yandex-specific format where longitude is first: ll=lng,lat or pt=lng,lat
    const yandexLLMatch = decoded.match(/[?&](ll|pt)=([-\d.]+),([-\d.]+)/);
    if (yandexLLMatch) {
      const lng = parseFloat(yandexLLMatch[2]);
      const lat = parseFloat(yandexLLMatch[3]);
      if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        return { lat, lng };
      }
    }

    // 2. Check for @lat,lng pattern (Google Maps uses this in paths)
    const atPatternMatch = decoded.match(/@([-\d.]+),([-\d.]+)/);
    if (atPatternMatch) {
      const lat = parseFloat(atPatternMatch[1]);
      const lng = parseFloat(atPatternMatch[2]);
      if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
        return { lat, lng };
      }
    }

    // 3. Look for generic decimal patterns "lat,lng" or "lat%2Clng"
    const genericMatches = [...decoded.matchAll(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/g)];
    for (const match of genericMatches) {
      const val1 = parseFloat(match[1]);
      const val2 = parseFloat(match[2]);

      if (Math.abs(val1) <= 90 && Math.abs(val2) <= 180) {
        // If it's a Yandex link, longitude is usually first
        if (url.includes('yandex') && Math.abs(val2) <= 90 && Math.abs(val1) > 45) {
          return { lat: val2, lng: val1 };
        }
        return { lat: val1, lng: val2 };
      }
    }
  } catch (error) {
    console.error('Failed to parse coordinates from URL:', error);
  }
  return null;
}

export function getMapUrls(locationName, locationUrl) {
  const cleanName = (locationName || '').trim();
  const coords = parseCoordinates(locationUrl);

  let googleMaps = locationUrl || '';
  let appleMaps = '';
  let yandexMaps = '';

  if (coords) {
    // If we have precise coordinates, construct direct search URLs for all map apps
    googleMaps = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
    appleMaps = `https://maps.apple.com/?q=${encodeURIComponent(cleanName || 'Wedding')}&ll=${coords.lat},${coords.lng}`;
    yandexMaps = `https://yandex.com/maps/?pt=${coords.lng},${coords.lat}&z=16&l=map`;
  } else {
    // Fallbacks using text search query if no coordinates can be parsed
    const query = encodeURIComponent(cleanName);
    if (!googleMaps) {
      googleMaps = `https://maps.google.com/?q=${query}`;
    }
    appleMaps = `https://maps.apple.com/?q=${query}`;
    yandexMaps = `https://yandex.com/maps/?text=${query}`;
  }

  return { googleMaps, appleMaps, yandexMaps };
}
