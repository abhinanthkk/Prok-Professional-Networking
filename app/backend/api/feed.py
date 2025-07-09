from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.post import Post
from models.user import User
from models import db

feed_bp = Blueprint('feed', __name__)

@feed_bp.route('/feed', methods=['GET'])
@jwt_required()
def get_feed():
    """Get personalized feed for the current user"""
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # For now, return all posts. In a full implementation, this would be filtered
    # based on user connections, interests, etc.
    posts = Post.query.order_by(Post.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    posts_data = []
    for post in posts.items:
        post_user = User.query.get(post.user_id)
        posts_data.append({
            'id': post.id,
            'content': post.content,
            'user_id': post.user_id,
            'created_at': post.created_at.isoformat(),
            'likes_count': post.likes_count,
            'comments_count': post.comments_count,
            'user': {
                'id': post_user.id,
                'name': post_user.name,
                'username': post_user.username
            } if post_user else None
        })
    
    return jsonify({
        'posts': posts_data,
        'total': posts.total,
        'pages': posts.pages,
        'current_page': page,
        'per_page': per_page
    }), 200

@feed_bp.route('/feed/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_feed(user_id):
    """Get posts from a specific user"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Check if user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    posts = Post.query.filter_by(user_id=user_id).order_by(Post.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    posts_data = []
    for post in posts.items:
        posts_data.append({
            'id': post.id,
            'content': post.content,
            'user_id': post.user_id,
            'created_at': post.created_at.isoformat(),
            'likes_count': post.likes_count,
            'comments_count': post.comments_count,
            'user': {
                'id': user.id,
                'name': user.name,
                'username': user.username
            }
        })
    
    return jsonify({
        'posts': posts_data,
        'total': posts.total,
        'pages': posts.pages,
        'current_page': page,
        'per_page': per_page,
        'user': {
            'id': user.id,
            'name': user.name,
            'username': user.username
        }
    }), 200 