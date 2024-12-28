import requests
import os
from dotenv import load_dotenv
import json
import csv
from tqdm import tqdm

# Load environment variables
load_dotenv()

api_key = os.getenv('MOVIE_API_KEY')
base_url = "https://api.themoviedb.org/3/discover/movie"
movie_details_url = "https://api.themoviedb.org/3/movie"

# Genres
genres = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western"
}

# Parameters for API requests
params = {
    "api_key": api_key,
    "language": "en-US",
    "sort_by": "popularity.desc",
    "page": 1
}

movies = []
movie_count = 0 

# Loop through pages
for page in tqdm(range(1, 501), desc="Scraping Pages"):
    params["page"] = page
    response = requests.get(base_url, params=params)
    data = response.json()

    # Process each movie in the results
    for movie in data.get('results', []):
        movie_id = movie.get("id")
        
        # Fetch detailed movie information
        details_response = requests.get(f"{movie_details_url}/{movie_id}", params={"api_key": api_key, "language": "en-US"})
        details_data = details_response.json()

        # Fetch credits information
        credits_response = requests.get(f"{movie_details_url}/{movie_id}/credits", params={"api_key": api_key})
        credits_data = credits_response.json()

        # Fetch certification data
        certification_response = requests.get(f"{movie_details_url}/{movie_id}/release_dates", params={"api_key": api_key})
        certification_data = certification_response.json()
        certification = "Not Rated"
        for result in certification_data.get("results", []):
            if result["iso_3166_1"] == "US":
                certifications = [entry["certification"] for entry in result["release_dates"] if entry["certification"]]
                if certifications:
                    certification = certifications[0]
                break

        # Extract cast (top 5 with character names)
        cast = [
            {"name": actor["name"], "character": actor.get("character", "Unknown")}
            for actor in credits_data.get("cast", [])[:5]
        ]

        crew = credits_data.get("crew", [])
        director = next((member["name"] for member in crew if member["job"] == "Director"), "Unknown")

    
        runtime_minutes = details_data.get("runtime")
        runtime_seconds = runtime_minutes * 60 if runtime_minutes is not None else None

        # Build movie information dictionary
        movie_info = {
            "original_title": movie.get("original_title"),
            "id": movie_id,
            "genre_ids": [genres[genre_id] for genre_id in movie.get("genre_ids", []) if genre_id in genres],
            "adult": movie.get("adult"),
            "overview": movie.get("overview"),
            "rating": round(movie.get("vote_average", 0) * 10, 1),
            "runtime_seconds": runtime_seconds,
            "cast": cast,
            "director": director,
            "certification": certification
        }

        movies.append(movie_info)
        movie_count += 1

output_file = "movies_with_runtime_seconds_and_certification.csv"
with open(output_file, "w", encoding="utf-8", newline="") as file:
    csv_writer = csv.writer(file)
    # Write header
    csv_writer.writerow([
        "Original Title", "ID", "Genres", "Adult", "Overview", "Rating", "Runtime (Seconds)",
        "Actors", "Characters", "Director", "Certification"
    ])
    # Write movie data
    for movie in movies:
        actors = ", ".join([actor["name"] for actor in movie["cast"]])
        characters = ", ".join([actor["character"] for actor in movie["cast"]])
        csv_writer.writerow([
            movie["original_title"],
            movie["id"],
            ", ".join(movie["genre_ids"]),
            movie["adult"],
            movie["overview"],
            movie["rating"],
            movie["runtime_seconds"],
            actors,
            characters,
            movie["director"],
            movie["certification"]
        ])

print(f"Data has been written to {output_file}")
print(f"Total movies added: {movie_count}")
