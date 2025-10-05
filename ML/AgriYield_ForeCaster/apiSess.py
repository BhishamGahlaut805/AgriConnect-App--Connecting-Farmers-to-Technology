from flask import Blueprint
from flask_socketio import SocketIO, emit, join_room
from flask import request, current_app
from datetime import datetime, timedelta
import uuid
import logging

# Initialize Blueprint
apiSessionblueprint = Blueprint('apiSession', __name__)

# Initialize Socket.IO
socketio = SocketIO()

# Configure logging
logger = logging.getLogger(__name__)

def init_socketio(app):
    """Initialize Socket.IO with the Flask app"""
    socketio.init_app(app, cors_allowed_origins="*")
    return socketio

class SessionManager:
    def __init__(self, mongo_service):
        self.mongo_service = mongo_service
        self.sessions = {}
        self.session_timeout = 3600  # 1 hour in seconds

    def create_session(self, farm_id: str) -> dict:
        session_id = f"{farm_id}_{uuid.uuid4().hex}"
        expires_at = datetime.utcnow() + timedelta(seconds=self.session_timeout)

        session_data = {
            "session_id": session_id,
            "farm_id": farm_id,
            "created_at": datetime.utcnow(),
            "last_accessed": datetime.utcnow(),
            "expires_at": expires_at,
            "context": []
        }

        self.sessions[session_id] = session_data
        if not self.mongo_service.save_session(session_data):
            raise RuntimeError("Failed to save session to database")
        return session_data

    def validate_session(self, session_id: str) -> bool:
        if session_id in self.sessions:
            if datetime.utcnow() < self.sessions[session_id]["expires_at"]:
                return True
            del self.sessions[session_id]
            return False

        session = self.mongo_service.get_active_session(session_id)
        if session:
            if isinstance(session.get("expires_at"), str):
                session["expires_at"] = datetime.fromisoformat(session["expires_at"])
            if datetime.utcnow() < session["expires_at"]:
                self.sessions[session_id] = session
                return True
        return False

    def update_session_activity(self, session_id: str):
        if session_id in self.sessions:
            now = datetime.utcnow()
            new_expiry = now + timedelta(seconds=self.session_timeout)
            self.sessions[session_id]["last_accessed"] = now
            self.sessions[session_id]["expires_at"] = new_expiry
            self.mongo_service.save_session({
                "session_id": session_id,
                "last_accessed": now,
                "expires_at": new_expiry
            })

# Socket.IO Event Handlers
@socketio.on('connect')
def handle_connect():
    session_id = request.args.get('session_id')
    if not session_id:
        emit('error', {'message': 'Session ID required', 'code': 'SESSION_ID_REQUIRED'})
        return False

    if not current_app.session_manager.validate_session(session_id):
        emit('error', {
            'message': 'Invalid or expired session',
            'code': 'INVALID_SESSION',
            'solution': 'Please create a new session'
        })
        return False

    join_room(session_id)
    emit('connection_success', {
        'message': 'Connected successfully',
        'session_id': session_id,
        'timestamp': datetime.utcnow().isoformat()
    })

@socketio.on('start_session')
def handle_start_session(data):
    try:
        farm_id = data.get('farm_id')
        if not farm_id:
            emit('error', {
                'message': 'farm_id is required',
                'code': 'FARM_ID_REQUIRED'
            })
            return

        session_data = current_app.session_manager.create_session(farm_id)
        emit('session_created', {
            'session_id': session_data['session_id'],
            'farm_id': farm_id,
            'expires_at': session_data['expires_at'].isoformat(),
            'created_at': session_data['created_at'].isoformat()
        })

    except Exception as e:
        logger.error(f"Session creation failed: {str(e)}")
        emit('error', {
            'message': 'Session creation failed',
            'code': 'SESSION_CREATION_ERROR',
            'details': str(e)
        })

@socketio.on('chat_message')
def handle_chat_message(data):
    try:
        session_id = data.get('session_id')
        message = data.get('message')
        crop_data = data.get('crop_data', {})

        if not session_id or not message:
            emit('error', {
                'message': 'session_id and message are required',
                'code': 'INVALID_INPUT'
            })
            return

        if not current_app.session_manager.validate_session(session_id):
            emit('session_error', {
                'message': 'Invalid or expired session',
                'code': 'SESSION_EXPIRED'
            })
            return

        current_app.session_manager.update_session_activity(session_id)

        response = current_app.chat_interface.process_query(
            session_id=session_id,
            query=message,
            crop_data=crop_data
        )

        if 'error' in response:
            emit('error', {
                'message': response.get('error'),
                'code': response.get('code', 'CHAT_ERROR'),
                'details': response.get('details')
            })
            return

        emit('chat_response', {
            **response,
            'session_id': session_id,
            'timestamp': datetime.utcnow().isoformat()
        }, room=session_id)

    except Exception as e:
        logger.error(f"Chat processing failed: {str(e)}")
        emit('error', {
            'message': 'Chat processing failed',
            'code': 'CHAT_PROCESSING_ERROR',
            'details': str(e)
        })

# HTTP API Routes
@apiSessionblueprint.route('/session/status/<session_id>', methods=['GET'])
def check_session_status(session_id):
    """HTTP endpoint to check session status"""
    try:
        if current_app.session_manager.validate_session(session_id):
            return {
                'status': 'active',
                'session_id': session_id,
                'valid': True
            }, 200
        return {
            'status': 'invalid',
            'session_id': session_id,
            'valid': False
        }, 404
    except Exception as e:
        logger.error(f"Session check failed: {str(e)}")
        return {
            'error': 'Session check failed',
            'details': str(e)
        }, 500

def init_app(app, mongo_service, chat_interface):
    """Initialize the API with the Flask app"""
    app.session_manager = SessionManager(mongo_service)
    app.chat_interface = chat_interface
    socketio.init_app(app)
    app.register_blueprint(apiSessionblueprint)
    return socketio
