from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import re

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), primary_key=True, unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    def __init__(self, username, email, password):
        self.username = username
        self.email = email
        self.set_password(password)
    
    def set_password(self, password):
        """Hash and set the password"""
        if not self._validate_password_complexity(password):
            raise ValueError("Password does not meet complexity requirements")
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if the provided password matches the hash"""
        return check_password_hash(self.password_hash, password)
    
    def _validate_password_complexity(self, password):
        """
        Validate password complexity requirements:
        - Minimum 8 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        - At least one special character
        """
        if len(password) < 8:
            return False
        
        # Check for at least one uppercase letter
        if not re.search(r'[A-Z]', password):
            return False
        
        # Check for at least one lowercase letter
        if not re.search(r'[a-z]', password):
            return False
        
        # Check for at least one digit
        if not re.search(r'\d', password):
            return False
        
        # Check for at least one special character
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            return False
        
        return True
    
    def to_dict(self):
        """Convert user object to dictionary (excluding password_hash)"""
        return {
            'username': self.username,
            'email': self.email
        }
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    @staticmethod
    def validate_username(username):
        """Validate username format and length"""
        if not username or len(username) < 3 or len(username) > 80:
            return False, "Username must be between 3 and 80 characters"
        
        # Check for valid characters (alphanumeric and underscore only)
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            return False, "Username can only contain letters, numbers, and underscores"
        
        return True, "Username is valid"
    
    @staticmethod
    def validate_email(email):
        """Validate email format"""
        if not email:
            return False, "Email is required"
        
        # Basic email validation regex
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return False, "Invalid email format"
        
        return True, "Email is valid"
    
    @staticmethod
    def get_password_requirements():
        """Return password complexity requirements for frontend validation"""
        return {
            'min_length': 8,
            'requires_uppercase': True,
            'requires_lowercase': True,
            'requires_digit': True,
            'requires_special': True,
            'message': 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.'
        }
