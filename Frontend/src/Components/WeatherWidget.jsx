// src/components/WeatherWidget.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const WeatherWidget = ({ latitude, longitude }) => {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API; // Replace with your real key

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather`,
          {
            params: {
              lat: latitude,
              lon: longitude,
              units: "metric",
              appid: API_KEY,
            },
          }
        );
        const data = res.data;
        setWeather({
          temp: data.main.temp,
          condition: data.weather[0].main,
          description: data.weather[0].description,
          humidity: data.main.humidity,
          wind: data.wind.speed,
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        });
      } catch (err) {
        setError("Unable to fetch weather");
      }
    };

    if (latitude && longitude) fetchWeather();
  }, [latitude, longitude]);

  if (error)
    return (
      <div className="text-sm text-red-500 bg-white dark:bg-gray-800 p-4 rounded-md shadow">
        {error}
      </div>
    );

  if (!weather)
    return (
      <div className="text-sm text-gray-500 bg-white dark:bg-gray-800 p-4 rounded-md shadow animate-pulse">
        Loading weather...
      </div>
    );

  return (
    <div className="bg-white dark:bg-gray-800 bg-opacity-20 p-4 rounded-lg backdrop-blur-sm shadow-md">
      <div className="flex items-center">
        <img
          src={weather.icon}
          alt={weather.condition}
          className="w-12 h-12 mr-3"
        />
        <div>
          <div className="text-2xl font-bold">{weather.temp}°C</div>
          <div className="text-sm capitalize">{weather.description}</div>
        </div>
      </div>
      <div className="mt-2 text-sm flex justify-between">
        <span>Humidity: {weather.humidity}%</span>
        <span>Wind: {weather.wind} km/h</span>
      </div>
    </div>
  );
};

export default WeatherWidget;
