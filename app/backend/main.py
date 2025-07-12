from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from dotenv import load_dotenv
import os
from flask_migrate import Migrate

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
CORS(app, origins=["http://localhost:5173", "http://localhost:5174"], allow_headers=["Content-Type", "Authorization"], methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], supports_credentials=True)

# Import db and models
from models import db
from models.user import User
from models.profile import Profile, Skill, Experience, Education

# Initialize database
db.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

# Import blueprints
from api.auth import auth_bp
from api.profile import profile_bp
from api.posts import posts_bp
from api.feed import feed_bp
from api.jobs import jobs_bp
from api.messaging import messaging_bp

# Remove the manual CORS headers from after_request
def add_cors_headers(response):
    # Only add non-origin headers
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

def setup_database():
    """Setup database tables"""
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")

# Create a function to initialize the app
def create_app():
    """Application factory function"""
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(posts_bp)
    app.register_blueprint(feed_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(messaging_bp)
    return app

@app.route('/')
def index():
    return 'Welcome to the Prok Professional Networking API!'

if __name__ == '__main__':
    # Setup database tables
    setup_database()
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(posts_bp)
    app.register_blueprint(feed_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(messaging_bp)
    # Run the app
    app.run(debug=True) 