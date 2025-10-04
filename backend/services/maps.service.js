// backend/services/maps.service.js
const axios = require("axios");
const captainModel = require("../models/captain.model");

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const OSRM_BASE = "https://router.project-osrm.org";

// Autocomplete (Place Search)
async function getPlaceSuggestions(inputText) {
  const res = await axios.get(`${NOMINATIM_BASE}/search`, {
    params: { q: inputText, format: "json", addressdetails: 1, limit: 5 },
    headers: { "User-Agent": "YourAppName/1.0" }
  });

  return res.data.map((place) => ({
    description: place.display_name,
    placeId: place.place_id,
    lat: place.lat,
    lng: place.lon
  }));
}

// NEW: geocode an address string to coordinates (first match)
async function getAddressCoordinate(address) {
  const res = await axios.get(`${NOMINATIM_BASE}/search`, {
    params: { q: address, format: "json", addressdetails: 1, limit: 1 },
    headers: { "User-Agent": "YourAppName/1.0" }
  });

  if (!res.data || !res.data.length) {
    throw new Error("Address not found");
  }

  const a = res.data[0];
  return {
    description: a.display_name,
    placeId: a.place_id,
    lat: parseFloat(a.lat),
    lng: parseFloat(a.lon)
  };
}

// Reverse Geocoding (kept as-is if you need it)
async function getAddressFromCoordinates(lat, lng) {
  const res = await axios.get(`${NOMINATIM_BASE}/reverse`, {
    params: { lat, lon: lng, format: "json", addressdetails: 1 },
    headers: { "User-Agent": "YourAppName/1.0" }
  });

  return {
    description: res.data.display_name,
    formattedAddress: res.data.display_name,
    lat: parseFloat(res.data.lat),
    lng: parseFloat(res.data.lon)
  };
}

// Low-level route function using coords → RETURNS NUMBERS
async function getDistanceAndTime(startLat, startLng, endLat, endLng) {
  const res = await axios.get(
    `${OSRM_BASE}/route/v1/driving/${startLng},${startLat};${endLng},${endLat}`,
    { params: { overview: "false" } }
  );

  const route = res.data?.routes?.[0];
  if (!route) throw new Error("Route not found");

  const km = route.distance / 1000;     // meters → km
  const mins = route.duration / 60;      // seconds → minutes

  return {
    distance: { text: `${km.toFixed(2)} km`, value: km },           // number
    duration: { text: `${Math.round(mins)} mins`, value: mins }     // number
  };
}

// NEW: accepts addresses OR objects; used by controllers and fare calc
async function getDistanceTime(origin, destination) {
  let o = origin;
  let d = destination;

  // If strings, geocode first
  if (typeof origin === "string") o = await getAddressCoordinate(origin);
  if (typeof destination === "string") d = await getAddressCoordinate(destination);

  if (!o?.lat || !o?.lng || !d?.lat || !d?.lng) {
    throw new Error("Invalid coordinates for distance calculation");
  }

  return getDistanceAndTime(o.lat, o.lng, d.lat, d.lng);
}

async function getCaptainsInTheRadius(lat, lng, radiusKm) {
  console.log("Searching for captains near:", lat, lng, "within", radiusKm, "km");
  const captains = await captainModel.find({
    "location.lat":{$ne: null},
    "location.lng":{$ne: null},
    status: "active"
  });
  console.log("Raw captains data from DB:", captains);

  console.log("Found captains in DB:", captains.length);

  const inRadius = captains.filter(captain => {
    if (!captain.location) return false;
    const distance = getDistanceFromLatLonInKm(
      lat,
      lng,
      captain.location.lat,
      captain.location.lng
    );
    console.log(
      `Captain ${captain.name} at [${captain.location.lat}, ${captain.location.lng}] is ${distance.toFixed(2)} km from pickup`
    );
    return distance <= radiusKm;
  });
  console.log("Captains after filtering:", inRadius.length);

  return inRadius;
}

/**
 * Haversine formula to get distance in km between two lat/lng points
 */
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
      const R = 6371; // Radius of earth in km
      const dLat = deg2rad(lat2 - lat1);
      const dLon = deg2rad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
          Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    function deg2rad(deg) {
      return deg * (Math.PI / 180);
    }


module.exports = {
  // names expected by controllers/services
  getAutoCompleteSuggestions: getPlaceSuggestions,
  getAddressCoordinate,
  getAddressFromCoordinates,
  getDistanceAndTime,
  getDistanceTime,
  getCaptainsInTheRadius
};
