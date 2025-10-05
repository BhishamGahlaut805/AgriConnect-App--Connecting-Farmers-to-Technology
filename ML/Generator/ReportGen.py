import requests
from bs4 import BeautifulSoup
from transformers import pipeline
import re
from datetime import datetime

# Load transformer QA model
qa_pipeline = pipeline("question-answering", model="distilbert-base-cased")

# ---- Sample user input ----
input_data = {
    "_id": "6876362dcae20cc3bc7c6c13",
    "crop": "cherry",
    "disease": "Powdery_mildew",
    "confidence": 78,
    "imageUrl": "/uploads/imageUrl-1752577570969-574758841.JPG"
}

# ---------------------- SCRAPE FUNCTION -----------------------

def scrape_wikipedia(crop, disease):
    try:
        query = f"{disease.replace('_', ' ')} on {crop}"
        url = f"https://en.wikipedia.org/wiki/{query.replace(' ', '_')}"
        res = requests.get(url)
        if res.status_code != 200:
            raise Exception("Wikipedia page not found.")

        soup = BeautifulSoup(res.content, "html.parser")
        paragraphs = soup.find_all("p")
        full_text = " ".join(p.get_text() for p in paragraphs)
        return full_text[:3000]  # limit to 3000 chars
    except Exception as e:
        print("Scrape error:", e)
        return ""

# ---------------------- QA MODEL QUESTIONS -----------------------

questions = {
    "pathogen": "What is the main pathogen causing the disease?",
    "pathogen_type": "What type of pathogen is it?",
    "spread": "How does the disease spread?",
    "favorable_conditions": "What are the favorable conditions for this disease?",
    "best_practices": "What are the best farming practices to prevent this disease?",
    "natural_methods": "What are the natural methods to control this disease?",
    "chemical_pesticides": "What chemical pesticides are effective against this disease?"
}

def ask_questions(context):
    answers = {}
    for key, q in questions.items():
        try:
            result = qa_pipeline({
                'context': context,
                'question': q
            })
            answers[key] = result['answer']
        except:
            answers[key] = "Not found"
    return answers

# ---------------------- FINAL REPORT GENERATION -----------------------

def generate_crop_report(input_data):
    context = scrape_wikipedia(input_data["crop"], input_data["disease"])
    if not context:
        return {"error": "Could not fetch reliable data"}

    results = ask_questions(context)

    report = {
        "_id": input_data["_id"],
        "crop": input_data["crop"],
        "disease": input_data["disease"],
        "confidence": input_data["confidence"],
        "imageUrl": input_data["imageUrl"],
        "isHealthy": False,
        "createdAt": datetime.utcnow().isoformat(),
        "report": {
            "pathogen": results["pathogen"],
            "pathogen_type": results["pathogen_type"],
            "spread": results["spread"],
            "favorable_conditions": results["favorable_conditions"],
            "best_practices": [results["best_practices"]],
            "natural_methods": [results["natural_methods"]],
            "chemical_pesticides": [results["chemical_pesticides"]],
        },
        "__v": 0
    }
    return report

# ---------------------- Run Example -----------------------

if __name__ == "__main__":
    report = generate_crop_report(input_data)
    from pprint import pprint
    pprint(report)
