from flask import Flask, url_for, redirect, session
from dotenv import load_dotenv
import requests
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
load_dotenv()


@app.route('/')
def home():
   return "hello world"


@app.route('/api/movies', methods=['GET'])
def fetch_movie():
    movie_data = requests.get('https://w3schools.com/python/demopage.htm')
    return jsonify(movies)




@app.route('/api/recomendation')
def recomendation():



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)

    
