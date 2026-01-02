from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from bson import ObjectId
import datetime

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def get_current_timestamp():
    return datetime.datetime.utcnow()

@bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        print("📨 Received registration data:", data)  # Debug log
        
        # Validate required fields - match frontend field names
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                print(f"❌ Missing required field: {field}")
                return jsonify({'error': f'{field} is required'}), 400
        
        if current_app.db is None:
            return jsonify({'error': 'Database not available'}), 500
            
        db = current_app.db
        users_collection = db.users
        
        # Check if user already exists
        if users_collection.find_one({'email': data['email']}):
            return jsonify({'error': 'User already exists with this email'}), 400
        
        # Create new user - combine first and last name
        user_data = {
            'email': data['email'],
            'name': f"{data['first_name']} {data['last_name']}",
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'password_hash': generate_password_hash(data['password']),
            'phone': data.get('phone', ''),
            'location': data.get('location', ''),
            'experience_years': data.get('experience_years', 0),
            'skills': data.get('skills', []),
            'current_role': data.get('current_role', ''),
            'target_role': data.get('target_role', ''),
            'salary_expectation': data.get('salary_expectation', 0),
            'created_at': get_current_timestamp(),
            'updated_at': get_current_timestamp()
        }
        
        print("💾 Attempting to save user:", user_data)  # Debug log
        
        # Insert user into MongoDB
        result = users_collection.insert_one(user_data)
        user_id = str(result.inserted_id)
        
        print("✅ User saved successfully with ID:", user_id)  # Debug log
        
        # Generate access token
        access_token = create_access_token(identity=user_id)
        
        response_data = {
            'message': 'User registered successfully',
            'token': access_token,
            'user': {
                'id': user_id,
                'email': user_data['email'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'name': user_data['name'],
                'phone': user_data['phone'],
                'location': user_data['location'],
                'current_role': user_data['current_role'],
                'experience_years': user_data['experience_years'],
                'skills': user_data['skills']
            }
        }
        
        print("📤 Sending response:", response_data)  # Debug log
        return jsonify(response_data)
        
    except Exception as e:
        print("❌ Registration error:", str(e))  # Debug log
        return jsonify({'error': str(e)}), 500

@bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        email = data.get('email', '')
        password = data.get('password', '')
        
        print("📨 Received login data:", {'email': email})  # Debug log
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        if current_app.db is None:
            return jsonify({'error': 'Database not available'}), 500
            
        db = current_app.db
        users_collection = db.users
        
        # Find user
        user = users_collection.find_one({'email': email})
        
        if not user:
            print("❌ User not found:", email)
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not check_password_hash(user['password_hash'], password):
            print("❌ Invalid password for user:", email)
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate access token
        access_token = create_access_token(identity=str(user['_id']))
        
        response_data = {
            'token': access_token,
            'user': {
                'id': str(user['_id']),
                'email': user['email'],
                'first_name': user.get('first_name', ''),
                'last_name': user.get('last_name', ''),
                'name': user.get('name', ''),
                'phone': user.get('phone', ''),
                'location': user.get('location', ''),
                'current_role': user.get('current_role', ''),
                'experience_years': user.get('experience_years', 0),
                'skills': user.get('skills', [])
            }
        }
        
        print("✅ Login successful for user:", email)
        return jsonify(response_data)
        
    except Exception as e:
        print("❌ Login error:", str(e))
        return jsonify({'error': str(e)}), 500

@bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get user profile"""
    try:
        user_id = get_jwt_identity()
        print("📨 Getting profile for user:", user_id)
        
        if current_app.db is None:
            return jsonify({'error': 'Database not available'}), 500
            
        db = current_app.db
        users_collection = db.users
        
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': str(user['_id']),
                'email': user['email'],
                'first_name': user.get('first_name', ''),
                'last_name': user.get('last_name', ''),
                'name': user.get('name', ''),
                'phone': user.get('phone', ''),
                'location': user.get('location', ''),
                'experience_years': user.get('experience_years', 0),
                'skills': user.get('skills', []),
                'current_role': user.get('current_role', ''),
                'target_role': user.get('target_role', ''),
                'salary_expectation': user.get('salary_expectation', 0)
            }
        })
        
    except Exception as e:
        print("❌ Get profile error:", str(e))
        return jsonify({'error': str(e)}), 500

@bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        print("📨 Updating profile for user:", user_id)
        print("📨 Update data:", data)
        
        if current_app.db is None:
            return jsonify({'error': 'Database not available'}), 500
            
        db = current_app.db
        users_collection = db.users
        
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update user fields
        update_data = {}
        if 'first_name' in data:
            update_data['first_name'] = data['first_name']
        if 'last_name' in data:
            update_data['last_name'] = data['last_name']
        if 'name' in data:
            update_data['name'] = data['name']
        if 'phone' in data:
            update_data['phone'] = data['phone']
        if 'location' in data:
            update_data['location'] = data['location']
        if 'experience_years' in data:
            update_data['experience_years'] = data['experience_years']
        if 'skills' in data:
            update_data['skills'] = data['skills']
        if 'current_role' in data:
            update_data['current_role'] = data['current_role']
        if 'target_role' in data:
            update_data['target_role'] = data['target_role']
        if 'salary_expectation' in data:
            update_data['salary_expectation'] = data['salary_expectation']
        
        # Update name if first_name or last_name changed
        if 'first_name' in update_data or 'last_name' in update_data:
            first_name = update_data.get('first_name', user.get('first_name', ''))
            last_name = update_data.get('last_name', user.get('last_name', ''))
            update_data['name'] = f"{first_name} {last_name}".strip()
        
        update_data['updated_at'] = get_current_timestamp()
        
        print("💾 Update data to save:", update_data)
        
        result = users_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            print("⚠️ No changes made to user profile")
        
        # Get updated user
        updated_user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        response_data = {
            'message': 'Profile updated successfully',
            'user': {
                'id': str(updated_user['_id']),
                'email': updated_user['email'],
                'first_name': updated_user.get('first_name', ''),
                'last_name': updated_user.get('last_name', ''),
                'name': updated_user.get('name', ''),
                'phone': updated_user.get('phone', ''),
                'location': updated_user.get('location', ''),
                'experience_years': updated_user.get('experience_years', 0),
                'skills': updated_user.get('skills', []),
                'current_role': updated_user.get('current_role', ''),
                'target_role': updated_user.get('target_role', ''),
                'salary_expectation': updated_user.get('salary_expectation', 0)
            }
        }
        
        print("✅ Profile updated successfully")
        return jsonify(response_data)
        
    except Exception as e:
        print("❌ Update profile error:", str(e))
        return jsonify({'error': str(e)}), 500

@bp.route('/test-db')
def test_db():
    """Test database connection"""
    try:
        if current_app.db is None:
            return jsonify({'error': 'Database not configured'}), 500
            
        # Test MongoDB connection
        current_app.db.command('ping')
        
        # Test users collection
        users_count = current_app.db.users.count_documents({})
        
        return jsonify({
            'status': 'healthy',
            'database': 'MongoDB',
            'users_count': users_count,
            'message': 'Database connection successful'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'message': 'Database connection failed'
        }), 500