import React, { act, useState } from "react";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  ServerIcon,
  CpuChipIcon,
  ArrowDownOnSquareStackIcon as DatabaseIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CloudIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  CodeBracketIcon,
  WrenchScrewdriverIcon,
  DocumentChartBarIcon,
  CubeIcon,
  CommandLineIcon,
  BeakerIcon,
  MapIcon,
  PhotoIcon,
  CalendarIcon,
  GlobeAltIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  BookmarkIcon,
  PhoneIcon,

} from "@heroicons/react/24/outline";
import RouteMap from "../NewComponents/RouteMap.jsx";
import ImagesView from "./Arch/Images.jsx";

const AgriConnectAdvancedProjectReport = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedModule, setSelectedModule] = useState(null);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Comprehensive Project Data from PDF Report
  const projectData = {
    // Basic Project Information
    projectInfo: {
      title: "AgriConnect - AI Powered Agricultural Assistance Platform",
    },

    // Complete Problem Statement
    problemStatement: {
      title: "Agricultural Challenges in India",
      challenges: [
        "Crop diseases and pest infestations causing significant yield losses",
        "Unpredictable weather patterns affecting crop planning",
        "Fluctuating market prices impacting farmer income",
        "Lack of access to timely information and expert advice",
        "Manual monitoring of crops being inefficient and error-prone",
        "Dependency on local advisories with limited scope",
        "Reduced productivity and income due to information gaps",
      ],
      solution:
        "AgriConnect provides AI-driven insights, automated disease detection, yield forecasting, and real-time interactive platform for farmers",
    },

    // Detailed Objectives
    objectives: [
      {
        id: "obj1",
        title: "AI-Powered Disease Detection",
        description:
          "Develop CNN-based system for crop disease detection and prediction",
        technologies: ["TensorFlow", "CNN", "Computer Vision"],
        status: "Completed",
      },
      {
        id: "obj2",
        title: "Yield Prediction System",
        description:
          "Predict crop yield using LSTM models with historical and real-time environmental data",
        technologies: ["PyTorch", "LSTM", "Time-series Analysis"],
        status: "Completed",
      },
      {
        id: "obj3",
        title: "Weed Detection",
        description:
          "Real-time weed detection using YOLOv8 computer vision models",
        technologies: ["YOLOv8", "OpenCV", "Object Detection"],
        status: "Completed",
      },
      {
        id: "obj4",
        title: "Weather Analytics",
        description:
          "Provide farmer-friendly weather insights and crop advisory with TTS",
        technologies: ["Multiple APIs", "Data Visualization", "TTS"],
        status: "Completed",
      },
      {
        id: "obj5",
        title: "Interactive Dashboard",
        description:
          "Implement secure, interactive dashboard for farm management",
        technologies: ["React", "Node.js", "MongoDB"],
        status: "Completed",
      },
      {
        id: "obj6",
        title: "E-commerce Integration",
        description:
          "Integrate online marketplace (HarvestLink) for crop trading",
        technologies: ["Full-stack", "Payment Gateway", "Inventory Management"],
        status: "Completed",
      },
      {
        id: "obj7",
        title: "AI Chatbot",
        description:
          "Develop multilingual chatbot for farmer queries using AI and NLP",
        technologies: ["LangChain", "Gemini API", "Pinecone"],
        status: "Completed",
      },
    ],

    // Comprehensive System Architecture
    architecture: {
      overview:
        "AgriConnect features a modular microservices architecture with separate frontend, backend, and ML servers",
      components: {
        frontend: {
          technology: "React with Redux Toolkit",
          port: 3000,
          features: [
            "Farmer Dashboard",
            "AI Chatbot Interface",
            "Weather Insights Visualization",
            "Crop/Weed Alerts Display",
            "Real-time Analytics",
            "Interactive Maps",
          ],
        },
        backend: {
          technology: "Node.js + Express",
          port: 5000,
          features: [
            "Authentication & Authorization",
            "Database Operations",
            "ML Server Communication",
            "Weather Data Aggregation",
            "Farm Management Logic",
            "API Endpoints Management",
          ],
        },
        mlServer: {
          technology: "Python (PyTorch/TensorFlow/Flask)",
          port: 5500,
          features: [
            "LSTM Crop Yield Predictions",
            "YOLOv8 Weed Detection",
            "CNN Disease Classification",
            "Data Preprocessing",
            "Model Inference",
            "Real-time Processing",
          ],
        },
        database: {
          technology: "MongoDB + Pinecone",
          port: 27017,
          features: [
            "User & Farm Data Storage",
            "Weather & Prediction Records",
            "Vector Storage for AI Chatbot",
            "Model Results Storage",
            "Historical Data Archive",
          ],
        },
      },
      dataFlow: [
        "Frontend captures user input and sends to Backend",
        "Backend processes requests and communicates with ML Server",
        "ML Server runs AI models and returns predictions",
        "Results stored in MongoDB and sent back to Frontend",
        "Real-time updates via Socket.io connections",
      ],
    },

    // Detailed Module Specifications
    modules: {
      // CNN Disease Detection Module
      cnnDiseaseDetection: {
        title: "CNN-based Crop Disease Detection",
        status: "Production Ready",
        description:
          "Real-time crop leaf disease classification using convolutional neural networks with multi-crop support",
        technicalSpecs: {
          framework: "TensorFlow with Keras",
          models: [
            "Potato Model – specialized for potato leaf diseases",
            "General Model – covers 20+ crop types (tomato, rice, wheat, etc.)",
            "Cotton Model – specialized for cotton leaf diseases",
          ],
          training:
            "Transfer learning with fine-tuned pre-trained convolutional layers",
          input: "Crop leaf images (JPG, PNG, WEBP) with metadata",
          output: "Disease class prediction with confidence scores",
        },
        architecture: {
          inputLayer:
            "Farmers upload crop leaf images via React frontend with metadata (farm name, location, crop type)",
          processingLayer:
            "Flask API serving TensorFlow CNN models for inference",
          outputLayer:
            "Predictions stored in MongoDB with automated report generation",
        },
        integration: {
          frontend: "React dashboard for image upload and result display",
          backend: "Node.js handles API calls and database operations",
          storage: "MongoDB for prediction records and farm data",
          reporting:
            "LLM-based processing (Gemini API) for natural-language summaries",
        },
        performance: {
          accuracy: "70-80% for beginner non-GPU setup",
          processingTime: "2-3 seconds per image",
          supportedCrops:
            "20+ crops including tomato, potato, rice, wheat, cotton",
        },
      },

      // LSTM Disease Prediction
      lstmDiseasePrediction: {
        title: "LSTM-based Disease Prediction System",
        status: "Production Ready",
        description:
          "10-day disease risk prediction using historical farm data and LSTM networks",
        technicalSpecs: {
          framework: "PyTorch",
          architecture:
            "LSTM with forget/input/output gates and cell state memory",
          features: "Multiple LSTM layers for complex pattern learning",
          output: "Risk percentage and affected radius predictions",
        },
        lstmArchitecture: {
          inputLayer: "Feature vector for each time step",
          lstmCells: [
            "Forget Gate: Decides which past information to discard",
            "Input Gate: Determines what new information to store",
            "Output Gate: Controls information to pass to next hidden state",
          ],
          hiddenLayers: "Stacked LSTM layers for complex patterns",
          outputLayer: "Fully connected layer mapping to predictions",
        },
        workflow: [
          "Preprocessing: Convert farm data into normalized sequences",
          "Forward Pass: Input sequence through LSTM with hidden/cell state updates",
          "Output Generation: Last hidden state through dense layer for predictions",
          "Loss Calculation: MSE comparison with actual values",
          "Backpropagation: Adam optimizer for weight updates",
          "Inference: Future predictions from recent sequences",
        ],
        integration: {
          backend: "Flask/PyTorch API for LSTM predictions",
          storage: "MongoDB for input sequences and predictions",
          frontend: "React visualization of risk trends and alerts",
          llm: "Gemini API for natural-language advisories",
        },
      },

      // Crop Recommendation System
      cropRecommendation: {
        title: "Crop Recommendation System",
        status: "Production Ready",
        description:
          "Intelligent crop type recommendation using Random Forest classifier",
        technicalSpecs: {
          algorithm: "Random Forest Classifier",
          features: "Environmental variables, farm data, historical yield",
          output: "Optimal crop recommendations for given conditions",
        },
        architecture: {
          inputLayer:
            "CSV dataset with historical crop, yield, and weather data",
          preprocessing:
            "LabelEncoder for categorical features (Crop, State, Season)",
          featureLayer: "Combined environmental and farm data",
          modelLayer: "Random Forest Classifier with ensemble decision trees",
          outputLayer: "Predicted crop recommendation",
          storage: "Joblib for model persistence",
        },
        rationale:
          "Random Forest chosen for handling categorical/numerical features, robustness to overfitting, and capturing non-linear relationships effectively compared to Decision Trees or Logistic Regression",
      },

      // LSTM Yield Prediction
      lstmYieldPrediction: {
        title: "LSTM-based Crop Yield Prediction",
        status: "Production Ready",
        description:
          "All-India, state-wise, season and crop-wise yield forecasting system",
        technicalSpecs: {
          scope: "Pan-India coverage for all states and crops",
          model: "PyTorch LSTM with 2 layers, 50 hidden units",
          sequence: "3-year rolling sequences for temporal patterns",
          features:
            "Area, yield, temperature, humidity, wind, solar radiation, pressure, cloud cover",
        },
        dataPipeline: {
          collection: [
            "Weather data from NASA POWER, OpenMeteo (last 5 years)",
            "Crop yield and production data from UPaj portal",
          ],
          preprocessing: [
            "Season filtering and categorical encoding",
            "MinMaxScaler for data normalization",
            "Feature selection for model training",
          ],
          training: [
            "PyTorch LSTM with Adam optimizer and MSE loss",
            "Early stopping with patience=10 to prevent overfitting",
            "Model versioning per crop, state, and season",
          ],
          prediction: [
            "Last 3-year sequence for next year prediction",
            "Input gradients for feature importance analysis",
            "Top 5 weather factors identification",
          ],
        },
        storage: "MongoDB with versioning and historical 5-year data",
      },

      // YOLOv8 Weed Detection
      yoloWeedDetection: {
        title: "YOLOv8 Weed Detection Module",
        status: "Development Complete",
        description:
          "Real-time detection of weeds in cotton and wheat fields using advanced object detection",
        technicalSpecs: {
          model: "YOLOv8 (Evolution of YOLOv5/YOLOv7)",
          purpose: "Precision agriculture interventions",
          capabilities:
            "Weed species classification, location, size, and density estimation",
        },
        architecture: {
          backbone:
            "CSPDarknet-like structure for multi-scale feature extraction",
          neck: "PANet or FPN for combining features from different layers",
          head: "Bounding boxes, objectness score, and class probabilities",
        },
        advantages: [
          "Real-time detection capability (high FPS)",
          "Handles small objects in dense crop images",
          "Lightweight architecture for edge deployment",
          "Multi-class weed species detection",
        ],
        dataProcessing: {
          labeling: "LabelMe tool for image annotation in YOLO format",
          dataset: "Drone-captured RGB images (1024x1024 or 2048x2048)",
          augmentation: "Rotation, flipping, scaling, color jitter",
          sources: "Drone imagery and public weed datasets",
        },
        features: [
          "Real-time video stream processing",
          "Bounding box predictions with confidence scores",
          "Integration with farm management systems",
          "Edge deployment on drones/mobile devices",
          "Visualization with prediction overlays",
        ],
      },

      // Weather Insights Module
      weatherInsights: {
        title: "Weather Insights Module",
        status: "Production Ready",
        description:
          "Multi-source weather data aggregation with advanced analytics and TTS capabilities",
        technicalSpecs: {
          dataSources: [
            "OpenMeteo API",
            "OpenWeatherMap API",
            "NASA POWER API",
          ],
          parameters: [
            "Temperature",
            "Humidity",
            "Precipitation",
            "Wind Speed",
            "Solar Radiation",
            "Surface Pressure",
          ],
          output: [
            "Visualizations",
            "TTS Alerts",
            "Forecasts",
            "Historical Trends",
          ],
        },
        keyFeatures: [
          "Multi-source Data Aggregation for reliability",
          "Interactive Data Visualization with graphs and heatmaps",
          "Text-to-Speech for field accessibility",
          "Short-term Forecasting & Extreme Weather Alerts",
          "User-Friendly Interface with tooltips",
        ],
        workflow: [
          "Fetch data from APIs using farm coordinates",
          "Clean and merge datasets for consistency",
          "Aggregate into daily/weekly/monthly averages",
          "Visualize using interactive graphs",
          "Convert insights to audio via TTS",
          "Send alerts and update farm dashboard",
        ],
      },

      // Farmer Dashboard
      farmerDashboard: {
        title: "Farmer Dashboard",
        status: "Production Ready",
        description:
          "Centralized farm management interface with comprehensive analytics and monitoring",
        features: {
          farmManagement: [
            "Farm creation with name, location, polygon boundaries",
            "Report folders and training CSVs management",
            "Farm-specific data tracking",
          ],
          cropHealth: [
            "Top disease risks with confidence scores",
            "LSTM-predicted risk percentages (10-day forecast)",
            "Affected radius visualization",
          ],
          analytics: [
            "Nearby farms display with distances",
            "Disease risk trend graphs",
            "Crop yield prediction visualizations",
            "Weather correlation analysis",
          ],
          reporting: [
            "Training CSVs and analysis folders",
            "Image analysis statistics",
            "Total images analyzed and diseased images found",
            "Last update timestamps",
          ],
          visualization: [
            "Interactive map with agro-polygons",
            "Nearby farm coordinates plotting",
            "Disease hotspots overlay",
            "Predicted risk radii visualization",
          ],
        },
      },

      // AI Chatbot System
      aiChatbot: {
        title: "AI Chatbot (LangChain + Pinecone + Gemini API)",
        status: "Beta Testing",
        description:
          "Multilingual contextual agricultural assistant with memory and semantic search",
        architecture: {
          langchain: {
            role: "Framework orchestration",
            functions: [
              "Prompt management and dynamic construction",
              "Chain execution for sequential reasoning",
              "External tools/APIs integration",
            ],
          },
          pinecone: {
            role: "Vector database for contextual memory",
            functions: [
              "Embedding storage for semantic search",
              "Context retrieval from historical interactions",
              "Similarity search for relevant knowledge",
            ],
          },
          gemini: {
            role: "LLM fine-tuning and response generation",
            functions: [
              "Domain-specific response optimization",
              "Multilingual support (Hindi, English, regional)",
              "Custom instruction handling",
            ],
          },
        },
        capabilities: [
          "Multilingual query understanding and response",
          "Conversation history maintenance",
          "Context-aware responses using semantic search",
          "Personalized farming advice",
          "Domain knowledge fine-tuning",
        ],
        workflow: [
          "User query input (text/voice)",
          "LangChain preprocessing and prompt construction",
          "Pinecone context retrieval via semantic search",
          "Gemini API response generation with fine-tuning",
          "Contextual multilingual response delivery",
          "History update in Pinecone for future retrieval",
        ],
      },
    },

    // Comprehensive Dataset Information
    datasets: {
      cropDisease: {
        structure: [
          { field: "_id", type: "ObjectId", example: "686dd7931c7b" },
          { field: "farm_name", type: "String", example: "New Farm 2" },
          {
            field: "farm_id",
            type: "String",
            example: "FARM_17520_28581_8242FE",
          },
          { field: "latitude", type: "Number", example: "28.6139" },
          { field: "longitude", type: "Number", example: "77.209" },
          { field: "crop", type: "String", example: "Tomato" },
          { field: "disease", type: "String", example: "healthy" },
          { field: "confidence", type: "Number", example: "0.4017" },
          {
            field: "image_path",
            type: "String",
            example: "C:\\Users\\bhish...\\CNN_MODEL_Train...",
          },
          {
            field: "timestamp",
            type: "Date",
            example: "2025-07-09T02:44:35.420+00:00",
          },
        ],
      },
      farmData: {
        example: {
          farmName: "SampleFarm",
          coordinates: "28.87, 78.9",
          farmId: "FARM_1752027512_E3574F",
          reportFolder: "C:\\Users\\bhish...",
          lastTrained: "2025-10-20 06:20:09",
          lstmUpdated: "2025-10-20 06:20:35",
          diseaseRisks: [
            "Healthy (91.3%)",
            "Aphids (99.2%)",
            "Aphids (99.4%)",
            "Healthy (58.9%)",
            "Aphids (99.3%)",
          ],
          totalImages: 577,
          diseasedImages: 503,
          nearbyFarms: ["BhishamFarm4 (2.5 km)", "New Farm2 (1.67 km)"],
          agroPolygon: "2.1471 hectares",
        },
      },
      cropRecommendation: {
        sample: [
          { field: "Crop", value: "Rice" },
          { field: "State", value: "Andaman And Nicobar Islands" },
          { field: "Season", value: "Kharif" },
          { field: "Year", value: "2020" },
          { field: "Area", value: "0.06" },
          { field: "Production", value: "0.13" },
          { field: "Yield", value: "2133.0" },
          { field: "Avg Temp 2m Mean", value: "28.32" },
          { field: "Avg Temp 2m Max", value: "28.92" },
        ],
      },
      lstmDiseaseData: {
        structure: [
          { field: "Date", value: "2025-06-30" },
          { field: "Latitude", value: "28.9222" },
          { field: "Longitude", value: "78.8888" },
          { field: "Soil Temp 0cm", value: "28.8" },
          { field: "Soil Temp 18cm", value: "30.7" },
          { field: "Soil Moisture 1-3cm", value: "0.341" },
          { field: "Risk %", value: "7" },
          { field: "Radius km", value: "0.9" },
        ],
      },
    },

    // Tools and Technologies Matrix
    technologies: {
      lstmYield: [
        "Python",
        "PyTorch",
        "Pandas",
        "NumPy",
        "scikit-learn",
        "MongoDB",
      ],
      yoloWeed: ["Python", "YOLOv8", "OpenCV", "LabelMe"],
      weather: [
        "OpenMeteo API",
        "OpenWeatherMap API",
        "NASA POWER API",
        "Plotly/Matplotlib",
        "Text-to-Speech",
      ],
      dashboard: ["React", "MongoDB", "Leaflet.js"],
      chatbot: ["LangChain", "Pinecone", "Gemini API"],
    },

    // Algorithms and Techniques
    algorithms: {
      lstmYield: [
        "LSTM (Long Short-Term Memory)",
        "MinMax Scaling",
        "Sliding Window",
      ],
      yoloWeed: ["YOLOv8 Object Detection", "Image Annotation (LabelMe)"],
      weather: ["API Aggregation", "Data Visualization", "Text-to-Speech"],
      dashboard: ["Geospatial Analysis", "Analytics", "Alerts"],
      chatbot: [
        "LangChain",
        "Vector Database (Pinecone)",
        "Fine-tuning (Gemini API)",
      ],
    },

    // Experimental Setup Details
    experimentalSetup: {
      servers: [
        { name: "Frontend", technology: "React", port: 3000 },
        { name: "Backend", technology: "Node.js/Express", port: 5000 },
        { name: "ML Server", technology: "PyTorch/TensorFlow", port: 5500 },
        { name: "Database", technology: "MongoDB", port: 27017 },
      ],
      hardware: "GPU-enabled ML server for LSTM and YOLOv8 training",
      dataSources: [
        "Historical yield data from UPaj portal",
        "Weather data from NASA POWER, OpenMeteo, OpenWeatherMap",
        "Crop images labeled using LabelMe for disease/weed detection",
      ],
      softwareStack: [
        "Python (PyTorch, Scikit-learn, Pandas)",
        "Node.js",
        "React",
        "Redux Toolkit",
        "Mermaid for diagrams",
      ],
      modelTraining: [
        "LSTM for crop yield prediction using 5-year weather sequences",
        "YOLOv8 for weed and disease detection with annotated datasets",
      ],
    },

    // Comprehensive Evaluation Metrics
    evaluationMetrics: {
      lstmYield: [
        {
          metric: "Mean Squared Error (MSE)",
          value: "0.015 - 0.03",
          description:
            "Average of squared differences between predicted and actual values",
        },
        {
          metric: "Root Mean Squared Error (RMSE)",
          value: "0.12 - 0.17",
          description: "Square root of MSE, easier to interpret",
        },
        {
          metric: "R² Score",
          value: "0.65 - 0.75",
          description: "How well model explains data variance (1 = perfect)",
        },
        {
          metric: "Feature Importance",
          value: "Temperature, Precipitation, Humidity",
          description: "~70% combined contribution to yield predictions",
        },
      ],
      yoloDetection: [
        {
          metric: "Precision",
          value: "0.65 - 0.75",
          description:
            "% of correct positive predictions out of all positive predictions",
        },
        {
          metric: "Recall",
          value: "0.60 - 0.70",
          description: "% of actual positives correctly identified",
        },
        {
          metric: "F1-Score",
          value: "0.62 - 0.72",
          description: "Harmonic mean of Precision and Recall",
        },
        {
          metric: "Mean Average Precision (mAP)",
          value: "0.60 - 0.70",
          description: "Overall detection accuracy across classes",
        },
        {
          metric: "Confidence Scores",
          value: "0.60 - 0.75",
          description: "Model confidence in detection predictions",
        },
      ],
      systemPerformance: [
        {
          metric: "Frontend-Backend Response Time",
          value: "500 – 800 ms",
          description: "API response latency for user interactions",
        },
        {
          metric: "ML Model Prediction Latency",
          value: "5-15s (LSTM), 0.3-1s (YOLOv8)",
          description: "Inference time for different model types",
        },
        {
          metric: "Real-time Alert Accuracy",
          value: "~70%",
          description: "Correct alerts for crop health and disease risks",
        },
      ],
    },

    // Results Analysis
    resultsAnalysis: {
      dataCollection:
        "2 months of data from NASA POWER, OpenMeteo, OpenWeatherMap, and farm-level crop images",
      lstmPerformance: {
        accuracy: "~70% for beginner setups without GPU",
        coverage: "Multiple crops with 5-year historical data",
        factors:
          "Temperature, precipitation, humidity identified as top contributors",
      },
      yoloPerformance: {
        detection: "Real-time weed and disease detection in cotton and wheat",
        scores: "Precision, recall, F1-scores around 70% for non-GPU setup",
        confidence: "Recorded confidence scores for each detection",
      },
      systemPerformance: {
        response: "Frontend-backend response time ~1-2 seconds",
        latency: "ML model prediction latency ~2-3 seconds per image/sequence",
        scalability: "Suitable for small-scale deployments",
      },
    },

    // Conclusion and Future Work
    conclusion: {
      summary:
        "System successfully integrates LSTM-based crop yield prediction, YOLOv8 weed/disease detection, and real-time weather insights to assist farmers with actionable predictions and alerts",
      limitations: [
        "Accuracy limited to ~70% for non-GPU beginner setups",
        "Predictions rely on historical data with reduced reliability in unusual conditions",
        "Real-time detection slower without GPU acceleration",
        "Limited coverage for all crop types and regions",
      ],
      futureScope: [
        "GPU integration for improved accuracy and reduced latency",
        "Dataset expansion for more crops and regions",
        "Advanced ML models (Transformers, attention-based models)",
        "Mobile app development with offline support",
        "IoT sensor integration for real-time soil and microclimate data",
      ],
    },

    // References
    references: [
      { id: 1, title: "React Documentation", url: "https://react.dev" },
      {
        id: 2,
        title: "FreeCodeCamp ML Tutorials",
        description: "TensorFlow, PyTorch, and API usage",
      },
      {
        id: 3,
        title: "Hugging Face Documentation",
        url: "https://huggingface.co/docs",
      },
      {
        id: 4,
        title: "UPaj Portal - Government Agriculture Data",
        url: "https://upag.gov.in",
      },
      {
        id: 5,
        title: "India Meteorological Department",
        url: "https://mausam.imd.gov.in",
      },
      {
        id: 6,
        title: "YOLOv8 Documentation",
        url: "https://docs.ultralytics.com",
      },
      {
        id: 7,
        title: "Scikit-learn Documentation",
        url: "https://scikit-learn.org",
      },
      { id: 8, title: "OpenMeteo API", url: "https://open-meteo.com" },
      {
        id: 9,
        title: "NASA POWER Project",
        url: "https://power.larc.nasa.gov",
      },
      {
        id: 10,
        title: "OpenWeatherMap API",
        url: "https://openweathermap.org/api",
      },
      {
        id: 11,
        title: "LangChain Documentation",
        url: "https://docs.langchain.com",
      },
      {
        id: 12,
        title: "Pinecone Vector Database",
        url: "https://www.pinecone.io",
      },
      {
        id: 13,
        title: "Gemini API Documentation",
        url: "https://ai.google.dev",
      },
      {
        id: 14,
        title: "Kaggle Datasets",
        url: "https://www.kaggle.com/datasets",
      },
      {
        id: 15,
        title: "Stack Overflow Developer Discussions",
        description: "Debugging and optimization resources",
      },
    ],
  };

  // Component for displaying technical specifications
  const TechnicalSpecsCard = ({ title, specs }) => (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
        {title}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(specs).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}:
            </span>
            <span className="text-sm text-gray-800 dark:text-gray-200 mt-1">
              {Array.isArray(value) ? value.join(", ") : value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // Component for displaying data tables
  const DataTable = ({ title, data, columns }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h4>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300"
                  >
                    {row[column.toLowerCase()] || row[column] || row.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Main render function
  return (
    <div className="mt-16 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-2xl">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {projectData.projectInfo.title}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 text-sm text-gray-600 dark:text-gray-400"></div>
          </div>
        </div>
      </header>

      {/* Enhanced Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 top-0 z-50 shadow-lg">
        <div className="max-w-8xl mx-auto">
          <nav className="flex space-x-1 px-4 sm:px-6 lg:px-8 overflow-x-auto">
            {[
              { id: "overview", name: "Project Overview", icon: BookOpenIcon },
              {
                id: "architecture",
                name: "System Architecture",
                icon: CpuChipIcon,
              },
              { id: "modules", name: "AI Modules", icon: CubeIcon },
              { id: "datasets", name: "Data & Datasets", icon: DatabaseIcon },
              { id: "technologies", name: "Tech Stack", icon: CommandLineIcon },
              { id: "evaluation", name: "Evaluation", icon: ChartBarIcon },
              { id: "results", name: "Results", icon: BeakerIcon },
              { id: "viewImages", name: "View Images", icon: PhotoIcon },
              { id: "conclusion", name: "Conclusion", icon: ShieldCheckIcon },
              { id: "references", name: "References", icon: BookmarkIcon },
              { id: "routeMap", name: "Route Map", icon: MapIcon },
              { id: "contact", name: "Contact", icon: PhoneIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm flex items-center transition-colors ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Problem Statement */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <ExclamationTriangleIcon className="w-8 h-8 mr-3 text-red-500" />
                Problem Statement & Challenges
              </h2>
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg p-6 mb-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  {projectData.problemStatement.solution}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projectData.problemStatement.challenges.map(
                  (challenge, index) => (
                    <div
                      key={index}
                      className="flex items-start bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                    >
                      <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-1">
                        !
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {challenge}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Project Objectives */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <TargetIcon className="w-8 h-8 mr-3 text-blue-500" />
                Project Objectives & Goals
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {projectData.objectives.map((objective) => (
                  <div
                    key={objective.id}
                    className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {objective.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          objective.status === "Completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {objective.status}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {objective.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {objective.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Datasets View */}
        {activeTab === "datasets" && (
  <div className="space-y-8">
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        <DatabaseIcon className="w-8 h-8 mr-3 text-blue-500" />
        Data & Datasets
      </h2>

      {/* 1. Crop Disease Outbreak Data */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <ExclamationTriangleIcon className="w-6 h-6 mr-2 text-red-500" />
          Crop Disease Outbreak Data (Sample Entries)
        </h3>
        <div className="overflow-x-auto bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-4">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-red-100 dark:bg-red-900/40">
              <tr>
                {["date", "latitude", "longitude", "soil_temp_0cm", "soil_moisture_1_3cm", "risk%", "radius_km"].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wider">
                    {header.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[
                { date: "2025-06-30", latitude: 28.9222, longitude: 78.8888, soil_temp_0cm: 28.8, soil_moisture_1_3cm: 0.341, risk: 7, radius_km: 0.9 },
                { date: "2025-07-01", latitude: 28.9222, longitude: 78.8888, soil_temp_0cm: 27.2, soil_moisture_1_3cm: 0.337, risk: 3, radius_km: 0.3 },
                { date: "2025-07-02", latitude: 28.9222, longitude: 78.8888, soil_temp_0cm: 30.4, soil_moisture_1_3cm: 0.282, risk: 13, radius_km: 0.7 },
                { date: "2025-07-03", latitude: 28.9222, longitude: 78.8888, soil_temp_0cm: 28.5, soil_moisture_1_3cm: 0.332, risk: 12, radius_km: 0.9 },
                { date: "2025-07-04", latitude: 28.9222, longitude: 78.8888, soil_temp_0cm: 29.1, soil_moisture_1_3cm: 0.315, risk: 8, radius_km: 0.5 }
              ].map((row, index) => (
                <tr key={index} className={`hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800'}`}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{row.date}</td>
                  <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400">{row.latitude}</td>
                  <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400">{row.longitude}</td>
                  <td className="px-4 py-3 text-sm text-orange-600 dark:text-orange-400">{row.soil_temp_0cm}°C</td>
                  <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400">{row.soil_moisture_1_3cm}</td>
                  <td className="px-4 py-3 text-sm font-bold">
                    <span className={`px-2 py-1 rounded-full text-xs ${row.risk > 10 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                      {row.risk}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-purple-600 dark:text-purple-400">{row.radius_km} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Weather + Season Mapped + LSTM Crop Yield Data */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <ChartBarIcon className="w-6 h-6 mr-2 text-green-500" />
          Weather + Season Mapped + LSTM Crop Yield Data (Sample Entries)
        </h3>
        <div className="overflow-x-auto bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-green-100 dark:bg-green-900/40">
              <tr>
                {["Crop", "State", "Season", "Year", "Area", "Production", "Yield", "Avg Temp", "Avg Humidity", "Precipitation"].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-bold text-green-800 dark:text-green-300 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[
                { crop: "Rice", state: "Andaman And Nicobar Islands", season: "Kharif", year: 2020, area: 0.06, production: 0.13, yield: 2133.0, temp: 28.32, humidity: 77.31, precipitation: 5.6 },
                { crop: "Rice", state: "Andaman And Nicobar Islands", season: "Kharif", year: 2021, area: 0.06, production: 0.13, yield: 2133.0, temp: 28.29, humidity: 77.64, precipitation: 6.37 },
                { crop: "Rice", state: "Andaman And Nicobar Islands", season: "Kharif", year: 2022, area: 0.05, production: 0.11, yield: 2107.0, temp: 28.25, humidity: 77.82, precipitation: 6.67 },
                { crop: "Rice", state: "Andaman And Nicobar Islands", season: "Kharif", year: 2023, area: 0.05, production: 0.10, yield: 2100.0, temp: 28.55, humidity: 77.77, precipitation: 5.01 },
                { crop: "Rice", state: "Andaman And Nicobar Islands", season: "Total", year: 2020, area: 0.06, production: 0.13, yield: 2133.0, temp: 28.32, humidity: 77.31, precipitation: 5.6 }
              ].map((row, index) => (
                <tr key={index} className={`hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800'}`}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{row.crop}</td>
                  <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400">{row.state}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${row.season === 'Kharif' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                      {row.season}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{row.year}</td>
                  <td className="px-4 py-3 text-sm text-purple-600 dark:text-purple-400">{row.area}</td>
                  <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400">{row.production}</td>
                  <td className="px-4 py-3 text-sm font-bold text-indigo-600 dark:text-indigo-400">{row.yield} kg/ha</td>
                  <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400">{row.temp}°C</td>
                  <td className="px-4 py-3 text-sm text-teal-600 dark:text-teal-400">{row.humidity}%</td>
                  <td className="px-4 py-3 text-sm text-blue-600 dark:text-blue-400">{row.precipitation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Yield Predicted Data */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <CpuChipIcon className="w-6 h-6 mr-2 text-purple-500" />
          Yield Prediction Data (Bajra - Kharif 2025)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
            <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-4">Prediction Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Predicted Year:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Predicted Yield:</span>
                <span className="font-bold text-green-600 dark:text-green-400">1385.46 kg/ha</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Crop:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">Bajra</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Season:</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">Kharif</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6">
            <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-4">Top Weather Factors</h4>
            <div className="space-y-2">
              {[
                { factor: "Min Temperature", value: "26.11", unit: "°C" },
                { factor: "Solar Radiation", value: "18.96", unit: "W/m²" },
                { factor: "Surface Pressure", value: "15.72", unit: "hPa" },
                { factor: "Max Temperature", value: "12.79", unit: "°C" }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.factor}:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{item.value} {item.unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Farm Stats Data */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <UserGroupIcon className="w-6 h-6 mr-2 text-indigo-500" />
          Farm Statistics Data
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Images Analyzed", value: "120", color: "blue", icon: PhotoIcon },
            { label: "Diseased Images Found", value: "83", color: "red", icon: ExclamationTriangleIcon },
            { label: "Max Risk Percentage", value: "32.1%", color: "orange", icon: ChartBarIcon },
            { label: "Most Common Crop", value: "Potato", color: "green", icon: CubeIcon }
          ].map((stat, index) => (
            <div key={index} className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 dark:from-${stat.color}-900/20 dark:to-${stat.color}-800/20 rounded-xl p-4 text-center`}>
              <stat.icon className={`w-8 h-8 mx-auto mb-2 text-${stat.color}-500`} />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Farm Created Model Data */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <WrenchScrewdriverIcon className="w-6 h-6 mr-2 text-yellow-500" />
          Farm Model Data
        </h3>
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-3">Farm Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Farm Name:</span>
                  <span className="font-bold text-gray-900 dark:text-white">SampleFarm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Location:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">28.87, 78.9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Agro Polygon Area:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">2.1471 hectares</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-3">LSTM Predictions (Next 3 Days)</h4>
              <div className="space-y-2">
                {[
                  { date: "2025-11-11", risk: "9.5%", radius: "-0.84 km" },
                  { date: "2025-11-12", risk: "15.93%", radius: "-1.12 km" },
                  { date: "2025-11-13", risk: "22.74%", radius: "-1.38 km" }
                ].map((pred, index) => (
                  <div key={index} className="flex justify-between items-center bg-white dark:bg-gray-700 p-2 rounded">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{pred.date}</span>
                    <span className="font-bold text-red-600 dark:text-red-400">{pred.risk}</span>
                    <span className="text-sm text-purple-600 dark:text-purple-400">{pred.radius}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Summary Dataset */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <DocumentChartBarIcon className="w-6 h-6 mr-2 text-teal-500" />
          Summary Dataset
        </h3>
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">580</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Images</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">508</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Diseased Images</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">90.5%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Max Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">87.6%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Disease Rate</div>
            </div>
          </div>

          <h4 className="font-semibold text-teal-700 dark:text-teal-300 mb-3">Top Diseases</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { disease: "Early blight", count: 130, color: "red" },
              { disease: "Bacterial spot", count: 123, color: "orange" },
              { disease: "Tomato Yellow Leaf Curl Virus", count: 49, color: "yellow" },
              { disease: "Citrus greening", count: 48, color: "green" }
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-white dark:bg-gray-700 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.disease}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold bg-${item.color}-100 text-${item.color}-800 dark:bg-${item.color}-900 dark:text-${item.color}-200`}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. Yield Model Metadata */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <CodeBracketIcon className="w-6 h-6 mr-2 text-gray-500" />
          Yield Model Metadata
        </h3>
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Model Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Model Type:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">LSTM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Crop:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">Bajra</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Model Size:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">58.56 KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Created At:</span>
                  <span className="font-bold text-gray-900 dark:text-white">2025-08-07</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Key Input Features</h4>
              <div className="flex flex-wrap gap-2">
                {["soil_pH", "temperature", "precipitation", "NPK", "GDD"].map((feature, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
        {/* Results View */}
        {activeTab === "results" && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <BeakerIcon className="w-8 h-8 mr-3 text-purple-500" />
                Results Analysis
              </h2>

              <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                <p>
                  Data was collected over{" "}
                  {projectData.resultsAnalysis.dataCollection}.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-600 dark:text-blue-300 mb-2">
                      LSTM Performance
                    </h4>
                    <p>
                      Accuracy:{" "}
                      {projectData.resultsAnalysis.lstmPerformance.accuracy}
                    </p>
                    <p>
                      Coverage:{" "}
                      {projectData.resultsAnalysis.lstmPerformance.coverage}
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-600 dark:text-green-300 mb-2">
                      YOLOv8 Detection
                    </h4>
                    <p>
                      {projectData.resultsAnalysis.yoloPerformance.detection}
                    </p>
                    <p>
                      Scores:{" "}
                      {projectData.resultsAnalysis.yoloPerformance.scores}
                    </p>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-600 dark:text-yellow-300 mb-2">
                      System Performance
                    </h4>
                    <p>
                      Response:{" "}
                      {projectData.resultsAnalysis.systemPerformance.response}
                    </p>
                    <p>
                      Latency:{" "}
                      {projectData.resultsAnalysis.systemPerformance.latency}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conclusion View */}
        {activeTab === "conclusion" && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <ShieldCheckIcon className="w-8 h-8 mr-3 text-green-500" />
                Conclusion & Future Scope
              </h2>

              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-lg p-6 mb-8">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  {projectData.conclusion.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-3">
                    Limitations
                  </h3>
                  <ul className="space-y-2">
                    {projectData.conclusion.limitations.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center text-gray-700 dark:text-gray-300"
                      >
                        <ChevronRightIcon className="w-4 h-4 mr-2 text-red-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-3">
                    Future Scope
                  </h3>
                  <ul className="space-y-2">
                    {projectData.conclusion.futureScope.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center text-gray-700 dark:text-gray-300"
                      >
                        <ChevronRightIcon className="w-4 h-4 mr-2 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Route Map Tab */}
        {activeTab === "routeMap" && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <RouteMap />
            </div>
          </div>
        )}
        {/* Contact Tab */}
        {activeTab === "contact" && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Contact Information
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    For further information or inquiries about the project,
                    please reach out to:
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span>{" "}
                    <a
                      href="mailto:info@agrisupport.com"
                      className="text-blue-500 hover:underline"
                    >
                      info@agrisupport.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/*References Tab */}
        {activeTab === "references" && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <BookmarkIcon className="w-8 h-8 mr-3 text-yellow-500" />
                References
              </h2>
              <ul className="list-disc list-inside space-y-3 text-gray-700 dark:text-gray-300">
                {projectData.references.map((ref) => (
                  <li key={ref.id}>
                    {ref.url ? (
                      <a
                        href={ref.url}
                        className="text-blue-500 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {ref.title}
                      </a>
                    ) : (
                      <span>{ref.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {activeTab === "viewImages" && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <PhotoIcon className="w-8 h-8 mr-3 text-indigo-500" />
                View Images
              </h2>
              <ImagesView />
            </div>
          </div>
        )}

        {/* System Architecture Tab */}
        {activeTab === "architecture" && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                System Architecture Overview
              </h2>

              {/* Architecture Components */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {Object.entries(projectData.architecture.components).map(
                  ([key, component]) => (
                    <div
                      key={key}
                      className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6"
                    >
                      <div className="flex items-center mb-4">
                        <ServerIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                            {key}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Port: {component.port} | {component.technology}
                          </p>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {component.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-center text-sm text-gray-700 dark:text-gray-300"
                          >
                            <ChevronRightIcon className="w-4 h-4 mr-2 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
              </div>

              {/* Data Flow */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Data Flow Architecture
                </h3>
                <div className="space-y-3">
                  {projectData.architecture.dataFlow.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-white dark:bg-gray-600 p-4 rounded-lg shadow"
                    >
                      <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Modules Tab - Enhanced with all technical details */}
        {activeTab === "modules" && (
          <div className="space-y-8">
            {Object.entries(projectData.modules).map(([moduleKey, module]) => (
              <div
                key={moduleKey}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {module.title}
                      </h3>
                      <div className="flex items-center space-x-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            module.status === "Production Ready"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {module.status}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {moduleKey.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSection(moduleKey)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <ChevronDownIcon
                        className={`w-6 h-6 text-gray-500 transition-transform ${
                          expandedSections[moduleKey] ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">
                    {module.description}
                  </p>
                </div>

                {expandedSections[moduleKey] && (
                  <div className="p-8 bg-gray-50 dark:bg-gray-700/50 space-y-8">
                    {/* Technical Specifications */}
                    {module.technicalSpecs && (
                      <TechnicalSpecsCard
                        title="Technical Specifications"
                        specs={module.technicalSpecs}
                      />
                    )}

                    {/* Architecture Details */}
                    {module.architecture && (
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                          Architecture Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {Object.entries(module.architecture).map(
                            ([archKey, archValue]) => (
                              <div
                                key={archKey}
                                className="bg-white dark:bg-gray-600 p-4 rounded-lg shadow"
                              >
                                <h5 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 capitalize">
                                  {archKey.replace(/([A-Z])/g, " $1").trim()}
                                </h5>
                                {Array.isArray(archValue) ? (
                                  <ul className="space-y-1">
                                    {archValue.map((item, idx) => (
                                      <li
                                        key={idx}
                                        className="text-sm text-gray-700 dark:text-gray-300"
                                      >
                                        • {item}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {archValue}
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Integration Details */}
                    {module.integration && (
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                          Integration Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {Object.entries(module.integration).map(
                            ([intKey, intValue]) => (
                              <div
                                key={intKey}
                                className="bg-white dark:bg-gray-600 p-4 rounded-lg shadow"
                              >
                                <h5 className="font-semibold text-green-600 dark:text-green-400 mb-2 capitalize">
                                  {intKey}
                                </h5>
                                {Array.isArray(intValue) ? (
                                  <ul className="space-y-1">
                                    {intValue.map((item, idx) => (
                                      <li
                                        key={idx}
                                        className="text-sm text-gray-700 dark:text-gray-300"
                                      >
                                        • {item}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {intValue}
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Performance Metrics */}
                    {module.performance && (
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                          Performance Metrics
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(module.performance).map(
                            ([perfKey, perfValue]) => (
                              <div
                                key={perfKey}
                                className="bg-white dark:bg-gray-600 p-4 rounded-lg text-center shadow"
                              >
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize mb-2">
                                  {perfKey.replace(/([A-Z])/g, " $1").trim()}
                                </div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
                                  {perfValue}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Technologies Tab */}
        {activeTab === "technologies" && (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Technology Stack
              </h2>

              {/* Tools and Technologies */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {Object.entries(projectData.technologies).map(
                  ([category, techs]) => (
                    <div
                      key={category}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6"
                    >
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                        {category.replace(/([A-Z])/g, " $1").trim()}
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {techs.map((tech, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Algorithms */}
              <div className="mt-8">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Algorithms & Techniques
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {Object.entries(projectData.algorithms).map(
                    ([category, algorithms]) => (
                      <div
                        key={category}
                        className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6"
                      >
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                          {category.replace(/([A-Z])/g, " $1").trim()}
                        </h4>
                        <ul className="space-y-2">
                          {algorithms.map((algo, index) => (
                            <li
                              key={index}
                              className="flex items-center text-gray-700 dark:text-gray-300"
                            >
                              <ChevronRightIcon className="w-4 h-4 mr-2 text-green-500" />
                              {algo}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Evaluation Tab */}
        {activeTab === "evaluation" && (
          <div className="space-y-8">
            {Object.entries(projectData.evaluationMetrics).map(
              ([category, metrics]) => (
                <div
                  key={category}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
                >
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 capitalize">
                    {category.replace(/([A-Z])/g, " $1").trim()} Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {metrics.map((metric, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6"
                      >
                        <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                          {metric.metric}
                        </div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                          {metric.value}
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-500">
                          {metric.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Add remaining tabs with similar comprehensive structure */}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left">
              <p className="text-gray-600 dark:text-gray-400 font-semibold">
                AgriConnect - Advanced Agricultural AI Platform
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Comprehensive Project Report v2.0 | All Rights Reserved
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Generated on:{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Custom Target Icon component
const TargetIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 18a6 6 0 100-12 6 6 0 000 12z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 14a2 2 0 100-4 2 2 0 000 4z"
    />
  </svg>
);

export default AgriConnectAdvancedProjectReport;
