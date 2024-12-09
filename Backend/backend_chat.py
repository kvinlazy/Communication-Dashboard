from flask import Flask, request, jsonify
import requests
import pandas as pd
import numpy as np
from datetime import datetime
from flask_cors import CORS
import os
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Endpoint for AI Doctor
@app.route('/ask', methods=['POST'])
def ask():
    message = request.json.get('message')
    logger.info(f"Received question: {message}")
    
    API_URL = "https://api-inference.huggingface.co/models/gpt2"
    headers = {"Authorization": f"Bearer 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"}
    
    try:
        response = requests.post(API_URL, headers=headers, json={"inputs": message})
        response.raise_for_status()  # Raise an error for HTTP issues
        result = response.json()
        
        if isinstance(result, list) and len(result) > 0:
            reply = result[0].get("generated_text", "I'm not sure about that.")
        else:
            reply = "Sorry, something went wrong."
    except requests.exceptions.RequestException as e:
        logger.error(f"Error querying Hugging Face API: {e}")
        return jsonify({"reply": f"Error: {str(e)}"}), 500

    return jsonify({"reply": reply})

# Endpoint for metrics data
@app.route('/metrics', methods=['GET'])
def get_metrics():
    logger.info("Generating metrics data...")
    
    today = pd.to_datetime('today')
    dates = pd.date_range(start=today - pd.Timedelta(days=30), end=today)

    data = {
        "Date": dates,
        "Message Volume": np.random.randint(50, 200, len(dates)),
        "Response Time (minutes)": np.random.randint(5, 30, len(dates)),
        "Referrals Processed": np.random.randint(10, 50, len(dates)),
    }
    
    df = pd.DataFrame(data)
    df['Date'] = df['Date'].dt.strftime('%Y-%m-%d')  # Convert dates to strings
    
    return jsonify(df.to_dict(orient="records"))

if __name__ == '__main__':
    app.run(debug=True)
