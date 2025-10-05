from flask import Flask
from flask_socketio import SocketIO
from .routes import weed_bp, generate_frames

socketio = SocketIO(cors_allowed_origins="*")

def create_app():
    app = Flask(__name__)
    app.register_blueprint(weed_bp)
    socketio.init_app(app)
    return app, socketio
