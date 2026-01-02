from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
import os
from datetime import datetime

def get_current_timestamp():
    return datetime.utcnow()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-here')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False  # Tokens don't expire for demo
    
    # Initialize extensions
    CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])  # React dev server
    jwt = JWTManager(app)
    
    # MongoDB configuration
    app.config['MONGO_URI'] = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/career_compass')
    
    try:
        # Initialize MongoDB
        app.mongo_client = MongoClient(app.config['MONGO_URI'])
        app.db = app.mongo_client.get_database()
        print("✅ MongoDB connected successfully")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        app.db = None
    
    # Add timestamp function to app context
    app.get_current_timestamp = get_current_timestamp
    
    # Register blueprints
    from app.routes import auth, jobs, resume, chat, salary
    
    app.register_blueprint(auth.bp)
    app.register_blueprint(jobs.bp)
    app.register_blueprint(resume.bp)
    app.register_blueprint(chat.bp)
    app.register_blueprint(salary.bp)
    
    return app