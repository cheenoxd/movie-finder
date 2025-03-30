from flask import Flask, url_for, redirect, session
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
import requests
import os

load_dotenv()
app = Flask(__name__)



appConf = {
    "OAUTH2_CLIENT_ID": os.getenv("CLIENT_ID"),
    "OAUTH2_CLIENT_SECRET": os.getenv("CLIENT_SECRET"),
    "OAUTH2_META_URL": "https://accounts.google.com/.well-known/openid-configuration",
    "FLASK_SECRET": os.getenv("FLASK_SECRET"),
    "FLASK_PORT": 5000
}

oauth = OAuth(app)

oauth.register(
    "myApp",
    client_id=appConf.get("OAUTH2_CLIENT_ID"),
    client_secret=appConf.get("OAUTH2_CLIENT_SECRET"),
    server_metadata_url=appConf.get("OAUTH2_META_URL"),
    client_kwargs={
        "scope": "openid profile email https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/user.gender.read",
    }
)


@app.route('/')
def home():
   return "hello world"

@app.route('/recomendation')

@app.route('/login')

def googleLogin():
    return oauth.myApp.authorize_redirect(
        redirect_uri="http://localhost:5001/callback", 
        _external=True)

@app.route('/callback')
def googleCallback():
    token = oauth.myApp.authorize_access_token()
    personDataUrl = "https://people.googleapis.com/v1/people/me?personFields=genders,birthdays"
    personData = requests.get(
        personDataUrl,
        headers={
            "Authorization": f"Bearer {token['access_token']}"
        }
    ).json()
    token["personData"] = personData
    session["user"] = token
    return redirect(url_for("home"))
    

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)

    
