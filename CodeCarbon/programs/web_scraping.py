from codecarbon import EmissionsTracker
import requests
from bs4 import BeautifulSoup
import time
import random

def scrape_website():
    """Simulate web scraping multiple pages"""
    print("Starting web scraping...")
    
    # Simulate scraping multiple pages
    base_url = "https://example.com/page/"
    pages_to_scrape = 10
    data_collected = []
    
    for i in range(1, pages_to_scrape + 1):
        # Simulate network request
        time.sleep(random.uniform(0.5, 1.5))
        
        # Simulate parsing content (we'll use a mock page)
        html_content = f"""
        <html>
            <head><title>Page {i}</title></head>
            <body>
                <h1>Page {i} Content</h1>
                <p>This is sample content from page {i}</p>
            </body>
        </html>
        """
        
        soup = BeautifulSoup(html_content, 'html.parser')
        title = soup.find('h1').text
        data_collected.append(title)
    
    return len(data_collected)

if __name__ == "__main__":
    tracker = EmissionsTracker(
        project_name="web_scraping",
        output_file="emissions.csv",
        log_level="error"
    )
    tracker.start()
    
    try:
        pages_scraped = scrape_website()
        print(f"Scraped {pages_scraped} pages successfully")
    finally:
        emissions = tracker.stop()
        print(f"Web scraping emissions: {emissions:.6f} kg CO2")