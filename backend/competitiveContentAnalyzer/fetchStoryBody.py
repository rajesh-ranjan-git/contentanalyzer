import requests
from bs4 import BeautifulSoup
import json

# Define the URL and headers
# source_url = "https://www.indiatoday.in/business/story/bitcoin-breaks-117000-mark-reaches-all-time-high-crypto-prices-ethereum-altcoins-rise-dogecoin-gain-2754173-2025-07-11"
# source_url = "https://www.ndtv.com/india-news/himachal-pradesh-floods-himachal-pradesh-rain-9-swept-away-in-himachal-village-4-bodies-found-150-km-away-8858585"
# source_url = "https://indianexpress.com/article/india/marine-engineer-death-iran-misidentified-body-jharkhand-family-endless-wait-compensation-10119643"
# source_url = "https://www.hindustantimes.com/cricket/ravi-shastri-paused-taken-aback-after-ben-stokes-decision-stuns-ex-india-coach-what-did-i-hear-you-correctly-101752212222919.html"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.google.com/",
}

# Helper Function
def clean_text(text):
    return " ".join(text.strip().split())

# Extract paragraphs from story body
def extract_elements_from_url(url):
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return []

    soup = BeautifulSoup(response.text, 'lxml')
    story_heading = []
    story_body = []
    responseData = {
        "word_count" : 0,
        "story_heading" : "",
        "story_body" : ""
    }

    for tag in soup.find_all(['h1']):
        if tag.name in ['h1']:
            text = clean_text(tag.get_text())
            if text:
                story_heading.append(text)

    for tag in soup.find_all(['p']):
        if tag.name in ['p']:
            text = clean_text(tag.get_text())
            responseData["word_count"] += len(text.split())
            if text:
                story_body.append(text)

    responseData["story_heading"] += "\n".join(story_heading)
    
    if("indianexpress" in url):
        responseData["story_body"] += "\n".join(story_body)
    else:
        responseData["story_body"] += "\n".join(story_body[1:])

    return responseData