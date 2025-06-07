import os
from flask import Blueprint, redirect, url_for, session, request, jsonify
from flask_login import login_user, login_required, logout_user, current_user, UserMixin
from requests_oauthlib import OAuth2Session
from dotenv import load_dotenv
from db.db import supabase as client
import requests

load_dotenv()

# Only set this for development
if os.getenv('FLASK_ENV') == 'development':
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# OAuth configuration
client_id = os.getenv('GOOGLE_CLIENT_ID')
client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
authorization_base_url = 'https://accounts.google.com/o/oauth2/auth'
token_url = 'https://accounts.google.com/o/oauth2/token'
# Use REDIRECT_URI from env, default to /auth/callback
GOOGLE_REDIRECT_URI = os.getenv('REDIRECT_URI', 'http://localhost:5001/auth/callback')
scope = ['profile', 'email']

# User class for Flask-Login
class User(UserMixin):
    def __init__(self, user_data):
        if isinstance(user_data, str):
            # If user_data is a string (user_id), fetch user data from Supabase
            response = client.table('users').select('*').eq('id', user_data).execute()
            if response.data:
                user_data = response.data[0]
            else:
                user_data = {'id': user_data}
        
        self.id = user_data.get('id') or user_data.get('user_id')
        self.name = user_data.get('name')
        self.email = user_data.get('email')
        self.picture = user_data.get('picture')
        self.created_at = user_data.get('created_at')

    def get_id(self):
        return str(self.id)

auth_bp = Blueprint("auth", __name__)

@auth_bp.route('/')
def index():
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {
                'name': current_user.name,
                'email': current_user.email
            }
        })
    return jsonify({'authenticated': False})

@auth_bp.route('/login')
def login():
    google = OAuth2Session(client_id, redirect_uri=GOOGLE_REDIRECT_URI, scope=scope)
    authorization_url, state = google.authorization_url(
        authorization_base_url, 
        access_type='offline', 
        prompt='select_account'
    )
    session['oauth_state'] = state
    return redirect(authorization_url)

@auth_bp.route('/callback')
def callback():
    try:
        if 'oauth_state' not in session:
            return jsonify({'error': 'Missing OAuth state'}), 400
        
        google = OAuth2Session(
            client_id, 
            state=session['oauth_state'], 
            redirect_uri=GOOGLE_REDIRECT_URI
        )
        token = google.fetch_token(
            token_url, 
            client_secret=client_secret, 
            authorization_response=request.url
        )
        session['google_token'] = token

        # Fetch user information from Google
        google = OAuth2Session(client_id, token=token)
        user_info = google.get('https://www.googleapis.com/oauth2/v1/userinfo').json()

        # Check if the user exists in Supabase
        response = client.table('users').select('*').eq('email', user_info['email']).execute()
        user = response.data[0] if response.data else None
        if not user:
            user_data = {
                'email': user_info['email'],
                'name': user_info.get('name'),
                'picture': user_info.get('picture')
            }
            insert_response = client.table('users').insert(user_data).execute()
            user = insert_response.data[0] if insert_response.data else None
        
        if not user:
            return jsonify({'error': 'Failed to create or retrieve user'}), 500
        
        login_user(User(user))
        session.permanent = True

        # Redirect to frontend after successful login
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        return redirect(f"{frontend_url}?login=success")

    except Exception as e:
        print(f"OAuth error: {str(e)}")
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        return redirect(f"{frontend_url}?login=error")

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    session.pop('google_token', None)
    session.pop('oauth_state', None)
    return jsonify({'message': 'Logged out successfully'})

@auth_bp.route('/google', methods=['GET'])
def google_auth():
    """Initiate Google OAuth flow"""
    if not client_id or not client_secret:
        print("Missing Google OAuth credentials")
        print(f"GOOGLE_CLIENT_ID: {'Set' if client_id else 'Not set'}")
        print(f"GOOGLE_CLIENT_SECRET: {'Set' if client_secret else 'Not set'}")
        return jsonify({'error': 'Google OAuth credentials not configured'}), 500

    try:
        google = OAuth2Session(client_id, redirect_uri=GOOGLE_REDIRECT_URI, scope=scope)
        authorization_url, state = google.authorization_url(
            authorization_base_url,
            access_type='offline',
            prompt='select_account'
        )
        session['oauth_state'] = state
        return jsonify({'url': authorization_url})
    except Exception as e:
        print(f"Error generating auth URL: {str(e)}")
        return jsonify({'error': 'Failed to generate auth URL'}), 500