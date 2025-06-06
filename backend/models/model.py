import numpy as np
import pandas as pd
import re
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import kagglehub
import os

# nltk.download('punkt_tab')
# nltk.download('stopwords')

movies = pd.read_csv("backend/models/movies.csv")
movies['clean_overview'] = movies['Overview'].fillna('')

# Clean up text: Convert to lowercase, remove non-alphanumeric characters, and trim spaces
movies['clean_overview'] = movies['clean_overview'].apply(
    lambda x: re.sub(r'[^a-z0-9]', ' ', x.lower()) if isinstance(x, str) else ''
)
movies['clean_overview'] = movies['clean_overview'].apply(
    lambda x: re.sub(r'\s+', ' ', x).strip()
)
movies['clean_overview'] = movies['clean_overview'].apply(
    lambda x: ' '.join(x) if isinstance(x, list) else x
)

# Tokenize sentences
movies['clean_overview'] = movies['clean_overview'].apply(nltk.word_tokenize)
stop_words = nltk.corpus.stopwords.words('english')
overview = []

for sentence in movies['clean_overview']:
    temp = []
    for word in sentence:
        if word not in stop_words or len(word) >= 3:
            temp.append(word)
    overview.append(temp)  

movies['clean_overview'] = overview
movies['Genres'] = movies['Genres'].apply(
    lambda x: [item.strip() for item in x] if isinstance(x, list) else x.split(',') if isinstance(x, str) else []
)

movies['Actors'] = movies['Actors'].apply(
    lambda x: [actor.strip() for actor in x.split(',')[:4]] if isinstance(x, str) else x if isinstance(x, list) else []
)

movies['Director'] = movies['Director'].apply(
    lambda x: [director.strip() for director in x.split(',')] if isinstance(x, str) else x if isinstance(x, list) else []
)

def clean(sentence):
    temp = []
    for word in sentence:
        temp.append(word.lower().replace(' ', ''))
    return temp

movies['Genres'] = [clean(x) for x in movies['Genres']]
movies['Actors'] = [clean(x) for x in movies['Actors']]
movies['Director'] = [clean(x) for x in movies['Director']]


columns = ['clean_overview','Genres','Actors','Director']

l = []

for i in range(len(movies)):
    words =''
    for col in columns:
        words += ' '.join(movies[col][i]) + ' '
    l.append(words)


movies['clean_overview'] = l
movies = movies[['Original Title','clean_overview']]
tfidf = TfidfVectorizer()
features = tfidf.fit_transform(movies['clean_overview'])

similarity = cosine_similarity(features,features)

index = pd.Series(movies['Original Title'])

## Recommendation Function

def recommend_movies(title):
    title = title.lower() 
    matching_indices = index[index.str.lower() == title].index  # Match the title in lowercase

    if len(matching_indices) == 0:
        print(f"Movie '{title}' not found in the dataset.")
        return []

    idx = matching_indices[0]
    print(f"Found movie at index {idx}.")

    # Compute similarity scores
    score = pd.Series(similarity[idx]).sort_values(ascending=False)

    # Get top 10 recommended movie indices (excluding the input movie itself)
    top10_indices = score.index[1:11]  # Exclude the first index (the input movie itself)

    # Retrieve movie titles for recommendations
    recommended_movies = []
    for i in top10_indices:
        recommended_movies.append(movies['Original Title'][i])

    return recommended_movies



print(recommend_movies("Diary of a Wimpy Kid"))