from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.job import Job, JobApplication
from models.user import User
from models import db

jobs_bp = Blueprint('jobs', __name__)
 
@jobs_bp.route('/jobs', methods=['GET'])
@jwt_required()
def get_jobs():
    """Get all active job listings"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    jobs = Job.query.filter_by(is_active=True).order_by(Job.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    jobs_data = []
    for job in jobs.items:
        posted_by_user = User.query.get(job.posted_by)
        jobs_data.append({
            'id': job.id,
            'title': job.title,
            'company': job.company,
            'location': job.location,
            'description': job.description,
            'requirements': job.requirements,
            'salary_range': job.salary_range,
            'job_type': job.job_type,
            'created_at': job.created_at.isoformat(),
            'posted_by': {
                'id': posted_by_user.id,
                'name': posted_by_user.name,
                'username': posted_by_user.username
            } if posted_by_user else None
        })
    
    return jsonify({
        'jobs': jobs_data,
        'total': jobs.total,
        'pages': jobs.pages,
        'current_page': page,
        'per_page': per_page
    }), 200

@jobs_bp.route('/jobs/<int:job_id>', methods=['GET'])
@jwt_required()
def get_job(job_id):
    """Get a specific job listing"""
    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    posted_by_user = User.query.get(job.posted_by)
    
    return jsonify({
        'id': job.id,
        'title': job.title,
        'company': job.company,
        'location': job.location,
        'description': job.description,
        'requirements': job.requirements,
        'salary_range': job.salary_range,
        'job_type': job.job_type,
        'created_at': job.created_at.isoformat(),
        'posted_by': {
            'id': posted_by_user.id,
            'name': posted_by_user.name,
            'username': posted_by_user.username
        } if posted_by_user else None
    }), 200

@jobs_bp.route('/jobs/<int:job_id>/apply', methods=['POST'])
@jwt_required()
def apply_for_job(job_id):
    """Apply for a job"""
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    if not job.is_active:
        return jsonify({'error': 'This job is no longer active'}), 400
    
    # Check if user already applied
    existing_application = JobApplication.query.filter_by(
        job_id=job_id, user_id=user.id
    ).first()
    
    if existing_application:
        return jsonify({'error': 'You have already applied for this job'}), 400
    
    data = request.get_json()
    cover_letter = data.get('cover_letter') if data else None
    
    application = JobApplication(
        job_id=job_id,
        user_id=user.id,
        cover_letter=cover_letter
    )
    
    db.session.add(application)
    db.session.commit()
    
    return jsonify({
        'message': 'Application submitted successfully',
        'application_id': application.id
    }), 201

@jobs_bp.route('/jobs', methods=['POST'])
@jwt_required()
def create_job():
    """Create a new job listing"""
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['title', 'company', 'description']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    job = Job(
        title=data['title'],
        company=data['company'],
        description=data['description'],
        posted_by=user.id,
        location=data.get('location'),
        requirements=data.get('requirements'),
        salary_range=data.get('salary_range'),
        job_type=data.get('job_type')
    )
    
    db.session.add(job)
    db.session.commit()
    
    return jsonify({
        'message': 'Job created successfully',
        'job_id': job.id
    }), 201 