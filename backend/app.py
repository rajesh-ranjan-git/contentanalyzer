import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import xml.etree.ElementTree as ET
import requests
from bs4 import BeautifulSoup
from sentence_transformers import SentenceTransformer, util

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Load the pre-trained SentenceTransformer model
try:
    # model = SentenceTransformer('all-MiniLM-L6-v2')
    model = SentenceTransformer('all-mpnet-base-v2')
    # model = SentenceTransformer('all-distilroberta-v1')
    print("SentenceTransformer model loaded successfully.")
except Exception as e:
    print(f"Error loading SentenceTransformer model: {e}")
    model = None

# Define namespaces for XML parsing
# 's' for standard sitemap, 'news' for Google News sitemap extension
NAMESPACES = {
    's': 'http://www.sitemaps.org/schemas/sitemap/0.9',
    'news': 'http://www.google.com/schemas/sitemap-news/0.9'
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def fetch_sitemap_urls_backend(sitemap_url):
    """Fetches URLs and titles from a given sitemap URL."""
    articles_data = [] # This will store dicts: {'url': '...', 'title': '...'}
    try:
        try:
            response = requests.get(sitemap_url, timeout=10)
            response.raise_for_status() # Raise an exception for bad status codes
        except requests.exceptions.RequestException as e:
            print(f"Error fetching sitemap {sitemap_url}: {e}")
            print("Retrying with headers...")
            try:
                response = requests.get(sitemap_url, timeout=10, headers=headers)
                response.raise_for_status() # Raise an exception for bad status codes
            except requests.exceptions.RequestException as e_with_headers:
                print(f"Error fetching sitemap even with headers: {e_with_headers}")
        
        root = ET.fromstring(response.content)

        # Case 1: Standard sitemap with <url> elements
        for url_element in root.findall('s:url', NAMESPACES):
            loc_element = url_element.find('s:loc', NAMESPACES)
            if loc_element is not None and loc_element.text:
                url = loc_element.text.strip()
                title = None

                # Attempt to find <news:title> within <news:news> for Google News Sitemaps
                news_element = url_element.find('news:news', NAMESPACES)
                if news_element is not None:
                    title_element = news_element.find('news:title', NAMESPACES)
                    if title_element is not None and title_element.text:
                        title = title_element.text.strip()
                
                # Fallback if no news:title was found
                if not title:
                    # Simple heuristic: try to get a title from the URL path
                    # This is a basic fallback and might not always be ideal.
                    path = os.path.basename(url.rstrip('/')).replace('-', ' ').replace('_', ' ').strip()
                    if path:
                        title = path.title()
                    else:
                        title = f"Article from {url.split('/')[2]}" # Use domain as a last resort
                        
                articles_data.append({'url': url, 'title': title})

        # Case 2: Sitemap Index with <sitemap> elements (recursive fetching)
        for sitemap_element in root.findall('s:sitemap', NAMESPACES):
            loc_element = sitemap_element.find('s:loc', NAMESPACES)
            if loc_element is not None and loc_element.text:
                # Recursively fetch URLs from nested sitemaps
                articles_data.extend(fetch_sitemap_urls_backend(loc_element.text))

    except requests.exceptions.RequestException as e:
        print(f"Error fetching sitemap {sitemap_url}: {e}")
    except ET.ParseError as e:
        print(f"Error parsing sitemap XML from {sitemap_url}: {e}")
    except Exception as e:
        print(f"An unexpected error occurred while processing sitemap {sitemap_url}: {e}")
    return articles_data

def fetch_article_content_backend(url):
    """Fetches and extracts main text content from an article URL."""
    try:
        try:
            response = requests.get(url, timeout=15)
            response.raise_for_status() # Raise an exception for bad status codes
        except requests.exceptions.RequestException as e:
            print(f"Error fetching article {url}: {e}")
            print("Retrying with headers...")
            try:
                response = requests.get(url, timeout=15, headers=headers)
                response.raise_for_status() # Raise an exception for bad status codes
            except requests.exceptions.RequestException as e_with_headers:
                print(f"Error fetching article even with headers {url}: {e}")
                
        soup = BeautifulSoup(response.content, 'html.parser')
        article_text_elements = []

        content_tags = ['article', 'main', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li']

        for tag in content_tags:
            for element in soup.find_all(tag):
                if element.get_text(separator=' ', strip=True) and \
                   not any(cls in element.get('class', []) for cls in ['nav', 'header', 'footer', 'sidebar', 'comment']):
                    article_text_elements.append(element.get_text(separator=' ', strip=True))

        full_text = ' '.join(article_text_elements).strip()
        if not full_text and soup.body:
            full_text = soup.body.get_text(separator=' ', strip=True)
        return full_text if full_text else None
    except requests.exceptions.RequestException as e:
        print(f"Error fetching article {url}: {e}")
        return None
    except Exception as e:
        print(f"Error processing article content from {url}: {e}")
        return None

@app.route('/fetch_sitemap', methods=['POST'])
def fetch_sitemap():
    """API endpoint to fetch sitemap URLs and titles."""
    data = request.json
    sitemap_url = data.get('sitemap_url')
    if not sitemap_url:
        return jsonify({'error': 'sitemap_url is required'}), 400
    
    articles_info = fetch_sitemap_urls_backend(sitemap_url)
    return jsonify(articles_info)

@app.route('/calculate_similarity', methods=['POST'])
def calculate_similarity():
    """API endpoint to calculate similarity between two texts."""
    if model is None:
        return jsonify({'error': 'SentenceTransformer model not loaded. Please check backend logs.'}), 500

    data = request.json
    text1 = data.get('text1')
    text2 = data.get('text2')

    if not text1 or not text2:
        return jsonify({'error': 'Both text1 and text2 are required'}), 400

    try:
        embedding1 = model.encode(text1, convert_to_tensor=True)
        embedding2 = model.encode(text2, convert_to_tensor=True)

        cosine_scores = util.cos_sim(embedding1, embedding2)
        similarity_score = round(cosine_scores.item() * 100, 2) # Convert to percentage and round

        return jsonify({'similarity': similarity_score})
    except Exception as e:
        print(f"Error during similarity calculation: {e}")
        return jsonify({'error': f'Failed to calculate similarity: {e}'}), 500

@app.route('/fetch_article_content', methods=['POST'])
def fetch_article_content_api():
    """API endpoint to fetch article content."""
    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    content = fetch_article_content_backend(url)
    if content:
        return jsonify({'content': content})
    return jsonify({'error': 'Could not fetch content from the URL'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000, threaded=True)