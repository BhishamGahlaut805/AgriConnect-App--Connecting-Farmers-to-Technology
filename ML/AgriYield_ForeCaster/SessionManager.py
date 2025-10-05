import uuid
from datetime import datetime, timedelta
from typing import Dict, Optional

class SessionManager:
    def __init__(self, mongo_service):
        self.mongo_service = mongo_service
        self.sessions = {}  # In-memory session cache
        self.session_timeout = 3600  # 1 hour in seconds

    def create_session(self, farm_id: str) -> Dict:
        """Create a new session with proper synchronization"""
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

        # Store in both memory and MongoDB
        self.sessions[session_id] = session_data
        if not self.mongo_service.save_session(session_data):
            raise RuntimeError("Failed to save session to database")

        return session_data

    def validate_session(self, session_id: str) -> bool:
        """Validate session with proper synchronization"""
        # Check memory first
        if session_id in self.sessions:
            if datetime.utcnow() < self.sessions[session_id]["expires_at"]:
                return True
            del self.sessions[session_id]
            return False

        # Check MongoDB if not in memory
        session = self.mongo_service.get_active_session(session_id)
        if session:
            # Convert string timestamps if needed
            if isinstance(session.get("expires_at"), str):
                session["expires_at"] = datetime.fromisoformat(session["expires_at"])

            if datetime.utcnow() < session["expires_at"]:
                # Load into memory
                self.sessions[session_id] = session
                return True

        return False

    def get_session(self, session_id: str) -> Optional[Dict]:
        """Get complete session data with validation"""
        if not self.validate_session(session_id):
            return None

        if session_id in self.sessions:
            return self.sessions[session_id]

        return None

    def update_session_activity(self, session_id: str):
        """Update session activity in both memory and DB"""
        if session_id in self.sessions:
            now = datetime.utcnow()
            new_expiry = now + timedelta(seconds=self.session_timeout)

            self.sessions[session_id]["last_accessed"] = now
            self.sessions[session_id]["expires_at"] = new_expiry

            # Update MongoDB
            update_data = {
                "session_id": session_id,
                "last_accessed": now,
                "expires_at": new_expiry
            }
            self.mongo_service.save_session(update_data)