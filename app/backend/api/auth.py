from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from models.user import User, db
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

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
    if User.query.filter((User.email == email) | (User.username == username)).first():
        return jsonify({'message': 'User with this email or username already exists'}), 400
    hashed_password = generate_password_hash(password)
    user = User(email=email, username=username, name=username, password_hash=hashed_password)
    db.session.add(user)
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

# Routes will be implemented here 