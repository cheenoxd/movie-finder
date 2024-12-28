
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
SSL_MODE = os.getenv("SSL_MODE")

try:
    
    connection = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        sslmode=SSL_MODE
    )
    print("Connection to the database established successfully!")

    # Create a cursor for executing queries
    cursor = connection.cursor()

cursor.execute()
connection.commit()
cursor.close()
connection.close()