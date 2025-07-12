from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.post import Post, Comment
from models.user import User
from models import db
from datetime import datetime
from werkzeug.utils import secure_filename
import os
from config import Config

posts_bp = Blueprint('posts', __name__)
 
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
            'username': user.username
        } if user else None
    }), 200 

@posts_bp.route('/uploads/<filename>')
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