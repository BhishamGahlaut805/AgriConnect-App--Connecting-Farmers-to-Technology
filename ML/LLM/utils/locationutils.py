import requests

def get_user_location(ip=None):
    try:
        if ip:
            resp = requests.get(f"http://ip-api.com/json/{ip}", timeout=5)
        else:
            resp = requests.get("http://ip-api.com/json/", timeout=5)
        data = resp.json()
        return {
            "latitude": data.get("lat"),
            "longitude": data.get("lon"),
            "city": data.get("city"),
            "region": data.get("regionName"),
            "country": data.get("country")
        }
    except Exception:
        return None
