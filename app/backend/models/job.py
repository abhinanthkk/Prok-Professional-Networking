from . import db
from datetime import datetime

class Job(db.Model):
    __tablename__ = 'jobs'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(200))
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text)
    salary_range = db.Column(db.String(100))
    job_type = db.Column(db.String(50))  # full-time, part-time, contract, etc.
    posted_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def __init__(self, title, company, description, posted_by, location=None, requirements=None, salary_range=None, job_type=None):
        self.title = title
        self.company = company
        self.description = description
        self.posted_by = posted_by
        self.location = location
        self.requirements = requirements
        self.salary_range = salary_range
        self.job_type = job_type
    
    def __repr__(self):
        return f'<Job {self.id}: {self.title} at {self.company}>'

class JobApplication(db.Model):
    __tablename__ = 'job_applications'
    
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(50), default='applied')  # applied, reviewed, interviewed, offered, rejected
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    cover_letter = db.Column(db.Text)
    
    def __init__(self, job_id, user_id, cover_letter=None):
        self.job_id = job_id
        self.user_id = user_id
        self.cover_letter = cover_letter
    
    def __repr__(self):
        return f'<JobApplication {self.id}: User {self.user_id} for Job {self.job_id}>'
