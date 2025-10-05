import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Line, Bar } from "react-chartjs-2";
import { Tooltip as ReactTooltip } from "react-tooltip";
import * as WeatherService from "../API/WeatherService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  BarElement,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

// Default WMO weather code descriptions
const defaultWmoDescriptions = {
  0: { day: { description: "Clear sky", icon: "bi-brightness-high" }, night: { description: "Clear sky", icon: "bi-moon" } },
  1: { day: { description: "Mainly clear", icon: "bi-brightness-high" }, night: { description: "Mainly clear", icon: "bi-moon-stars" } },
  2: { day: { description: "Partly cloudy", icon: "bi-cloud-sun" }, night: { description: "Partly cloudy", icon: "bi-cloud-moon" } },
  3: { day: { description: "Overcast", icon: "bi-cloudy" }, night: { description: "Overcast", icon: "bi-cloudy-fill" } },
  45: { day: { description: "Fog", icon: "bi-cloud-fog" }, night: { description: "Fog", icon: "bi-cloud-fog" } },
  48: { day: { description: "Depositing rime fog", icon: "bi-cloud-fog2" }, night: { description: "Depositing rime fog", icon: "bi-cloud-fog2" } },
  51: { day: { description: "Light drizzle", icon: "bi-cloud-drizzle" }, night: { description: "Light drizzle", icon: "bi-cloud-drizzle" } },
  53: { day: { description: "Moderate drizzle", icon: "bi-cloud-drizzle" }, night: { description: "Moderate drizzle", icon: "bi-cloud-drizzle" } },
  55: { day: { description: "Dense drizzle", icon: "bi-cloud-drizzle" }, night: { description: "Dense drizzle", icon: "bi-cloud-drizzle" } },
  56: { day: { description: "Light freezing drizzle", icon: "bi-cloud-sleet" }, night: { description: "Light freezing drizzle", icon: "bi-cloud-sleet" } },
  57: { day: { description: "Dense freezing drizzle", icon: "bi-cloud-sleet" }, night: { description: "Dense freezing drizzle", icon: "bi-cloud-sleet" } },
  61: { day: { description: "Slight rain", icon: "bi-cloud-rain" }, night: { description: "Slight rain", icon: "bi-cloud-rain" } },
  63: { day: { description: "Moderate rain", icon: "bi-cloud-rain-fill" }, night: { description: "Moderate rain", icon: "bi-cloud-rain-fill" } },
  65: { day: { description: "Heavy rain", icon: "bi-cloud-rain-heavy" }, night: { description: "Heavy rain", icon: "bi-cloud-rain-heavy" } },
  66: { day: { description: "Light freezing rain", icon: "bi-cloud-sleet" }, night: { description: "Light freezing rain", icon: "bi-cloud-sleet" } },
  67: { day: { description: "Heavy freezing rain", icon: "bi-cloud-sleet-fill" }, night: { description: "Heavy freezing rain", icon: "bi-cloud-sleet-fill" } },
  71: { day: { description: "Slight snow fall", icon: "bi-cloud-snow" }, night: { description: "Slight snow fall", icon: "bi-cloud-snow" } },
  73: { day: { description: "Moderate snow fall", icon: "bi-cloud-snow-fill" }, night: { description: "Moderate snow fall", icon: "bi-cloud-snow-fill" } },
  75: { day: { description: "Heavy snow fall", icon: "bi-cloud-snow-heavy" }, night: { description: "Heavy snow fall", icon: "bi-cloud-snow-heavy" } },
  77: { day: { description: "Snow grains", icon: "bi-snow" }, night: { description: "Snow grains", icon: "bi-snow" } },
  80: { day: { description: "Slight rain showers", icon: "bi-cloud-drizzle" }, night: { description: "Slight rain showers", icon: "bi-cloud-drizzle" } },
  81: { day: { description: "Moderate rain showers", icon: "bi-cloud-rain" }, night: { description: "Moderate rain showers", icon: "bi-cloud-rain" } },
  82: { day: { description: "Violent rain showers", icon: "bi-cloud-rain-heavy" }, night: { description: "Violent rain showers", icon: "bi-cloud-rain-heavy" } },
  85: { day: { description: "Slight snow showers", icon: "bi-cloud-snow" }, night: { description: "Slight snow showers", icon: "bi-cloud-snow" } },
  86: { day: { description: "Heavy snow showers", icon: "bi-cloud-snow-heavy" }, night: { description: "Heavy snow showers", icon: "bi-cloud-snow-heavy" } },
  95: { day: { description: "Thunderstorm", icon: "bi-cloud-lightning" }, night: { description: "Thunderstorm", icon: "bi-cloud-lightning" } },
  96: { day: { description: "Thunderstorm with slight hail", icon: "bi-cloud-lightning-rain" }, night: { description: "Thunderstorm with slight hail", icon: "bi-cloud-lightning-rain" } },
  99: { day: { description: "Thunderstorm with heavy hail", icon: "bi-cloud-lightning-rain-fill" }, night: { description: "Thunderstorm with heavy hail", icon: "bi-cloud-lightning-rain-fill" } }
};

export default function WeatherPage() {
  // State management
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState(null);
  const [hourly, setHourly] = useState(null);
  const [daily, setDaily] = useState(null);
  const [seasonal, setSeasonal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cityMeta, setCityMeta] = useState("");
  const [voices, setVoices] = useState([]);
  const [voiceIndex, setVoiceIndex] = useState(0);
  const [ttsLang, setTtsLang] = useState("en-US");
  const [wmoDescriptions, setWmoDescriptions] = useState(
    defaultWmoDescriptions
  );
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Refs for graph containers
  const c2Ref = useRef(null);
  const c3Ref = useRef(null);
  const c4Ref = useRef(null);
  const seasonRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const utterRef = useRef(null);

  // Helper to run scripts after injecting HTML from backend
  const runScripts = useCallback((container) => {
    const scripts = Array.from(container.querySelectorAll("script"));
    scripts.forEach((s) => {
      try {
        const newScript = document.createElement("script");
        if (s.src) newScript.src = s.src;
        else newScript.textContent = s.textContent;
        document.body.appendChild(newScript);
        document.body.removeChild(newScript);
      } catch (err) {
        console.warn("Error running injected script:", err);
      }
    });
  }, []);

  // TTS Functions
  const speak = useCallback(
    (text, lang = ttsLang, voiceIdx = voiceIndex) => {
      if (!text) return;
      stopSpeech();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      if (voices.length > 0) u.voice = voices[voiceIdx];
      utterRef.current = u;
      u.onend = () => setIsSpeaking(false);
      u.onstart = () => setIsSpeaking(true);
      synthRef.current.speak(u);
    },
    [ttsLang, voiceIndex, voices]
  );

  const stopSpeech = useCallback(() => {
    if (synthRef.current?.speaking || synthRef.current?.paused) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const cycleLanguage = useCallback(() => {
    const pool = ["en-US", "hi-IN"];
    const idx = (pool.indexOf(ttsLang) + 1) % pool.length;
    setTtsLang(pool[idx]);
  }, [ttsLang]);

  const cycleVoice = useCallback(() => {
    if (!voices.length) return;
    setVoiceIndex((i) => (i + 1) % voices.length);
  }, [voices]);

  // Weather Data Functions
  const fetchAllForCoords = useCallback(
    async (latitude, longitude, nameHint = "") => {
      setLoading(true);
      try {
        const [cur, h, d, s] = await Promise.all([
          WeatherService.fetchCurrentWeatherData(latitude, longitude),
          WeatherService.fetchHourlyWeather(latitude, longitude),
          WeatherService.fetchDailyWeather(latitude, longitude),
          WeatherService.fetchSeasonalWeather(latitude, longitude),
        ]);

        setCurrent(cur);
        setHourly(h);
        setDaily(d);
        setSeasonal(s);

        // Get city name
        let determinedCityMeta = nameHint;
        if (!nameHint && cur) {
          const reverseGeo = await WeatherService.reverseGeocode(
            latitude,
            longitude
          );
          if (reverseGeo) {
            determinedCityMeta = reverseGeo.city;
          } else if (cur.name) {
            determinedCityMeta = cur.name;
          }
        } else if (cur?.name) {
          determinedCityMeta = cur.name;
        }
        setCityMeta(determinedCityMeta || "");

        // Generate graphs
        if (h && d) {
          const prepared = prepareGraphPayload(h, d);
          try {
            const backendResponse =
              await WeatherService.generateHourlyGraphsBackend(prepared);
            injectBackendGraphs(backendResponse);
          } catch (err) {
            console.warn("Backend hourly graph generation failed:", err);
          }
        }

        if (s) {
          const seasonalDataFormatted = {
            date: s.daily?.time || [],
            tempMax: s.daily?.temperature_2m_max_member01 || [],
            tempMin: s.daily?.temperature_2m_min_member01 || [],
            windSpeed: s.daily?.wind_speed_10m_max_member01 || [],
            rain: s.daily?.precipitation_sum_member01 || [],
          };
          try {
            const seasonalBackendResponse =
              await WeatherService.generateSeasonalGraphsBackend(
                seasonalDataFormatted
              );
            if (seasonalBackendResponse?.graph_html && seasonRef.current) {
              seasonRef.current.innerHTML = seasonalBackendResponse.graph_html;
              runScripts(seasonRef.current);
            }
          } catch (err) {
            console.warn("Backend seasonal graph generation failed:", err);
          }
        }
      } catch (err) {
        console.error("Error fetching all weather data:", err);
      } finally {
        setLoading(false);
      }
    },
    [runScripts]
  );

  const handleSearch = useCallback(
    async (locationString = query) => {
      if (!locationString) {
        console.warn("Search query is empty.");
        return;
      }
      setLoading(true);
      try {
        const coordsObj = await WeatherService.fetchLatLon(locationString);
        if (!coordsObj) {
          console.error("Location not found for:", locationString);
          return;
        }
        await fetchAllForCoords(
          coordsObj.latitude,
          coordsObj.longitude,
          locationString
        );
      } catch (err) {
        console.error("Error in search operation:", err);
      } finally {
        setLoading(false);
      }
    },
    [query, fetchAllForCoords]
  );

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await fetchAllForCoords(latitude, longitude);
        setLoading(false);
      },
      (err) => {
        console.error("Error getting user location:", err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [fetchAllForCoords]);

  const startMicSearch = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn(
        "Speech recognition is not supported in this browser. Please use Chrome."
      );
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = async (ev) => {
      const transcript = ev.results[0][0].transcript.trim();
      setQuery(transcript);
      await handleSearch(transcript);
    };
    rec.onerror = (e) => console.error("Speech recognition error:", e);
    rec.start();
  }, [handleSearch]);

  // Helper Functions
  const formatTimeLabel = useCallback((iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }, []);

  const formatDateLabel = useCallback((iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  const prepareGraphPayload = useCallback(
    (hourlyData, dailyData) => {
      const now = new Date();
      const times = hourlyData.hourly?.time || [];
      let startIndex = 0;
      for (let i = 0; i < times.length; i++) {
        if (new Date(times[i]) >= now) {
          startIndex = i;
          break;
        }
      }

      const dTime = dailyData.daily?.time || [];
      const tempDailyMax = dailyData.daily?.temperature_2m_max || [];
      const tempDailyMin = dailyData.daily?.temperature_2m_min || [];
      const dailyRainChance =
        dailyData.daily?.precipitation_probability_max || [];
      const dailySun = dailyData.daily?.sunshine_duration || [];
      const dailyWind = dailyData.daily?.wind_speed_10m_max || [];

      const parsed = [];
      for (
        let i = startIndex;
        i < Math.min(startIndex + 24, times.length);
        i++
      ) {
        const hourlyIndex = i;
        const dateObj = new Date(times[i]);
        const dateStr = dateObj.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "numeric",
          year: "numeric",
        });

        const dailyIdxOffset = Math.floor(
          (new Date(times[hourlyIndex]).setHours(0, 0, 0, 0) -
            new Date(dTime[0]).setHours(0, 0, 0, 0)) /
            (1000 * 60 * 60 * 24)
        );
        const effectiveDailyIndex = Math.max(
          0,
          Math.min(dailyIdxOffset, dTime.length - 1)
        );

        parsed.push({
          time: formatTimeLabel(times[hourlyIndex]),
          temperature: hourlyData.hourly?.temperature_2m?.[hourlyIndex] || 0,
          cloudCover: hourlyData.hourly?.cloud_cover?.[hourlyIndex] || 0,
          rainChance:
            hourlyData.hourly?.precipitation_probability?.[hourlyIndex] ||
            hourlyData.hourly?.precipitation?.[hourlyIndex] ||
            0,
          windSpeed: hourlyData.hourly?.wind_speed_10m?.[hourlyIndex] || 0,
          humidity: hourlyData.hourly?.relative_humidity_2m?.[hourlyIndex] || 0,
          soil_moisture_0_to_1cm:
            hourlyData.hourly?.soil_moisture_0_to_1cm?.[hourlyIndex] || 0,
          soil_temperature_18cm:
            hourlyData.hourly?.soil_temperature_18cm?.[hourlyIndex] || 0,
          sunshine_duration: (dailySun[effectiveDailyIndex]
            ? dailySun[effectiveDailyIndex] / 3600
            : 0
          ).toFixed(2),
          tempDailyMax: tempDailyMax[effectiveDailyIndex] || 0,
          tempDailyMin: tempDailyMin[effectiveDailyIndex] || 0,
          date: dateStr,
          windspeedF: dailyWind[effectiveDailyIndex] || 0,
          rainChanceF: dailyRainChance[effectiveDailyIndex] || 0,
          sunshineF: ((dailySun[effectiveDailyIndex] || 0) / 3600).toFixed(2),
        });
      }
      return parsed;
    },
    [formatTimeLabel]
  );

  const injectBackendGraphs = useCallback(
    (payload) => {
      try {
        // Clear previous content
        if (c2Ref.current) c2Ref.current.innerHTML = "";
        if (c3Ref.current) c3Ref.current.innerHTML = "";
        if (c4Ref.current) c4Ref.current.innerHTML = "";

        // Graph 1
        if (payload?.graph_html && c2Ref.current) {
          const div = document.createElement("div");
          div.innerHTML = payload.graph_html;
          c2Ref.current.appendChild(div);
          runScripts(div);
        }

        // Graph 2 and Pie Chart
        if (payload?.graph_html2 && c3Ref.current) {
          const div = document.createElement("div");
          div.innerHTML = payload.graph_html2;
          c3Ref.current.appendChild(div);
          runScripts(div);
        }

        if (payload?.pie_chart_html && c3Ref.current) {
          const pie = document.createElement("div");
          pie.innerHTML = payload.pie_chart_html;
          c3Ref.current.appendChild(pie);
          runScripts(pie);
        }

        // Graph 3 & 4
        if (payload?.graph_html3 && c4Ref.current) {
          const div = document.createElement("div");
          div.innerHTML = payload.graph_html3;
          c4Ref.current.appendChild(div);
          runScripts(div);
        }

        if (payload?.graph_html4 && c4Ref.current) {
          const el = document.createElement("div");
          el.innerHTML = payload.graph_html4;
          c4Ref.current.appendChild(el);
          runScripts(el);
        }
      } catch (err) {
        console.warn("Error injecting backend graphs:", err);
      }
    },
    [runScripts]
  );

  const build24HourChartData = useCallback(() => {
    if (!hourly) return { labels: [], datasets: [] };

    const now = new Date();
    const times = hourly.hourly?.time || [];
    let startIndex = 0;
    for (let i = 0; i < times.length; i++) {
      if (new Date(times[i]) >= now) {
        startIndex = i;
        break;
      }
    }

    const sliceTimes = times.slice(startIndex, startIndex + 24);
    const labels = sliceTimes.map((t) => formatTimeLabel(t));
    const temps =
      hourly.hourly?.temperature_2m?.slice(startIndex, startIndex + 24) || [];
    const precip = (
      hourly.hourly?.precipitation ||
      hourly.hourly?.precipitation_probability ||
      []
    ).slice(startIndex, startIndex + 24);

    return {
      labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temps,
          borderColor: "rgb(31, 142, 241)",
          backgroundColor: "rgba(31, 142, 241, 0.12)",
          yAxisID: "y",
          tension: 0.25,
          pointRadius: 2,
        },
        {
          label: "Precipitation (mm)",
          data: precip,
          type: "bar",
          backgroundColor: "rgba(16, 185, 129, 0.6)",
          yAxisID: "y1",
        },
      ],
    };
  }, [hourly, formatTimeLabel]);

  const buildCurrentReport = useCallback(() => {
    if (!current) return "No weather data available for this location.";

    const name = cityMeta || current.name || "this location";
    const description = current.weather?.[0]?.description || "clear skies";
    const temp = Math.round(current.main?.temp ?? 0);
    const humidity = current.main?.humidity ?? "unknown";
    const wind = current.wind
      ? `${current.wind.speed} meters per second`
      : "calm";
    const rain1hr = current.rain?.["1h"]
      ? `${current.rain["1h"]} mm rain in last 1 hour`
      : "no rain in last 1 hour";
    const cloudiness = current.clouds?.all ?? "unknown";

    const baseReport = `Weather at ${name}. ${description}. Temperature ${temp} degrees Celsius. Humidity ${humidity} percent. Wind ${wind}.`;

    if (hourly && hourly.hourly?.time?.length > 0) {
      const currentHourIndex = new Date().getHours();
      const hTemp = Math.round(
        hourly.hourly?.temperature_2m?.[currentHourIndex] ?? 0
      );
      const hPrecip = hourly.hourly?.precipitation?.[currentHourIndex] ?? 0;
      const hWindSpeed = hourly.hourly?.wind_speed_10m?.[currentHourIndex] ?? 0;
      const hHumidity =
        hourly.hourly?.relative_humidity_2m?.[currentHourIndex] ?? 0;
      const hSoilMoisture = (
        hourly.hourly?.soil_moisture_0_to_1cm?.[currentHourIndex] * 100 ?? 0
      ).toFixed(1);
      const hSoilTemp =
        hourly.hourly?.soil_temperature_18cm?.[currentHourIndex] ?? 0;
      const hVisibility = hourly.hourly?.visibility?.[currentHourIndex] ?? 0;
      const hCloudCover = hourly.hourly?.cloud_cover?.[currentHourIndex] ?? 0;

      return `Hello Farmer Friend! Here is today's weather update for ${name}: The current temperature is ${hTemp}°C. Humidity is ${hHumidity} percent. Wind speed is ${hWindSpeed} meters per second. Cloud cover is ${hCloudCover} percent. Rain forecast for the current hour: ${hPrecip} millimeters. Soil moisture is ${hSoilMoisture} percent. Soil temperature at 18 cm depth is ${hSoilTemp}°C. Visibility is ${hVisibility} meters.`;
    }

    return baseReport;
  }, [current, hourly, cityMeta]);

  const buildOffsetReport = useCallback(
    (hours = 5) => {
      if (!hourly) return "Hourly forecast not available.";

      const now = new Date();
      const targetTime = new Date(now.getTime() + hours * 3600 * 1000);

      const times = hourly.hourly?.time || [];
      let bestIdx = 0;
      let minDiff = Infinity;

      for (let i = 0; i < times.length; i++) {
        const dataPointTime = new Date(times[i]);
        const diff = Math.abs(dataPointTime.getTime() - targetTime.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          bestIdx = i;
        }
      }

      const t = times[bestIdx];
      const temp = Math.round(hourly.hourly?.temperature_2m?.[bestIdx] ?? 0);
      const precip = hourly.hourly?.precipitation?.[bestIdx] ?? 0;
      const wind = hourly.hourly?.wind_speed_10m?.[bestIdx] ?? 0;
      const cloud = hourly.hourly?.cloud_cover?.[bestIdx] ?? 0;
      const soilMoisture = (
        hourly.hourly?.soil_moisture_0_to_1cm?.[bestIdx] * 100 ?? 0
      ).toFixed(1);
      const soilTemp = hourly.hourly?.soil_temperature_18cm?.[bestIdx] ?? 0;
      const humidity = hourly.hourly?.relative_humidity_2m?.[bestIdx] ?? 0;
      const visibility = hourly.hourly?.visibility?.[bestIdx] ?? 0;

      const weatherCode = hourly.hourly?.weather_code?.[bestIdx];
      const isDaytime =
        new Date(t).getHours() >= 6 && new Date(t).getHours() < 18;
      const description =
        wmoDescriptions?.[weatherCode]?.[isDaytime ? "day" : "night"]
          ?.description || "unknown";

      const timeLabel = formatTimeLabel(t);
      const dateLabel = formatDateLabel(t);

      if (hours === 24) {
        if (!daily || !daily.daily?.time || daily.daily.time.length < 2) {
          return "Daily forecast for tomorrow not available.";
        }

        const tomorrowIndex = 1;
        const tomorrowDate = daily.daily.time[tomorrowIndex];
        const tomorrowMaxTemp =
          daily.daily?.temperature_2m_max?.[tomorrowIndex] ?? "N/A";
        const tomorrowMinTemp =
          daily.daily?.temperature_2m_min?.[tomorrowIndex] ?? "N/A";
        const tomorrowRainSum =
          daily.daily?.precipitation_sum?.[tomorrowIndex] ?? "N/A";
        const tomorrowWindMax =
          daily.daily?.wind_speed_10m_max?.[tomorrowIndex] ?? "N/A";
        const tomorrowWeatherCode = daily.daily?.weather_code?.[tomorrowIndex];
        const tomorrowDescription =
          wmoDescriptions?.[tomorrowWeatherCode]?.day?.description || "unknown";

        return `Hello Farmer Friend! Here is the weather forecast for ${formatDateLabel(
          tomorrowDate
        )}: Maximum temperature ${tomorrowMaxTemp}°C, minimum temperature ${tomorrowMinTemp}°C. Total rainfall ${tomorrowRainSum} millimeters. Maximum wind speed ${tomorrowWindMax} meters per second. Weather condition: ${tomorrowDescription}. Please plan your farming activities accordingly. Thank you!`;
      } else {
        return `At ${timeLabel} on ${dateLabel}, expected temperature ${temp} degrees Celsius. Precipitation ${precip} millimeters. Wind speed ${wind} meters per second. Cloud cover ${cloud} percent. Soil moisture ${soilMoisture} percent. Soil temperature ${soilTemp}°C. Humidity ${humidity} percent. Visibility ${visibility} meters. Weather condition: ${description}.`;
      }
    },
    [hourly, daily, formatTimeLabel, formatDateLabel, wmoDescriptions]
  );

  // Component Effects
  useEffect(() => {
    const loadVoices = () => {
      const vs = synthRef.current.getVoices() || [];
      setVoices(vs);
      if (vs.length > 0) setVoiceIndex(0);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    WeatherService.loadWeatherCodeDescriptions()
      .then((data) => {
        if (data) setWmoDescriptions(data);
      })
      .catch((err) => console.error("Failed to load WMO descriptions:", err));

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      stopSpeech();
    };
  }, [stopSpeech]);

  // Initial load effect for user's location
  useEffect(() => {
    useMyLocation();
  }, [useMyLocation]);

  // Utility for getting weather icon and styling
  const getWeatherStyle = useCallback(
    (weatherCode, isDaytime, temperature, precipitation, windSpeed) => {
      const weatherDetail = wmoDescriptions[weatherCode];
      let description = "Unknown";
      let icon = "bi-question-circle";
      let bgColor = "bg-blue-200";
      let textColor = "text-slate-900";

      if (weatherDetail) {
        const dailyOrNightly = isDaytime
          ? weatherDetail.day
          : weatherDetail.night;
        description = dailyOrNightly.description;
        icon = dailyOrNightly.icon;

        if (precipitation > 0.5) {
          bgColor = "bg-blue-600";
          textColor = "text-white";
        } else if (windSpeed > 10) {
          bgColor = "bg-slate-500";
          textColor = "text-white";
        } else if (
          description.includes("clear") ||
          description.includes("sunny")
        ) {
          bgColor = isDaytime ? "bg-yellow-200" : "bg-indigo-700";
          textColor = isDaytime ? "text-slate-900" : "text-white";
        } else if (
          description.includes("cloud") ||
          description.includes("overcast")
        ) {
          bgColor = isDaytime ? "bg-slate-300" : "bg-slate-600";
          textColor = "text-slate-900";
        } else if (
          description.includes("drizzle") ||
          description.includes("rain")
        ) {
          bgColor = isDaytime ? "bg-blue-400" : "bg-blue-700";
          textColor = "text-white";
        } else if (
          description.includes("snow") ||
          description.includes("sleet")
        ) {
          bgColor = "bg-sky-100";
          textColor = "text-slate-900";
        } else if (description.includes("thunderstorm")) {
          bgColor = "bg-purple-700";
          textColor = "text-white";
        } else if (description.includes("fog")) {
          bgColor = "bg-gray-400";
          textColor = "text-slate-900";
        }
      }

      return { description, icon, bgColor, textColor };
    },
    [wmoDescriptions]
  );

  // UI Components
  const SmallInfoGrid = () => {
    const items = [
      {
        title: "Weather Info",
        subtitle: "Temp, humidity, and more",
        icon: "bi-cloud-sun",
        bg: "bg-blue-100",
      },
      {
        title: "Irrigation",
        subtitle: "Optimal water usage",
        icon: "bi-droplet-fill",
        bg: "bg-green-100",
      },
      {
        title: "Temperature",
        subtitle: "Daily and hourly updates",
        icon: "bi-thermometer-sun",
        bg: "bg-indigo-100",
      },
      {
        title: "Location",
        subtitle: "GPS-based weather",
        icon: "bi-geo-alt-fill",
        bg: "bg-amber-100",
      },
      {
        title: "Crop Info",
        subtitle: "Recommendations for crops",
        icon: "bi-tree-fill",
        bg: "bg-emerald-100",
      },
      {
        title: "Wind",
        subtitle: "Monitor wind patterns",
        icon: "bi-wind",
        bg: "bg-lime-100",
      },
      {
        title: "Rainfall",
        subtitle: "Rain predictions",
        icon: "bi-cloud-rain",
        bg: "bg-sky-100",
      },
      {
        title: "Night",
        subtitle: "Monitor night weather",
        icon: "bi-moon-stars",
        bg: "bg-slate-100",
      },
      {
        title: "Soil Temp",
        subtitle: "Check soil temperature",
        icon: "bi-thermometer-half",
        bg: "bg-amber-100",
      },
      {
        title: "Analytics",
        subtitle: "Detailed insights",
        icon: "bi-bar-chart-fill",
        bg: "bg-cyan-100",
      },
    ];

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {items.map((it, idx) => (
          <motion.div
            key={idx}
            className={`${it.bg} rounded-xl shadow-md p-4 flex flex-col items-center justify-center transition-all duration-300`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className={`bi ${it.icon} text-3xl mb-2 text-blue-600`} />
            <h6 className="font-semibold text-sm text-center">{it.title}</h6>
            <p className="text-xs text-center text-gray-600">{it.subtitle}</p>
          </motion.div>
        ))}
      </div>
    );
  };

  const HourlyCarousel = () => {
    if (!hourly || !hourly.hourly?.time || hourly.hourly.time.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <i className="bi bi-cloud-slash text-4xl mb-2" />
          <p>Hourly data not available</p>
        </div>
      );
    }

    const now = new Date();
    const currentHour = now.getHours();
    const cards = [];

    for (let i = 0; i < 24; i++) {
      const dataIndex = (currentHour + i) % hourly.hourly.time.length;
      const t = hourly.hourly.time[dataIndex];
      const date = new Date(t);
      const isDaytime = date.getHours() >= 6 && date.getHours() < 18;

      const weatherCode = hourly.hourly.weather_code[dataIndex];
      const temp = Math.round(hourly.hourly.temperature_2m[dataIndex] ?? 0);
      const precip = hourly.hourly.precipitation?.[dataIndex] ?? 0;
      const windSpeed = hourly.hourly.wind_speed_10m[dataIndex] ?? 0;
      const windDir = hourly.hourly.wind_direction_10m?.[dataIndex] ?? 0;
      const cloudCover = hourly.hourly.cloud_cover?.[dataIndex] ?? 0;
      const humidity = hourly.hourly.relative_humidity_2m?.[dataIndex] ?? 0;

      const { description, icon, bgColor, textColor } = getWeatherStyle(
        weatherCode,
        isDaytime,
        temp,
        precip,
        windSpeed
      );

      cards.push(
        <motion.div
          key={`${t}-${dataIndex}`}
          className={`flex-shrink-0 w-48 p-4 rounded-xl shadow-md ${bgColor} ${textColor} mx-2`}
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-center">
            <h6 className="font-semibold">{formatTimeLabel(t)}</h6>
            <p className="text-sm">{formatDateLabel(t)}</p>
          </div>
          <div className="flex flex-col items-center my-3">
            <i className={`bi ${icon} text-4xl mb-2`} />
            <p className="text-2xl font-bold">{temp}°C</p>
          </div>
          <div className="text-xs space-y-1">
            <p className="font-medium">{description}</p>
            <p>Rain: {precip} mm</p>
            <p>
              Wind: {windSpeed} m/s (
              {WeatherService.getCardinalDirection(windDir)})
            </p>
            <p>Clouds: {cloudCover}%</p>
            <p>Humidity: {humidity}%</p>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="overflow-x-auto py-4 scrollbar-hide">
        <div className="flex space-x-4 px-4">{cards}</div>
      </div>
    );
  };

  const DailyCards = () => {
    if (!daily || !daily.daily?.time || daily.daily.time.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <i className="bi bi-calendar-x text-4xl mb-2" />
          <p>Daily forecast not available</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {daily.daily.time.slice(0, 7).map((date, idx) => {
          const isToday = idx === 0;
          const weatherCode = daily.daily.weather_code[idx];
          const maxTemp = Math.round(daily.daily.temperature_2m_max[idx] ?? 0);
          const minTemp = Math.round(daily.daily.temperature_2m_min[idx] ?? 0);
          const precip = daily.daily.precipitation_sum?.[idx] ?? 0;
          const windSpeed = daily.daily.wind_speed_10m_max?.[idx] ?? 0;
          const sunrise = daily.daily.sunrise?.[idx];
          const sunset = daily.daily.sunset?.[idx];

          const { description, icon, bgColor, textColor } = getWeatherStyle(
            weatherCode,
            true,
            maxTemp,
            precip,
            windSpeed
          );

          return (
            <motion.div
              key={date}
              className={`rounded-xl shadow-md p-4 ${bgColor} ${textColor}`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">
                  {isToday ? "Today" : formatDateLabel(date)}
                </h3>
                <i className={`bi ${icon} text-3xl`} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>High:</span>
                  <span className="font-semibold">{maxTemp}°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Low:</span>
                  <span className="font-semibold">{minTemp}°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Precipitation:</span>
                  <span className="font-semibold">{precip} mm</span>
                </div>
                <div className="flex justify-between">
                  <span>Wind:</span>
                  <span className="font-semibold">{windSpeed} m/s</span>
                </div>
                {sunrise && sunset && (
                  <>
                    <div className="flex justify-between">
                      <span>Sunrise:</span>
                      <span className="font-semibold">
                        {formatTimeLabel(sunrise)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunset:</span>
                      <span className="font-semibold">
                        {formatTimeLabel(sunset)}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <p className="mt-2 text-sm italic">{description}</p>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const CurrentWeatherCard = () => {
    if (!current) {
      return (
        <div className="text-center py-8 text-gray-500">
          <i className="bi bi-cloud-slash text-4xl mb-2" />
          <p>Current weather data not available</p>
        </div>
      );
    }

    const weatherCode = current.weather?.[0]?.id ?? 0;
    const isDaytime = new Date().getHours() >= 6 && new Date().getHours() < 18;
    const temp = Math.round(current.main?.temp ?? 0);
    const precip = current.rain?.["1h"] ?? 0;
    const windSpeed = current.wind?.speed ?? 0;
    const humidity = current.main?.humidity ?? 0;
    const pressure = current.main?.pressure ?? 0;
    const visibility = current.visibility ? current.visibility / 1000 : 0;

    const { description, icon, bgColor, textColor } = getWeatherStyle(
      weatherCode,
      isDaytime,
      temp,
      precip,
      windSpeed
    );

    return (
      <div className={`rounded-xl shadow-lg p-6 ${bgColor} ${textColor}`}>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">
              {cityMeta || current.name || "Current Location"}
            </h2>
            <p className="text-lg">{description}</p>
            <p className="text-5xl font-bold my-4">{temp}°C</p>
          </div>
          <i className={`bi ${icon} text-6xl`} />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white bg-opacity-20 p-3 rounded-lg">
            <p className="flex items-center">
              <i className="bi bi-droplet mr-2" /> Humidity: {humidity}%
            </p>
          </div>
          <div className="bg-white bg-opacity-20 p-3 rounded-lg">
            <p className="flex items-center">
              <i className="bi bi-wind mr-2" /> Wind: {windSpeed} m/s
            </p>
          </div>
          <div className="bg-white bg-opacity-20 p-3 rounded-lg">
            <p className="flex items-center">
              <i className="bi bi-speedometer2 mr-2" /> Pressure: {pressure} hPa
            </p>
          </div>
          <div className="bg-white bg-opacity-20 p-3 rounded-lg">
            <p className="flex items-center">
              <i className="bi bi-eye mr-2" /> Visibility: {visibility} km
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={() => speak(buildCurrentReport())}
            className="bg-white bg-opacity-30 hover:bg-opacity-40 px-4 py-2 rounded-full flex items-center"
          >
            <i className="bi bi-megaphone mr-2" /> Current Report
          </button>
          <button
            onClick={() => speak(buildOffsetReport(5))}
            className="bg-white bg-opacity-30 hover:bg-opacity-40 px-4 py-2 rounded-full flex items-center"
          >
            <i className="bi bi-clock mr-2" /> 5-Hour Forecast
          </button>
          <button
            onClick={() => speak(buildOffsetReport(24))}
            className="bg-white bg-opacity-30 hover:bg-opacity-40 px-4 py-2 rounded-full flex items-center"
          >
            <i className="bi bi-calendar mr-2" /> Tomorrow's Forecast
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-16 min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Farm Weather Dashboard
            </h1>
            <p className="text-gray-600">
              Real-time weather data and forecasts for agricultural planning
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search location..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
              >
                <i
                  className={`bi ${
                    loading ? "bi-arrow-clockwise animate-spin" : "bi-search"
                  }`}
                />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={startMicSearch}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center"
              >
                <i className="bi bi-mic" />
              </button>
              <button
                onClick={useMyLocation}
                className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center"
              >
                <i className="bi bi-geo-alt" />
              </button>
              <button
                onClick={cycleLanguage}
                className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center"
              >
                <i className="bi bi-translate" />
              </button>
              <button
                onClick={cycleVoice}
                className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 flex items-center"
              >
                <i className="bi bi-person-voice" />
              </button>
              {isSpeaking && (
                <button
                  onClick={stopSpeech}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center"
                >
                  <i className="bi bi-stop-circle" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Current Weather */}
          <CurrentWeatherCard />

          {/* Small Info Grid */}
          <SmallInfoGrid />

          {/* Hourly Forecast */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Hourly Forecast</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => speak("Here is the hourly weather forecast")}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <i className="bi bi-megaphone" />
                </button>
              </div>
            </div>
            <HourlyCarousel />
          </div>

          {/* Daily Forecast */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">7-Day Forecast</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => speak("Here is the 7 day weather forecast")}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <i className="bi bi-megaphone" />
                </button>
              </div>
            </div>
            <DailyCards />
          </div>

          {/* Charts Section */}
          <div className="space-y-6">
            {/* 24 Hour Temperature/Precipitation Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">
                24 Hour Temperature & Precipitation
              </h2>
              <div className="h-80">
                <Line
                  data={build24HourChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            let label = context.dataset.label || "";
                            if (label) label += ": ";
                            if (context.parsed.y !== null) {
                              label +=
                                context.datasetIndex === 0
                                  ? `${context.parsed.y}°C`
                                  : `${context.parsed.y} mm`;
                            }
                            return label;
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        type: "linear",
                        display: true,
                        position: "left",
                        title: { display: true, text: "Temperature (°C)" },
                      },
                      y1: {
                        type: "linear",
                        display: true,
                        position: "right",
                        title: { display: true, text: "Precipitation (mm)" },
                        grid: { drawOnChartArea: false },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Backend Generated Charts */}
            <div
              ref={c2Ref}
              className="bg-white rounded-xl shadow-md p-6"
            ></div>
            <div
              ref={c3Ref}
              className="bg-white rounded-xl shadow-md p-6"
            ></div>
            <div
              ref={c4Ref}
              className="bg-white rounded-xl shadow-md p-6"
            ></div>

            {/* Seasonal Forecast */}
            {seasonal && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Seasonal Forecast</h2>
                <div ref={seasonRef}></div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Data provided by various weather APIs. Icons by Bootstrap Icons.
          </p>
          <p className="mt-1">
            Agricultural weather dashboard designed for farmers and growers.
          </p>
        </footer>
      </div>

      {/* Tooltip */}
      <ReactTooltip id="tooltip" place="top" effect="solid" />
    </div>
  );
}
