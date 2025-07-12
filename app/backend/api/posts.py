from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.post import Post, Comment
from models.user import User
from models.profile import Profile
from models import db
from datetime import datetime
from werkzeug.utils import secure_filename
import os
from config import Config
import json
from typing import Dict, Any, Optional

posts_bp = Blueprint('posts', __name__)

# Simple in-memory cache
_cache: Dict[str, Any] = {
    'categories': None,
    'popular_tags': None,
    'last_updated': None
}

def get_cached_data(key: str, ttl_seconds: int = 300) -> Optional[Any]:
    """Get cached data if it's still valid"""
    if key not in _cache or _cache[key] is None:
        return None
    
    if _cache['last_updated'] is None:
        return None
    
    # Check if cache is still valid (5 minutes TTL)
    if (datetime.utcnow() - _cache['last_updated']).total_seconds() > ttl_seconds:
        return None
    
    return _cache[key]

def set_cached_data(key: str, data: Any) -> None:
    """Set cached data with timestamp"""
    _cache[key] = data
    _cache['last_updated'] = datetime.utcnow()

def invalidate_cache() -> None:
    """Invalidate all cached data"""
    _cache['categories'] = None
    _cache['popular_tags'] = None
    _cache['last_updated'] = None
 
@posts_bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    """Create a new post (supports JSON or multipart/form-data with media)"""
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    content = None
    media_url = None
    file = None
    # Handle both JSON and multipart/form-data
    if request.content_type and request.content_type.startswith('multipart/form-data'):
        content = request.form.get('content')
        file = request.files.get('media')
    else:
        data = request.get_json()
        content = data.get('content') if data else None

    if not content or len(content.strip()) == 0:
        return jsonify({'error': 'Post content is required'}), 400

    # Validate media if present
    if file:
        filename = file.filename
        if not filename:
            return jsonify({'error': 'No media file provided'}), 400
        ext = filename.rsplit('.', 1)[-1].lower()
        allowed = set(['jpg', 'jpeg', 'png', 'mp4'])
        if ext not in allowed:
            return jsonify({'error': 'Invalid media type. Only jpg, jpeg, png, mp4 allowed.'}), 400
        file.seek(0, 2)
        file_length = file.tell()
        file.seek(0)
        if file_length > Config.MAX_CONTENT_LENGTH:
            return jsonify({'error': 'File too large. Max 5MB.'}), 400
        # Save file
        timestamp = int(datetime.utcnow().timestamp())
        random_hex = os.urandom(4).hex()
        safe_name = secure_filename(f"{timestamp}_{random_hex}.{ext}")
        upload_dir = os.path.join(os.path.dirname(__file__), '../uploads')
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, safe_name)
        file.save(file_path)
        media_url = f"/api/uploads/{safe_name}"

    post = Post(
        user_id=user.id,
        content=content.strip(),
        media_url=media_url,
        created_at=datetime.utcnow()
    )

    db.session.add(post)
    db.session.commit()

    # After saving the file and setting media_url:
    if media_url:
        # Ensure full URL is returned
        media_url = request.host_url.rstrip('/') + media_url

    # Get user profile information
    profile = Profile.query.filter_by(user_id=user.id).first()
    
    return jsonify({
        'id': post.id,
        'content': post.content,
        'imageUrl': media_url,
        'user_id': post.user_id,
        'created_at': post.created_at.isoformat(),
        'likes_count': post.likes_count if hasattr(post, 'likes_count') else 0,
        'comments_count': post.comments_count if hasattr(post, 'comments_count') else 0,
        'user': {
            'id': user.id,
            'name': user.name,
            'username': user.username,
            'avatar_url': profile.avatar_url if profile else None,
            'title': profile.title if profile else None,
            'location': profile.location if profile else None
        }
    }), 201

@posts_bp.route('/posts', methods=['GET'])
@jwt_required()
def get_posts():
    """Get all posts with pagination, filtering, and sorting"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '')
    category = request.args.get('category', '')
    visibility = request.args.get('visibility', 'all')
    tags = request.args.get('tags', '')
    sort_by = request.args.get('sort_by', 'created_at')
    sort_order = request.args.get('sort_order', 'desc')
    
    # Build query
    query = Post.query
    
    # Apply search filter
    if search:
        query = query.filter(Post.content.ilike(f'%{search}%'))
    
    # Apply category filter
    if category:
        query = query.filter(Post.category == category)
    
    # Apply visibility filter
    if visibility != 'all':
        is_public = visibility == 'public'
        query = query.filter(Post.is_public == is_public)
    
    # Apply tags filter
    if tags:
        tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
        for tag in tag_list:
            query = query.filter(Post.tags.contains(tag))
    
    # Apply sorting
    if sort_by == 'created_at':
        if sort_order == 'asc':
            query = query.order_by(Post.created_at.asc())
        else:
            query = query.order_by(Post.created_at.desc())
    elif sort_by == 'updated_at':
        if sort_order == 'asc':
            query = query.order_by(Post.updated_at.asc())
        else:
            query = query.order_by(Post.updated_at.desc())
    elif sort_by == 'likes':
        if sort_order == 'asc':
            query = query.order_by(Post.likes_count.asc())
        else:
            query = query.order_by(Post.likes_count.desc())
    elif sort_by == 'comments':
        if sort_order == 'asc':
            query = query.order_by(Post.comments_count.asc())
        else:
            query = query.order_by(Post.comments_count.desc())
    else:
        # Default sorting
        query = query.order_by(Post.created_at.desc())
    
    posts = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    posts_data = []
    for post in posts.items:
        user = User.query.get(post.user_id)
        profile = Profile.query.filter_by(user_id=post.user_id).first() if user else None
        media_url = post.media_url
        if media_url:
            media_url = request.host_url.rstrip('/') + media_url
        posts_data.append({
            'id': post.id,
            'content': post.content,
            'user_id': post.user_id,
            'created_at': post.created_at.isoformat(),
            'likes_count': post.likes_count if hasattr(post, 'likes_count') else 0,
            'comments_count': post.comments_count if hasattr(post, 'comments_count') else 0,
            'imageUrl': media_url,
            'user': {
                'id': user.id,
                'name': user.name,
                'username': user.username,
                'avatar_url': profile.avatar_url if profile else None,
                'title': profile.title if profile else None,
                'location': profile.location if profile else None
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
    profile = Profile.query.filter_by(user_id=post.user_id).first() if user else None
    media_url = post.media_url
    if media_url:
        media_url = request.host_url.rstrip('/') + media_url
    return jsonify({
        'id': post.id,
        'content': post.content,
        'user_id': post.user_id,
        'created_at': post.created_at.isoformat(),
        'likes_count': post.likes_count if hasattr(post, 'likes_count') else 0,
        'comments_count': post.comments_count if hasattr(post, 'comments_count') else 0,
        'imageUrl': media_url,
        'user': {
            'id': user.id,
            'name': user.name,
            'username': user.username,
            'avatar_url': profile.avatar_url if profile else None,
            'title': profile.title if profile else None,
            'location': profile.location if profile else None
        } if user else None
    }), 200 

@posts_bp.route('/api/uploads/<filename>')
def uploaded_file(filename):
    # Use absolute path for uploads directory
    upload_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'uploads'))
    from flask import make_response
    response = make_response(send_from_directory(upload_dir, filename))
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    return response

@posts_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.asc()).all()
    comments_data = []
    for comment in comments:
        user = User.query.get(comment.user_id)
        comments_data.append({
            'id': comment.id,
            'content': comment.content,
            'created_at': comment.created_at.isoformat(),
            'user': {
                'id': user.id,
                'name': user.name,
                'username': user.username
            } if user else None
        })
    return jsonify({'comments': comments_data}), 200

@posts_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    data = request.get_json()
    content = data.get('content')
    if not content or not content.strip():
        return jsonify({'error': 'Comment content is required'}), 400
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    comment = Comment(post_id=post_id, user_id=user.id, content=content.strip())
    db.session.add(comment)
    db.session.commit()
    return jsonify({
        'id': comment.id,
        'content': comment.content,
        'created_at': comment.created_at.isoformat(),
        'user': {
            'id': user.id,
            'name': user.name,
            'username': user.username
        }
    }), 201 

@posts_bp.route('/posts/<int:post_id>/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
def edit_comment(post_id, comment_id):
    comment = Comment.query.filter_by(id=comment_id, post_id=post_id).first()
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if not user or user.id != comment.user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    content = data.get('content')
    if not content or not content.strip():
        return jsonify({'error': 'Comment content is required'}), 400
    comment.content = content.strip()
    db.session.commit()
    return jsonify({'message': 'Comment updated', 'id': comment.id, 'content': comment.content}), 200

@posts_bp.route('/posts/<int:post_id>/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(post_id, comment_id):
    comment = Comment.query.filter_by(id=comment_id, post_id=post_id).first()
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if not user or user.id != comment.user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    db.session.delete(comment)
    db.session.commit()
    return jsonify({'message': 'Comment deleted', 'id': comment.id}), 200 