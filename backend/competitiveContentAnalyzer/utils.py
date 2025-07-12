# Library imports
import os
import requests
import xml.etree.ElementTree as ET
import extruct
import re
import logging

from w3lib.html import get_base_url
from dateutil import parser
from datetime import datetime
from bs4 import BeautifulSoup

# Local imports
from competitiveContentAnalyzer.config import NAMESPACES, headers

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Helper Function
def clean_text(text):
    return " ".join(text.strip().split())


# Get Date Modified
def get_date_modified(url):
    response = requests.get(url, headers=headers)
    base_url = get_base_url(response.text, response.url)
    data = extruct.extract(response.text, base_url=base_url)

    for item in data.get("json-ld", []):
        if "dateModified" in item:
            try:
                dt = parser.parse(item["dateModified"])
                return dt.replace(tzinfo=None).strftime("%Y-%m-%d %H:%M:%S")
            except Exception as e:
                print(
                    f"⚠️ Failed to parse dateModified: {item} - {item['dateModified']} — {e} for URL : {url}"
                )
                return None
    return None


# Extract data from article body
def fetch_article_data(url):
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return []

    soup = BeautifulSoup(response.text, "lxml")
    article_heading = []
    article_body = []
    article_response_Data = {
        "word_count": 0,
        "article_heading": "",
        "article_body": "",
        "date_modified": "",
    }

    for tag in soup.find_all(["h1"]):
        if tag.name in ["h1"]:
            text = clean_text(tag.get_text())
            if text:
                article_heading.append(text)

    for tag in soup.find_all(["p"]):
        if tag.name in ["p"]:
            text = clean_text(tag.get_text())
            article_response_Data["word_count"] += len(text.split())
            if text:
                article_body.append(text)

    article_response_Data["article_heading"] += "\n".join(article_heading)

    if "indianexpress" in url:
        article_response_Data["article_body"] += "\n".join(article_body)
    else:
        article_response_Data["article_body"] += "\n".join(article_body[1:])

    article_response_Data["date_modified"] = get_date_modified(url)

    return article_response_Data


# Fetch Sitemap URLs
def fetch_sitemap_urls(sitemap_url):
    """Fetches URLs and titles from a given sitemap URL."""
    articles_data = []  # This will store dicts: {'url': '...', 'title': '...'}
    try:
        try:
            response = requests.get(sitemap_url, timeout=10)
            response.raise_for_status()  # Raise an exception for bad status codes
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching sitemap {sitemap_url}: {e}")
            logger.info("Retrying with headers...")
            try:
                response = requests.get(sitemap_url, timeout=10, headers=headers)
                response.raise_for_status()  # Raise an exception for bad status codes
            except requests.exceptions.RequestException as e_with_headers:
                logger.error(
                    f"Error fetching sitemap even with headers: {e_with_headers}"
                )

        root = ET.fromstring(response.content)

        # Extract domain using regex
        match = re.match(
            r"^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)",
            sitemap_url,
            re.IGNORECASE,
        )
        domain = match.group(1) if match else sitemap_url

        # Remove ".com", ".in" and get the first part before "."
        name = domain.replace(".com", "").replace(".in", "").split(".")[0]

        # Generate Ids
        idCounter = 0

        # Case 1: Standard sitemap with <url> elements
        for url_element in root.findall("s:url", NAMESPACES):
            loc_element = url_element.find("s:loc", NAMESPACES)
            if loc_element is not None and loc_element.text:
                url = loc_element.text.strip()
                idCounter += 1
                id = name + str(idCounter)
                title = None
                published_date = None

                # Attempt to find <news:title> within <news:news> for Google News Sitemaps
                news_element = url_element.find("news:news", NAMESPACES)
                if news_element is not None:
                    title_element = news_element.find("news:title", NAMESPACES)
                    if title_element is not None and title_element.text:
                        title = title_element.text.strip()

                    published_date_element = news_element.find(
                        "news:publication_date", NAMESPACES
                    )
                    if (
                        published_date_element is not None
                        and published_date_element.text
                    ):
                        published_date = published_date_element.text.strip()

                # Fallback if no news:title was found
                if not title:
                    # Simple heuristic: try to get a title from the URL path
                    # This is a basic fallback and might not always be ideal.
                    path = (
                        os.path.basename(url.rstrip("/"))
                        .replace("-", " ")
                        .replace("_", " ")
                        .strip()
                    )
                    if path:
                        title = path.title()
                    else:
                        title = f"Article from {url.split('/')[2]}"  # Use domain as a last resort

                # Convert published date
                if published_date:
                    try:
                        dt = parser.parse(published_date)
                        published_date = dt.replace(tzinfo=None).strftime(
                            "%Y-%m-%d %H:%M:%S"
                        )
                    except Exception as e:
                        print(
                            f"⚠️ Failed to parse published date: {published_date} - {published_date} — {e} for URL : {url}"
                        )

                articles_data.append(
                    {
                        "id": id,
                        "url": url,
                        "domain": domain,
                        "title": title,
                        "published_date": published_date,
                    }
                )

                articles_data.sort(
                    key=lambda x: datetime.strptime(
                        x["published_date"], "%Y-%m-%d %H:%M:%S"
                    ),
                    reverse=True,
                )

        # Case 2: Sitemap Index with <sitemap> elements (recursive fetching)
        for sitemap_element in root.findall("s:sitemap", NAMESPACES):
            loc_element = sitemap_element.find("s:loc", NAMESPACES)
            if loc_element is not None and loc_element.text:
                # Recursively fetch URLs from nested sitemaps
                articles_data.extend(fetch_sitemap_urls(loc_element.text))

    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching sitemap {sitemap_url}: {e}")
    except ET.ParseError as e:
        logger.error(f"Error parsing sitemap XML from {sitemap_url}: {e}")
    except Exception as e:
        logger.error(
            f"An unexpected error occurred while processing sitemap {sitemap_url}: {e}"
        )
    return articles_data
