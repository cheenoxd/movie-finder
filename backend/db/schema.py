from mongoengine import *
import os
from dotenv import load_dotenv
import datetime

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
connect(
    db="movie-haven",
    host="mongodb+srv://debDB:loldev@dev.a36fgdc.mongodb.net/movie-haven?retryWrites=true&w=majority",
    tls=True,
    tlsAllowInvalidCertificates=False
)


class Movie(Document):
    favourite_movie = StringField(required=True)

    meta = {
        'collection': 
        'movie'
        }
    

class User(Document):
    email = StringField()
    name = StringField()
    last = StringField()
    session_token = IntField()

    meta = {
        'collection': 
        'user'
        }





# if __name__ == "__main__":
    
#     sample_movie = Movie(favourite_movie="Inception")
#     sample_movie.save()
#     print("Inserted sample movie document:", sample_movie.to_json())
    
    
#     sample_user = User(email="user@example.com", name="John", last="Doe")
#     sample_user.save()
#     print("Inserted sample user document:", sample_user.to_json())