from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from models.user import User, db
from datetime import timedelta
from models.profile import Profile
import re

auth_bp = Blueprint('auth', __name__)

def validate_password(password):
    """
    Validate password complexity requirements:
    - At least 8 characters long
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    - Contains at least one digit
    - Contains at least one special character
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)"
    
    return True, "Password is valid"
 
@auth_bp.route('/auth/signup', methods=['POST', 'OPTIONS'])
def signup():
    if request.method == 'OPTIONS':
        return '', 204
    data = request.get_json()
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    confirm_password = data.get('confirm_password')
    if not email or not username or not password or not confirm_password:
        return jsonify({'message': 'All fields are required'}), 400
    if password != confirm_password:
        return jsonify({'message': 'Passwords do not match'}), 400
    
    # Validate password complexity
    is_valid, error_message = validate_password(password)
    if not is_valid:
        return jsonify({'message': error_message}), 400
    
    if User.query.filter((User.email == email) | (User.username == username)).first():
        return jsonify({'message': 'User with this email or username already exists'}), 400
    hashed_password = generate_password_hash(password)
    user = User(email=email, username=username, name=username, password_hash=hashed_password)
    db.session.add(user)
    db.session.flush()  # Get the user ID
    # Auto-create blank profile for new user
    profile = Profile(user_id=user.id)
    db.session.add(profile)
    db.session.commit()
    access_token = create_access_token(identity=email, expires_delta=timedelta(hours=1))
    return jsonify({'access_token': access_token}), 201

@auth_bp.route('/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 204
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Invalid credentials'}), 401
    access_token = create_access_token(identity=email, expires_delta=timedelta(hours=1))
    return jsonify({'access_token': access_token}), 200

@auth_bp.route('/auth/change-password', methods=['POST', 'OPTIONS'])
@jwt_required()
def change_password():
    """Change user password with validation"""
    if request.method == 'OPTIONS':
        return '', 204
    
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    confirm_password = data.get('confirm_password')
    
    if not current_password or not new_password or not confirm_password:
        return jsonify({'message': 'All password fields are required'}), 400
    
    # Verify current password
    if not check_password_hash(user.password_hash, current_password):
        return jsonify({'message': 'Current password is incorrect'}), 400
    
    # Check if new password matches confirmation
    if new_password != confirm_password:
        return jsonify({'message': 'New passwords do not match'}), 400
    
    # Validate new password complexity
    is_valid, error_message = validate_password(new_password)
    if not is_valid:
        return jsonify({'message': error_message}), 400
    
    # Check if new password is different from current password
    if check_password_hash(user.password_hash, new_password):
        return jsonify({'message': 'New password must be different from current password'}), 400
    
    # Update password
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200

# Routes will be implemented here 