import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
    UPLOAD_FOLDER = 'static/uploads'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'mp4', 'avi', 'mov'}
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB max file size


    # Class colors
    CLASS_COLORS = {
        "Soil": (0, 255, 0),     # Green
        "Weed": (0, 0, 255),     # Red
        "Cotton": (255, 165, 0)  # Orange
    }
    