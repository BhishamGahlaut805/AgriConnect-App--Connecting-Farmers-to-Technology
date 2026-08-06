# 🌾 AgriConnect – Connecting Farmers to Technology

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Smart%20Agriculture-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI-Powered-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/MERN-Full%20Stack-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Machine%20Learning-Integrated-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Deep%20Learning-CNN%20%7C%20LSTM-red?style=for-the-badge" />
  <img src="https://img.shields.io/badge/LLM-LangChain%20%7C%20Gemini-purple?style=for-the-badge" />
</p>

<p align="center">
  <strong>🚜 Empowering Farmers with Artificial Intelligence, Machine Learning, Deep Learning & Real-Time Agricultural Intelligence</strong>
</p>

<p align="center">
  <a href="https://agri-connect-app-connecting-farmers.vercel.app">
    <img src="https://img.shields.io/badge/🌐%20Live%20Website-Visit%20Now-00C853?style=for-the-badge&logo=vercel&logoColor=white">
  </a>

  <a href="https://agri-connect-app-connecting-farmers.vercel.app/flowchart">
    <img src="https://img.shields.io/badge/📊%20System%20Flowchart-View%20Architecture-1E88E5?style=for-the-badge">
  </a>
</p>

---

# 🌱 About AgriConnect

**AgriConnect** is a next-generation **AI-Powered Smart Agriculture Platform** developed to bridge the gap between **farmers and modern technology**.

The platform combines **Machine Learning**, **Deep Learning**, **Large Language Models (LLMs)**, **Computer Vision**, **Weather Intelligence**, **Real-Time Analytics**, and **Cloud Technologies** into one intelligent ecosystem that assists farmers throughout the complete crop lifecycle—from crop selection to harvesting.

Instead of using separate applications for disease diagnosis, weather forecasting, crop recommendations, and community support, **AgriConnect provides everything in a single integrated platform**.

It has been designed with scalability, modularity, and accessibility in mind so that farmers can receive accurate recommendations through an intuitive and user-friendly interface.

---

# 🎯 Vision

> **Empowering every farmer with intelligent, affordable, and accessible AI-driven agricultural solutions that improve productivity, reduce crop losses, and promote sustainable farming.**

---

# 🚀 Mission

Our mission is to build a unified agricultural ecosystem capable of:

* 🌾 Improving crop productivity using Artificial Intelligence
* 🛰️ Predicting diseases before outbreaks occur
* 🌦️ Delivering real-time weather intelligence
* 📈 Forecasting crop yield with Deep Learning
* 🤖 Providing multilingual AI assistance
* 👨‍🌾 Connecting farming communities across regions
* 🌍 Making precision agriculture accessible to everyone

---

# ✨ Key Highlights

* 🤖 AI Powered Smart Agriculture Platform
* 🌱 End-to-End Crop Lifecycle Management
* 🧠 Machine Learning + Deep Learning Integration
* 💬 Intelligent Agricultural Chatbot (LLM Powered)
* 🌦️ Live Weather Intelligence
* 📊 Interactive Analytics Dashboard
* 🌿 CNN-based Crop Disease Detection
* 🌾 YOLOv8 Weed Detection
* 📈 LSTM Disease Prediction
* 🚜 National-Level Crop Yield Prediction
* 🌍 Location-Based Crop Recommendation
* 🔔 Real-Time Notifications
* 📱 Responsive Modern UI
* ☁️ Cloud Ready Architecture

---

# 📑 Table of Contents

* 🌱 Project Overview
* 🏗️ System Architecture
* 🚀 Major Features
* 🧠 AI & Machine Learning Models
* 💻 Technology Stack
* 📂 Database Structure
* ⚙️ Installation Guide
* 📸 Screenshots
* 📈 Future Scope
* 🤝 Contributing

---

# 🌾 Project Overview

Agriculture generates enormous amounts of valuable data every day—from weather conditions and soil health to crop diseases and yield patterns. Unfortunately, most of this information remains fragmented and inaccessible to farmers.

**AgriConnect transforms this scattered data into actionable intelligence using Artificial Intelligence.**

The platform integrates:

* 🌦️ Weather APIs
* 🧠 Machine Learning Models
* 🤖 Deep Learning Models
* 💬 Large Language Models
* 🌍 Geolocation Services
* 📊 Data Visualization
* ☁️ Cloud Deployment
* 🔄 Real-Time Communication

to help farmers make informed decisions at every stage of cultivation.

---

# 🏗️ System Architecture

```text
                   🌐 React + Tailwind Frontend
                               │
             ┌─────────────────┴─────────────────┐
             │                                   │
      Node.js + Express Backend          Flask ML Server
             │                                   │
             │                                   │
      Authentication                  AI / ML Prediction APIs
             │                                   │
             └──────────────┬────────────────────┘
                            │
                    MongoDB Database
                            │
         ┌──────────────┬──────────────┬──────────────┐
         │              │              │
      Weather APIs   Gemini LLM   Pinecone Vector DB
```

---

# 🚀 Core Modules

## 🤖 AI Agricultural Chatbot

An intelligent conversational assistant developed using **LangChain**, **Sentence Transformers**, **Vector Search**, and **Google Gemini**.

### Features

* 💬 Human-like conversations
* 🎤 Voice Input & Text-to-Speech
* 🌾 Crop advisory
* 🦠 Disease information
* 🌦️ Weather guidance
* 📚 Government schemes
* 🌍 Regional language support
* 📖 Agricultural knowledge base

---

## 📊 Farmer Dashboard

A centralized dashboard providing complete farm insights.

### Dashboard Includes

* 🌾 Crop Health Cards
* 🌦️ Weather Forecasts
* 📈 Interactive Charts
* 🌿 Weed Detection Reports
* 🦠 Disease Prediction
* 🚜 Yield Estimation
* 🔔 Notifications
* 📊 Historical Analytics

---

## 🔐 Authentication System

Secure role-based authentication system.

### Supports

* 👨‍🌾 Farmers
* 👨‍💼 Administrators
* 🔬 Researchers

Security Features

* JWT Authentication
* HTTP Cookies
* Protected Routes
* Admin Verification
* Role-Based Authorization

---

## 🌿 Crop Disease Detection (CNN)

Image classification using Convolutional Neural Networks.

### Capabilities

* Upload crop leaf images
* Automatic disease identification
* Confidence score prediction
* Disease description
* Treatment suggestions
* Prevention guidelines

---

## 🌱 Weed Detection (YOLOv8)

Real-time weed detection using YOLOv8 object detection.

### Current Features

* Cotton weed detection
* Bounding boxes
* Detection confidence
* Real-time inference
* Socket.IO communication

---

## 📈 Disease Prediction (LSTM)

Advanced temporal prediction using Long Short-Term Memory Networks.

Predicts

* Disease Risk Percentage
* Affected Radius
* 10-Day Forecast
* Historical Disease Trends
* Farm-specific Predictions

---

## 🌾 Crop Yield Prediction

National-level crop yield estimation using AI.

Considers

* Rainfall
* Temperature
* Soil Type
* NDVI
* Irrigation
* Fertilizer Usage
* Historical Yield

---

## 🌍 Smart Crop Recommendation

Suggests suitable crops based on

* Soil Type
* Location
* Climate
* Weather
* Historical Production
* Yield Trends

---

## 🌦️ Weather Intelligence

Real-time weather analytics.

Includes

* Current Weather
* Hourly Forecast
* Multi-day Forecast
* Rain Probability
* Wind Speed
* Temperature Trends
* Weather News
* Agricultural Advisories

---

## 👨‍🌾 Community Platform

A collaborative ecosystem for farmers.

Features

* Community Posts
* Crop Reports
* Image Sharing
* Disease Discussions
* Knowledge Exchange

---

## 🔔 Notification System

Real-time notifications powered by Socket.IO.

Alerts

* Disease Warnings
* Weather Alerts
* Community Updates
* Prediction Results
* Crop Recommendations

---

# 🧠 Artificial Intelligence Models

| Model                    | Purpose                |
| ------------------------ | ---------------------- |
| 🧠 CNN                   | Crop Disease Detection |
| 🌱 YOLOv8                | Weed Detection         |
| 📈 LSTM                  | Disease Prediction     |
| 🚜 LSTM                  | Crop Yield Prediction  |
| 🌾 Scikit-Learn Models   | Crop Recommendation    |
| 🤖 LangChain + Gemini    | Conversational AI      |
| 📚 Sentence Transformers | Semantic Search        |
| 🔍 TF-IDF                | Knowledge Retrieval    |

---

# 💻 Technology Stack

| Layer            | Technologies                             |
| ---------------- | ---------------------------------------- |
| 🎨 Frontend      | React, Tailwind CSS, Redux Toolkit       |
| ⚙️ Backend       | Node.js, Express.js                      |
| 🧠 AI Server     | Flask                                    |
| 🗄 Database      | MongoDB, Pinecone                        |
| 🤖 AI Frameworks | TensorFlow, PyTorch, Transformers        |
| 📊 Data Science  | Pandas, NumPy, Scikit-learn              |
| 💬 NLP           | LangChain, Sentence Transformers, Gemini |
| 🌦 APIs          | OpenWeatherMap, Open-Meteo, Geopy        |
| 🔄 Real-Time     | Socket.IO                                |
| 🔐 Security      | JWT, Cookie Parser, Flask-CORS           |

---

# 🗂️ Database Collections

* 👤 Users
* 🚜 Farms
* 🌾 Crop Reports
* 🔔 Notifications
* 💬 Community Posts
* 📈 Prediction History
* 🌦 Weather Cache

---

# ⚙️ Installation

## 📦 Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## ⚙️ Backend

```bash
cd backend
npm install
npm run dev
```

---

## 🤖 ML Server

```bash
cd ML/server

python -m venv .venv

source .venv/bin/activate

pip install -r requirements.txt

python api.py
```

---

# 📸 Screenshots

> 📷 Add screenshots of

* Login
* Dashboard
* Weather Module
* Chatbot
* Disease Detection
* Weed Detection
* Crop Prediction
* Yield Prediction
* Community Module

---

# 🚀 Future Roadmap

* 🌍 Multi-language Voice Assistant
* 📱 Android & iOS Mobile Application
* 🛰️ Satellite Imagery Integration
* 🌿 Multi-Crop Weed Detection
* 🚜 Smart Irrigation Prediction
* 🌧️ Flood & Drought Prediction
* 📡 IoT Sensor Integration
* 🧠 Generative AI Farming Assistant
* ☁️ Cloud-native Microservices
* 🌎 Nationwide Agricultural Intelligence Platform

---

# 🤝 Contributing

Contributions are always welcome!

If you'd like to improve AgriConnect:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

# ⭐ Support the Project

If you found this project useful:

⭐ Star this repository

🍴 Fork it

📢 Share it with others

🤝 Contribute to its development

---

<p align="center">

### 🌾 *"Connecting Farmers to Technology, Empowering Agriculture with Artificial Intelligence."*

**Built with ❤️ for Farmers, Researchers, and the Future of Smart Agriculture**

</p>
