import requests, json, os
from bs4 import BeautifulSoup
from datetime import datetime
from ..config import DEFAULT_DATA_DIR, logger, NEWS_SOURCES

def fetch_agri_news(db):
    """Fetch agricultural news from multiple sources"""
    all_news = []

    try:
        # SkyMet Weather News
        skymet_news = _fetch_skymet_news()
        all_news.extend(skymet_news)

        # PIB News
        pib_news = _fetch_pib_news()
        all_news.extend(pib_news)

        # IMD News
        imd_news = _fetch_imd_news()
        all_news.extend(imd_news)

    except Exception as e:
        logger.error(f"News fetch error: {e}")

    # Save to database
    if all_news:
        try:
            db.agri_news.insert_many(all_news)

            # Save to file
            filename = f"agri_news_{int(datetime.utcnow().timestamp())}.json"
            news_dir = os.path.join(DEFAULT_DATA_DIR, "news")
            os.makedirs(news_dir, exist_ok=True)

            path = os.path.join(news_dir, filename)
            with open(path, "w", encoding="utf-8") as f:
                json.dump(all_news, f, default=str, indent=2)

        except Exception as e:
            logger.error(f"Failed to save news: {e}")

    return all_news

def _fetch_skymet_news():
    """Fetch news from SkyMet Weather"""
    news_items = []
    try:
        url = "https://www.skymetweather.com/content/weather-news-and-analysis/"
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')

        stories = soup.find_all('li', class_=lambda x: x and 'post-' in x)

        for story in stories[:10]:  # Limit to 10 stories
            link_elem = story.find('a', href=True)
            title_elem = story.find(['h2', 'h3', 'strong'])
            date_elem = story.find('time')

            if link_elem and title_elem:
                news_items.append({
                    'title': title_elem.get_text(strip=True),
                    'url': link_elem['href'],
                    'source': 'SkyMet Weather',
                    'published_at': date_elem.get_text(strip=True) if date_elem else datetime.utcnow().isoformat(),
                    'fetched_at': datetime.utcnow()
                })

    except Exception as e:
        logger.warning(f"SkyMet news fetch failed: {e}")

    return news_items

def _fetch_pib_news():
    """Fetch news from PIB"""
    news_items = []
    try:
        url = "https://pib.gov.in/AllReleases.aspx"
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")

        # Look for agricultural related releases
        releases = soup.find_all("div", class_="release")

        for release in releases[:5]:
            title_elem = release.find("h2") or release.find("strong")
            link_elem = release.find("a", href=True)

            if title_elem and link_elem and any(keyword in title_elem.text.lower()
                                              for keyword in ['agriculture', 'crop', 'farmer', 'weather']):
                news_items.append({
                    'title': title_elem.get_text(strip=True),
                    'url': f"https://pib.gov.in{link_elem['href']}",
                    'source': 'PIB',
                    'published_at': datetime.utcnow().isoformat(),
                    'fetched_at': datetime.utcnow()
                })

    except Exception as e:
        logger.warning(f"PIB news fetch failed: {e}")

    return news_items

def _fetch_imd_news():
    """Fetch news from IMD"""
    news_items = []
    try:
        url = "https://mausam.imd.gov.in/"
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")

        # Extract news items from IMD
        news_sections = soup.find_all("div", class_=lambda x: x and 'news' in x.lower())

        for section in news_sections[:5]:
            links = section.find_all("a", href=True)
            for link in links:
                text = link.get_text(strip=True)
                if text and len(text) > 10:
                    news_items.append({
                        'title': text,
                        'url': link['href'] if link['href'].startswith('http') else f"https://mausam.imd.gov.in/{link['href']}",
                        'source': 'IMD',
                        'published_at': datetime.utcnow().isoformat(),
                        'fetched_at': datetime.utcnow()
                    })

    except Exception as e:
        logger.warning(f"IMD news fetch failed: {e}")

    return news_items