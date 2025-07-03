import os
import asyncio
from openai import OpenAI
from dotenv import load_dotenv
from quart import Blueprint, request, jsonify
import logging

# Load API key from .env file
load_dotenv()
openai_api_key = os.getenv("GITHUB_OPENAI_API_KEY")

# Initialize OpenAI client
endpoint = "https://models.github.ai/inference"
model = "openai/gpt-4.1"

client = OpenAI(
    base_url=endpoint,
    api_key=openai_api_key,
)

comments_summarizer = Blueprint('commentsSummarizer', __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_summary(text):
    logger.info("Generating summary...")
    try:
        response = client.chat.completions.create(
            messages = [
                {
                    "role": "system",
                    "content": "You are an assistant that summarizes user feedback into a structured format with Pros, Cons, and Overall Sentiment.",
                },
                {
                    "role": "user",
                    "content": f"""Please generate a summary of the following comments where the overall summary should be in at least 150 words and it should give the sentiment analysis in positive, neutral and negative percentages, also it should give frequent keywords used and the key themes :{text}
                    Return the result in this format:
                    Pros:
                    - ...
                    Cons:
                    - ...
                    Overall Summary: ...
                    Sentiment Analysis: 
                    Positive Sentiment %: ...
                    Neutral Sentiment %: ...
                    Negative Sentiment %: ...
                    Frequent Keywords: ...
                    Key Themes: ...""",
                }
            ],
            temperature=0.7,
            top_p=1,
            model=model
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error during summarization: {e}")
        return "Error generating summary."

@comments_summarizer.route('/analyze_comments', methods=['POST'])
async def analyze_comments_endpoint():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = await request.get_json()
    comments = data.get('comments')

    if not comments or not isinstance(comments, list) or not all(isinstance(c, str) for c in comments):
        return jsonify({"error": "Invalid input: 'comments' must be a list of strings"}), 400

    if not comments:
        return jsonify({"error": "No comments provided for analysis."}), 400
    
    full_comments_text = "\n".join(f"- {comment}" for comment in comments)

    # Perform analysis
    analyzed_data = await asyncio.to_thread(get_summary, full_comments_text)

    response_data = {
        "summary": analyzed_data
    }
    
    return jsonify(response_data), 200

# --- Default Endpoint ---
@comments_summarizer.route('/', methods=['GET'])
def default_endpoint():
    return jsonify({"status": "ok", "message": "Comment Summarizer App running"}), 200