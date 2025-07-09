from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.post import Post
from models.user import User
from models import db
from datetime import datetime

posts_bp = Blueprint('posts', __name__)

@posts_bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    """Create a new post"""
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    content = data.get('content')
    
    if not content or len(content.strip()) == 0:
        return jsonify({'error': 'Post content is required'}), 400
    
    if len(content) > 1000:
        return jsonify({'error': 'Post content must be less than 1000 characters'}), 400
    
    post = Post(
        user_id=user.id,
        content=content.strip(),
        created_at=datetime.utcnow()
    )
    
    db.session.add(post)
    db.session.commit()
    
    return jsonify({
        'id': post.id,
        'content': post.content,
        'user_id': post.user_id,
        'created_at': post.created_at.isoformat(),
        'likes_count': 0,
        'comments_count': 0,
        'user': {
            'id': user.id,
            'name': user.name,
            'username': user.username
        }
    }), 201

@posts_bp.route('/posts', methods=['GET'])
@jwt_required()
def get_posts():
    """Get all posts with pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    posts = Post.query.order_by(Post.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    posts_data = []
    for post in posts.items:
        user = User.query.get(post.user_id)
        posts_data.append({
            'id': post.id,
            'content': post.content,
            'user_id': post.user_id,
            'created_at': post.created_at.isoformat(),
            'likes_count': post.likes_count if hasattr(post, 'likes_count') else 0,
            'comments_count': post.comments_count if hasattr(post, 'comments_count') else 0,
            'user': {
                'id': user.id,
                'name': user.name,
                'username': user.username
            } if user else None
        })
    
    return jsonify({
        'posts': posts_data,
        'total': posts.total,
        'pages': posts.pages,
        'current_page': page,
        'per_page': per_page
    }), 200

@posts_bp.route('/posts/<int:post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    """Like or unlike a post"""
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    # For now, just increment likes count
    # In a full implementation, you'd have a separate likes table
    if not hasattr(post, 'likes_count'):
        post.likes_count = 0
    post.likes_count += 1
    
    db.session.commit()
    
    return jsonify({
        'message': 'Post liked successfully',
        'likes_count': post.likes_count
    }), 200

@posts_bp.route('/posts/<int:post_id>', methods=['GET'])
@jwt_required()
def get_post(post_id):
    """Get a specific post"""
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    user = User.query.get(post.user_id)
    
    return jsonify({
        'id': post.id,
        'content': post.content,
        'user_id': post.user_id,
        'created_at': post.created_at.isoformat(),
        'likes_count': post.likes_count if hasattr(post, 'likes_count') else 0,
        'comments_count': post.comments_count if hasattr(post, 'comments_count') else 0,
        'user': {
            'id': user.id,
            'name': user.name,
            'username': user.username
        } if user else None
    }), 200 