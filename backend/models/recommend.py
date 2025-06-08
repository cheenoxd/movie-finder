import pandas as pd
import numpy as np
import faiss
from pathlib import Path
from sentence_transformers import SentenceTransformer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import nltk
from fuzzywuzzy import process
import pickle

nltk.download('punkt')
nltk.download('stopwords')

def load_model():
    output_dir = Path("output")
    movies = pd.read_csv(output_dir / "processed_movies.csv")
    index = faiss.read_index(str(output_dir / "movie_index.faiss"))
    with open(output_dir / "model_config.pkl", 'rb') as f:
        config = pickle.load(f)
    model = SentenceTransformer(config['model_name'])
    return movies, index, model, config

def preprocess_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = ''.join(c if c.isalnum() or c.isspace() else ' ' for c in text)
    stop_words = set(stopwords.words('english'))
    text = ' '.join([word for word in word_tokenize(text) if word not in stop_words])
    return text.strip()

def find_movie(movie_title, movies, threshold=80):
    titles = movies['title'].tolist()
    best_match = process.extractOne(movie_title, titles, score_cutoff=threshold)
    if best_match:
        matched_title, score = best_match
        return movies[movies['title'] == matched_title].iloc[0], score
    return None, 0

def get_recommendations(movie_title, movies, index, model, config, k=10):
    movie, match_score = find_movie(movie_title, movies)
    if movie is None:
        print(f"Movie '{movie_title}' not found in the dataset.")
        return []
    print(f"Found movie: {movie['title']} (match score: {match_score}%)")
    movie_overview = movie['clean_overview']
    if not movie_overview:
        print(f"Warning: No overview available for '{movie['title']}'")
        return []
    query_vector = model.encode([movie_overview])[0].reshape(1, -1).astype('float32')
    faiss.normalize_L2(query_vector)
    distances, indices = index.search(query_vector, k + 1)
    recommended_movies = []
    for i, idx in enumerate(indices[0][1:], 1):
        if idx < len(movies):
            similarity = float(distances[0][i])
            if similarity >= config['similarity_threshold']:
                movie = movies.iloc[idx]
                recommended_movies.append({
                    'rank': i,
                    'title': movie['title'],
                    'similarity': similarity,
                    'overview': movie['clean_overview']
                })
    return recommended_movies

def main():
    print("Loading model...")
    movies, index, model, config = load_model()
    while True:
        movie_title = input("\nEnter a movie title (or 'quit' to exit): ")
        if movie_title.lower() == 'quit':
            break
        print(f"\nFinding recommendations for: {movie_title}")
        recommendations = get_recommendations(movie_title, movies, index, model, config)
        if recommendations:
            print("\nRecommended movies:")
            for rec in recommendations:
                print(f"\n{rec['rank']}. {rec['title']} (similarity: {rec['similarity']:.3f})")
                print(f"   Overview: {rec['overview'][:200]}...")
        else:
            print("No recommendations found.")

if __name__ == "__main__":
    main()
