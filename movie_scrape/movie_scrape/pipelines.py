import os
import psycopg2
from scrapy.exceptions import DropItem
from dotenv import load_dotenv


load_dotenv()

class PostgresPipeline:
    def open_spider(self, spider):
        print("Connecting to database...")
   
        self.conn = psycopg2.connect(
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            sslmode=os.getenv("SSL_MODE")
        )
        print("Connected to database successfully")
        self.cursor = self.conn.cursor()

        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS movies (
                title TEXT,
                genres TEXT[],
                release_date DATE,
                duration INTEGER,
                user_score INTEGER,
                movie_rating TEXT,
                director TEXT[],
                cast_members TEXT[]
            )
        ''')
        self.conn.commit()

    def close_spider(self, spider):

        self.cursor.close()
        self.conn.close()

    def process_item(self, item, spider):
        try:
            # Clean and remove empty entries from the 'cast' list, limit to the first 5 members
            cast_members = [member.strip() for member in item.get('cast', []) if member.strip()][:5]

            # (Repeat similar cleanup for other fields if needed)

            # Insert the cleaned data into the database
            self.cursor.execute('''
                INSERT INTO movies (title, genres, release_date, duration, user_score, movie_rating, director, cast_members)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ''', (
                item.get('title', '').strip().replace('\n', ''),
                [genre.strip().replace('\n', '') for genre in item.get('genres', [])],
                item.get('release_date', '').strip().replace('\n', ''),
                item.get('duration', 0),
                int(item.get('user_score', 0)) if item.get('user_score') else None,
                item.get('movie_rating', '').strip().replace('\n', ''),
                [director.strip().replace('\n', '') for director in item.get('director', [])],
                cast_members  
            ))
            
            self.conn.commit()

        except psycopg2.Error as e:
            spider.logger.error(f"Error inserting item: {e}")
            raise DropItem(f"Error inserting item: {e}")
        
        return item
