const defaultWmoDescriptions = {
  0: {
    day: { description: "Clear sky", icon: "bi-brightness-high" },
    night: { description: "Clear sky", icon: "bi-moon" },
  },
  1: {
    day: { description: "Mainly clear", icon: "bi-brightness-high" },
    night: { description: "Mainly clear", icon: "bi-moon-stars" },
  },
  2: {
    day: { description: "Partly cloudy", icon: "bi-cloud-sun" },
    night: { description: "Partly cloudy", icon: "bi-cloud-moon" },
  },
  3: {
    day: { description: "Overcast", icon: "bi-cloudy" },
    night: { description: "Overcast", icon: "bi-cloudy-fill" },
  },
  45: {
    day: { description: "Fog", icon: "bi-cloud-fog" },
    night: { description: "Fog", icon: "bi-cloud-fog" },
  },
  48: {
    day: { description: "Depositing rime fog", icon: "bi-cloud-fog2" },
    night: { description: "Depositing rime fog", icon: "bi-cloud-fog2" },
  },
  51: {
    day: { description: "Light drizzle", icon: "bi-cloud-drizzle" },
    night: { description: "Light drizzle", icon: "bi-cloud-drizzle" },
  },
  53: {
    day: { description: "Moderate drizzle", icon: "bi-cloud-drizzle" },
    night: { description: "Moderate drizzle", icon: "bi-cloud-drizzle" },
  },
  55: {
    day: { description: "Dense drizzle", icon: "bi-cloud-drizzle" },
    night: { description: "Dense drizzle", icon: "bi-cloud-drizzle" },
  },
  56: {
    day: { description: "Light freezing drizzle", icon: "bi-cloud-sleet" },
    night: { description: "Light freezing drizzle", icon: "bi-cloud-sleet" },
  },
  57: {
    day: { description: "Dense freezing drizzle", icon: "bi-cloud-sleet" },
    night: { description: "Dense freezing drizzle", icon: "bi-cloud-sleet" },
  },
  61: {
    day: { description: "Slight rain", icon: "bi-cloud-rain" },
    night: { description: "Slight rain", icon: "bi-cloud-rain" },
  },
  63: {
    day: { description: "Moderate rain", icon: "bi-cloud-rain-fill" },
    night: { description: "Moderate rain", icon: "bi-cloud-rain-fill" },
  },
  65: {
    day: { description: "Heavy rain", icon: "bi-cloud-rain-heavy" },
    night: { description: "Heavy rain", icon: "bi-cloud-rain-heavy" },
  },
  66: {
    day: { description: "Light freezing rain", icon: "bi-cloud-sleet" },
    night: { description: "Light freezing rain", icon: "bi-cloud-sleet" },
  },
  67: {
    day: { description: "Heavy freezing rain", icon: "bi-cloud-sleet-fill" },
    night: { description: "Heavy freezing rain", icon: "bi-cloud-sleet-fill" },
  },
  71: {
    day: { description: "Slight snow fall", icon: "bi-cloud-snow" },
    night: { description: "Slight snow fall", icon: "bi-cloud-snow" },
  },
  73: {
    day: { description: "Moderate snow fall", icon: "bi-cloud-snow-fill" },
    night: { description: "Moderate snow fall", icon: "bi-cloud-snow-fill" },
  },
  75: {
    day: { description: "Heavy snow fall", icon: "bi-cloud-snow-heavy" },
    night: { description: "Heavy snow fall", icon: "bi-cloud-snow-heavy" },
  },
  77: {
    day: { description: "Snow grains", icon: "bi-snow" },
    night: { description: "Snow grains", icon: "bi-snow" },
  },
  80: {
    day: { description: "Slight rain showers", icon: "bi-cloud-drizzle" },
    night: { description: "Slight rain showers", icon: "bi-cloud-drizzle" },
  },
  81: {
    day: { description: "Moderate rain showers", icon: "bi-cloud-rain" },
    night: { description: "Moderate rain showers", icon: "bi-cloud-rain" },
  },
  82: {
    day: { description: "Violent rain showers", icon: "bi-cloud-rain-heavy" },
    night: { description: "Violent rain showers", icon: "bi-cloud-rain-heavy" },
  },
  85: {
    day: { description: "Slight snow showers", icon: "bi-cloud-snow" },
    night: { description: "Slight snow showers", icon: "bi-cloud-snow" },
  },
  86: {
    day: { description: "Heavy snow showers", icon: "bi-cloud-snow-heavy" },
    night: { description: "Heavy snow showers", icon: "bi-cloud-snow-heavy" },
  },
  95: {
    day: { description: "Thunderstorm", icon: "bi-cloud-lightning" },
    night: { description: "Thunderstorm", icon: "bi-cloud-lightning" },
  },
  96: {
    day: {
      description: "Thunderstorm with slight hail",
      icon: "bi-cloud-lightning-rain",
    },
    night: {
      description: "Thunderstorm with slight hail",
      icon: "bi-cloud-lightning-rain",
    },
  },
  99: {
    day: {
      description: "Thunderstorm with heavy hail",
      icon: "bi-cloud-lightning-rain-fill",
    },
    night: {
      description: "Thunderstorm with heavy hail",
      icon: "bi-cloud-lightning-rain-fill",
    },
  },
};
export default defaultWmoDescriptions;
