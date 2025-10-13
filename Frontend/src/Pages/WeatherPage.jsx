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

// Import images and GIFs
import campingimg from "/src/assets/images/camping.gif";
import newimg from "/src/assets/images/newi.gif";
import envirimg from "/src/assets/images/environment.gif";
import harvestimg from "/src/assets/images/fruit.gif";
import agribotimg from "/src/assets/images/chat-bot.gif";
import communityimg from "/src/assets/images/communityimg.gif";
import playGif from "/src/assets/images/play.gif";
import pauseGif from "/src/assets/images/play.gif";
import stopGif from "/src/assets/images/play.gif";


import cardcontainerimage1 from "../assets/images/cont1.png";
import cardcontainerimage2 from "../assets/images/cont2.png";
import cardcontainerimage3 from "../assets/images/cont3.png";
import cardcontainerimage4 from "../assets/images/cont4.png";
import image1 from "../assets/images/bg1.png";
import image2 from "../assets/images/bg2.png";
import image3 from "../assets/images/bg3.png";
import image4 from "../assets/images/bg4.png";
import image5 from "../assets/images/bg5.png";
import image6 from "../assets/images/bg6.png";
import image8 from "../assets/images/bg8.png";
import image7 from "../assets/images/bg7.png";
import image9 from "../assets/images/bg9.png";
import image10 from "../assets/images/bg10.png";
import image11 from "../assets/images/bg11.png";
import image12 from "../assets/images/bg12.png";
import image13 from "../assets/images/card1.png";

// Import images for graph cards
import tempRainImg from "/src/assets/images/rain.gif";
import analysisImg from "/src/assets/images/fruit.gif";
import metricsImg from "/src/assets/images/newi.gif";
import analyticsImg from "/src/assets/images/camping.gif";
import seasonalImg from "/src/assets/images/environment.gif";

// Import weather GIFs
import stormgif from "/src/assets/images/storm.gif";
import rain1gif from "/src/assets/images/rain1.gif";
import clearsun from "/src/assets/images/sun.gif";
import nightclouds from "/src/assets/images/night.gif";
import windgif from "/src/assets/images/forest.gif";
import cloudydaygif from "/src/assets/images/cloudy.gif";
import hottempgif from "/src/assets/images/hot.gif";
import clearnight from "/src/assets/images/night1.gif";


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
  0: {
    day: {
      description: "Clear sky",
      icon: "bi-brightness-high",
      gif: clearsun,
    },
    night: { description: "Clear sky", icon: "bi-moon", gif: clearnight },
  },
  1: {
    day: {
      description: "Mainly clear",
      icon: "bi-brightness-high",
      gif: clearsun,
    },
    night: {
      description: "Mainly clear",
      icon: "bi-moon-stars",
      gif: nightclouds,
    },
  },
  2: {
    day: {
      description: "Partly cloudy",
      icon: "bi-cloud-sun",
      gif: cloudydaygif,
    },
    night: {
      description: "Partly cloudy",
      icon: "bi-cloud-moon",
      gif: nightclouds,
    },
  },
  3: {
    day: { description: "Overcast", icon: "bi-cloudy", gif: cloudydaygif },
    night: {
      description: "Overcast",
      icon: "bi-cloudy-fill",
      gif: nightclouds,
    },
  },
  45: {
    day: { description: "Fog", icon: "bi-cloud-fog", gif: cloudydaygif },
    night: { description: "Fog", icon: "bi-cloud-fog", gif: nightclouds },
  },
  48: {
    day: {
      description: "Depositing rime fog",
      icon: "bi-cloud-fog2",
      gif: cloudydaygif,
    },
    night: {
      description: "Depositing rime fog",
      icon: "bi-cloud-fog2",
      gif: nightclouds,
    },
  },
  51: {
    day: {
      description: "Light drizzle",
      icon: "bi-cloud-drizzle",
      gif: rain1gif,
    },
    night: {
      description: "Light drizzle",
      icon: "bi-cloud-drizzle",
      gif: rain1gif,
    },
  },
  53: {
    day: {
      description: "Moderate drizzle",
      icon: "bi-cloud-drizzle",
      gif: rain1gif,
    },
    night: {
      description: "Moderate drizzle",
      icon: "bi-cloud-drizzle",
      gif: rain1gif,
    },
  },
  55: {
    day: {
      description: "Dense drizzle",
      icon: "bi-cloud-drizzle",
      gif: rain1gif,
    },
    night: {
      description: "Dense drizzle",
      icon: "bi-cloud-drizzle",
      gif: rain1gif,
    },
  },
  56: {
    day: {
      description: "Light freezing drizzle",
      icon: "bi-cloud-sleet",
      gif: rain1gif,
    },
    night: {
      description: "Light freezing drizzle",
      icon: "bi-cloud-sleet",
      gif: rain1gif,
    },
  },
  57: {
    day: {
      description: "Dense freezing drizzle",
      icon: "bi-cloud-sleet",
      gif: rain1gif,
    },
    night: {
      description: "Dense freezing drizzle",
      icon: "bi-cloud-sleet",
      gif: rain1gif,
    },
  },
  61: {
    day: { description: "Slight rain", icon: "bi-cloud-rain", gif: rain1gif },
    night: { description: "Slight rain", icon: "bi-cloud-rain", gif: rain1gif },
  },
  63: {
    day: {
      description: "Moderate rain",
      icon: "bi-cloud-rain-fill",
      gif: rain1gif,
    },
    night: {
      description: "Moderate rain",
      icon: "bi-cloud-rain-fill",
      gif: rain1gif,
    },
  },
  65: {
    day: {
      description: "Heavy rain",
      icon: "bi-cloud-rain-heavy",
      gif: stormgif,
    },
    night: {
      description: "Heavy rain",
      icon: "bi-cloud-rain-heavy",
      gif: stormgif,
    },
  },
  66: {
    day: {
      description: "Light freezing rain",
      icon: "bi-cloud-sleet",
      gif: rain1gif,
    },
    night: {
      description: "Light freezing rain",
      icon: "bi-cloud-sleet",
      gif: rain1gif,
    },
  },
  67: {
    day: {
      description: "Heavy freezing rain",
      icon: "bi-cloud-sleet-fill",
      gif: stormgif,
    },
    night: {
      description: "Heavy freezing rain",
      icon: "bi-cloud-sleet-fill",
      gif: stormgif,
    },
  },
  71: {
    day: {
      description: "Slight snow fall",
      icon: "bi-cloud-snow",
      gif: rain1gif,
    },
    night: {
      description: "Slight snow fall",
      icon: "bi-cloud-snow",
      gif: rain1gif,
    },
  },
  73: {
    day: {
      description: "Moderate snow fall",
      icon: "bi-cloud-snow-fill",
      gif: rain1gif,
    },
    night: {
      description: "Moderate snow fall",
      icon: "bi-cloud-snow-fill",
      gif: rain1gif,
    },
  },
  75: {
    day: {
      description: "Heavy snow fall",
      icon: "bi-cloud-snow-heavy",
      gif: stormgif,
    },
    night: {
      description: "Heavy snow fall",
      icon: "bi-cloud-snow-heavy",
      gif: stormgif,
    },
  },
  77: {
    day: { description: "Snow grains", icon: "bi-snow", gif: rain1gif },
    night: { description: "Snow grains", icon: "bi-snow", gif: rain1gif },
  },
  80: {
    day: {
      description: "Slight rain showers",
      icon: "bi-cloud-drizzle",
      gif: rain1gif,
    },
    night: {
      description: "Slight rain showers",
      icon: "bi-cloud-drizzle",
      gif: rain1gif,
    },
  },
  81: {
    day: {
      description: "Moderate rain showers",
      icon: "bi-cloud-rain",
      gif: rain1gif,
    },
    night: {
      description: "Moderate rain showers",
      icon: "bi-cloud-rain",
      gif: rain1gif,
    },
  },
  82: {
    day: {
      description: "Violent rain showers",
      icon: "bi-cloud-rain-heavy",
      gif: stormgif,
    },
    night: {
      description: "Violent rain showers",
      icon: "bi-cloud-rain-heavy",
      gif: stormgif,
    },
  },
  85: {
    day: {
      description: "Slight snow showers",
      icon: "bi-cloud-snow",
      gif: rain1gif,
    },
    night: {
      description: "Slight snow showers",
      icon: "bi-cloud-snow",
      gif: rain1gif,
    },
  },
  86: {
    day: {
      description: "Heavy snow showers",
      icon: "bi-cloud-snow-heavy",
      gif: stormgif,
    },
    night: {
      description: "Heavy snow showers",
      icon: "bi-cloud-snow-heavy",
      gif: stormgif,
    },
  },
  95: {
    day: {
      description: "Thunderstorm",
      icon: "bi-cloud-lightning",
      gif: stormgif,
    },
    night: {
      description: "Thunderstorm",
      icon: "bi-cloud-lightning",
      gif: stormgif,
    },
  },
  96: {
    day: {
      description: "Thunderstorm with slight hail",
      icon: "bi-cloud-lightning-rain",
      gif: stormgif,
    },
    night: {
      description: "Thunderstorm with slight hail",
      icon: "bi-cloud-lightning-rain",
      gif: stormgif,
    },
  },
  99: {
    day: {
      description: "Thunderstorm with heavy hail",
      icon: "bi-cloud-lightning-rain-fill",
      gif: stormgif,
    },
    night: {
      description: "Thunderstorm with heavy hail",
      icon: "bi-cloud-lightning-rain-fill",
      gif: stormgif,
    },
  },
};

// Array of background images for cards
const backgroundImages = [
  image1,
  image2,
  image3,
  image4,
  image5,
  image6,
  image7,
  image8,
  image9,
  image10,
  image11,
  image12,
  image13,
];

// Storage keys
const STORAGE_KEYS = {
  WEATHER_DATA: "agriweather_data",
  TIMESTAMP: "agriweather_timestamp",
};

// Cache duration - 30 minutes
const CACHE_DURATION = 30 * 60 * 1000;

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
  const [graphDataLoaded, setGraphDataLoaded] = useState(false);

  // Refs for graph containers
  const c2Ref = useRef(null);
  const c3Ref = useRef(null);
  const c4Ref = useRef(null);
  const seasonRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const utterRef = useRef(null);

  // Load data from localStorage
  const loadCachedData = useCallback(() => {
    try {
      const cachedData = localStorage.getItem(STORAGE_KEYS.WEATHER_DATA);
      const cachedTimestamp = localStorage.getItem(STORAGE_KEYS.TIMESTAMP);

      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        const now = Date.now();

        if (now - timestamp < CACHE_DURATION) {
          const data = JSON.parse(cachedData);
          setCurrent(data.current);
          setHourly(data.hourly);
          setDaily(data.daily);
          setSeasonal(data.seasonal);
          setCityMeta(data.cityMeta);
          setGraphDataLoaded(true);
          return true;
        } else {
          // Clear expired cache
          localStorage.removeItem(STORAGE_KEYS.WEATHER_DATA);
          localStorage.removeItem(STORAGE_KEYS.TIMESTAMP);
        }
      }
    } catch (error) {
      console.warn("Error loading cached data:", error);
    }
    return false;
  }, []);

  // Save data to localStorage
  const saveDataToCache = useCallback((data) => {
    try {
      const cacheData = {
        current: data.current,
        hourly: data.hourly,
        daily: data.daily,
        seasonal: data.seasonal,
        cityMeta: data.cityMeta,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        STORAGE_KEYS.WEATHER_DATA,
        JSON.stringify(cacheData)
      );
      localStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.warn("Error saving data to cache:", error);
    }
  }, []);

  // Helper to run scripts after injecting HTML from backend
  const runScripts = useCallback((container) => {
    if (!container) return;

    const scripts = Array.from(container.querySelectorAll("script"));
    scripts.forEach((oldScript, i) => {
      try {
        const newScript = document.createElement("script");
        // Copy script attributes
        Array.from(oldScript.attributes).forEach((attr) =>
          newScript.setAttribute(attr.name, attr.value)
        );
        if (oldScript.src) {
          // Load external scripts independently
          newScript.src = oldScript.src;
        } else {
          // Wrap inline scripts in an IIFE to isolate scope
          newScript.textContent = `(function(){\n${oldScript.textContent}\n})();`;
        }
        // Append inside the same container instead of document.body
        container.appendChild(newScript);
      } catch (err) {
        console.warn("Error running injected script:", err);
      }
    });
  }, []);

  // TTS Functions
  //  Voice selection function (handles Hindi + English robustly)
  const getVoiceByLang = useCallback((lang) => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Prioritize Hindi voices (Microsoft, Google, native)
    if (lang === "hi-IN") {
      const preferredHindiVoices = voices.filter(
        (v) =>
          v.lang.toLowerCase().includes("hi") ||
          v.name.toLowerCase().includes("swara") ||
          v.name.toLowerCase().includes("hindi") ||
          v.name.toLowerCase().includes("female") ||
          v.name.toLowerCase().includes("google हिन्दी")
      );

      if (preferredHindiVoices.length > 0) {
        return preferredHindiVoices[0];
      }
    }

    // Fallback to English voice
    const englishVoice =
      voices.find((v) => v.lang.startsWith("en")) || voices[0];
    return englishVoice;
  }, []);

  // Main Speak function (robust & loud TTS for Hindi + English)
  const speak = useCallback(
    (text) => {
      if (!text) return;
      try {
        window.speechSynthesis.cancel(); // stop any ongoing speech
      } catch (e) {
        console.warn("Speech cancel failed:", e);
      }

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = ttsLang;
      utter.voice = getVoiceByLang(ttsLang);
      utter.rate = 0.95; // slightly slower for clarity
      utter.pitch = 1; // natural tone
      utter.volume = 1; // loud and clear

      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = (err) => {
        console.error("Speech error:", err);
        setIsSpeaking(false);
      };

      // If voices are not yet loaded, wait and retry
      if (!utter.voice) {
        const handleVoicesChanged = () => {
          utter.voice = getVoiceByLang(ttsLang);
          window.speechSynthesis.speak(utter);
          window.speechSynthesis.onvoiceschanged = null;
        };
        window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      } else {
        window.speechSynthesis.speak(utter);
      }
    },
    [ttsLang, getVoiceByLang]
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

        const weatherData = {
          current: cur,
          hourly: h,
          daily: d,
          seasonal: s,
          cityMeta: nameHint,
        };

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

        // Save to cache
        saveDataToCache({
          current: cur,
          hourly: h,
          daily: d,
          seasonal: s,
          cityMeta: determinedCityMeta,
        });

        // Generate graphs
        if (h && d) {
          const prepared = prepareGraphPayload(h, d);
          try {
            const backendResponse =
              await WeatherService.generateHourlyGraphsBackend(prepared);
            setTimeout(() => {
              injectBackendGraphs(backendResponse);
              setGraphDataLoaded(true);
            }, 100);
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
              setTimeout(() => {
                seasonRef.current.innerHTML =
                  seasonalBackendResponse.graph_html;
                runScripts(seasonRef.current);
              }, 100);
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
    [runScripts, saveDataToCache]
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
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          if (payload?.graph_html && c2Ref.current) {
            c2Ref.current.innerHTML = payload.graph_html;
            runScripts(c2Ref.current);
          }

          if (payload?.graph_html2 && c3Ref.current) {
            c3Ref.current.innerHTML = payload.graph_html2;
            runScripts(c3Ref.current);
          }

          if (payload?.pie_chart_html && c3Ref.current) {
            const existingPie = c3Ref.current.querySelector(
              ".pie-chart-container"
            );
            if (!existingPie) {
              const pie = document.createElement("div");
              pie.className = "pie-chart-container";
              pie.innerHTML = payload.pie_chart_html;
              c3Ref.current.appendChild(pie);
              runScripts(pie);
            }
          }

          if (payload?.graph_html3 && c4Ref.current) {
            c4Ref.current.innerHTML = payload.graph_html3;
            runScripts(c4Ref.current);
          }

          if (payload?.graph_html4 && c4Ref.current) {
            const existingGraph4 =
              c4Ref.current.querySelector(".graph4-container");
            if (!existingGraph4) {
              const el = document.createElement("div");
              el.className = "graph4-container";
              el.innerHTML = payload.graph_html4;
              c4Ref.current.appendChild(el);
              runScripts(el);
            }
          }
        }, 100);
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

    const sliceTimes = times.slice(
      startIndex,
      Math.min(startIndex + 48, times.length)
    );
    const labels = sliceTimes.map((t) => formatTimeLabel(t));
    const temps =
      hourly.hourly?.temperature_2m?.slice(
        startIndex,
        startIndex + sliceTimes.length
      ) || [];
    const precip = (
      hourly.hourly?.precipitation ||
      hourly.hourly?.precipitation_probability ||
      []
    ).slice(startIndex, startIndex + sliceTimes.length);

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
          pointRadius: 3,
        },
        {
          label: "Precipitation (mm)",
          data: precip,
          type: "bar",
          backgroundColor: "rgba(16, 185, 129, 0.7)",
          yAxisID: "y1",
        },
      ],
    };
  }, [hourly, formatTimeLabel]);

  // Enhanced TTS Reports with Farmer-Friendly Language
  const buildCurrentReport = useCallback(
    (long = false) => {
      if (!current) return "No weather data available.";

      const name = cityMeta || current.name || "your area";
      const temp = Math.round(current.main?.temp ?? 0);
      const humidity = current.main?.humidity ?? "unknown";
      const wind = current.wind?.speed ?? "unknown";
      const desc = current.weather?.[0]?.description || "clear skies";

      if (ttsLang === "hi-IN") {
        return `नमस्कार किसान मित्र! आपका स्वागत है एग्रीकनेक्ट मौसम सेवा में।
${name} के लिए मौसम की जानकारी:
वर्तमान तापमान ${temp} डिग्री सेल्सियस है।
आर्द्रता लगभग ${humidity} प्रतिशत है और हवा की गति ${wind} मीटर प्रति सेकंड है।
आज का मौसम ${desc} रहने की संभावना है।
कृपया खेत में काम करते समय सावधानी रखें, सिंचाई या छिड़काव की योजना सुबह या शाम के समय बनाएं।
एग्रीकनेक्ट आपकी खेती में हर मौसम में मददगार रहेगा।`;
      } else {
        return `Hello dear farmer! Welcome to AgriConnect Weather Service.
Here’s your weather update for ${name}.
The current temperature is around ${temp}°C with humidity near ${humidity}% and wind speed about ${wind} m/s.
Today’s weather is expected to be ${desc}.
Stay hydrated and plan your field activities wisely — early mornings or evenings are best for spraying and irrigation.
AgriConnect stands with you in every season!`;
      }
    },
    [current, cityMeta, ttsLang]
  );

  const buildOffsetReport = useCallback(
    (hours = 5) => {
      if (!hourly)
        return ttsLang === "hi-IN"
          ? "घंटे के हिसाब से पूर्वानुमान उपलब्ध नहीं है।"
          : "Hourly forecast not available.";

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

      const weatherCode = hourly.hourly?.weather_code?.[bestIdx];
      const isDaytime =
        new Date(t).getHours() >= 6 && new Date(t).getHours() < 18;
      const description =
        wmoDescriptions?.[weatherCode]?.[isDaytime ? "day" : "night"]
          ?.description || "unknown";

      const timeLabel = formatTimeLabel(t);

      if (hours === 24) {
        if (!daily || !daily.daily?.time || daily.daily.time.length < 2) {
          return ttsLang === "hi-IN"
            ? "कल के लिए दैनिक पूर्वानुमान उपलब्ध नहीं है।"
            : "Daily forecast for tomorrow not available.";
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

        if (ttsLang === "hi-IN") {
          return `कल के मौसम का पूर्वानुमान: अधिकतम तापमान ${tomorrowMaxTemp} डिग्री सेल्सियस, न्यूनतम तापमान ${tomorrowMinTemp} डिग्री सेल्सियस रहेगा। कुल वर्षा ${tomorrowRainSum} मिलीमीटर होने की संभावना है। अधिकतम हवा की गति ${tomorrowWindMax} मीटर प्रति सेकंड रहेगी। मौसम की स्थिति: ${tomorrowDescription}। कृपया अपनी खेती की गतिविधियों की योजना इसी के अनुसार बनाएं। धन्यवाद!`;
        } else {
          return `Tomorrow's weather forecast: Maximum temperature ${tomorrowMaxTemp}°C, minimum temperature ${tomorrowMinTemp}°C. Total rainfall ${tomorrowRainSum} millimeters expected. Maximum wind speed ${tomorrowWindMax} meters per second. Weather condition: ${tomorrowDescription}. Please plan your farming activities accordingly. Thank you!`;
        }
      } else {
        if (ttsLang === "hi-IN") {
          return `अगले ${hours} घंटे में मौसम: समय ${timeLabel} पर तापमान ${temp} डिग्री सेल्सियस रहने की संभावना है। वर्षा ${precip} मिलीमीटर, हवा की गति ${wind} मीटर प्रति सेकंड, और बादल ${cloud} प्रतिशत छाए रहेंगे। मौसम की स्थिति: ${description}।`;
        } else {
          return `In the next ${hours} hours at ${timeLabel}, expected temperature ${temp} degrees Celsius. Precipitation ${precip} millimeters. Wind speed ${wind} meters per second. Cloud cover ${cloud} percent. Weather condition: ${description}.`;
        }
      }
    },
    [hourly, daily, formatTimeLabel, wmoDescriptions, ttsLang]
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

    // Load cached data on initial render
    if (loadCachedData()) {
      setGraphDataLoaded(true);
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      stopSpeech();
    };
  }, [stopSpeech, loadCachedData]);

  // Initial data load effect
  useEffect(() => {
    if (!current && !hourly && !daily && !loading) {
      useMyLocation();
    }
  }, [current, hourly, daily, loading, useMyLocation]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { grid: { display: false } },
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
  };

  // Get weather GIF based on conditions
  const getWeatherGif = useCallback(
    (weatherCode, isDaytime = true) => {
      const weatherInfo =
        wmoDescriptions[weatherCode]?.[isDaytime ? "day" : "night"];
      return weatherInfo?.gif || clearsun;
    },
    [wmoDescriptions]
  );

  // Get weather icon based on conditions
  const getWeatherIcon = useCallback(
    (weatherCode, isDaytime = true) => {
      const weatherInfo =
        wmoDescriptions[weatherCode]?.[isDaytime ? "day" : "night"];
      return weatherInfo?.icon || "bi-brightness-high";
    },
    [wmoDescriptions]
  );

  // Get background color based on weather
  const getWeatherColor = useCallback((weatherCode, isDaytime = true) => {
    if (weatherCode >= 0 && weatherCode <= 3) {
      return isDaytime
        ? "linear-gradient(135deg, #87CEEB, #1E90FF)"
        : "linear-gradient(135deg, #2C3E50, #34495E)";
    } else if (weatherCode >= 45 && weatherCode <= 48) {
      return "linear-gradient(135deg, #BDC3C7, #7F8C8D)";
    } else if (weatherCode >= 51 && weatherCode <= 67) {
      return "linear-gradient(135deg, #3498DB, #2980B9)";
    } else if (weatherCode >= 71 && weatherCode <= 77) {
      return "linear-gradient(135deg, #ECF0F1, #BDC3C7)";
    } else if (weatherCode >= 80 && weatherCode <= 86) {
      return "linear-gradient(135deg, #5DADE2, #3498DB)";
    } else if (weatherCode >= 95 && weatherCode <= 99) {
      return "linear-gradient(135deg, #2C3E50, #E74C3C)";
    } else {
      return "linear-gradient(135deg, #87CEEB, #1E90FF)";
    }
  }, []);

  // Render 12-hour forecast cards
  // 🌤 Enhanced 12-Hour Forecast Cards (Farmer-Friendly, Colorful, Responsive)
  const render12HourForecast = useCallback(() => {
    if (!hourly || !hourly.hourly) return null;

    const now = new Date();
    const times = hourly.hourly.time || [];
    let startIndex = 0;
    for (let i = 0; i < times.length; i++) {
      if (new Date(times[i]) >= now) {
        startIndex = i;
        break;
      }
    }

    const forecastHours = times.slice(
      startIndex,
      Math.min(startIndex + 12, times.length)
    );

    // 🌾 Alternate background images for variety
    const bgImages = [
      cardcontainerimage1,
      cardcontainerimage2,
      cardcontainerimage3,
      cardcontainerimage4,
      image1,
      image2,
      image3,
      image4,
      image5,
      image6,
      image7,
      image8,
      image9,
      image10,
      image11,
      image12,
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-10">
        {forecastHours.map((time, index) => {
          const actualIndex = startIndex + index;
          const temp = Math.round(
            hourly.hourly.temperature_2m?.[actualIndex] || 0
          );
          const weatherCode = hourly.hourly.weather_code?.[actualIndex] || 0;
          const precip = hourly.hourly.precipitation?.[actualIndex] || 0;
          const windSpeed = hourly.hourly.wind_speed_10m?.[actualIndex] || 0;
          const isDaytime =
            new Date(time).getHours() >= 6 && new Date(time).getHours() < 18;
          const weatherGif = getWeatherGif(weatherCode, isDaytime);
          const weatherColor = getWeatherColor(weatherCode, isDaytime);
          const weatherIcon = getWeatherIcon(weatherCode, isDaytime);
          const formattedTime = formatTimeLabel(time);

          const bgImg = bgImages[index % bgImages.length];

          // Farmer-friendly text
          const conditionText = wmoDescriptions?.[weatherCode]?.day?.description
            ? wmoDescriptions[weatherCode][isDaytime ? "day" : "night"]
                .description
            : "Clear and calm skies";

          return (
            <motion.div
              key={time}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.03] transition-transform duration-300"
            >
              {/* Background with alternating GIFs */}
              <div className="absolute inset-0">
                <img
                  src={bgImg}
                  alt="Weather background"
                  className="w-full h-full object-cover opacity-90"
                />
                <div
                  className="absolute inset-0 backdrop-blur-sm"
                  style={{
                    background: `${weatherColor}AA`,
                  }}
                ></div>
              </div>

              {/* Foreground content */}
              <div className="relative z-10 text-center text-white p-5 flex flex-col justify-between h-full">
                <div>
                  <p className="text-lg font-bold drop-shadow-md mb-2">
                    {formattedTime}
                  </p>

                  <div className="flex flex-col items-center">
                    <img
                      src={weatherGif}
                      alt="Weather"
                      className="w-20 h-20 rounded-xl mb-2 shadow-lg"
                    />
                    <p className="text-4xl font-extrabold mb-1 drop-shadow-xl">
                      🌡️ {temp}°C
                    </p>
                    <p className="text-md font-semibold text-white/90 capitalize">
                      {conditionText}
                    </p>
                  </div>
                </div>

                {/* Weather Details */}
                <div className="mt-4 flex flex-col items-center space-y-1 text-sm font-semibold">
                  <p className="flex items-center gap-2">
                    🌧️ <span>Rain: {precip} mm</span>
                  </p>
                  <p className="flex items-center gap-2">
                    💨 <span>Wind: {windSpeed} m/s</span>
                  </p>
                </div>

                {/* Farmer message */}
                <p className="mt-3 text-xs italic text-yellow-200 font-medium">
                  {isDaytime
                    ? "सुबह का मौसम खेती के काम के लिए अच्छा है 🌞"
                    : "रात में फसलों को ठंडी हवा का असर हो सकता है 🌙"}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }, [
    hourly,
    formatTimeLabel,
    getWeatherGif,
    getWeatherColor,
    getWeatherIcon,
    wmoDescriptions,
  ]);

  // Render 7-day forecast cards
  // 🌤 Enhanced 7-Day Forecast Cards (Farmer-Friendly, Colorful, Responsive)
  const render7DayForecast = useCallback(() => {
    if (!daily || !daily.daily) return null;

    const days = daily.daily.time || [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // 🌾 Background images for variety
    const bgImages = [
      cardcontainerimage1,
      cardcontainerimage2,
      cardcontainerimage3,
      cardcontainerimage4,
      image1,
      image2,
      image3,
      image4,
      image5,
      image6,
      image7,
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-6 mb-10">
        {days.slice(0, 7).map((day, index) => {
          const maxTemp = Math.round(
            daily.daily.temperature_2m_max?.[index] || 0
          );
          const minTemp = Math.round(
            daily.daily.temperature_2m_min?.[index] || 0
          );
          const weatherCode = daily.daily.weather_code?.[index] || 0;
          const precip = daily.daily.precipitation_sum?.[index] || 0;
          const windSpeed = daily.daily.wind_speed_10m_max?.[index] || 0;

          const isDaytime = true; // Daily forecast generally considered daytime
          const weatherGif = getWeatherGif(weatherCode, isDaytime);
          const weatherColor = getWeatherColor(weatherCode, isDaytime);
          const weatherIcon = getWeatherIcon(weatherCode, isDaytime);

          const dateObj = new Date(day);
          const dayName = dayNames[dateObj.getDay()];
          const dateStr = dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          const bgImg = bgImages[index % bgImages.length];

          // Farmer-friendly weather text
          const conditionText =
            wmoDescriptions?.[weatherCode]?.day?.description ||
            "Clear and calm skies";

          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.03] transition-transform duration-300"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={bgImg}
                  alt="Weather background"
                  className="w-full h-full object-cover opacity-90"
                />
                <div
                  className="absolute inset-0 backdrop-blur-sm"
                  style={{ background: `${weatherColor}AA` }}
                ></div>
              </div>

              {/* Foreground content */}
              <div className="relative z-10 text-center text-white p-5 flex flex-col justify-between h-full">
                <div>
                  <p className="text-lg font-bold drop-shadow-md mb-2">
                    {dayName}
                  </p>
                  <p className="text-sm drop-shadow-md mb-3">{dateStr}</p>

                  <div className="flex flex-col items-center">
                    <img
                      src={weatherGif}
                      alt="Weather"
                      className="w-20 h-20 rounded-xl mb-2 shadow-lg"
                    />
                    <p className="text-3xl font-extrabold mb-1 drop-shadow-xl">
                      🌡️ {maxTemp}°C / {minTemp}°C
                    </p>
                    <p className="text-md font-semibold text-white/90 capitalize mb-1">
                      {conditionText}
                    </p>
                  </div>
                </div>

                {/* Weather Details */}
                <div className="mt-4 flex flex-col items-center space-y-1 text-sm font-semibold">
                  <p className="flex items-center gap-2">
                    🌧️ <span>Rain: {precip} mm</span>
                  </p>
                  <p className="flex items-center gap-2">
                    💨 <span>Wind: {windSpeed} m/s</span>
                  </p>
                </div>

                {/* Farmer message */}
                <p className="mt-3 text-xs italic text-yellow-200 font-medium">
                  {isDaytime
                    ? "आज का मौसम खेती के लिए अच्छा है 🌞"
                    : "रात में फसलों को ठंडी हवा का असर हो सकता है 🌙"}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }, [daily, getWeatherGif, getWeatherColor, getWeatherIcon, wmoDescriptions]);

  // Render TTS cards for farmers
  const renderTtsCards = useCallback(() => {
    const ttsReports = [
      {
        title:
          ttsLang === "hi-IN" ? "आज का मौसम सारांश" : "Today's Weather Summary",
        content: buildCurrentReport(true),
        bgColor: "linear-gradient(135deg, #84fab0, #8fd3f4)",
        gif: agribotimg,
      },
      {
        title:
          ttsLang === "hi-IN"
            ? "अगले कुछ घंटों का पूर्वानुमान"
            : "Upcoming 5-Hour Forecast",
        content: buildOffsetReport(5, true),
        bgColor: "linear-gradient(135deg, #f093fb, #f5576c)",
        gif: communityimg,
      },
      {
        title:
          ttsLang === "hi-IN"
            ? "कल का विस्तृत पूर्वानुमान"
            : "Tomorrow's Detailed Forecast",
        content: buildOffsetReport(24, true),
        bgColor: "linear-gradient(135deg, #43e97b, #38f9d7)",
        gif: harvestimg,
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {ttsReports.map((report, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="relative rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300"
            style={{ background: report.bgColor }}
          >
            {/* Background */}
            <div className="absolute inset-0">
              <img
                src={cardcontainerimage1}
                alt="Weather background"
                className="w-full h-full object-cover opacity-25"
              />
              <div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 p-6 flex flex-col justify-between h-full">
              <div>
                <h3 className="text-2xl font-bold text-white drop-shadow-lg mb-3">
                  {report.title}
                </h3>

                <p className="text-white/90 text-base md:text-lg leading-relaxed mb-6 font-medium whitespace-pre-line">
                  {report.content}
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-3 justify-center">
                {/* Play / Pause Button */}
                <button
                  onClick={() =>
                    isSpeaking ? stopSpeech() : speak(report.content)
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium shadow-md text-white transition-all duration-300 ${
                    isSpeaking
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  <img
                    src={isSpeaking ? pauseGif : playGif}
                    alt="Play or Pause"
                    className="w-7 h-7 object-contain"
                  />
                  <span>{isSpeaking ? "Pause" : "Play"}</span>
                </button>

                {/* Change Language */}
                <button
                  onClick={cycleLanguage}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium shadow-md transition-all duration-300"
                >
                  <i className="bi bi-translate text-lg"></i>
                  <span>{ttsLang === "hi-IN" ? "हिंदी" : "English"}</span>
                </button>

                {/* Stop */}
                <button
                  onClick={stopSpeech}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-white font-medium shadow-md transition-all duration-300"
                >
                  <img
                    src={stopGif}
                    alt="Stop"
                    className="w-7 h-7 object-contain"
                  />
                  <span>Stop</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }, [
    ttsLang,
    isSpeaking,
    speak,
    stopSpeech,
    cycleLanguage,
    buildCurrentReport,
    buildOffsetReport,
  ]);

  // Main Render

  return (
    <div className="mt-20 min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-6">
      {/* Header + Search Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-12 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Background Image Layer */}
        <div className="absolute inset-0">
          <img
            src={image1}
            alt="Farming background"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-800/70 via-blue-900/70 to-sky-700/60"></div>
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 text-center py-16 px-6 md:px-12 text-white">
          <motion.h1
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-extrabold tracking-wide drop-shadow-lg"
          >
            🌾 Welcome to{" "}
            <span className="text-yellow-300">AgriConnect Weather</span>
          </motion.h1>

          <p className="mt-4 text-lg md:text-2xl text-yellow-100 max-w-3xl mx-auto font-medium">
            Helping farmers make smarter field decisions with{" "}
            <br className="hidden md:block" />
            <span className="text-yellow-300 font-semibold">
              accurate, real-time weather insights.
            </span>
          </p>

          {/* Animated weather GIFs */}
          <div className="flex justify-center mt-6 gap-4 flex-wrap">
            <img
              src="/src/assets/images/sun.gif"
              alt="Sun"
              className="w-20 h-20 object-contain rounded-full shadow-lg"
            />
            <img
              src="/src/assets/images/cloudy.gif"
              alt="Cloudy"
              className="w-20 h-20 object-contain rounded-full shadow-lg"
            />
            <img
              src="/src/assets/images/rain1.gif"
              alt="Rain"
              className="w-20 h-20 object-contain rounded-full shadow-lg"
            />
            <img
              src="/src/assets/images/forest.gif"
              alt="Wind"
              className="w-20 h-20 object-contain rounded-full shadow-lg"
            />
          </div>

          {/* Friendly tagline */}
          <p className="mt-6 text-lg text-gray-100 italic">
            “A farmer’s best friend under the sun, rain, and clouds — always
            with you in every season.”
          </p>
        </div>

        {/* Search Bar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-20 max-w-5xl mb-6 mx-auto -mt-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="🔍 Enter your village, city, or location..."
                className="w-full px-6 py-4 rounded-2xl border border-gray-300 focus:border-green-600 focus:ring-4 focus:ring-green-200 outline-none transition-all duration-300 text-lg shadow-md placeholder:text-gray-500"
              />
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-green-500/40 disabled:opacity-50"
              >
                <i className="bi bi-search"></i>
                <span>{loading ? "Searching..." : "Search"}</span>
              </button>
              <button
                onClick={useMyLocation}
                disabled={loading}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-yellow-400/40 disabled:opacity-50"
              >
                <i className="bi bi-geo-alt"></i>
                <span>Use My Location</span>
              </button>
              <button
                onClick={startMicSearch}
                className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-sky-400/40"
              >
                <i className="bi bi-mic"></i>
                <span>Voice Search</span>
              </button>
            </div>
          </div>

          {/* Extra visual touch below search */}
          <div className="mt-6 flex justify-center gap-6 flex-wrap text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <img
                src="/src/assets/images/hot.gif"
                alt="Temp"
                className="w-10 h-10"
              />
              <span>Temperature Alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <img
                src="/src/assets/images/rain1.gif"
                alt="Rain"
                className="w-10 h-10"
              />
              <span>Rain Forecast</span>
            </div>
            <div className="flex items-center gap-2">
              <img
                src="/src/assets/images/forest.gif"
                alt="Wind"
                className="w-10 h-10"
              />
              <span>Wind & Soil Insights</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 🌾 Current Weather Display */}
      {current && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto mb-10"
        >
          <div className="relative overflow-hidden rounded-3xl shadow-2xl border border-white/20 bg-gradient-to-r from-green-100 via-blue-100 to-yellow-50 dark:from-gray-800 dark:via-gray-900 dark:to-green-900">
            {/* Decorative top bar */}
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-green-500 via-sky-500 to-yellow-500"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 backdrop-blur-sm">
              {/* Left: Weather overview */}
              <div className="flex items-center space-x-6">
                <img
                  src={getWeatherGif(current.weather?.[0]?.id || 800, true)}
                  alt="Weather"
                  className="w-28 h-28 rounded-2xl shadow-lg border-2 border-white/50 bg-white/50"
                />
                <div>
                  <h2 className="text-4xl font-extrabold text-green-800 dark:text-green-200">
                    {cityMeta || current.name}
                  </h2>
                  <p className="text-xl capitalize text-gray-700 dark:text-gray-300">
                    {current.weather?.[0]?.description || "Weather Info"}
                  </p>
                  <p className="text-6xl font-bold text-sky-700 dark:text-sky-300 mt-2 drop-shadow-lg">
                    {Math.round(current.main?.temp)}°C
                  </p>
                </div>
              </div>

              {/* Right: Weather stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 md:mt-0 bg-white/50 dark:bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    🌡️ Feels Like
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {Math.round(current.main?.feels_like)}°C
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    💧 Humidity
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {current.main?.humidity}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    🌬️ Wind Speed
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {current.wind?.speed} m/s
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    📊 Pressure
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {current.main?.pressure} hPa
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom line with friendly note */}
            <div className="px-6 py-4 bg-gradient-to-r from-yellow-100 via-green-100 to-blue-100 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 text-center text-gray-800 dark:text-gray-200 font-medium italic text-sm">
              🌻{" "}
              <span className="text-green-700 dark:text-green-300">Tip:</span>{" "}
              Keep an eye on humidity before spraying crops. Ideal time is early
              morning or late evening for best results.
            </div>
          </div>
        </motion.div>
      )}

      {/* TTS Reports Section */}
      {renderTtsCards()}

      {/* 12-Hour Forecast */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-7xl mx-auto mb-12"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          {ttsLang === "hi-IN"
            ? "अगले 12 घंटे का पूर्वानुमान"
            : "12-Hour Forecast"}
        </h2>
        {render12HourForecast()}
      </motion.section>

      {/* Graphs Section */}
      {graphDataLoaded && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-7xl mx-auto space-y-8"
        >
          {/* 24-Hour Chart */}
          {hourly && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {ttsLang === "hi-IN"
                  ? "24 घंटे का तापमान और वर्षा"
                  : "24-Hour Temperature & Precipitation"}
              </h3>
              <div className="h-80">
                <Line data={build24HourChartData()} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Backend Generated Graphs */}
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-[600px]">
              {/* Card 1 */}
              <div className="backend-graph-container bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col">
                <img
                  src={image1} // Replace with your image
                  alt="Graph 1"
                  className="w-full h-92 object-cover rounded-lg mb-4"
                />
                <div ref={c2Ref} className="flex-1"></div>
              </div>

              {/* Card 2 */}
              <div className="backend-graph-container bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col">
                <img
                  src={image2} // Replace with your image
                  alt="Graph 2"
                  className="w-full h-92 object-cover rounded-lg mb-4"
                />
                <div ref={c3Ref} className="flex-1"></div>
              </div>
            </div>
          </div>
          {/* 7-Day Forecast */}
          <div>
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-7xl mx-auto mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                {ttsLang === "hi-IN"
                  ? "7 दिन का पूर्वानुमान"
                  : "7-Day Forecast"}
              </h2>
              {render7DayForecast()}
            </motion.section>
          </div>
          {/* <div ref={c4Ref} className="backend-graph-container"></div> */}
          <div className="backend-graph-container bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-full overflow-hidden">
            {/* Header with details */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                Seasonal Crop Trends 📊
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This graph shows the crop yield and weather trends over
                different seasons. Use this to plan sowing, irrigation, and
                harvesting efficiently.
              </p>
            </div>

            {/* Image at top */}
            <div className="w-full">
              <img
                src={cardcontainerimage3} // Replace with your seasonal image
                alt="Seasonal Graph"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Graph container */}
            <div
              ref={seasonRef}
              className="overflow-x-scroll p-4"
              style={{ height: "600px" }} // adjust height as needed
            ></div>
          </div>
        </motion.section>
      )}

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-lg font-semibold text-gray-800">
                Loading weather data...
              </p>
            </div>
          </div>
        </div>
      )}

      <ReactTooltip place="top" type="dark" effect="solid" />
    </div>
  );
}
