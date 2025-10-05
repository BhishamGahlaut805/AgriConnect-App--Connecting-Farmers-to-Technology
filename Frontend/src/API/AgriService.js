// src/API/AgriService.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const BASE_URL_FLASK = import.meta.env.VITE_BACKEND_FLASK_URL;
const TIMEOUT = 5000;

class AgriService {
  // Fetch all farms for a user
  static async getAllData() {
    try {
      const res = await fetch(`${BASE_URL}/api/farms`);
      if (!res.ok) throw new Error("Farm data not found");
      const data = await res.json();
      console.log("Farm data fetched successfully:", data);
      return data;
    } catch (err) {
      console.error("Farm fetch error:", err);
      throw err;
    }
  }
  //Fetch user's farm data
  static async getFarmData(userId) {
    try {
      const res = await fetch(`${BASE_URL}/api/farms/${userId}`);
      if (!res.ok) throw new Error("Farm data not found");
      const data = await res.json();
      console.log("Farm data fetched successfully:", data);
      return data;
    } catch (err) {
      console.error("Farm fetch error:", err);
      throw err;
    }
  }

  //Sample Response:
  //Sample response from getFarmData(userId):
  //{
  //     "_id": "686dd1781427f0c0af601cb0",
  //     "farm_name": "SampleFarm",
  //     "latitude": 28.87,
  //     "longitude": 78.9,
  //     "user_id": "687384eaf8246bd0befdda60",
  //     "report_folder": "C:\\Users\\bhish\\OneDrive\\Desktop\\AgriSupport\\ML\\TrainingReports\\BhishamFarmNew",
  //     "nearby_farms": [
  //         {
  //             "_id": "6875e5bb560327f79ef0e6a0",
  //             "farm_id": "FARM_1752027955_D52242",
  //             "farm_name": "BhishamFarm4",
  //             "latitude": 78.92,
  //             "longitude": 28.923,
  //             "distance_km": 2.5
  //         },
  //         {
  //             "_id": "6875e5bb560327f79ef0e6a1",
  //             "farm_id": "FARM_1752028581_8242FE",
  //             "farm_name": "New Farm2",
  //             "latitude": 78.8888,
  //             "longitude": 28.9222,
  //             "distance_km": 1.67
  //         }
  //     ],
  //     "agro_polygon": {
  //         "geo_json": {
  //             "geometry": {
  //                 "type": "Polygon",
  //                 "coordinates": [
  //                     [
  //                         [
  //                             28.8685,
  //                             78.8985
  //                         ],
  //                         [
  //                             28.8715,
  //                             78.8985
  //                         ],
  //                         [
  //                             28.8715,
  //                             78.9015
  //                         ],
  //                         [
  //                             28.8685,
  //                             78.9015
  //                         ],
  //                         [
  //                             28.8685,
  //                             78.8985
  //                         ]
  //                     ]
  //                 ]
  //             },
  //             "type": "Feature"
  //         },
  //         "polygon_id": "686dcfd2a049de4a054b1916",
  //         "area": 2.1471,
  //         "center": [
  //             28.87,
  //             78.9
  //         ],
  //         "created_at": 1752027464,
  //         "_id": "6875e5bb560327f79ef0e6a2"
  //     },
  //     "farm_id": "FARM_1752027512_E3574F",
  //     "last_trained_at": "2025-07-13T08:28:39.209Z",
  //     "top_disease_risks": [
  //         {
  //             "_id": "6875e5bb560327f79ef0e6a3",
  //             "distance_km": 0.088,
  //             "disease": "Tomato_Yellow_Leaf_Curl_Virus",
  //             "confidence": 0.422
  //         },
  //         {
  //             "_id": "6875e5bb560327f79ef0e6a4",
  //             "distance_km": 0.088,
  //             "disease": "Early blight",
  //             "confidence": 1
  //         },
  //         {
  //             "_id": "6875e5bb560327f79ef0e6a5",
  //             "distance_km": 0.109,
  //             "disease": "Early blight",
  //             "confidence": 1
  //         },
  //         {
  //             "_id": "6875e5bb560327f79ef0e6a6",
  //             "distance_km": 0.115,
  //             "disease": "Early blight",
  //             "confidence": 1
  //         },
  //         {
  //             "_id": "6875e5bb560327f79ef0e6a7",
  //             "distance_km": 0.146,
  //             "disease": "Early blight",
  //             "confidence": 1
  //         }
  //     ],
  //     "training_csv_path": "C:\\Users\\bhish\\OneDrive\\Desktop\\AgriSupport\\ML\\TrainingReports\\BhishamFarmNew\\training.csv",
  //     "lstm_last_updated": "2025-07-13T08:28:47.916Z",
  //     "lstm_prediction": [
  //         {
  //             "_id": "6875e5bb560327f79ef0e6a8",
  //             "date": "2025-07-14",
  //             "predicted_risk%": 1.46,
  //             "predicted_radius_Km": 0.44
  //         },
  //         {
  //             "_id": "6875e5bb560327f79ef0e6a9",
  //             "date": "2025-07-15",
  //             "predicted_risk%": 1.66,
  //             "predicted_radius_Km": 0.46
  //         },
  //         {
  //             "_id": "6875e5bb560327f79ef0e6aa",
  //             "date": "2025-07-16",
  //             "predicted_risk%": 1.5,
  //             "predicted_radius_Km": 0.46
  //         },
  //         {
  //             "_id": "6875e5bb560327f79ef0e6ab",
  //             "date": "2025-07-17",
  //             "predicted_risk%": 1.4,
  //             "predicted_radius_Km": 0.46
  //         },
  //         {
  //             "_id": "6875e5bb560327f79ef0e6ac",
  //             "date": "2025-07-18",
  //             "predicted_risk%": 1.51,
  //             "predicted_radius_Km": 0.47
  //         },
  //         {
  //             "_id": "6875e5bb560327f79ef0e6ad",
  //             "date": "2025-07-19",
  //             "predicted_risk%": 1.67,
  //             "predicted_radius_Km": 0.46
  //         },
  //         {
  //             "_id": "6875e5bb560327f79ef0e6ae",
  //             "date": "2025-07-20",
  //             "predicted_risk%": 1.2,
  //             "predicted_radius_Km": 0.46
  //         },
  //         {
  //             "_id": "6875e5bb560327f79ef0e6af",
  //             "date": "2025-07-21",
  //             "predicted_risk%": 1.38,
  //             "predicted_radius_Km": 0.46
  //         },
  //         {
  //             "_id": "6875e5bb560327f79ef0e6b0",
  //             "date": "2025-07-22",
  //             "predicted_risk%": 1.84,
  //             "predicted_radius_Km": 0.45
  //         },
  //         {
  //             "_id": "6875e5bb560327f79ef0e6b1",
  //             "date": "2025-07-23",
  //             "predicted_risk%": 1.91,
  //             "predicted_radius_Km": 0.45
  //         }
  //     ]
  // }

  //  Get summarized data for dashboard
  static async getUserSummary(userId) {
    try {
      const res = await fetch(`${BASE_URL}/api/user-summary/${userId}`);
      if (!res.ok) throw new Error("User summary not found");
      return await res.json();
    } catch (err) {
      console.error("User summary fetch error:", err);
      throw err;
    }
  }
  // Sample response from getUserSummary(userId):
  //   {
  //     "_id": "686de8550d353678c2e4c603",
  //     "user_id": "687384eaf8246bd0befdda60",
  //     "created_at": "2025-07-13T08:28:54.902Z",
  //     "summary": {
  //         "total_images": 120,
  //         "total_diseased": 83,
  //         "last_updated": "2025-07-13T08:28:54.902Z",
  //         "max_risk_percent": 47.14,
  //         "top_diseases": {
  //             "Early blight": 31,
  //             "Northern_Leaf_Blight": 18,
  //             "Target Spot": 12,
  //             "Healthy": 6,
  //             "Tomato_Yellow_Leaf_Curl_Virus": 6
  //         }
  //     }
  // }

  // Fetch all disease reports for a farm
  static async getDiseaseReports(farmId) {
    try {
      const res = await fetch(`${BASE_URL}/api/disease-reports/${farmId}`);
      if (!res.ok) throw new Error("Disease reports not found");
      return await res.json();
    } catch (err) {
      console.error("Disease reports fetch error:", err);
      throw err;
    }
  }
  //// Sample response from getDiseaseReports(farmId):
  // [
  //   {
  //       "_id": "686e59e2acf357d3c3871f5e",
  //       "farm_name": "NEWFARM5",
  //       "farm_id": "FARM_1752028581_8242FE",
  //       "latitude": null,
  //       "longitude": null,
  //       "crop": "Potato",
  //       "disease": "Early blight",
  //       "confidence": 0.9963,
  //       "image_path": "zoom_11.jpg",
  //       "timestamp": "2025-07-09T12:00:34.022Z"
  //   },
  //   {
  //       "_id": "686e59e1acf357d3c3871f5d",
  //       "farm_name": "NEWFARM5",
  //       "farm_id": "FARM_1752028581_8242FE",
  //       "latitude": null,
  //       "longitude": null,
  //       "crop": "Potato",
  //       "disease": "Healthy",
  //       "confidence": 0.62,
  //       "image_path": "zoom_10.jpg",
  //       "timestamp": "2025-07-09T12:00:33.858Z"
  //   },
  //   {
  //       "_id": "686e59e1acf357d3c3871f5c",
  //       "farm_name": "NEWFARM5",
  //       "farm_id": "FARM_1752028581_8242FE",
  //       "latitude": null,
  //       "longitude": null,
  //       "crop": "Potato",
  //       "disease": "Healthy",
  //       "confidence": 0.7321,
  //       "image_path": "zoom_14.jpg",
  //       "timestamp": "2025-07-09T12:00:33.669Z"
  //   },
  //   {
  //       "_id": "686e59e1acf357d3c3871f5b",
  //       "farm_name": "NEWFARM5",
  //       "farm_id": "FARM_1752028581_8242FE",
  //       "latitude": null,
  //       "longitude": null,
  //       "crop": "Potato",
  //       "disease": "Healthy",
  //       "confidence": 0.7153,
  //       "image_path": "zoom_12.jpg",
  //       "timestamp": "2025-07-09T12:00:33.519Z"
  //   },
  //   {
  //       "_id": "686e59e1acf357d3c3871f5a",
  //       "farm_name": "NEWFARM5",
  //       "farm_id": "FARM_1752028581_8242FE",
  //       "latitude": null,
  //       "longitude": null,
  //       "crop": "Potato",
  //       "disease": "Early blight",
  //       "confidence": 1,
  //       "image_path": "Potato___Late_blight_73.JPG",
  //       "timestamp": "2025-07-09T12:00:33.250Z"
  //   },
  //   {
  //       "_id": "686e59e1acf357d3c3871f59",
  //       "farm_name": "NEWFARM5",
  //       "farm_id": "FARM_1752028581_8242FE",
  //       "latitude": null,
  //       "longitude": null,
  //       "crop": "Potato",
  //       "disease": "Early blight",
  //       "confidence": 0.9708,
  //       "image_path": "translation_zoom_8.jpg",
  //       "timestamp": "2025-07-09T12:00:33.048Z"
  //   },
  //   {
  //       "_id": "686e59e0acf357d3c3871f58",
  //       "farm_name": "NEWFARM5",
  //       "farm_id": "FARM_1752028581_8242FE",
  //       "latitude": 28.8734,
  //       "longitude": 78.902,
  //       "crop": "Potato",
  //       "disease": "Late blight",
  //       "confidence": 0.8227,
  //       "image_path": "translation_zoom_5.jpg",
  //       "timestamp": "2025-07-09T12:00:32.900Z"
  //   },
  //   ...and so on...
  // ];

  //  Get overall statistics for a farm
  static async getFarmStats(farmId) {
    try {
      const res = await fetch(`${BASE_URL}/api/farm-stats/${farmId}`);
      if (!res.ok) throw new Error("Farm stats not found");
      return await res.json();
    } catch (err) {
      console.error("Farm stats fetch error:", err);
      throw err;
    }
  }

  // Sample response from getFarmStats(farmId):
  //   [
  //     {
  //         "_id": "68736e46ac23862839d00935",
  //         "farm_id": "FARM_1752028581_8242FE",
  //         "date": "2025-07-13",
  //         "created_at": "2025-07-13T08:28:54.880Z",
  //         "crop_counts": {
  //             "Tomato": 20,
  //             "Grape": 2,
  //             "Cotton": 15,
  //             "Potato": 38,
  //             "Blueberry": 18,
  //             "Corn_(maize)": 26,
  //             "Strawberry": 1,
  //             "_id": "6875ebed648183054a10f0ae"
  //         },
  //         "disease_counts": {
  //             "Healthy": 6,
  //             "Target Spot": 12,
  //             "Early blight": 31,
  //             "Late blight": 2,
  //             "Tomato_Yellow_Leaf_Curl_Virus": 6,
  //             "Northern_Leaf_Blight": 18,
  //             "Common_rust": 6,
  //             "Late_blight": 1,
  //             "Leaf_scorch": 1,
  //             "_id": "6875ebed648183054a10f0af"
  //         },
  //         "diseased_images_found": 83,
  //         "last_updated": "2025-07-13T08:28:54.880Z",
  //         "max_risk_percent": 47.14,
  //         "most_common_crop": "Potato",
  //         "most_common_disease": "Early blight",
  //         "total_images_analyzed": 120
  //     },
  //     {
  //         "_id": "68720661d8ecf55231d68e19",
  //         "date": "2025-07-12",
  //         "farm_id": "FARM_1752028581_8242FE",
  //         "created_at": "2025-07-12T06:53:21.298Z",
  //         "crop_counts": {
  //             "Tomato": 20,
  //             "Grape": 2,
  //             "Cotton": 15,
  //             "Potato": 38,
  //             "Blueberry": 18,
  //             "Corn_(maize)": 26,
  //             "Strawberry": 1,
  //             "_id": "6875ebed648183054a10f0b0"
  //         },
  //         "disease_counts": {
  //             "Healthy": 6,
  //             "Target Spot": 12,
  //             "Early blight": 31,
  //             "Late blight": 2,
  //             "Tomato_Yellow_Leaf_Curl_Virus": 6,
  //             "Northern_Leaf_Blight": 18,
  //             "Common_rust": 6,
  //             "Late_blight": 1,
  //             "Leaf_scorch": 1,
  //             "_id": "6875ebed648183054a10f0b1"
  //         },
  //         "diseased_images_found": 83,
  //         "last_updated": "2025-07-12T06:53:21.298Z",
  //         "max_risk_percent": 38.28,
  //         "most_common_crop": "Potato",
  //         "most_common_disease": "Early blight",
  //         "total_images_analyzed": 120
  //     },
  //     {
  //         "_id": "6870c1afabbdedae076d0f9b",
  //         "date": "2025-07-11",
  //         "farm_id": "FARM_1752028581_8242FE",
  //         "created_at": "2025-07-11T07:47:58.989Z",
  //         "crop_counts": {
  //             "Tomato": 20,
  //             "Grape": 2,
  //             "Cotton": 15,
  //             "Potato": 38,
  //             "Blueberry": 18,
  //             "Corn_(maize)": 26,
  //             "Strawberry": 1,
  //             "_id": "6875ebed648183054a10f0b2"
  //         },
  //         "disease_counts": {
  //             "Healthy": 6,
  //             "Target Spot": 12,
  //             "Early blight": 31,
  //             "Late blight": 2,
  //             "Tomato_Yellow_Leaf_Curl_Virus": 6,
  //             "Northern_Leaf_Blight": 18,
  //             "Common_rust": 6,
  //             "Late_blight": 1,
  //             "Leaf_scorch": 1,
  //             "_id": "6875ebed648183054a10f0b3"
  //         },
  //         "diseased_images_found": 83,
  //         "last_updated": "2025-07-11T07:47:58.989Z",
  //         "max_risk_percent": 24.08,
  //         "most_common_crop": "Potato",
  //         "most_common_disease": "Early blight",
  //         "total_images_analyzed": 120
  //     },
  //     {
  //         "_id": "686f7ca9f35205ee01bb3f72",
  //         "farm_id": "FARM_1752028581_8242FE",
  //         "date": "2025-07-10",
  //         "created_at": "2025-07-10T08:42:57.635Z",
  //         "crop_counts": {
  //             "Tomato": 20,
  //             "Grape": 2,
  //             "Cotton": 15,
  //             "Potato": 38,
  //             "Blueberry": 18,
  //             "Corn_(maize)": 26,
  //             "Strawberry": 1,
  //             "_id": "6875ebed648183054a10f0b4"
  //         },
  //         "disease_counts": {
  //             "Healthy": 6,
  //             "Target Spot": 12,
  //             "Early blight": 31,
  //             "Late blight": 2,
  //             "Tomato_Yellow_Leaf_Curl_Virus": 6,
  //             "Northern_Leaf_Blight": 18,
  //             "Common_rust": 6,
  //             "Late_blight": 1,
  //             "Leaf_scorch": 1,
  //             "_id": "6875ebed648183054a10f0b5"
  //         },
  //         "diseased_images_found": 83,
  //         "last_updated": "2025-07-10T08:42:57.635Z",
  //         "max_risk_percent": 47.67,
  //         "most_common_crop": "Potato",
  //         "most_common_disease": "Early blight",
  //         "total_images_analyzed": 120
  //     },
  //     {
  //         "_id": "686de8550d353678c2e4c602",
  //         "farm_id": "FARM_1752028581_8242FE",
  //         "date": "2025-07-09",
  //         "created_at": "2025-07-09T14:47:43.605Z",
  //         "crop_counts": {
  //             "Tomato": 20,
  //             "Grape": 2,
  //             "Cotton": 15,
  //             "Potato": 38,
  //             "Blueberry": 18,
  //             "Corn_(maize)": 26,
  //             "Strawberry": 1,
  //             "_id": "6875ebed648183054a10f0b6"
  //         },
  //         "disease_counts": {
  //             "Healthy": 6,
  //             "Target Spot": 12,
  //             "Early blight": 31,
  //             "Late blight": 2,
  //             "Tomato_Yellow_Leaf_Curl_Virus": 6,
  //             "Northern_Leaf_Blight": 18,
  //             "Common_rust": 6,
  //             "Late_blight": 1,
  //             "Leaf_scorch": 1,
  //             "_id": "6875ebed648183054a10f0b7"
  //         },
  //         "diseased_images_found": 83,
  //         "last_updated": "2025-07-09T14:47:43.605Z",
  //         "total_images_analyzed": 120,
  //         "max_risk_percent": 32.1,
  //         "most_common_crop": "Potato",
  //         "most_common_disease": "Early blight"
  //     }
  // ]

  // Create a new farm with geolocation and proper error handling
  static async createFarm(payload) {
    try {
      const res = await axios.post(`${BASE_URL_FLASK}/api/createFarm`, payload);
      return res.data;
    } catch (err) {
      console.error("API createFarm error:", err);
      throw new Error(
        err.response?.data?.error || "Failed to create farm via API"
      );
    }
  }

  static async predictCropDisease(data) {
    try {
      const formData = new FormData();

      // Append images (each one must use field name 'image')
      if (Array.isArray(data.images)) {
        data.images.forEach((image) => {
          formData.append("image", image);
        });
      }

      // Append other fields safely
      formData.append("farm_id", data.farm_id || "unknown_farm");
      formData.append("farm_name", data.farm_name || "Unknown Farm");
      formData.append("latitude", data.latitude?.toString() || ""); // optional
      formData.append("longitude", data.longitude?.toString() || ""); // optional
      formData.append("model_type", data.modelType?.toLowerCase() || "all");

      const response = await fetch(`${BASE_URL_FLASK}/api/predictDisease`, {
        method: "POST",
        body: formData,
        // Content-Type is automatically set to multipart/form-data with boundary
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Prediction request failed");
      }

      console.log("Prediction response:", result);
      return result;
    } catch (error) {
      console.error("Prediction error:", error);
      throw new Error(`Prediction failed: ${error.message}`);
    }
  }

  // 🔹 Get full crop report
  static async getCropReport({
    crop,
    disease,
    confidence = 0,
    imageUrl = null,
    imageFile = null,
  }) {
    try {
      const formData = new FormData();
      formData.append("crop", crop);
      formData.append("disease", disease);
      formData.append("confidence", confidence.toString());

      if (imageFile) {
        formData.append("image", imageFile, imageFile.name);
      } else if (imageUrl) {
        formData.append("imageUrl", imageUrl);
      }

      const res = await axios.post(
        `${BASE_URL}/api/reports/crop-report`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: TIMEOUT,
        }
      );
      console.log("Crop report request:", {
        crop,
        disease,
        confidence,
        imageUrl,
        imageFile: imageFile ? imageFile.name : null,
      });
      const data2 = res.data;
      console.log("Crop report response:", data2);
      return res.data;
    } catch (err) {
      if (axios.isCancel(err)) throw new Error("Request timed out");
      console.error("Crop report error:", err);
      throw err;
    }
  }

  static async getAllReports() {
    try {
      const res = await fetch(`${BASE_URL}/api/reports/all`);
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      console.error("AgriService.getAllReports failed:", err);
      throw err;
    }
  }
}

export default AgriService;
