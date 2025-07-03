from flask import Flask
from config import Config
from api import auth_bp
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_jwt_extended import JWTManager

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not found. Environment variables may not be loaded.")
    # You can still set environment variables manually or use system defaults

# Initialize CORS
try:
    from flask_cors import CORS
except ImportError:
    print("Warning: Flask-CORS not found. CORS will not be enabled.")
    CORS = None

# Import models
from models.user import User, db

# Import Flask-Migrate
try:
    from flask_migrate import Migrate
except ImportError:
    print("Warning: Flask-Migrate not found. Database migrations will not be available.")
    Migrate = None

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize JWTManager
jwt = JWTManager(app)

# Initialize extensions
if CORS:
    CORS(app)
else:
    print("CORS not available - cross-origin requests may be blocked")

# Initialize Flask-Limiter
if not hasattr(app, 'limiter'):
    limiter = Limiter(get_remote_address, app=app, default_limits=["10 per minute"])
    app.limiter = limiter
else:
    limiter = app.limiter

# Initialize database
db.init_app(app)

# Initialize Flask-Migrate
if Migrate:
    migrate = Migrate(app, db)
else:
    print("Flask-Migrate not available - database migrations will not be available")

# Register blueprints
app.register_blueprint(auth_bp)

# Add a root route for API status
@app.route('/')
def index():
    return "Prok API is running!", 200

def setup_database():
    """Setup database tables"""
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")

# Create a function to initialize the app
def create_app():
    """Application factory function"""
    return app

if __name__ == '__main__':
    # Setup database tables
    setup_database()
    
    # Run the app
    app.run(debug=True) 