import os
from datetime import datetime

# Base directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DATA_DIR = os.path.join(BASE_DIR, "data")

# Create necessary directories
os.makedirs(os.path.join(DEFAULT_DATA_DIR, "uploads"), exist_ok=True)
os.makedirs(os.path.join(DEFAULT_DATA_DIR, "news"), exist_ok=True)
os.makedirs(os.path.join(DEFAULT_DATA_DIR, "weather"), exist_ok=True)
os.makedirs(os.path.join(DEFAULT_DATA_DIR, "training_pdfs"), exist_ok=True)

# File handling
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}

# LLM Configuration
LLM_MODEL_NAME = "gpt2"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

# Pinecone
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY1", "your-pinecone-api-key")
PINECONE_ENV = os.getenv("PINECONE_ENV", "us-east-1")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "agri-chatbot")

# MongoDB
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
DATABASE_NAME = os.getenv("DATABASE_NAME", "agribot")

# Admin
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "admin-secret-token")

# Logging
import logging

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Directory configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DATA_DIR = os.path.join(BASE_DIR, "data")
ALLOWED_EXTENSIONS = {'pdf', 'txt', 'doc', 'docx'}

# Pinecone configuration
PINECONE_INDEXES = {
    "weather": "agribot-weather",
    "news": "agribot-news",
    "diseases": "agribot-v4",
    "bulletins": "agribot-bulletins",
    "general": "agribot-general"
}

# API Configuration
WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast"
NEWS_SOURCES = [
    "https://www.skymetweather.com/content/weather-news-and-analysis/",
    "https://pib.gov.in/",
    "https://mausam.imd.gov.in/"
]

# Scraping intervals (in hours)
SCRAPING_INTERVALS = {
    "weather": 6,
    "news": 24,
    "bulletins": 24,
    "diseases": 168  # 1 week
}

# MongoDB configuration
MONGO_URI = "mongodb://localhost:27017/"
MONGO_DB = "agribot_db"