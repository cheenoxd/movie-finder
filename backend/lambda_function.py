import json
import boto3
import pickle
import faiss
import numpy as np
from typing import Dict, List, Any
import os
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
S3_BUCKET = "movie-recommender-assets"
ASSETS_DIR = Path("/tmp/assets")
ASSETS_DIR.mkdir(parents=True, exist_ok=True)

# Global variables for caching
vectorizer = None
index = None
movie_titles = None
title_to_idx = None

def download_assets():
    """Download required assets from S3 if not already present"""
    global vectorizer, index, movie_titles, title_to_idx
    
    if all(x is not None for x in [vectorizer, index, movie_titles, title_to_idx]):
        return
    
    s3 = boto3.client('s3')
    
    # Download files from S3
    for filename in ["tfidf_vectorizer.pkl", "movie_index.faiss", "movie_titles.pkl", "title_to_idx.pkl"]:
        s3_path = f"assets/{filename}"
        local_path = ASSETS_DIR / filename
        
        if not local_path.exists():
            s3.download_file(S3_BUCKET, s3_path, str(local_path))
    
    # Load the assets
    with open(ASSETS_DIR / "tfidf_vectorizer.pkl", "rb") as f:
        vectorizer = pickle.load(f)
    
    index = faiss.read_index(str(ASSETS_DIR / "movie_index.faiss"))
    
    with open(ASSETS_DIR / "movie_titles.pkl", "rb") as f:
        movie_titles = pickle.load(f)
    
    with open(ASSETS_DIR / "title_to_idx.pkl", "rb") as f:
        title_to_idx = pickle.load(f)

def lambda_handler(event, context):
    """Handle API Gateway requests"""
    try:
        # Download and load assets (only on cold start)
        download_assets()
        
        # Get movie title from query parameters
        title = event.get('queryStringParameters', {}).get('title', '').lower()
        
        if not title:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing title parameter'})
            }
        
        # Get movie index
        movie_idx = title_to_idx.get(title)
        if movie_idx is None:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': f'Movie "{title}" not found'})
            }
        
        # Get movie vector
        movie_vector = index.reconstruct(movie_idx).reshape(1, -1)
        faiss.normalize_L2(movie_vector)
        
        # Search for similar movies
        k = 11  # Get 11 results (including the query movie)
        distances, indices = index.search(movie_vector.astype(np.float32), k)
        
        # Filter out the query movie and get titles
        similar_movies = [
            movie_titles[idx] for idx in indices[0]
            if idx != movie_idx
        ][:10]  # Take top 10 excluding the query movie
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'  # Enable CORS
            },
            'body': json.dumps({
                'recommendations': similar_movies
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        } 