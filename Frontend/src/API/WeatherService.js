// src/services/WeatherService.js
const API_BASE_URL = import.meta.env.VITE_BACKEND_FLASK_URL;

// Public folder JSON files
const WMO_FILE = "/Constants/WMO.json";
const CITIES_FILE =
  "C:\\Users\\bhish\\OneDrive\\Desktop\\Agriculture_Project\\Backend\\public\\weather\\cities.json";
const countriesFile =
  "C:\\Users\\bhish\\OneDrive\\Desktop\\Agriculture_Project\\Backend\\public\\weather\\countries.json";

/** Get user's location from browser */
export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      (error) => reject(new Error(`Error getting location: ${error.message}`))
    );
  });
}

/** Converts degrees to cardinal direction */
export function getCardinalDirection(deg) {
  if (deg > 337.5 || deg <= 22.5) return "N";
  if (deg > 22.5 && deg <= 67.5) return "NE";
  if (deg > 67.5 && deg <= 112.5) return "E";
  if (deg > 112.5 && deg <= 157.5) return "SE";
  if (deg > 157.5 && deg <= 202.5) return "S";
  if (deg > 202.5 && deg <= 247.5) return "SW";
  if (deg > 247.5 && deg <= 292.5) return "W";
  if (deg > 292.5 && deg <= 337.5) return "NW";
  return "";
}

export function formatUnixTimestamp(unixTimestamp) {
  return new Date(unixTimestamp * 1000).toLocaleString();
}

/** Open-Meteo Geocoding API */
export async function fetchLatLon(location) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    location
  )}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const data = await res.json();
    if (data.results?.length > 0) {
      const { latitude, longitude } = data.results[0];
      return { latitude, longitude };
    }
    return null;
  } catch (err) {
    console.error("fetchLatLon error:", err);
    return null;
  }
}

/** Reverse geocode via OpenCage */
export async function reverseGeocode(latitude, longitude) {
  try {
    const apiKey = import.meta.env.VITE_OPENCAGE_API_KEY;
    const res = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`
    );
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const data = await res.json();
    if (data.results?.length > 0) {
      const loc = data.results[0].components;
      return {
        city: loc.city || loc.town || loc.village,
        country: loc.country || "Unknown",
      };
    }
    return null;
  } catch (err) {
    console.error("reverseGeocode error:", err);
    return null;
  }
}

/** Fetch current weather from OpenWeather */
export async function fetchCurrentWeatherData(lat, lon) {
  try {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("fetchCurrentWeatherData error:", err);
    return null;
  }
}

/** Fetch hourly forecast from Open-Meteo */
export async function fetchHourlyWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m&timezone=Asia/Kolkata&forecast_days=7`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("fetchHourlyWeather error:", err);
    return null;
  }
}

/** Fetch daily forecast */
export async function fetchDailyWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Kolkata&forecast_days=16`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("fetchDailyWeather error:", err);
    return null;
  }
}

/** Fetch seasonal forecast */
export async function fetchSeasonalWeather(lat, lon) {
  const today = new Date();
  const start = today.toISOString().split("T")[0];
  const endDate = new Date(today.setMonth(today.getMonth() + 6))
    .toISOString()
    .split("T")[0];
  const url = `https://seasonal-api.open-meteo.com/v1/seasonal?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Kolkata&start_date=${start}&end_date=${endDate}&time_step=7`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("fetchSeasonalWeather error:", err);
    return null;
  }
}

/** Load WMO codes */
export const loadWeatherCodeDescriptions = async () => {
  try {
    // Use the default descriptions directly instead of fetching from backend
    // This avoids the JSON parsing error when backend returns HTML instead of JSON
    console.log("Using default WMO descriptions");
    return null; // Return null to use the default descriptions defined in component
  } catch (error) {
    console.error("Error loading WMO descriptions:", error);
    return null; // Fallback to default descriptions
  }
};

/** Get cities data */
export async function fetchCityData(cityName) {
  try {
    const res = await fetch(CITIES_FILE);
    if (!res.ok) throw new Error("Failed to load cities.json");
    const data = await res.json();
    for (const state of data) {
      if (
        state.cities.find(
          (c) => c.name.toLowerCase() === cityName.toLowerCase()
        )
      ) {
        return state.name;
      }
    }
    return "";
  } catch (err) {
    console.error("fetchCityData error:", err);
    return "";
  }
}

/** Send hourly data to backend */
// Update the generateHourlyGraphsBackend function to validate data
export async function generateHourlyGraphsBackend(dataSets) {
  try {
    // Validate and clean data
    const cleanedData = dataSets.map(item => ({
      time: item.time || "",
      temperature: item.temperature || 0,
      cloudCover: item.cloudCover || 0,
      rainChance: item.rainChance || 0,
      windSpeed: item.windSpeed || 0,
      humidity: item.humidity || 0,
      soil_moisture_0_to_1cm: item.soil_moisture_0_to_1cm || 0,
      soil_temperature_18cm: item.soil_temperature_18cm || 0,
      sunshine_duration: item.sunshine_duration || 0,
      tempDailyMax: item.tempDailyMax || 0,
      tempDailyMin: item.tempDailyMin || 0,
      date: item.date || "",
      windspeedF: item.windspeedF || 0,
      rainChanceF: item.rainChanceF || 0,
      sunshineF: item.sunshineF || 0
    }));

    const res = await fetch(`${API_BASE_URL}/weather/generateGraph`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanedData),
    });
    if (!res.ok) throw new Error("Backend error generating hourly graphs");
    return await res.json();
  } catch (err) {
    console.error("generateHourlyGraphsBackend error:", err);
    throw err;
  }
}

/** Send seasonal data to backend */
export async function generateSeasonalGraphsBackend(dataSets) {
  try {
    // Validate and clean data
    const cleanedData = {
      date: dataSets.date || [],
      tempMax: dataSets.tempMax?.map((val) => val || 0) || [],
      tempMin: dataSets.tempMin?.map((val) => val || 0) || [],
      windSpeed: dataSets.windSpeed?.map((val) => val || 0) || [],
      rain: dataSets.rain?.map((val) => val || 0) || [],
    };

    const res = await fetch(`${API_BASE_URL}/weather/generateSeasonal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanedData),
    });
    if (!res.ok) throw new Error("Backend error generating seasonal graphs");
    return await res.json();
  } catch (err) {
    console.error("generateSeasonalGraphsBackend error:", err);
    throw err;
  }
}

/** Fetch next hour rain */
export async function fetchRainChance(lat, lon) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation`
    );
    const data = await res.json();
    return data.hourly?.precipitation?.[0] ?? null;
  } catch (err) {
    console.error("fetchRainChance error:", err);
    return null;
  }
}
