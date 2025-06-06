from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv("MONGO_URI")

# Force TLS, allow self-signed certs
client = MongoClient(
    uri,
    server_api=ServerApi('1'),
    tls=True,
    tlsAllowInvalidCertificates=True  # DEV ONLY
)

try:
    client.admin.command('ping')
    print("✅ Connected to MongoDB!")
except Exception as e:
    print("❌ MongoDB connection error:", e)
