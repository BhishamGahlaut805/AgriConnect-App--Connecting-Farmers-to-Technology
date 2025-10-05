import {
  CalendarDaysIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Tooltip } from "react-tooltip";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const DiseaseAlerts = ({ farmData }) => {
  const lstm_prediction = farmData?.lstm_prediction || [];
  const top_disease_risks = farmData?.top_disease_risks || [];

  const getRiskColor = (risk) => {
    if (risk > 1.7) return "bg-red-500";
    if (risk > 1.4) return "bg-yellow-400";
    return "bg-green-500";
  };

  const getRiskLevel = (risk) => {
    if (risk > 1.7) return "High";
    if (risk > 1.4) return "Medium";
    return "Low";
  };

  const getRiskTextColor = (risk) => {
    if (risk > 1.7) return "text-red-600 dark:text-red-400";
    if (risk > 1.4) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const aggregateDiseases = () => {
    const map = {};
    top_disease_risks.forEach((entry) => {
      const key = entry.disease;
      if (!map[key]) {
        map[key] = {
          count: 0,
          confidence: 0,
          distance: entry.distance_km,
        };
      }
      map[key].count += 1;
      map[key].confidence = Math.max(map[key].confidence, entry.confidence);
      map[key].distance = Math.min(map[key].distance, entry.distance_km);
    });

    return Object.entries(map)
      .sort((a, b) => b[1].confidence - a[1].confidence)
      .slice(0, 5);
  };

  // Prepare data for the forecast chart
  const forecastChartData = {
    labels: lstm_prediction.map((pred) =>
      new Date(pred.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    ),
    datasets: [
      {
        label: "Disease Risk %",
        data: lstm_prediction.map((pred) =>
          parseFloat(pred["predicted_risk%"]).toFixed(2)
        ),
        borderColor: "#7c3aed",
        backgroundColor: "rgba(124, 58, 237, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: lstm_prediction.map((pred) => {
          const risk = parseFloat(pred["predicted_risk%"]);
          if (risk > 1.7) return "#ef4444";
          if (risk > 1.4) return "#f59e0b";
          return "#10b981";
        }),
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const forecastChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `Risk: ${context.raw}% (${getRiskLevel(context.raw)})`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Risk Percentage (%)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
    },
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 border border-indigo-100 dark:border-gray-700">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <ExclamationTriangleIcon className="h-7 w-7 text-violet-600 dark:text-violet-400 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Disease Alerts & Forecast
          </h2>
          <InformationCircleIcon
            className="h-5 w-5 text-gray-400 ml-2 cursor-help"
            data-tooltip-id="main-tooltip"
            data-tooltip-content="Predictions based on weather patterns, historical data, and nearby outbreaks"
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 pl-10">
          Risk assessment for your farm location and nearby disease outbreaks
        </p>
      </div>

      {/* 🔮 10-Day Forecast Section */}
      {lstm_prediction.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              <span className="bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200 px-3 py-1 rounded-full mr-2">
                10-Day Disease Forecast
              </span>
            </h3>
            <InformationCircleIcon
              className="h-4 w-4 text-gray-400 ml-1 cursor-help"
              data-tooltip-id="forecast-tooltip"
              data-tooltip-content="Predicted disease risk based on weather patterns, historical data, and reports from nearby farms"
            />
          </div>

          {/* Introductory Text */}
          <div className="bg-white/80 dark:bg-gray-800/90 p-4 rounded-lg mb-4 border border-indigo-50 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Based on analysis of{" "}
              <span className="font-medium text-violet-600 dark:text-violet-400">
                weather patterns
              </span>
              ,
              <span className="font-medium text-violet-600 dark:text-violet-400">
                {" "}
                historical outbreak data
              </span>
              , and
              <span className="font-medium text-violet-600 dark:text-violet-400">
                {" "}
                reports from {top_disease_risks.length} nearby farms
              </span>
              , this forecast predicts disease risk levels and potential spread
              radius for your location.
            </p>
          </div>

          {/* Horizontal Layout - Graph and Cards */}
                <div className="flex flex-col lg:flex-row gap-6">
                {/* Graph Section */}
                <div className="lg:w-2/3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-indigo-50 dark:border-gray-700">
                  <div className="h-150 w-full">
                  <Line data={forecastChartData} options={forecastChartOptions} />
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                  Hover over points for detailed risk information
                  </div>
                </div>

                {/* Cards Section - First 5 days */}
            <div className="lg:w-1/3">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center">
                <CalendarDaysIcon className="h-4 w-4 mr-1" />
                Upcoming 5 Days Detail
              </h4>
              <div className="space-y-3">
                {lstm_prediction.slice(0, 5).map((pred, index) => {
                  const risk = parseFloat(pred["predicted_risk%"]).toFixed(2);
                  const radius = parseFloat(
                    pred["predicted_radius_Km"]
                  ).toFixed(1);
                  const date = new Date(pred.date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  });

                  return (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-indigo-50 dark:border-gray-700 hover:shadow-md transition-shadow"
                      data-tooltip-id={`day-tooltip-${index}`}
                      data-tooltip-html={`<div class="text-sm"><b>${new Date(
                        pred.date
                      ).toLocaleDateString("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}</b><br/>Risk Level: ${getRiskLevel(
                        risk
                      )}<br/>Spread Radius: ${radius} km</div>`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium text-violet-700 dark:text-violet-300">
                            {date}
                          </div>
                          <div
                            className={`text-xl font-bold ${getRiskTextColor(
                              risk
                            )} mt-1`}
                          >
                            {risk}%
                          </div>
                        </div>
                        <div
                          className={`h-3 w-3 rounded-full mt-1 ${getRiskColor(
                            risk
                          )}`}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex items-center">
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        Spread: ~{radius} km radius
                      </div>
                      <div className="mt-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                        {getRiskLevel(risk)} Risk
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Full 10-Day Forecast Cards */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center">
              <CalendarDaysIcon className="h-4 w-4 mr-1" />
              Complete 10-Day Forecast
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {lstm_prediction.map((pred, index) => {
                const risk = parseFloat(pred["predicted_risk%"]).toFixed(2);
                const radius = parseFloat(pred["predicted_radius_Km"]).toFixed(
                  1
                );
                const date = new Date(pred.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                });

                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-indigo-50 dark:border-gray-700 hover:shadow-md transition-shadow"
                    data-tooltip-id={`day-tooltip-${index}`}
                    data-tooltip-html={`<div class="text-sm"><b>${new Date(
                      pred.date
                    ).toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}</b><br/>Risk Level: ${getRiskLevel(
                      risk
                    )}<br/>Spread Radius: ${radius} km</div>`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-medium text-violet-700 dark:text-violet-300">
                        {date}
                      </div>
                      <div
                        className={`h-2 w-2 rounded-full ${getRiskColor(risk)}`}
                      ></div>
                    </div>
                    <div
                      className={`text-lg font-bold ${getRiskTextColor(
                        risk
                      )} mt-1`}
                    >
                      {risk}%
                    </div>
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {radius} km
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 🦠 Nearby Disease Breakdown */}
      {top_disease_risks.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              <span className="bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200 px-3 py-1 rounded-full mr-2">
                Nearby Disease Threats
              </span>
            </h3>
            <InformationCircleIcon
              className="h-4 w-4 text-gray-400 ml-1 cursor-help"
              data-tooltip-id="disease-tooltip"
              data-tooltip-content="Diseases detected in farms near your location"
            />
          </div>

          <div className="bg-white/80 dark:bg-gray-800/90 p-4 rounded-lg mb-4 border border-indigo-50 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              The following diseases have been reported in farms within a{" "}
              <span className="font-medium text-violet-600 dark:text-violet-400">
                {Math.max(
                  ...top_disease_risks.map((d) => d.distance_km)
                ).toFixed(1)}{" "}
                km radius
              </span>{" "}
              of your location. These nearby outbreaks may affect your farm's
              risk level.
            </p>
          </div>

          <div className="space-y-3">
            {aggregateDiseases().map(([disease, info], index) => {
              const distance = info.distance.toFixed(1);
              const confidence = Math.round(info.confidence * 100);
              const severity =
                confidence > 70 ? "High" : confidence > 40 ? "Medium" : "Low";

              return (
                <div
                  key={index}
                  className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-indigo-50 dark:border-gray-700 hover:shadow-md transition-shadow"
                  data-tooltip-id={`disease-tooltip-${index}`}
                  data-tooltip-html={`<div class="text-sm"><b>${disease}</b><br/>Detected in ${info.count} nearby farms<br/>Closest outbreak: ${distance} km away<br/>Max confidence: ${confidence}%</div>`}
                >
                  <div className="flex items-center">
                    <div
                      className={`h-4 w-4 rounded-full mr-3 ${
                        severity === "High"
                          ? "bg-red-500"
                          : severity === "Medium"
                          ? "bg-yellow-400"
                          : "bg-green-500"
                      }`}
                    ></div>
                    <div>
                      <h4 className="text-md font-semibold text-gray-800 dark:text-white">
                        {disease}
                      </h4>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <MapPinIcon className="h-3 w-3 mr-1" />~{distance} km
                        away • {info.count} reports
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-bold ${
                        severity === "High"
                          ? "text-red-600 dark:text-red-400"
                          : severity === "Medium"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {severity} Risk
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {confidence}% confidence
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* React Tooltips */}
      <Tooltip id="main-tooltip" className="z-50" />
      <Tooltip id="forecast-tooltip" className="z-50" />
      <Tooltip id="disease-tooltip" className="z-50" />
      {lstm_prediction.map((_, index) => (
        <Tooltip key={index} id={`day-tooltip-${index}`} className="z-50" />
      ))}
      {aggregateDiseases().map((_, index) => (
        <Tooltip key={index} id={`disease-tooltip-${index}`} className="z-50" />
      ))}
    </div>
  );
};

export default DiseaseAlerts;
