from flask import Blueprint, jsonify, request
import requests
import os
from flask_login import login_required, current_user
from db.db import supabase as client
from functools import wraps
from dotenv import load_dotenv

load_dotenv()

# Create a separate blueprint for public routes
public_bp = Blueprint("public", __name__)
api_bp = Blueprint("api", __name__)

def public_route(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        return f(*args, **kwargs)
    return decorated_function

headers = {
    "accept": "application/json",
    "Authorization": f"Bearer {os.getenv('TMDB_BEARER_TOKEN')}"
}

@public_bp.route('/movies', methods=['GET'])
def fetch_movie():
    api_key = os.getenv('TMDB_API_KEY')
    url = f"https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1&api_key={api_key}"
    response = requests.get(url)
    if response.status_code == 200:
        return jsonify(response.json())
    return jsonify({"error": f"Failed to fetch movies: {response.text}"}), response.status_code

@public_bp.route('/movies/<int:movie_id>', methods=['GET'])
def get_movie_details(movie_id):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}?language=en-US"
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        movie_data = response.json()
        # Get additional data like credits and videos
        credits_url = f"https://api.themoviedb.org/3/movie/{movie_id}/credits?language=en-US"
        videos_url = f"https://api.themoviedb.org/3/movie/{movie_id}/videos?language=en-US"
        
        credits_response = requests.get(credits_url, headers=headers)
        videos_response = requests.get(videos_url, headers=headers)
        
        if credits_response.status_code == 200:
            movie_data['credits'] = credits_response.json()
        if videos_response.status_code == 200:
            movie_data['videos'] = videos_response.json()
        
        return jsonify(movie_data)
    return jsonify({"error": f"Failed to fetch movie details: {response.text}"}), response.status_code

@public_bp.route('/movies/search', methods=['GET'])
def search_movies():
    query = request.args.get('q')
    api_key = os.getenv('TMDB_API_KEY')
    if not query:
        return jsonify({"results": []})
    url = f"https://api.themoviedb.org/3/search/movie?query={query}&language=en-US&page=1&api_key={api_key}"
    response = requests.get(url)
    if response.status_code == 200:
        return jsonify(response.json())
    return jsonify({"error": f"Failed to search movies: {response.text}"}), response.status_code

@api_bp.route('/recommendation')
@login_required
def recommendation():
    return jsonify({"message": "recommendation stub"})

@api_bp.route('/user', methods=['GET', 'PUT'])
@login_required
def user_profile():
    if request.method == 'PUT':
        try:
            data = request.get_json()
            # Update user in Supabase
            response = client.table('users').update({
                'name': data.get('name')
            }).eq('id', current_user.id).execute()
            
            if not response.data:
                return jsonify({'error': 'Failed to update user'}), 500
                
            # Update the current user object
            current_user.name = data.get('name')
            
            return jsonify({
                'message': 'User updated successfully',
                'user': {
                    'id': str(current_user.id),
                    'name': current_user.name,
                    'email': current_user.email,
                    'picture': getattr(current_user, 'picture', None),
                    'created_at': getattr(current_user, 'created_at', None)
                }
            })
        except Exception as e:
            print(f"Error updating user: {str(e)}")
            return jsonify({'error': 'Failed to update user'}), 500
    
    return jsonify({
        'user': {
            'id': str(current_user.id),
            'name': current_user.name,
            'email': current_user.email,
            'picture': getattr(current_user, 'picture', None),
            'created_at': getattr(current_user, 'created_at', None)
        }
    })

@api_bp.route('/favourites', methods=['GET', 'POST'])
@login_required
def favourites():
    if request.method == 'POST':
        data = request.get_json()
        movie_id = data.get('movie_id')
        movie_data = data.get('movie_data')
        if not movie_id or not movie_data:
            return jsonify({'error': 'Missing movie_id or movie_data'}), 400
        try:
            response = client.table('favourites').insert({
                'user_id': current_user.id,
                'movie_id': movie_id,
                'movie_data': movie_data
            }).execute()
            return jsonify({'message': 'Favourite added successfully', 'data': response.data})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        try:
            response = client.table('favourites').select('*').eq('user_id', current_user.id).execute()
            return jsonify({'favourites': response.data})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@api_bp.route('/watch-history', methods=['GET', 'POST'])
@login_required
def watch_history():
    if request.method == 'POST':
        data = request.get_json()
        movie_id = data.get('movie_id')
        movie_data = data.get('movie_data')
        if not movie_id or not movie_data:
            return jsonify({'error': 'Missing movie_id or movie_data'}), 400
        try:
            response = client.table('watch_history').insert({
                'user_id': current_user.id,
                'movie_id': movie_id,
                'movie_data': movie_data
            }).execute()
            return jsonify({'message': 'Watch history updated successfully', 'data': response.data})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        try:
            response = client.table('watch_history').select('*').eq('user_id', current_user.id).execute()
            return jsonify({'watch_history': response.data})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
