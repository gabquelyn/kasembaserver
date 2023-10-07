import axios from "axios";
export async function checkDistance(
  source: number,
  destination: { lat: number; lng: number }
): Promise<number> {
  let distance: number = Infinity;

  try {
    const sourceRes = await axios.get(
      `https://api.geocod.io/v1.7/geocode?postal_code=${source}&api_key=${process.env.GEOCODIO_API_KEY}`
    );
    const sourcePositon = sourceRes.data;
    if (sourcePositon.results.length > 0) {
      const { lat, lng } = sourcePositon.results[0].location;
      const _distance = calculateDistance(
        lat,
        lng,
        destination.lat,
        destination.lng
      );
      console.log(_distance);
      distance = _distance;
    }
  } catch (err) {
    console.log(err);
  }
  return distance;
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  // if the positions are the same
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }
  // Radius of the Earth in kilometers
  const earthRadius = 6371;

  // Convert latitude and longitude from degrees to radians
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lon1Rad = (lon1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const lon2Rad = (lon2 * Math.PI) / 180;

  // Differences in latitude and longitude
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  // Haversine formula
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Calculate the distance
  const distance = earthRadius * c;

  return distance; // Distance in kilometers
}

