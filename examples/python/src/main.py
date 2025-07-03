import os
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, jsonify
from hiphops_hook import license, HookError

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)


@app.route("/health")
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
    })


@app.route("/license")
def get_license():
    """License information endpoint"""
    try:
        license_info = license()
        return jsonify(license_info)
    except HookError as e:
        app.logger.error(f"Hook error: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
        }), 500
    except Exception as e:
        app.logger.error(f"Unexpected error: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
        }), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 3000))
    license_token_configured = bool(os.getenv("LICENSE_TOKEN"))
    
    print(f"🚀 Hook Python Example running on port {port}")
    print(f"🔑 License token configured: {license_token_configured}")
    
    app.run(host="0.0.0.0", port=port, debug=True)