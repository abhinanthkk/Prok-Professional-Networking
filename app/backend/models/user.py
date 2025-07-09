from datetime import datetime
from . import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # New numeric PK
    email = db.Column(db.String(120), unique=True, nullable=False)    # No longer PK
    username = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, email, username, name, password_hash):
        self.email = email
        self.username = username
        self.name = name
        self.password_hash = password_hash

    def __repr__(self):
        return f'<User {self.email}>'
