import pandas as pd
import numpy as np
from pathlib import Path
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sentence_transformers import SentenceTransformer
import faiss
import pickle
import os
from tqdm import tqdm
import gc
import torch
from multiprocessing import Pool, cpu_count
import re

nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

OUTPUT_DIR = Path("output")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

STOP_WORDS = set(stopwords.words('english'))

def preprocess_text(text):
    if not isinstance(text, str):
        return ""
    
    text = text.lower()
    
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    
    words = text.split()
    
    words = [word for word in words if word not in STOP_WORDS]
    
    return ' '.join(words)

def process_chunk(chunk):
    return chunk.apply(preprocess_text)

def main():
    print("Loading movies data...")
    movies = pd.read_csv("movies.csv", usecols=['id', 'title', 'overview'])
    print(f"Loaded {len(movies)} movies")
    
    movies['overview_length'] = movies['overview'].fillna('').str.len()
    movies = movies[movies['overview_length'] > 50]
    print(f"After filtering short overviews: {len(movies)} movies")
    
    print("Preprocessing movie overviews...")
    n_cores = max(1, cpu_count() - 1)
    chunk_size = len(movies) // n_cores
    chunks = [movies['overview'].fillna('').iloc[i:i + chunk_size] for i in range(0, len(movies), chunk_size)]
    
    with Pool(n_cores) as pool:
        processed_chunks = list(tqdm(
            pool.imap(process_chunk, chunks),
            total=len(chunks),
            desc="Processing chunks"
        ))
    
    movies['clean_overview'] = pd.concat(processed_chunks)
    
    print("Loading sentence transformer model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    print(f"Using device: {device}")
    
    print("Generating embeddings...")
    batch_size = 128
    embeddings = []
    
    for i in tqdm(range(0, len(movies), batch_size)):
        batch = movies['clean_overview'].iloc[i:i+batch_size].tolist()
        batch_embeddings = model.encode(batch, show_progress_bar=False, convert_to_numpy=True)
        embeddings.append(batch_embeddings)
        
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
    
    embeddings = np.vstack(embeddings)
    
    print("Creating FAISS index...")
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)
    
    faiss.normalize_L2(embeddings)
    index.add(embeddings.astype('float32'))
    
    print("Saving index and movie data...")
    faiss.write_index(index, str(OUTPUT_DIR / "movie_index.faiss"))
    
    movies.to_csv(OUTPUT_DIR / "processed_movies.csv", index=False)
    np.save(OUTPUT_DIR / "movie_embeddings.npy", embeddings)
    
    config = {
        'model_name': 'all-MiniLM-L6-v2',
        'dimension': dimension,
        'similarity_threshold': 0.3
    }
    with open(OUTPUT_DIR / "model_config.pkl", 'wb') as f:
        pickle.dump(config, f)
    
    print("Done! Files saved to output directory:")
    print(f"- FAISS index: {OUTPUT_DIR / 'movie_index.faiss'}")
    print(f"- Processed movies: {OUTPUT_DIR / 'processed_movies.csv'}")
    print(f"- Movie embeddings: {OUTPUT_DIR / 'movie_embeddings.npy'}")
    print(f"- Model config: {OUTPUT_DIR / 'model_config.pkl'}")

if __name__ == "__main__":
    main()
