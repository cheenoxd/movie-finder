import os
import pandas as pd
from opensearchpy import OpenSearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
from sentence_transformers import SentenceTransformer
from tqdm import tqdm
from dotenv import load_dotenv
import json
import boto3

# Load environment variables
load_dotenv()

# Get AWS credentials
session = boto3.Session()
credentials = session.get_credentials()
region = session.region_name or 'us-east-1'

# Create AWS4Auth instance
awsauth = AWS4Auth(
    credentials.access_key,
    credentials.secret_key,
    region,
    'es',
    session_token=credentials.token
)

# Initialize OpenSearch client with AWS authentication
es = OpenSearch(
    hosts=[{'host': os.getenv('ELASTICSEARCH_URL').replace('https://', ''), 'port': 443}],
    http_auth=awsauth,
    use_ssl=True,
    verify_certs=True,
    connection_class=RequestsHttpConnection
)

# Initialize the sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

def create_index():
    """Create the movies index with mapping for vector search"""
    mapping = {
        "mappings": {
            "properties": {
                "title": {"type": "text"},
                "description": {"type": "text"},
                "year": {"type": "integer"},
                "genre": {"type": "keyword"},
                "rating": {"type": "float"},
                "embedding": {
                    "type": "dense_vector",
                    "dims": 384,  # Dimension of the all-MiniLM-L6-v2 model
                    "index": True,
                    "similarity": "cosine"
                }
            }
        }
    }
    
    # Create index if it doesn't exist
    if not es.indices.exists(index="movies"):
        es.indices.create(index="movies", body=mapping)
        print("Created 'movies' index with vector search mapping")

def generate_embedding(text):
    """Generate embedding for a text using the sentence transformer model"""
    if not isinstance(text, str):
        return None
    return model.encode(text).tolist()

def process_movies(csv_path):
    """Process movies from CSV and upload to Elasticsearch"""
    # Read CSV file
    df = pd.read_csv(csv_path)
    
    # Create index with proper mapping
    create_index()
    
    # Process movies in batches
    batch_size = 100
    for i in tqdm(range(0, len(df), batch_size)):
        batch = df.iloc[i:i + batch_size]
        actions = []
        
        for _, movie in batch.iterrows():
            # Generate embedding from title and description
            text_for_embedding = f"{movie['title']} {movie.get('description', '')}"
            embedding = generate_embedding(text_for_embedding)
            
            # Prepare document
            doc = {
            "title": movie["title"],
            "description": movie.get("description", ""),
            "year": movie.get("year"),
            "genre": movie.get("genre"),
            "rating": movie.get("rating"),
            "embedding": embedding
        }
            
            # Add to bulk actions
            actions.append({
                "_index": "movies",
                "_source": doc
            })
        
        # Bulk index the documents
        if actions:
            es.bulk(operations=actions)
    
    print(f"Successfully indexed {len(df)} movies")

if __name__ == "__main__":
    # Check if movies.csv exists
    csv_path = "../models/movies.csv"
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found!")
        print("Please make sure the movies.csv file is in the backend/models directory.")
        exit(1)
    
    # Process movies
    process_movies(csv_path) 