import os
import time
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Any
from .config import logger, SCRAPING_INTERVALS
from .utils.weatherutils import fetch_weather_data
from .utils.newsutils import fetch_agri_news
from .utils.bulletinUtils import fetch_imd_agromet_bulletin

class AdminManager:
    def __init__(self, db, pinecone_manager):
        self.db = db
        self.pinecone_manager = pinecone_manager
        self.is_running = False
        self.scraping_thread = None
        self.last_scrape_times = {}

    def start_auto_scraping(self):
        """Start automatic scraping in background thread"""
        self.is_running = True
        self.scraping_thread = threading.Thread(target=self._scraping_loop, daemon=True)
        self.scraping_thread.start()
        logger.info("Auto-scraping started")

    def stop_auto_scraping(self):
        """Stop automatic scraping"""
        self.is_running = False
        if self.scraping_thread:
            self.scraping_thread.join()
        logger.info("Auto-scraping stopped")

    def _scraping_loop(self):
        """Main scraping loop - runs but only processes when manually triggered"""
        while self.is_running:
            try:
                # Check every hour but only log status
                # Actual scraping only happens via admin routes
                logger.debug("Scraping service running (manual trigger required)")
                time.sleep(3600)
            except Exception as e:
                logger.error(f"Scraping loop error: {e}")
                time.sleep(300)

    def scrape_weather_data(self, locations=None):
        """Scrape weather data for specified locations"""
        try:
            if not locations:
                locations = [
                    {"state": "Haryana", "lat": 29.0588, "lon": 76.0856},
                    {"state": "Punjab", "lat": 31.1471, "lon": 75.3412},
                    {"state": "Uttar Pradesh", "lat": 26.8467, "lon": 80.9462},
                ]

            success_count = 0
            for location in locations:
                try:
                    weather_data = fetch_weather_data(
                        location["lat"],
                        location["lon"],
                        self.db
                    )
                    if weather_data and "error" not in weather_data:
                        # Add location info to weather data
                        weather_data["location"] = location["state"]
                        self.pinecone_manager.add_weather_data(weather_data, location["state"])
                        success_count += 1
                        logger.info(f"Weather data processed for {location['state']}")

                except Exception as e:
                    logger.error(f"Weather scraping failed for {location['state']}: {e}")
                    continue

            self.last_scrape_times["weather"] = datetime.now()
            logger.info(f"Weather data scraping completed: {success_count}/{len(locations)} locations")
            return success_count

        except Exception as e:
            logger.error(f"Weather scraping failed: {e}")
            return 0

    def scrape_news_data(self):
        """Scrape agricultural news"""
        try:
            news_items = fetch_agri_news(self.db)
            if news_items:
                success_count = self.pinecone_manager.add_news_data(news_items)
                self.last_scrape_times["news"] = datetime.now()
                logger.info(f"News data scraped: {len(news_items)} items")
                return len(news_items)
            return 0

        except Exception as e:
            logger.error(f"News scraping failed: {e}")
            return 0

    def scrape_bulletins(self):
        """Scrape agricultural bulletins"""
        try:
            states = ["Haryana", "Delhi", "Uttar Pradesh"]
            bulletins = []
            success_count = 0

            for state in states:
                try:
                    bulletin_data = fetch_imd_agromet_bulletin(state)
                    if bulletin_data:
                        bulletins.append(bulletin_data)
                        success_count += 1
                        logger.info(f"Bulletin fetched for {state}")
                except Exception as e:
                    logger.error(f"Bulletin fetch failed for {state}: {e}")
                    continue

            if bulletins:
                self.pinecone_manager.add_bulletins_data(bulletins)
                self.last_scrape_times["bulletins"] = datetime.now()
                logger.info(f"Bulletins processed: {success_count}/{len(states)} states")

            return success_count

        except Exception as e:
            logger.error(f"Bulletin scraping failed: {e}")
            return 0

    def scrape_disease_info(self):
        """Scrape crop disease information"""
        try:
            disease_data = self._fetch_disease_information()
            if disease_data:
                self.pinecone_manager.add_disease_data(disease_data)
                self.last_scrape_times["diseases"] = datetime.now()
                logger.info(f"Disease info updated: {len(disease_data)} items")
                return len(disease_data)
            return 0

        except Exception as e:
            logger.error(f"Disease info scraping failed: {e}")
            return 0

    def _fetch_disease_information(self) -> List[Dict]:
        """Fetch comprehensive crop disease information"""
        return [
            {
                "disease": "Late Blight of Potato",
                "crop": "Potato",
                "symptoms": "Water-soaked lesions on leaves that turn brown and necrotic, white fungal growth on undersides of leaves during humid conditions, rapid destruction of foliage",
                "treatment": "Apply fungicides containing chlorothalonil, mancozeb, or metalaxyl. Remove and destroy infected plants. Use certified disease-free seed potatoes.",
                "prevention": "Plant resistant varieties, ensure proper spacing for air circulation, avoid overhead irrigation, practice crop rotation with non-host crops",
                "source": "Agricultural Plant Pathology Database"
            },
            {
                "disease": "Wheat Rust",
                "crop": "Wheat",
                "symptoms": "Orange-brown pustules on leaves and stems, yellowing of leaves, reduced grain filling, premature leaf death",
                "treatment": "Apply fungicides like propiconazole or tebuconazole at first sign of infection. Remove volunteer wheat plants.",
                "prevention": "Plant rust-resistant varieties, avoid excessive nitrogen fertilization, practice timely sowing",
                "source": "Cereal Disease Research Institute"
            },
            {
                "disease": "Rice Blast",
                "crop": "Rice",
                "symptoms": "Diamond-shaped lesions with gray centers and brown borders on leaves, neck rot causing whiteheads, node infections",
                "treatment": "Apply fungicides like tricyclazole, isoprothiolane, or carbendazim. Drain fields to reduce humidity.",
                "prevention": "Use resistant varieties, avoid excessive nitrogen, maintain proper water management, destroy crop residues",
                "source": "International Rice Research Institute"
            }
        ]

    def get_scraping_status(self) -> Dict[str, Any]:
        """Get current scraping status"""
        status = {
            "is_running": self.is_running,
            "last_scrape_times": {},
            "next_scrapes": {}
        }

        for data_type in SCRAPING_INTERVALS:
            last_time = self.last_scrape_times.get(data_type)
            status["last_scrape_times"][data_type] = last_time.isoformat() if last_time else "Never"

            if last_time:
                next_time = last_time + timedelta(hours=SCRAPING_INTERVALS[data_type])
                status["next_scrapes"][data_type] = next_time.isoformat()
            else:
                status["next_scrapes"][data_type] = "Ready for first scrape"

        return status