from quart import Blueprint, request, jsonify
from sentence_transformers import SentenceTransformer, util
import logging

from backend.competitiveContentAnalyzer.utils import (
    fetch_sitemap_urls,
    fetch_article_data,
)

competitive_content_analyzer = Blueprint("competitiveContentAnalyzer", __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load the pre-trained SentenceTransformer model
try:
    # model = SentenceTransformer('all-MiniLM-L6-v2')
    model = SentenceTransformer("all-mpnet-base-v2")
    # model = SentenceTransformer('all-distilroberta-v1')
    logger.error("SentenceTransformer model loaded successfully.")
except Exception as e:
    logger.error(f"Error loading SentenceTransformer model: {e}")
    model = None


@competitive_content_analyzer.route("/fetch_sitemap_urls", methods=["POST"])
async def fetch_sitemap_api():
    """API endpoint to fetch sitemap URLs and titles."""
    data = await request.json
    sitemap_url = data.get("sitemap_url")
    if not sitemap_url:
        return jsonify({"error": "sitemap_url is required"}), 400

    articles_info = fetch_sitemap_urls(sitemap_url)
    return jsonify(articles_info)


@competitive_content_analyzer.route("/fetch_article_data", methods=["POST"])
async def fetch_article_data_api():
    """API endpoint to fetch article data."""
    data = await request.json
    url = data.get("url")
    if not url:
        return jsonify({"error": "URL is required"}), 400
    article_data = fetch_article_data(url)
    if article_data:
        return jsonify(article_data)
    return jsonify({"error": "Could not fetch article data from the URL : {url}"}), 500


@competitive_content_analyzer.route("/calculate_similarity", methods=["POST"])
async def calculate_similarity():
    """API endpoint to calculate similarity between two texts."""
    if model is None:
        return (
            jsonify(
                {
                    "error": "SentenceTransformer model not loaded. Please check backend logs."
                }
            ),
            500,
        )

    data = await request.json
    text1 = data.get("text1")
    text2 = data.get("text2")

    if not text1 or not text2:
        return jsonify({"error": "Both text1 and text2 are required"}), 400

    try:
        embedding1 = model.encode(text1, convert_to_tensor=True)
        embedding2 = model.encode(text2, convert_to_tensor=True)

        cosine_scores = util.cos_sim(embedding1, embedding2)
        similarity_score = round(
            cosine_scores.item() * 100, 2
        )  # Convert to percentage and round

        return jsonify({"similarity": similarity_score})
    except Exception as e:
        logger.error(f"Error during similarity calculation: {e}")
        return jsonify({"error": f"Failed to calculate similarity: {e}"}), 500


# --- Default Endpoint ---
@competitive_content_analyzer.route("/", methods=["GET"])
def default_endpoint():
    return (
        jsonify(
            {"status": "ok", "message": "Competitive Content Analyzer App running"}
        ),
        200,
    )
