from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.message import Conversation, Message
from models.user import User
from models import db
from datetime import datetime

messaging_bp = Blueprint('messaging', __name__)

@messaging_bp.route('/messages/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    """Get all conversations for the current user"""
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get conversations where user is either user1 or user2
    conversations = Conversation.query.filter(
        db.or_(Conversation.user1_id == user.id, Conversation.user2_id == user.id)
    ).order_by(Conversation.updated_at.desc()).all()
    
    conversations_data = []
    for conv in conversations:
        # Get the other user in the conversation
        other_user_id = conv.user2_id if conv.user1_id == user.id else conv.user1_id
        other_user = User.query.get(other_user_id)
        
        # Get the latest message
        latest_message = Message.query.filter_by(conversation_id=conv.id).order_by(Message.created_at.desc()).first()
        
        conversations_data.append({
            'id': conv.id,
            'other_user': {
                'id': other_user.id,
                'name': other_user.name,
                'username': other_user.username
            } if other_user else None,
            'latest_message': {
                'content': latest_message.content,
                'created_at': latest_message.created_at.isoformat(),
                'sender_id': latest_message.sender_id
            } if latest_message else None,
            'created_at': conv.created_at.isoformat(),
            'updated_at': conv.updated_at.isoformat()
        })
    
    return jsonify({'conversations': conversations_data}), 200

@messaging_bp.route('/messages/<int:conversation_id>', methods=['GET'])
@jwt_required()
def get_messages(conversation_id):
    """Get all messages in a conversation"""
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    conversation = Conversation.query.get(conversation_id)
    if not conversation:
        return jsonify({'error': 'Conversation not found'}), 404
    
    # Check if user is part of this conversation
    if conversation.user1_id != user.id and conversation.user2_id != user.id:
        return jsonify({'error': 'Access denied'}), 403
    
    messages = Message.query.filter_by(conversation_id=conversation_id).order_by(Message.created_at.asc()).all()
    
    messages_data = []
    for msg in messages:
        sender = User.query.get(msg.sender_id)
        messages_data.append({
            'id': msg.id,
            'content': msg.content,
            'sender_id': msg.sender_id,
            'sender': {
                'id': sender.id,
                'name': sender.name,
                'username': sender.username
            } if sender else None,
            'created_at': msg.created_at.isoformat(),
            'is_read': msg.is_read
        })
    
    return jsonify({'messages': messages_data}), 200

@messaging_bp.route('/messages/<int:conversation_id>', methods=['POST'])
@jwt_required()
def send_message(conversation_id):
    """Send a message in a conversation"""
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    conversation = Conversation.query.get(conversation_id)
    if not conversation:
        return jsonify({'error': 'Conversation not found'}), 404
    
    # Check if user is part of this conversation
    if conversation.user1_id != user.id and conversation.user2_id != user.id:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    content = data.get('content')
    
    if not content or len(content.strip()) == 0:
        return jsonify({'error': 'Message content is required'}), 400
    
    if len(content) > 1000:
        return jsonify({'error': 'Message content must be less than 1000 characters'}), 400
    
    message = Message(
        conversation_id=conversation_id,
        sender_id=user.id,
        content=content.strip()
    )
    
    db.session.add(message)
    
    # Update conversation's updated_at timestamp
    conversation.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'id': message.id,
        'content': message.content,
        'sender_id': message.sender_id,
        'created_at': message.created_at.isoformat(),
        'is_read': message.is_read
    }), 201

@messaging_bp.route('/messages/conversations', methods=['POST'])
@jwt_required()
def create_conversation():
    """Create a new conversation with another user"""
    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    other_user_id = data.get('user_id')
    
    if not other_user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    other_user = User.query.get(other_user_id)
    if not other_user:
        return jsonify({'error': 'User not found'}), 404
    
    if other_user.id == user.id:
        return jsonify({'error': 'Cannot create conversation with yourself'}), 400
    
    # Check if conversation already exists
    existing_conversation = Conversation.query.filter(
        db.or_(
            db.and_(Conversation.user1_id == user.id, Conversation.user2_id == other_user.id),
            db.and_(Conversation.user1_id == other_user.id, Conversation.user2_id == user.id)
        )
    ).first()
    
    if existing_conversation:
        return jsonify({
            'message': 'Conversation already exists',
            'conversation_id': existing_conversation.id
        }), 200
    
    conversation = Conversation(
        user1_id=user.id,
        user2_id=other_user.id
    )
    
    db.session.add(conversation)
    db.session.commit()
    
    return jsonify({
        'message': 'Conversation created successfully',
        'conversation_id': conversation.id
    }), 201 