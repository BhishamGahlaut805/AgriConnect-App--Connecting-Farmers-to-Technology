from flask import Blueprint, render_template, jsonify, request
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['newsDB']
collection = db['news']

bp = Blueprint('bp', __name__)
CORS(bp)

last_scrape_time = None

def scrape_and_store():
    global last_scrape_time
    current_time = datetime.now()
    if last_scrape_time is None or current_time - last_scrape_time > timedelta(days=1):
        url = "https://www.skymetweather.com/content/weather-news-and-analysis/"
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')

        stories = soup.find_all('li', id='post-134103')
        news_data = []

        for story in stories:
            link = story.find('a')['href']
            title = story.find('a').get_text(strip=True)
            heading = story.find('div', class_='articale-heading').get_text(strip=True)
            datetime_str = story.find('p', class_='datetime').get_text(strip=True)
            thumbnail = story.find('img')['defer-src'] if story.find('img') else None

            news_data.append({
                'title': title,
                'link': link,
                'heading': heading,
                'datetime': datetime_str,
                'thumbnail': thumbnail
            })
        if not news_data:  # Check if the list is empty
            print("No news data found. Skipping database insertion.")
            return  # Stop execution if no data is found
        collection.insert_many(news_data)
        last_scrape_time = current_time

def get_latest_news():
    scrape_and_store()
    latest_news = list(collection.find().sort([('_id', -1)]).limit(20))
    for news in latest_news:
        news['_id'] = str(news['_id'])
    return jsonify(latest_news), 200

@bp.route('/news', methods=['POST'])
def new_route():
    return get_latest_news()

@bp.route('/newsdetail', methods=['POST'])
def news_detail():
    data = request.get_json()
    link = data.get('link')

    if not link:
        return jsonify({"error": "No link provided"}), 400

    response = requests.get(link)
    soup = BeautifulSoup(response.content, 'html.parser')

    headline = soup.find('h1', {'itemprop': 'headline'})
    headline_text = headline.get_text(strip=True) if headline else "No headline available"

    paragraphs = [p.get_text(strip=True) for p in soup.find_all('p')]
    figure = soup.find('figure')
    image = None
    if figure:
        img = figure.find('img')
        if img:
            image = {'src': img['src'], 'alt': img.get('alt', '')}

    return jsonify({
        "headline": headline_text,
        "paragraphs": paragraphs,
        "figure": image
    })
