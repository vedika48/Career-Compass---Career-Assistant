from flask import Blueprint, request, jsonify, current_app
from bson import ObjectId
from datetime import datetime, timezone
import traceback
import logging

bp = Blueprint('chat', __name__, url_prefix='/api/chat')

logger = logging.getLogger(__name__)

# Simple in-memory storage for demo (replace with MongoDB when available)
demo_responses = {
    'job_search': "I can help you find job opportunities! While I work on connecting to our job database, here are some general tips: Update your LinkedIn profile, network with professionals in your field, and check job portals like LinkedIn Jobs, Naukri.com, and Indeed for the latest openings in Indian tech companies.",
    'salary': "I can provide salary insights! For accurate salary information, I need access to our salary database. In the meantime, you can check platforms like Glassdoor, AmbitionBox, and LinkedIn Salary for compensation data specific to your role and location in India.",
    'resume': "I can help with resume optimization! Focus on quantifying your achievements, using action verbs, and tailoring your resume for each job application. When our database is available, I'll be able to provide more personalized feedback.",
    'interview': "I can assist with interview preparation! Practice common technical and behavioral questions. For technical roles, focus on data structures and algorithms. For behavioral interviews, use the STAR method (Situation, Task, Action, Result) to structure your answers.",
    'company_research': "I can help research companies! While I work on connecting to our company database, you can research companies on platforms like Glassdoor, AmbitionBox, and LinkedIn for information about culture, benefits, and work environment.",
    'career_growth': "I can provide career growth advice! Focus on continuous learning, networking, and taking on challenging projects. Consider online courses, certifications, and mentorship opportunities to advance your career in the Indian tech industry.",
    'general': "I'm here to help with your career journey in India! I can assist with job search strategies, resume building, interview preparation, salary research, and career growth planning. What specific area would you like help with today?"
}

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
        
        # Simple intent detection (you can enhance this)
        message_lower = user_message.lower()
        intent = 'general'
        
        if any(word in message_lower for word in ['job', 'career', 'hiring', 'opportunities']):
            intent = 'job_search'
        elif any(word in message_lower for word in ['salary', 'pay', 'compensation']):
            intent = 'salary'
        elif any(word in message_lower for word in ['resume', 'cv']):
            intent = 'resume'
        elif any(word in message_lower for word in ['interview']):
            intent = 'interview'
        elif any(word in message_lower for word in ['company', 'organization']):
            intent = 'company_research'
        elif any(word in message_lower for word in ['growth', 'promotion', 'career']):
            intent = 'career_growth'
        
        response_data = {
            'message': demo_responses.get(intent, demo_responses['general']),
            'intent': intent,
            'context': {
                'user_message': user_message,
                'database_available': current_app.db is not None
            },
            'suggestions': [
                "Find software engineer jobs",
                "Salary negotiation tips", 
                "Resume building help",
                "Interview preparation",
                "Company research"
            ],
            'data': {
                'database_status': 'online' if current_app.db else 'offline'
            },
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
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