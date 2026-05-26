"""
Transify AI - Main Flask Application Entry Point
Uses threading async mode (more stable than eventlet for newer Flask-SocketIO)
"""

from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

# Import routes
from routes.translate import translate_bp
from routes.ocr import ocr_bp
from routes.history import history_bp

# Import socket handlers
from chat.socket_handler import register_socket_events

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'transify-secret-key-2024'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

# Enable CORS for all origins (frontend at localhost:5173)
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize SocketIO with threading mode (no eventlet dependency)
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode='threading',
    logger=False,
    engineio_logger=False
)

# Register blueprints
app.register_blueprint(translate_bp, url_prefix='/api')
app.register_blueprint(ocr_bp, url_prefix='/api')
app.register_blueprint(history_bp, url_prefix='/api')

# Register socket events
register_socket_events(socketio)


@app.route('/')
def index():
    return {'status': 'Transify AI Backend Running', 'version': '1.0.0'}


@app.route('/api/health')
def health():
    return {'status': 'healthy', 'message': 'Transify AI is operational'}


if __name__ == '__main__':
    print("=" * 60)
    print("  Transify AI Backend Starting...")
    print("  URL:  http://localhost:5000")
    print("  Mode: threading (stable)")
    print("=" * 60)
    socketio.run(
        app,
        host='0.0.0.0',
        port=5000,
        debug=False,         # debug=False avoids reloader issues
        use_reloader=False,  # prevents double-start
        allow_unsafe_werkzeug=True
    )
