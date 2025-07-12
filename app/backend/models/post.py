from . import db
from datetime import datetime

class Post(db.Model):
    __tablename__ = 'posts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    media_url = db.Column(db.String(255), nullable=True)
    
    # For now, we'll add these as columns. In a full implementation, 
    # these would be calculated from related tables
    likes_count = db.Column(db.Integer, default=0)
    comments_count = db.Column(db.Integer, default=0)
    
    def __init__(self, user_id, content, media_url=None, created_at=None, updated_at=None):
        self.user_id = user_id
        self.content = content
        self.media_url = media_url
        if created_at:
            self.created_at = created_at
        if updated_at:
            self.updated_at = updated_at
    
    def __repr__(self):
        return f'<Post {self.id}>'

class Comment(db.Model):
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, post_id, user_id, content, created_at=None):
        self.post_id = post_id
        self.user_id = user_id
        self.content = content
        if created_at:
            self.created_at = created_at

    def __repr__(self):
        return f'<Comment {self.id}>'
