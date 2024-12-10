import requests
import pandas as pd
import os
from dotenv import load_dotenv

# Load API Key
load_dotenv()
tmdb_key = os.getenv("MOVIE_KEY")

if not tmdb_key:
    raise ValueError("TMDB API key is not set. Check your .env file.")

# Headers for API requests
headers = {
    "accept": "application/json",
    "Authorization": f"Bearer {tmdb_key}"
}

def grab_movie_data(total_pages):
    movie_data = []

    for page in range(1, total_pages + 1):
        movie_pages_url = (
            f"https://api.themoviedb.org/3/discover/movie?"
            f"include_adult=false&include_video=false&language=en-US&page={page}"
            f"&sort_by=popularity.desc&vote_average.gte=5&vote_count.gte=1000"
        )
        response = requests.get(movie_pages_url, headers=headers)

        # Check for errors in the response
        if response.status_code != 200:
            print(f"Error fetching page {page}: {response.status_code}")
            print(f"Response content: {response.text}")
            continue

        results = response.json().get("results", [])
        if not results:
            print(f"No results found for page {page}. Response: {response.json()}")
            continue

        for movie in results:
            movie_id = movie["id"]

            # Fetch detailed movie info
            details = requests.get(f"https://api.themoviedb.org/3/movie/{movie_id}?language=en-US", headers=headers).json()
            credits = requests.get(f"https://api.themoviedb.org/3/movie/{movie_id}/credits?language=en-US", headers=headers).json()
            keywords = requests.get(f"https://api.themoviedb.org/3/movie/{movie_id}/keywords", headers=headers).json()

            movie_data.append({
                "id": details.get("id"),
                "title": details.get("title"),
                "overview": details.get("overview"),
                "genres": [genre["name"] for genre in details.get("genres", [])],
                "release_date": details.get("release_date"),
                "popularity": details.get("popularity"),
                "vote_average": details.get("vote_average"),
                "runtime": details.get("runtime"),
                "cast": [cast["name"] for cast in credits.get("cast", [])[:7]],
                "director": [crew["name"] for crew in credits.get("crew", []) if crew["job"] == "Director"],
                "keywords": [keyword["name"] for keyword in keywords.get("keywords", [])]
            })

    # Return as a DataFrame
    return pd.DataFrame(movie_data)

# Fetch data
movie_detail_df = grab_movie_data(total_pages=1)

# Save to CSV
movie_detail_df.to_csv("movies.csv", index=False)
print("Movies saved to movies.csv")
