# Add this at the top
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from flask import Flask, redirect, url_for, session, request
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from requests_oauthlib import OAuth2Session
from bson.objectid import ObjectId
from dotenv import load_dotenv
from db import client

load_dotenv()

app = Flask(__name__)


app.secret_key = os.getenv('FLASK_SECRET')
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

client_id = os.getenv('GOOGLE_CLIENT_ID')
client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
authorization_base_url = 'https://accounts.google.com/o/oauth2/auth'
token_url = 'https://accounts.google.com/o/oauth2/token'
redirect_uri = 'http://localhost:5001/callback'
scope = ['profile', 'email']



@app.route('/')
def index():
    if current_user.is_authenticated:
        return f'Logged in as {current_user.name} ({current_user.email})<br><a href="/logout">Logout</a>'
    return 'You are not logged in<br><a href="/login">Login</a>'

@app.route('/login')
def login():
    google = OAuth2Session(client_id, redirect_uri=redirect_uri, scope=scope)
    authorization_url, state = google.authorization_url(authorization_base_url, access_type='offline', prompt='select_account')
    session['oauth_state'] = state
    return redirect(authorization_url)

@app.route('/callback')
def callback():
    try:
        google = OAuth2Session(client_id, state=session['oauth_state'], redirect_uri=redirect_uri)
        token = google.fetch_token(token_url, client_secret=client_secret, authorization_response=request.url)
        session['google_token'] = token

        # Fetch user information from Google
        google = OAuth2Session(client_id, token=token)
        user_info = google.get('https://www.googleapis.com/oauth2/v1/userinfo').json()

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

    return redirect(url_for('index'))

@app.route('/logout')
@login_required
def logout():
    logout_user()
    session.pop('google_token', None)
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5001)