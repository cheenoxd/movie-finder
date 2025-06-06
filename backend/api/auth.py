import os
import sys
from flask import Flask, Blueprint, redirect, url_for, session, request
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from requests_oauthlib import OAuth2Session
from bson.objectid import ObjectId
from dotenv import load_dotenv
from ..models.schema import User
from db.db import client
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


load_dotenv()

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# Flask-Login configuration
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)


client_id = os.getenv('GOOGLE_CLIENT_ID')
client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
authorization_base_url = 'https://accounts.google.com/o/oauth2/auth'
token_url = 'https://accounts.google.com/o/oauth2/token'
redirect_uri = 'http://localhost:5001/callback'
scope = ['profile', 'email']


db = client['movie-haven']
users_collection = db['users']


auth_bp = Blueprint("auth", __name__)

@auth_bp.route('/')
def index():
    if current_user.is_authenticated:
        return (
            f'Logged in as {current_user.name} ({current_user.email})<br>'
            f'<a href="/logout">Logout</a>'
        )
    return 'You are not logged in<br><a href="/login">Login</a>'

@auth_bp.route('/login')
def login():
    google = OAuth2Session(client_id, redirect_uri=redirect_uri, scope=scope)
    authorization_url, state = google.authorization_url(
        authorization_base_url, access_type='offline', prompt='select_account'
    )
    session['oauth_state'] = state
    return redirect(authorization_url)

@auth_bp.route('/callback')
def callback():
    try:
        google = OAuth2Session(client_id, state=session['oauth_state'], redirect_uri=redirect_uri)
        token = google.fetch_token(
            token_url, client_secret=client_secret, authorization_response=request.url
        )
        session['google_token'] = token

        # Fetch user information from Google
        google = OAuth2Session(client_id, token=token)
        user_info = google.get('https://www.googleapis.com/oauth2/v1/userinfo').json()

        # Check if the user exists in your database
        user = users_collection.find_one({'email': user_info['email']})
        if not user:
            user_data = {
                'email': user_info['email'],
                'name': user_info.get('name')
            }
            result = users_collection.insert_one(user_data)
            user = users_collection.find_one({'_id': result.inserted_id})
        login_user(User(user))
        session.permanent = True

    except Exception as e:
        print("OAuth error:", str(e))
        return "OAuth failed", 400

    return redirect(url_for('auth.index'))

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    session.pop('google_token', None)
    return redirect(url_for('auth.index'))

# Register the blueprint with the Flask app
app.register_blueprint(auth_bp)

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5001)
