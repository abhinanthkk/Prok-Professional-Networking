from datetime import datetime
from . import db

class Profile(db.Model):
    __tablename__ = 'profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)  # Changed to user_id
    bio = db.Column(db.Text)
    location = db.Column(db.String(100))
    title = db.Column(db.String(100))
    avatar_url = db.Column(db.String(255))  # URL to profile picture
    cover_url = db.Column(db.String(255))   # URL to profile background/cover image
    website = db.Column(db.String(255))     # Personal website
    linkedin = db.Column(db.String(255))    # LinkedIn profile
    github = db.Column(db.String(255))      # GitHub profile
    twitter = db.Column(db.String(255))     # Twitter profile
    phone = db.Column(db.String(20))        # Phone number
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('profile', uselist=False))

    def __init__(self, user_id):
        self.user_id = user_id

    # Validation rules (to be enforced in API or forms):
    # - bio: optional, max 1000 chars
    # - location, title: optional, max 100 chars
    # - avatar_url, website, linkedin, github, twitter: optional, must be valid URLs if present
    # - phone: optional, max 20 chars, should be a valid phone number if present

class Skill(db.Model):
    __tablename__ = 'skills'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Changed to user_id
    name = db.Column(db.String(50), nullable=False)

class Experience(db.Model):
    __tablename__ = 'experiences'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Changed to user_id
    title = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    description = db.Column(db.Text)
    current = db.Column(db.Boolean, default=False)

class Education(db.Model):
    __tablename__ = 'education'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Changed to user_id
    school = db.Column(db.String(100), nullable=False)
    degree = db.Column(db.String(100), nullable=False)
    field = db.Column(db.String(100))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    current = db.Column(db.Boolean, default=False)
