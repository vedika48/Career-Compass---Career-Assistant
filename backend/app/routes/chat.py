from flask import Blueprint, request, jsonify, current_app
from bson import ObjectId
from datetime import datetime, timezone
import traceback
import logging
from app.services.chat_service import ChatService

bp = Blueprint('chat', __name__, url_prefix='/api/chat')

logger = logging.getLogger(__name__)

# Initialize ML-powered ChatService
# Instantiated globally to avoid reloading models on every request
chat_service_instance = None

@bp.route('/message', methods=['POST'])
def send_message():
    """Handle chat messages from the frontend - works without MongoDB"""
    try:
        logger.info("📨 Received chat message request")
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400
            
        user_message = data.get('message', '')
        user_id = data.get('user_id', 'anonymous')
        
        logger.info(f"📝 Processing message: {user_message}")
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Instantiate service lazily if not done yet
        global chat_service_instance
        if chat_service_instance is None:
            chat_service_instance = ChatService()
            
        # Use ML-powered ChatService for intent detection and response generation
        response_data = chat_service_instance.process_message(
            user_message, 
            user_id=user_id if user_id != 'anonymous' else None
        )
        
        # Preserve context flags for frontend compatibility
        if 'context' not in response_data:
            response_data['context'] = {}
        response_data['context']['user_message'] = user_message
        response_data['context']['database_available'] = current_app.db is not None
        
        if 'data' not in response_data:
            response_data['data'] = {}
        response_data['data']['database_status'] = 'online' if current_app.db else 'offline'
        
        return jsonify({
            'response': response_data,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Chat Error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@bp.route('/test', methods=['GET'])
def test_chat():
    """Test endpoint to verify chat is working"""
    return jsonify({
        'message': 'Chat service is working!',
        'database_status': 'connected' if current_app.db else 'disconnected',
        'timestamp': datetime.now(timezone.utc).isoformat()
    })

@bp.route('/suggestions', methods=['GET'])
def get_suggestions():
    """Get suggested queries"""
    suggestions = [
        "Find software engineer jobs in Bangalore",
        "How to prepare for a technical interview",
        "Companies with good maternity leave policies in India", 
        "Salary negotiation tips for women in tech",
        "Remote work opportunities for Indian companies"
    ]
    return jsonify({'suggestions': suggestions})