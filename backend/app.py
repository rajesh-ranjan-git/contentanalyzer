from quart import Quart, jsonify
from quart_cors import cors

#--- Routes ---
from commentsSummarizer.routes import comments_summarizer
from competitiveContentAnalyzer.routes import competitive_content_analyzer

# Initialize Quart app
app = Quart(__name__)
app = cors(app)  # Enable CORS

# Register blueprints
app.register_blueprint(comments_summarizer, url_prefix="/comments-summarizer")
app.register_blueprint(competitive_content_analyzer, url_prefix="/competitive-content-analyzer")

# Default async endpoint
@app.route('/', methods=['GET'])
async def default_endpoint():
    return jsonify({"status": "ok", "message": "Content Analyzer and Comment Summarizer App running"})

# Entry point for uvicorn
asgi_app = app  # already ASGI-compliant
