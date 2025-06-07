import os
from flask import Flask, jsonify
from flask_login import LoginManager, current_user
from flask_cors import CORS
from dotenv import load_dotenv
from api.auth import auth_bp, User
from api.api import api_bp, public_bp
from db.db import supabase as client

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your-secret-key')  # Required for sessions

# Configure CORS
CORS(app, supports_credentials=True, origins=['http://localhost:3000', 'http://localhost:3001'])

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.session_protection = None  # Disable session protection for public routes

@login_manager.unauthorized_handler
def unauthorized():
    return {'error': 'Unauthorized'}, 401

@login_manager.user_loader
def load_user(user_id):
    try:
        return User(user_id)
    except Exception as e:
        print(f"Error loading user: {str(e)}")
        return None

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(api_bp, url_prefix='/api')
app.register_blueprint(public_bp, url_prefix='/api')

@app.route('/')
def home():
    return jsonify({"message": "MovieHaven API"})

if __name__ == '__main__':
    app.run(debug=True, port=5001)