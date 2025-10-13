# AgriConnect-App--Connecting-Farmers-to-Technology
AgriConnect App--Connecting Farmers to Technology

# AgriConnect – Connecting Farmers to Technology

**AgriConnect** is an integrated AI-powered agricultural platform designed to connect farmers with modern technology for crop management, disease detection, yield prediction, and community support. It combines **Machine Learning**, **Deep Learning**, and **Large Language Models (LLMs)** to deliver data-driven insights and real-time recommendations for farmers across India.

---

## Vision

To empower farmers with accessible, intelligent, and automated tools that optimize crop productivity, reduce losses, and ensure sustainable farming practices through technology.

## Mission

To build a unified ecosystem that integrates AI-driven insights, real-time data analysis, and farmer-friendly interfaces to revolutionize agricultural decision-making and communication.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Modules and Features](#modules-and-features)

   * [1. Chatbot](#1-chatbot)
   * [2. Farmer Dashboard](#2-farmer-dashboard)
   * [3. Login and Registration](#3-login-and-registration)
   * [4. Crop Disease Detection (CNN)](#4-crop-disease-detection-cnn)
   * [5. Crop Weed Detection (YOLOv8)](#5-crop-weed-detection-yolov8)
   * [6. Crop Disease Prediction (LSTM + Weather)](#6-crop-disease-prediction-lstm--weather)
   * [7. Yield Prediction (National-Level LSTM)](#7-yield-prediction-national-level-lstm)
   * [8. Crop Suggestions System](#8-crop-suggestions-system)
   * [9. Weather Intelligence Module](#9-weather-intelligence-module)
   * [10. Crop Community and Reports](#10-crop-community-and-reports)
   * [11. Notification Service](#11-notification-service)
4. [Technology Stack](#technology-stack)
5. [ML Server Architecture](#ml-server-architecture)
6. [Database Structure](#database-structure)
7. [Setup Instructions](#setup-instructions)
8. [Future Scope](#future-scope)

---

## Project Overview

AgriConnect integrates **AI models, data storage, weather APIs, and real-time communication** to assist farmers in making informed agricultural decisions.
It provides:

* Disease detection and forecasting using CNN and LSTM models.
* Yield prediction for entire regions based on climatic and soil data.
* Community discussions and crop health monitoring.
* Real-time weather intelligence and notifications.

---

## System Architecture

**Frontend:** React + Tailwind
**Backend:** Node.js + Express
**ML Layer:** Flask + Deep Learning Models
**Database:** MongoDB + Pinecone (Vector Storage)
**APIs:** OpenWeatherMap, OpenMeteo, Geopy, LangChain, Gemini
**Real-time Communication:** Socket.io

---

## Modules and Features

### 1. Chatbot

* Built using **LangChain**, **TF-IDF**, and **LLM-based conversational AI**.
* Supports both **text and voice (TTS)** interaction.
* Trained on agricultural datasets, government schemes, and crop management guides.
* Provides **24×7 support** for farmer queries in regional languages.

### 2. Farmer Dashboard

* Centralized dashboard showing:

  * Crop health cards
  * Weather updates and charts
  * Crop yield and disease predictions
  * Real-time weed and pest analytics
* Designed with **Tailwind CSS** for a clean and intuitive experience.

### 3. Login and Registration

* Role-based authentication for **Farmers, Admins, and Researchers**.
* Built with **JWT**, **cookie-parser**, and **CORS** for secure access.
* Admin verification workflow ensures authorized user access.

### 4. Crop Disease Detection (CNN)

* Utilizes **Convolutional Neural Networks (CNNs)** trained on crop leaf datasets.
* Detects diseases from uploaded images.
* Returns disease name, confidence score, and solution tips.
* Backend in **Flask**, model stored securely with `.pt` and `.h5` exclusion.

### 5. Crop Weed Detection (YOLOv8)

* Real-time detection of weeds using **YOLOv8** and **Socket.io**.
* Currently optimized for **cotton crops**.
* Displays bounding boxes and analytical reports.
* Future support for multi-crop weed detection.

### 6. Crop Disease Prediction (LSTM + Weather)

* Advanced **LSTM model** predicts **disease risk percentage and affected radius** for the next **10 days**.
* Trained using historical crop, soil, and **weather data** from each farm.
* Automatically updates MongoDB with daily prediction records.
* Each farm has an independent LSTM model and scaler stored for personalized prediction.

### 7. Yield Prediction (National-Level LSTM)

* Predicts **annual crop yield** across India using multi-variate LSTM.
* Considers soil conditions, rainfall, temperature, and NDVI trends.
* Helps estimate production and identify high-risk zones.

### 8. Crop Suggestions System

* Suggests suitable crops based on:

  * Location, soil health, and historical yield patterns.
  * Trained using **LSTM and Scikit-learn models**.
* Aims to optimize profitability and sustainability for farmers.

### 9. Weather Intelligence Module

* Uses **OpenWeatherMap** and **OpenMeteo APIs** for real-time and forecast data.
* Displays temperature, humidity, rainfall, and wind speed in **graphical format**.
* Provides **news updates and advisories** relevant to weather impact on crops.

### 10. Crop Community and Reports

* Farmers can share crop issues, images, and experiences.
* Stores **crop disease reports** with:

  * Image, location, timestamp, and analysis summary.
* Enables community collaboration and learning.

### 11. Notification Service

* Node.js-based **notification system** for alerts on:

  * Predicted crop diseases
  * Weather warnings
  * Community updates
* Integrates **Socket.io** for real-time message delivery.

---

## Technology Stack

| Layer              | Technology                                      |
| ------------------ | ----------------------------------------------- |
| **Frontend**       | React, Tailwind CSS, Redux Toolkit              |
| **Backend**        | Node.js, Express, Flask                         |
| **Database**       | MongoDB, Pinecone                               |
| **AI & ML Models** | TensorFlow, PyTorch, Scikit-learn, Transformers |
| **Data Handling**  | Pandas, NumPy, Joblib, Geopy                    |
| **LLM & NLP**      | LangChain, Sentence Transformers, Gemini        |
| **Weather APIs**   | OpenMeteo, OpenWeatherMap                       |
| **Realtime**       | Socket.io                                       |
| **Authentication** | JWT, Flask-CORS, Cookie-Parser, Body-Parser     |

---

## ML Server Architecture

### Key Python Dependencies

```
flask==2.2.5
python-dotenv==1.0.1
numpy==1.26.4
pandas==2.2.2
tensorflow==2.18.0
scikit-learn==1.4.2
geopy==2.4.1
pymongo==4.6.3
requests==2.31.0
joblib==1.4.2
pillow==10.3.0
matplotlib==3.8.4
Flask-Cors==4.0.1
langchain==0.3.7
langchain-core==0.3.15
langchain-community==0.3.4
pinecone-client==3.1.0
sentence-transformers==3.2.0
transformers==4.44.2
torch==2.3.1
accelerate==0.34.2
huggingface-hub==0.25.2
aiohttp==3.10.10
unstructured==0.15.6
pypdf==5.1.0
docx2txt==0.8
```

---

## Database Structure

### MongoDB Collections

* **users** → Stores login credentials, roles, and verification status.
* **farms** → Holds location data, LSTM models, and prediction logs.
* **disease_reports** → Contains disease detection and analysis results.
* **notifications** → Stores alerts sent to users.
* **community_posts** → Forum posts and discussions between farmers.

---

## Setup Instructions

### 1. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Runs on: **[http://localhost:5173](http://localhost:5173)**

### 2. Backend (Node.js)

```bash
cd backend
npm install
npm run dev
```

Runs on: **[http://localhost:5000](http://localhost:5000)**

### 3. ML Server (Flask)

```bash
cd ML
cd server
.venv/scripts/activate
flask run --port=5500
```

Runs on: **[http://localhost:5500](http://localhost:5500)**

---

## Future Scope

* Multi-language voice assistant for rural accessibility.
* Expansion of YOLOv8 weed detection to more crops.
* Integration with government APIs for direct crop insurance and scheme recommendations.
* Satellite data integration for large-scale crop analytics.
* Mobile app version with offline capabilities.



AgriConnect is a complete AI-driven agricultural ecosystem that merges deep learning, NLP, and IoT data to create actionable intelligence for farmers. Its modular design ensures scalability, and its farmer-friendly interface ensures accessibility for everyone.

