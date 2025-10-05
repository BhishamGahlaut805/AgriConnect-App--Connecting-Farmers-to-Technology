import os, uuid, time
from werkzeug.utils import secure_filename
from ..config import DEFAULT_DATA_DIR, ALLOWED_EXTENSIONS

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file, dest_dir=None):
    dest_dir = dest_dir or os.path.join(DEFAULT_DATA_DIR, "uploads")
    os.makedirs(dest_dir, exist_ok=True)
    unique_name = f"{int(time.time())}_{uuid.uuid4().hex[:8]}_{secure_filename(file.filename)}"
    path = os.path.join(dest_dir, unique_name)
    file.save(path)
    return unique_name, path
