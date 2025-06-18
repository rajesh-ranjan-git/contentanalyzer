from flask import Flask, request, jsonify
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from textblob import TextBlob
import re
import nltk
import logging

# Configure logging for Flask
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# --- Global Model and NLTK Data Loading (Load once at startup) ---
# This ensures models are loaded only when the Flask app starts,
# not with every API request, which is crucial for performance.

summarizer = None
sentiment_classifier = None
nltk_stopwords = None
lemmatizer = None

def load_nlp_models():
    """Loads all necessary NLP models and NLTK data."""
    global summarizer, sentiment_classifier, nltk_stopwords, lemmatizer

    if summarizer and sentiment_classifier and nltk_stopwords and lemmatizer:
        logger.info("NLP models already loaded.")
        return

    logger.info("Loading NLP models and NLTK data...")
    
    # Check for CUDA availability
    device = 0 if torch.cuda.is_available() else -1
    logger.info(f"Using device: {'CUDA GPU' if device == 0 else 'CPU'}")

    # List of NLTK resources to check/download
    # Explicitly added 'punkt_tab' as per the error message.
    nltk_resources = [
        'punkt', # For word_tokenize and sent_tokenize (main Punkt data)
        'stopwords',
        'averaged_perceptron_tagger', # For part-of-speech tagging if used (TextBlob might use this internally)
        'wordnet', # For lemmatization
        'punkt_tab' # Explicitly added based on the error
    ]

    for resource in nltk_resources:
        try:
            # nltk.data.find will raise LookupError if resource is not found.
            # The path format varies, but nltk.download() handles it correctly.
            nltk.data.find(f'tokenizers/{resource}' if 'punkt' in resource else f'corpora/{resource}' if resource != 'averaged_perceptron_tagger' else f'taggers/{resource}')
            logger.info(f"NLTK resource '{resource}' found locally.")
        except LookupError: # Corrected exception type to catch the NLTK error
            logger.warning(f"NLTK resource '{resource}' not found, downloading now...")
            try:
                nltk.download(resource, quiet=True)
                logger.info(f"NLTK resource '{resource}' downloaded successfully.")
            except Exception as e:
                logger.error(f"Failed to download NLTK resource '{resource}': {e}")
                # If a critical resource fails to download, re-raise to prevent the app from starting
                if resource in ['punkt', 'punkt_tab', 'stopwords', 'wordnet']:
                    raise
        except Exception as e:
            logger.error(f"An unexpected error occurred while checking NLTK resource '{resource}': {e}")
            raise # Re-raise for any other unexpected errors during NLTK data check

    # Summarization Model (BART)
    try:
        summarizer = pipeline("summarization", model="facebook/bart-large-cnn", device=device)
        logger.info("BART summarization model loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load BART model: {e}")
        raise # Critical model, re-raise if it fails

    # Sentiment Analysis Model
    try:
        sentiment_tokenizer = AutoTokenizer.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment-latest")
        sentiment_model = AutoModelForSequenceClassification.from_pretrained("cardiffnlp/twitter-roberta-base-sentiment-latest")
        sentiment_classifier = pipeline(
            "sentiment-analysis",
            model=sentiment_model,
            tokenizer=sentiment_tokenizer,
            device=device
        )
        logger.info("Sentiment analysis model loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load sentiment model: {e}")
        raise # Critical model, re-raise if it fails

    # NLTK setup for keywords/themes
    try:
        nltk_stopwords = set(stopwords.words('english'))
        lemmatizer = WordNetLemmatizer()
        logger.info("NLTK components initialized.")
    except Exception as e:
        logger.error(f"Failed to initialize NLTK components: {e}")
        raise # Re-raise if essential NLTK components cannot be set up

# --- Helper Functions (unchanged from previous version) ---

def preprocess_text(text):
    """Cleans and tokenizes text for keyword/theme extraction."""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text) # Remove punctuation and special characters
    tokens = word_tokenize(text)
    # Ensure nltk_stopwords and lemmatizer are loaded
    if nltk_stopwords and lemmatizer:
        tokens = [lemmatizer.lemmatize(word) for word in tokens if word not in nltk_stopwords and len(word) > 2]
    else:
        logger.warning("NLTK components not loaded, skipping stopword removal and lemmatization.")
        tokens = [word for word in tokens if len(word) > 2]
    return " ".join(tokens)

def get_summary(text):
    """Generates a summary using the BART model."""
    if not summarizer:
        logger.error("Summarization model not loaded.")
        return "Summarization service unavailable."
    try:
        summary_output = summarizer(
            text,
            max_length=150,
            min_length=50,
            do_sample=False,
            truncation=True # Important for handling inputs longer than model's max length
        )
        return summary_output[0]['summary_text']
    except Exception as e:
        logger.error(f"Error during summarization: {e}")
        return "Error generating summary."

def get_sentiment_breakdown(comments_list):
    """Analyzes sentiment for each comment and provides a breakdown."""
    if not sentiment_classifier:
        logger.error("Sentiment analysis model not loaded.")
        return {"error": "Sentiment analysis service unavailable."}
    sentiments = []
    try:
        for comment in comments_list:
            result = sentiment_classifier(comment)[0]
            sentiments.append(result['label'])

        sentiment_counts = Counter(sentiments)
        total_comments = len(comments_list)
        breakdown = {label: count / total_comments * 100 for label, count in sentiment_counts.items()}
        return breakdown
    except Exception as e:
        logger.error(f"Error during sentiment analysis: {e}")
        return {"error": "Error performing sentiment analysis."}

def get_key_themes(text, num_themes=5):
    """Extracts key themes using TF-IDF."""
    if not text.strip():
        return []
    try:
        vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
        tfidf_matrix = vectorizer.fit_transform([text])
        feature_names = vectorizer.get_feature_names_out()
        
        tfidf_scores = tfidf_matrix.sum(axis=0).A1
        sorted_indices = tfidf_scores.argsort()[::-1]
        
        themes = []
        for i in sorted_indices[:num_themes]:
            themes.append(feature_names[i])
        return [theme.replace('_', ' ') for theme in themes] # Clean up n-gram names
    except Exception as e:
        logger.error(f"Error extracting key themes: {e}")
        return []

def get_frequent_keywords(text, num_keywords=10):
    """Extracts frequent keywords using TextBlob noun phrases and frequency."""
    if not text.strip():
        return []
    try:
        blob = TextBlob(text)
        
        noun_phrases = [str(phrase) for phrase in blob.noun_phrases]
        
        words = preprocess_text(text).split() # Use preprocessed text for word freq
        word_freq = Counter(words)
        
        combined_keywords = set(noun_phrases)
        
        for word, freq in word_freq.most_common(num_keywords * 2):
            # Check if the word is already part of a multi-word noun phrase
            is_subword_of_phrase = False
            for phrase in combined_keywords:
                if word in phrase.split(): # Simple check
                    is_subword_of_phrase = True
                    break
            if not is_subword_of_phrase and word not in combined_keywords:
                combined_keywords.add(word)
            
            if len(combined_keywords) >= num_keywords:
                break
                
        # Filter out very generic terms that might slip through
        final_keywords = [kw for kw in list(combined_keywords)[:num_keywords] if kw not in ['product', 'unit', 'thing', 'issue', 'use']] 
        return final_keywords
    except Exception as e:
        logger.error(f"Error extracting frequent keywords: {e}")
        return []


# --- API Endpoint (unchanged from previous version) ---

@app.route('/analyze_comments', methods=['POST'])
def analyze_comments_endpoint():
    """
    API endpoint to analyze a list of comments.
    Expects a JSON payload with a 'comments' key,
    where 'comments' is a list of strings.
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    comments = data.get('comments')

    if not comments or not isinstance(comments, list) or not all(isinstance(c, str) for c in comments):
        return jsonify({"error": "Invalid input: 'comments' must be a list of strings"}), 400

    if not comments:
        return jsonify({"error": "No comments provided for analysis."}), 400

    # Concatenate all comments for holistic summary, theme, and keyword analysis
    full_comments_text = "\n".join(comments)

    # Preprocess text once for keyword and theme extraction
    full_preprocessed_text = preprocess_text(full_comments_text)

    # Perform analysis
    summary = get_summary(full_comments_text)
    sentiment_breakdown = get_sentiment_breakdown(comments)
    key_themes = get_key_themes(full_preprocessed_text)
    frequent_keywords = get_frequent_keywords(full_comments_text) # Use original for TextBlob noun phrases

    response_data = {
        "summary": summary,
        "sentiment_breakdown": sentiment_breakdown,
        "key_themes": key_themes,
        "frequent_keywords": frequent_keywords
    }
    
    return jsonify(response_data), 200

# --- Health Check Endpoint (unchanged from previous version) ---
@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint to verify the server is running."""
    return jsonify({"status": "healthy", "models_loaded": summarizer is not None and sentiment_classifier is not None}), 200

# --- Default Endpoint ---
@app.route('/', methods=['GET'])
def default_endpoint():
    return jsonify({"status": "ok", "message": "Comment Summarizer App running"}), 200

# --- Run the Flask App ---
if __name__ == '__main__':
    # Load models when the application starts
    load_nlp_models()
    # Run Flask app (host='0.0.0.0' makes it accessible externally, e.g., in a Docker container)
    app.run(host='0.0.0.0', port=5001, debug=True, threaded=True) # Set debug=False for production
