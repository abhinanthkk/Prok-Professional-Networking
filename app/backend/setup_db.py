#!/usr/bin/env python3
"""
Database setup script - creates all tables from scratch
"""
import os
import sys
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
from models import db
from models.user import User
from models.profile import Profile, Skill, Experience, Education
from models.post import Post
from models.job import Job, JobApplication
from models.message import Conversation, Message

# Initialize database
db.init_app(app)
migrate = Migrate(app, db)

def setup_database():
    """Setup database tables from scratch"""
    with app.app_context():
        # Drop all tables if they exist
        print("Dropping all existing tables...")
        db.drop_all()
        
        # Create all tables
        print("Creating all tables...")
        db.create_all()
        
        print("✅ Database tables created successfully!")
        print("Tables created:")
        print("- users")
        print("- profiles")
        print("- skills")
        print("- experiences")
        print("- education")
        print("- posts")
        print("- jobs")
        print("- job_applications")
        print("- conversations")
        print("- messages")

if __name__ == '__main__':
    setup_database() 