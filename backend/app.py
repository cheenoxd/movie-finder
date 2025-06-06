from flask import Flask, url_for, redirect, session
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
import requests
import os
from api import api_bp, auth_bp
from backend.models.model import User

load_dotenv()
app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET')



@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)


app.register_blueprint(api_bp, url_prefix="/api")
app.register_blueprint(auth_bp, url_prefix="/auth")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)

    
