from flask import Blueprint, request, jsonify
from models.user import User, db
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import IntegrityError
from flask_limiter.util import get_remote_address
import re

# Import limiter from main
from flask import current_app

# Blueprint
auth_bp = Blueprint('auth', __name__)
 
# Helper: sanitize input
def sanitize_string(s):
    if not isinstance(s, str):
        return ''
    # Remove leading/trailing whitespace and limit length
    return re.sub(r'[^a-zA-Z0-9_@.+-]', '', s.strip())[:120]

# Registration Endpoint
@auth_bp.route('/api/signup', methods=['POST'])
def signup():
    limiter = current_app.limiter
    @limiter.limit("5 per minute")
    def limited_signup():
        data = request.get_json() or {}
        username = sanitize_string(data.get('username', ''))
        email = sanitize_string(data.get('email', ''))
        password = data.get('password', '')

        # Validate required fields
        if not username or not email or not password:
            return jsonify({'error': 'All fields are required.'}), 400

        # Validate username and email format
        valid_username, username_msg = User.validate_username(username)
        valid_email, email_msg = User.validate_email(email)
        if not valid_username:
            return jsonify({'error': username_msg}), 400
        if not valid_email:
            return jsonify({'error': email_msg}), 400

        # Enforce password complexity
        try:
            user = User(username=username, email=email, password=password)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

        # Save user, check uniqueness
        try:
            db.session.add(user)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return jsonify({'error': 'Username or email already exists.'}), 400

        return jsonify({'message': 'User created successfully.'}), 201
    return limited_signup()

# Login Endpoint
@auth_bp.route('/api/login', methods=['POST'])
def login():
    limiter = current_app.limiter
    @limiter.limit("10 per minute")
    def limited_login():
        data = request.get_json() or {}
        identifier = sanitize_string(data.get('identifier', ''))
        password = data.get('password', '')

        if not identifier or not password:
            return jsonify({'error': 'Username/email and password are required.'}), 400

        # Find user by username or email
        user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid credentials.'}), 401

        # Generate JWT token
        access_token = create_access_token(identity=user.email)
        return jsonify({
            'token': access_token,
            'user': user.to_dict()
        }), 200
    return limited_login()

# Routes will be implemented here 