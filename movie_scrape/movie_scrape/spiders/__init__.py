import scrapy
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from scrapy.http import HtmlResponse
import re

class MovieSpider(scrapy.Spider):
    name = "movie_db"
    allowed_domains = ["themoviedb.org"]
    start_page = 1
    max_page = 1

    def __init__(self, *args, **kwargs):
        super(MovieSpider, self).__init__(*args, **kwargs)
        service = Service(executable_path='/usr/local/bin/chromedriver')
        options = Options()
        options.add_argument('--headless')
        self.driver = webdriver.Chrome(service=service, options=options)

    def start_requests(self):
        for page_number in range(self.start_page, self.max_page + 1):
            url = f'https://www.themoviedb.org/movie?page={page_number}&language=en-CA'
            yield scrapy.Request(url=url, callback=self.parse_page, meta={'page_number': page_number})

    def parse_page(self, response):
        page_number = response.meta['page_number']
        self.driver.get(response.url)
        
        # Wait for elements to load instead of using time.sleep
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'div.content'))
        )
        
        page_source = self.driver.page_source
        selenium_response = HtmlResponse(url=self.driver.current_url, body=page_source, encoding='utf-8')
        
        for container in selenium_response.css('div.content'):
            relative_url = container.css('a::attr(href)').get()
            if relative_url:
                full_url = response.urljoin(relative_url)
                yield scrapy.Request(url=full_url, callback=self.parse_movie_page)
        
        if page_number == self.max_page:
            self.driver.quit()

    def parse_movie_page(self, response):
        # Movie details
        title = response.css('h2 a::text').get()
        genres = response.css("a[href*='/genre/']::text").getall()
        release_date = response.css('span.release::text').get()
        duration = response.css('span.runtime::text').get()
        user_score = response.css('div.user_score_chart::attr(data-percent)').get()
        movie_rating = response.css('span.certification::text').get()

        # Director and cast
        director = response.css("li.profile a[href*='/person/']::text").getall()
        cast = response.css("li.card a[href*='/person/']::text").getall()

        # Convert duration
        duration_in_seconds = self.convert_duration_to_seconds(duration)
        
        yield {
            'title': title,
            'genres': genres,
            'release_date': release_date,
            'duration': duration_in_seconds,
            'user_score': int(user_score) if user_score else None,
            'movie_rating': movie_rating,
            'director': director,
            'cast': cast
        }

    def convert_duration_to_seconds(self, duration_text):
        hours = minutes = 0
        if duration_text:
            hours_match = re.search(r'(\d+)h', duration_text)
            minutes_match = re.search(r'(\d+)m', duration_text)
            if hours_match:
                hours = int(hours_match.group(1))
            if minutes_match:
                minutes = int(minutes_match.group(1))
        return hours * 3600 + minutes * 60

    def closed(self, reason):
        if self.driver:
            self.driver.quit()
