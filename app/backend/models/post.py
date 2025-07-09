from . import db
from datetime import datetime

class Post(db.Model):
    __tablename__ = 'posts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # For now, we'll add these as columns. In a full implementation, 
    # these would be calculated from related tables
    likes_count = db.Column(db.Integer, default=0)
    comments_count = db.Column(db.Integer, default=0)
    
    def __init__(self, user_id, content, created_at=None):
        self.user_id = user_id
        self.content = content
        if created_at:
            self.created_at = created_at
    
    def __repr__(self):
        return f'<Post {self.id}>'
