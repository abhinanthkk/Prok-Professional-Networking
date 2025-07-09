from flask import Blueprint, request, jsonify, send_from_directory
from models.profile import Profile, Skill, Experience, Education, db
from models.user import User
import os
import secrets
from werkzeug.utils import secure_filename
from PIL import Image
from config import Config
from flask_jwt_extended import jwt_required, get_jwt_identity
import time
import datetime

profile_bp = Blueprint('profile', __name__)
 
# Helper: validate profile data
def validate_profile_data(data):
    errors = {}
    if 'bio' in data and data['bio'] and len(data['bio']) > 1000:
        errors['bio'] = 'Bio must be at most 1000 characters.'
    for field in ['location', 'title']:
        if field in data and data[field] and len(data[field]) > 100:
            errors[field] = f'{field.capitalize()} must be at most 100 characters.'
    for url_field in ['avatar_url', 'website', 'linkedin', 'github', 'twitter']:
        if url_field in data and data[url_field]:
            if not (data[url_field].startswith('http://') or data[url_field].startswith('https://') or data[url_field].startswith('/')):
                errors[url_field] = f'{url_field.replace("_", " ").capitalize()} must be a valid URL.'
    if 'phone' in data and data['phone'] and len(data['phone']) > 20:
        errors['phone'] = 'Phone must be at most 20 characters.'
    # Do NOT require skills, experience, or education to be non-empty
    # For profile updates, allow empty strings for name, email, username
    # Only validate if they are provided and not empty
    for required in ['name', 'email', 'username']:
        if required in data and data[required] is not None and data[required].strip() == '':
            errors[required] = f'{required.capitalize()} cannot be empty.'
    return errors

# Helper: serialize skill, experience, education

def serialize_skill(skill):
    return {"id": skill.id, "name": skill.name}

def serialize_experience(exp):
    return {
        "id": exp.id,
        "title": exp.title,
        "company": exp.company,
        "start_date": exp.start_date.isoformat() if exp.start_date else None,
        "end_date": exp.end_date.isoformat() if exp.end_date else None,
        "description": exp.description,
        "current": exp.current
    }

def serialize_education(edu):
    return {
        "id": edu.id,
        "school": edu.school,
        "degree": edu.degree,
        "field": edu.field,
        "start_date": edu.start_date.isoformat() if edu.start_date else None,
        "end_date": edu.end_date.isoformat() if edu.end_date else None,
        "current": edu.current
    }

def get_user_id_from_email(email):
    user = User.query.filter_by(email=email).first()
    return user.id if user else None

def get_email_from_user_id(user_id):
    user = User.query.filter_by(id=user_id).first()
    return user.email if user else None

# Get profile by user_id
@profile_bp.route('/profile/<int:user_id>', methods=['GET'])
def get_profile(user_id):
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    return jsonify({
        'id': profile.id,
        'user_id': profile.user_id,
        'bio': profile.bio,
        'location': profile.location,
        'title': profile.title,
        'avatar_url': profile.avatar_url,
        'cover_url': profile.cover_url,
        'website': profile.website,
        'linkedin': profile.linkedin,
        'github': profile.github,
        'twitter': profile.twitter,
        'phone': profile.phone,
        'created_at': profile.created_at.isoformat() if profile.created_at else None
    })

# Create or update profile by user_id
@profile_bp.route('/profile/<int:user_id>', methods=['POST', 'PUT'])
def create_or_update_profile(user_id):
    data = request.get_json()
    errors = validate_profile_data(data)
    if errors:
        return jsonify({'errors': errors}), 400
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        # Check user exists
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        profile = Profile(user_id=user_id)
        db.session.add(profile)
    for field in ['bio', 'location', 'title', 'avatar_url', 'cover_url', 'website', 'linkedin', 'github', 'twitter', 'phone']:
        if field in data:
            setattr(profile, field, data[field])
    db.session.commit()
    return jsonify({'message': 'Profile saved successfully.'})

# Delete profile by user_id
@profile_bp.route('/profile/<int:user_id>', methods=['DELETE'])
def delete_profile(user_id):
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    db.session.delete(profile)
    db.session.commit()
    return jsonify({'message': 'Profile deleted.'})

# GET /api/profile - Get current user's profile (with skills, experience, education)
@profile_bp.route('/api/profile', methods=['GET'])
@jwt_required()
def get_current_profile():
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user_id = user.id
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    skills = Skill.query.filter_by(user_id=user_id).all()
    experience = Experience.query.filter_by(user_id=user_id).all()
    education = Education.query.filter_by(user_id=user_id).all()
    return jsonify({
        'id': profile.id,
        'user_id': profile.user_id,
        'bio': profile.bio,
        'location': profile.location,
        'title': profile.title,
        'avatar_url': profile.avatar_url,
        'cover_url': profile.cover_url,
        'website': profile.website,
        'linkedin': profile.linkedin,
        'github': profile.github,
        'twitter': profile.twitter,
        'phone': profile.phone,
        'created_at': profile.created_at.isoformat() if profile.created_at else None,
        'name': user.name,
        'username': user.username,
        'email': user.email,
        'skills': [serialize_skill(s) for s in skills],
        'experience': [serialize_experience(e) for e in experience],
        'education': [serialize_education(ed) for ed in education]
    }), 200

# PUT /api/profile - Update current user's profile (with skills, experience, education)
@profile_bp.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_current_profile():
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user_id = user.id
    data = request.get_json()
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    print('Validating profile data:', data)
    errors = validate_profile_data(data)
    if errors:
        print('Validation errors:', errors)
        return jsonify({'errors': errors}), 400
    print('Full incoming profile update payload:', data)
    print('Incoming skills:', data['skills'])
    print('Incoming experience:', data['experience'])
    print('Incoming education:', data['education'])
    
    # Update basic profile fields
    if 'bio' in data:
        profile.bio = data['bio']
    if 'location' in data:
        profile.location = data['location']
    if 'title' in data:
        profile.title = data['title']
    if 'website' in data:
        profile.website = data['website']
    if 'linkedin' in data:
        profile.linkedin = data['linkedin']
    if 'github' in data:
        profile.github = data['github']
    if 'twitter' in data:
        profile.twitter = data['twitter']
    if 'cover_url' in data:
        profile.cover_url = data['cover_url']
    
    # Update user fields if provided
    if 'name' in data:
        user.name = data['name']
    if 'username' in data:
        user.username = data['username']
    if 'email' in data:
        user.email = data['email']
    
    # Helper function for parsing dates
    def parse_date(val):
        if not val:
            return None
        if isinstance(val, str):
            try:
                return datetime.datetime.strptime(val, '%Y-%m-%d').date()
            except Exception:
                return None
        return val
    
    # Save as before
    Skill.query.filter_by(user_id=user_id).delete()
    for skill in data['skills']:
        if isinstance(skill, dict):
            name = skill.get('name')
        else:
            name = skill
        if name:
            db.session.add(Skill(user_id=user_id, name=name))
    Experience.query.filter_by(user_id=user_id).delete()
    for exp in data['experience']:
        db.session.add(Experience(
            user_id=user_id,
            title=exp.get('title', ''),
            company=exp.get('company', ''),
            start_date=parse_date(exp.get('start_date')),
            end_date=parse_date(exp.get('end_date')),
            description=exp.get('description', ''),
            current=bool(exp.get('current', False))
        ))
    Education.query.filter_by(user_id=user_id).delete()
    for edu in data['education']:
        db.session.add(Education(
            user_id=user_id,
            school=edu.get('school', ''),
            degree=edu.get('degree', ''),
            field=edu.get('field', ''),
            start_date=parse_date(edu.get('start_date')),
            end_date=parse_date(edu.get('end_date')),
            current=bool(edu.get('current', False))
        ))
    try:
        db.session.commit()
        # Re-fetch the latest data after saving
        profile = Profile.query.filter_by(user_id=user_id).first()
        user = User.query.filter_by(id=user_id).first()
        skills = Skill.query.filter_by(user_id=user_id).all()
        experience = Experience.query.filter_by(user_id=user_id).all()
        education = Education.query.filter_by(user_id=user_id).all()
        skills_serialized = [serialize_skill(s) for s in skills]
        experience_serialized = [serialize_experience(e) for e in experience]
        education_serialized = [serialize_education(ed) for ed in education]
        response = {
            'id': profile.id,
            'user_id': profile.user_id,
            'bio': profile.bio,
            'location': profile.location,
            'title': profile.title,
            'avatar_url': profile.avatar_url,
            'cover_url': profile.cover_url,
            'website': profile.website,
            'linkedin': profile.linkedin,
            'github': profile.github,
            'twitter': profile.twitter,
            'phone': profile.phone,
            'created_at': profile.created_at.isoformat() if profile.created_at else None,
            'name': user.name,
            'username': user.username,
            'email': user.email,
            'skills': skills_serialized,
            'experience': experience_serialized,
            'education': education_serialized
        }
    except Exception as e:
        print('Critical error in profile PUT response:', e)
        response = {
            'id': profile.id,
            'user_id': profile.user_id,
            'bio': profile.bio,
            'location': profile.location,
            'title': profile.title,
            'avatar_url': profile.avatar_url,
            'cover_url': profile.cover_url,
            'website': profile.website,
            'linkedin': profile.linkedin,
            'github': profile.github,
            'twitter': profile.twitter,
            'phone': profile.phone,
            'created_at': profile.created_at.isoformat() if profile.created_at else None,
            'name': user.name,
            'username': user.username,
            'email': user.email,
            'skills': [],
            'experience': [],
            'education': [],
            'error': 'Backend error: ' + str(e)
        }
    return jsonify(response), 200

def allowed_image(filename):
    if not filename or '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in Config.ALLOWED_IMAGE_EXTENSIONS

def process_image(image, base_path, sizes=None, convert_format='webp'):
    """
    Save original, resize, compress, and generate thumbnail. Returns dict of paths.
    """
    if sizes is None:
        sizes = {'main': (400, 400), 'thumb': (100, 100)}
    img = Image.open(image)
    out_paths = {}
    for key, size in sizes.items():
        img_copy = img.copy()
        img_copy.thumbnail(size)
        out_name = f"{base_path}_{key}.{convert_format}"
        img_copy.save(out_name, convert_format.upper(), quality=85, optimize=True)
        out_paths[key] = out_name
    return out_paths

# POST /api/profile/image - Upload profile image for current user
@profile_bp.route('/api/profile/image', methods=['POST'])
@jwt_required()
def upload_profile_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part in request'}), 400
    file = request.files['image']
    if not file or not getattr(file, 'filename', None) or file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if not allowed_image(file.filename):
        return jsonify({'error': 'Invalid file type. Only jpg and png allowed.'}), 400
    file.seek(0, 2)
    file_length = file.tell()
    file.seek(0)
    if file_length > Config.MAX_CONTENT_LENGTH:
        return jsonify({'error': 'File too large. Max 5MB.'}), 400
    ext = file.filename.rsplit('.', 1)[1].lower()
    timestamp = int(time.time())
    random_hex = secrets.token_hex(4)
    filename = secure_filename(f"{timestamp}_{random_hex}.{ext}")
    upload_dir = Config.UPLOAD_FOLDER
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)
    file.save(file_path)
    try:
        base_path = os.path.splitext(file_path)[0]
        processed = process_image(file_path, base_path)
        os.remove(file_path)
        main_img_path = processed['main']
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({'error': f'Image processing failed: {str(e)}'}), 400
    email = get_jwt_identity()
    user_id = get_user_id_from_email(email)
    if not user_id:
        return jsonify({'error': 'User not found'}), 404
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    profile.avatar_url = f"/api/profile_images/{os.path.basename(main_img_path)}"
    db.session.commit()
    return jsonify({'image_url': profile.avatar_url}), 200

# Secure file serving for profile images (public access)
@profile_bp.route('/api/profile_images/<filename>', methods=['GET'])
def serve_profile_image(filename):
    return send_from_directory(Config.UPLOAD_FOLDER, filename)

@profile_bp.route('/api/profile/cover', methods=['POST'])
@jwt_required()
def upload_cover_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part in request'}), 400
    file = request.files['image']
    if not file or not getattr(file, 'filename', None) or file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if not allowed_image(file.filename):
        return jsonify({'error': 'Invalid file type. Only jpg and png allowed.'}), 400
    file.seek(0, 2)
    file_length = file.tell()
    file.seek(0)
    if file_length > Config.MAX_CONTENT_LENGTH:
        return jsonify({'error': 'File too large. Max 5MB.'}), 400
    ext = file.filename.rsplit('.', 1)[1].lower()
    timestamp = int(time.time())
    random_hex = secrets.token_hex(4)
    filename = secure_filename(f"cover_{timestamp}_{random_hex}.{ext}")
    upload_dir = Config.UPLOAD_FOLDER
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)
    file.save(file_path)
    try:
        base_path = os.path.splitext(file_path)[0]
        processed = process_image(file_path, base_path, sizes={'main': (1200, 300), 'thumb': (400, 100)})
        os.remove(file_path)
        main_img_path = processed['main']
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({'error': f'Image processing failed: {str(e)}'}), 400
    email = get_jwt_identity()
    user_id = get_user_id_from_email(email)
    if not user_id:
        return jsonify({'error': 'User not found'}), 404
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    profile.cover_url = f"/api/profile_images/{os.path.basename(main_img_path)}"
    db.session.commit()
    return jsonify({'cover_url': profile.cover_url}), 200

@profile_bp.route('/api/profile/cover', methods=['DELETE'])
@jwt_required()
def remove_cover_image():
    email = get_jwt_identity()
    user_id = get_user_id_from_email(email)
    if not user_id:
        return jsonify({'error': 'User not found'}), 404
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    profile.cover_url = None
    db.session.commit()
    return jsonify({'message': 'Cover image removed.'}), 200

# Routes will be implemented here 