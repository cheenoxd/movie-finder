
from flask import Blueprint, jsonify, request
import requests
import os

api_bp = Blueprint("api", __name__)

headers = {
    "accept": "application/json",
    "Authorization": f"Bearer {os.getenv('TMDB_API_KEY')}"
}

@api_bp.route('/movies', methods=['GET'])
def fetch_movie():
    url = "https://api.themoviedb.org/3/trending/movie/day?language=en-US"
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return jsonify(response.json())
    return jsonify({"error": "Failed to fetch movies"}), response.status_code

@api_bp.route('/recommendation')
def recommendation():
    return jsonify({"message": "recommendation stub"})
