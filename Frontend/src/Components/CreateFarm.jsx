// src/components/CreateFarm.jsx
import { useEffect, useState } from "react";
import {
  MapPinIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Tooltip } from "react-tooltip";
import AgriService from "../API/AgriService";

const CreateFarm = ({ userId, username, onCreate, onCancel }) => {
  const [farmName, setFarmName] = useState("");
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [userFarms, setUserFarms] = useState([]);
  const [loadingFarms, setLoadingFarms] = useState(true);

  // Fetch user farms
  useEffect(() => {
    const loadUserFarms = async () => {
      try {
        const data = await AgriService.getFarmData(userId);
        // Handle both array and single object responses
        if (Array.isArray(data)) {
          setUserFarms(data);
        } else if (data && typeof data === "object") {
          setUserFarms([data]);
        } else {
          setUserFarms([]);
        }
      } catch (err) {
        console.error("Error loading user farms:", err);
        setUserFarms([]);
      } finally {
        setLoadingFarms(false);
      }
    };
    loadUserFarms();
  }, [userId]);

  // Fetch user location
  useEffect(() => {
    let isMounted = true;

    const fetchLocation = async () => {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        });

        if (isMounted) {
          setCoords({
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
            accuracy: position.coords.accuracy.toFixed(2),
          });
          setLocationError(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Location error:", err);
          setLocationError(true);
          setError("Location permission denied. Enable GPS and retry.");
        }
      }
    };

    fetchLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError("");

    if (!farmName.trim()) {
      setError("Please enter a farm name.");
      setIsCreating(false);
      return;
    }

    if (!coords) {
      setError("Location data not available. Please wait or retry.");
      setIsCreating(false);
      return;
    }

    try {
      const newFarm = await AgriService.createFarm({
        user_id: userId,
        farm_name: farmName.trim(),
        latitude: parseFloat(coords.latitude),
        longitude: parseFloat(coords.longitude),
      });

      setSuccess({
        message: "Farm created successfully!",
        farm: newFarm,
      });

      // Refresh farm list
      const updatedFarms = await AgriService.getFarmData(userId);
      setUserFarms(Array.isArray(updatedFarms) ? updatedFarms : [updatedFarms]);

      onCreate?.(newFarm);
    } catch (err) {
      console.error("Farm creation error:", err);
      setError(err.message || "Failed to create farm. Try again later.");
    } finally {
      setIsCreating(false);
    }
  };

  // Retry GPS
  const retryLocation = async () => {
    setError("");
    setLocationError(false);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
      setCoords({
        latitude: position.coords.latitude.toFixed(6),
        longitude: position.coords.longitude.toFixed(6),
        accuracy: position.coords.accuracy.toFixed(2),
      });
    } catch (err) {
      setLocationError(true);
      setError("Location access denied. Please enable GPS.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 max-w-3xl mx-auto mt-8 border border-violet-100 dark:border-violet-900/50">
      <h2 className="text-2xl font-bold text-violet-800 dark:text-violet-200 mb-4">
        {success ? "🎉 Farm Created Successfully!" : "🌱 Your Farms & Setup"}
      </h2>

      {/* Display farms if any */}
      {loadingFarms ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
        </div>
      ) : userFarms.length > 0 ? (
        <div className="mb-6">
          <h3 className="text-md font-semibold text-violet-700 dark:text-violet-300 mb-3">
            Your Existing Farms:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userFarms.map((farm, idx) => (
              <div
                key={farm._id || idx}
                className="bg-violet-50 dark:bg-violet-900/20 p-3 rounded-lg border border-violet-100 dark:border-violet-900/30"
              >
                <div className="flex items-start">
                  <div className="bg-violet-100 dark:bg-violet-800/50 p-2 rounded-lg mr-3">
                    <MapPinIcon className="h-5 w-5 text-violet-600 dark:text-violet-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-violet-800 dark:text-violet-100">
                      {farm.farm_name}
                      {farm.farm_id && (
                        <span
                          className="ml-2 text-xs bg-violet-200 dark:bg-violet-800/70 text-violet-700 dark:text-violet-200 px-2 py-0.5 rounded-full"
                          data-tooltip-id="farm-id-tooltip"
                          data-tooltip-content={`Farm ID: ${farm.farm_id}`}
                        >
                          ID
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-violet-600 dark:text-violet-300 mt-1">
                      📍 {farm.latitude}, {farm.longitude}
                    </p>
                    {farm.last_trained_at && (
                      <p className="text-xs text-violet-500 dark:text-violet-400 mt-1">
                        Last trained:{" "}
                        {new Date(farm.last_trained_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-violet-600/80 dark:text-violet-300/80 mb-4 italic">
          You don't have any farms yet. Let's create your first one!
        </p>
      )}

      {/* Show success message */}
      {success ? (
        <div className="space-y-4">
          <div className="bg-violet-100 dark:bg-violet-900/30 p-4 rounded-md flex items-start">
            <CheckCircleIcon className="h-6 w-6 text-violet-600 mr-3 flex-shrink-0" />
            <div>
              <p className="text-violet-800 dark:text-violet-200 font-medium">
                {success.message}
              </p>
              {success.farm && (
                <div className="mt-2 text-sm text-violet-700 dark:text-violet-300">
                  <p>
                    <strong>Name:</strong> {success.farm.farm_name}
                  </p>
                  <p>
                    <strong>Location:</strong> {success.farm.latitude},{" "}
                    {success.farm.longitude}
                  </p>
                  {success.farm.farm_id && (
                    <p>
                      <strong>Farm ID:</strong> {success.farm.farm_id}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSuccess(null);
                setFarmName("");
                onCancel?.();
              }}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-md shadow transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Farm name */}
          <div>
            <label className="block text-sm font-medium mb-1 text-violet-800 dark:text-violet-200">
              Farm Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="e.g. Sunny Acres Farm"
              className="w-full p-2 border border-violet-200 dark:border-violet-700 rounded-md dark:bg-violet-900/20 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              required
            />
          </div>

          {/* Location */}
          <div className="bg-violet-50 dark:bg-violet-900/10 p-4 rounded-md border border-violet-100 dark:border-violet-900/20">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center text-violet-800 dark:text-violet-200">
                <MapPinIcon className="h-4 w-4 mr-2 text-violet-600" />
                Your Location
              </h3>
              {locationError && (
                <button
                  onClick={retryLocation}
                  type="button"
                  className="text-xs text-violet-600 dark:text-violet-300 hover:text-violet-800 dark:hover:text-violet-200 flex items-center"
                >
                  <ArrowPathIcon className="h-3 w-3 mr-1" />
                  Retry
                </button>
              )}
            </div>
            {coords ? (
              <div className="mt-2">
                <p className="text-sm text-violet-700 dark:text-violet-300">
                  <span className="font-medium">Latitude:</span>{" "}
                  {coords.latitude}
                  <br />
                  <span className="font-medium">Longitude:</span>{" "}
                  {coords.longitude}
                </p>
                <p className="text-xs text-violet-500 dark:text-violet-400 mt-1">
                  Accuracy: ±{coords.accuracy} meters
                </p>
              </div>
            ) : locationError ? (
              <p className="text-red-500 text-sm mt-2">
                <XCircleIcon className="h-4 w-4 inline mr-1" />
                Couldn't fetch location. Please enable GPS and try again.
              </p>
            ) : (
              <div className="flex items-center mt-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-violet-500 mr-2"></div>
                <p className="text-sm text-violet-600 dark:text-violet-300">
                  Detecting your location...
                </p>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-md flex items-start">
              <XCircleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between pt-2">
            <button
              onClick={onCancel}
              type="button"
              className="text-sm text-violet-600 dark:text-violet-300 hover:text-violet-800 dark:hover:text-violet-200 px-3 py-2 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || locationError}
              className={`px-4 py-2 rounded-md text-white flex items-center transition-colors ${
                isCreating || locationError
                  ? "bg-violet-400 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-700"
              }`}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <PlusCircleIcon className="h-5 w-5 mr-1" />
                  Create Farm
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Tooltip for farm IDs */}
      <Tooltip id="farm-id-tooltip" className="z-50" />
    </div>
  );
};

export default CreateFarm;
