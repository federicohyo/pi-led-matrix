from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import subprocess
import os

app = Flask(__name__)
CORS(app)

AI_SERVER_URL = "http://192.168.1.231:5000/generate"  # Replace with Ubuntu IP

LED_SCRIPT_PATH = "led_script.js"

@app.route('/led', methods=['POST'])
def update_led():
    data = request.json
    prompt = data.get("prompt", "")

    if not prompt:
        return jsonify({"status": "error", "message": "No prompt provided"}), 400

    # Send request to AI server (Ubuntu machine)
    print(f"📡 Requesting AI-generated code for: {prompt}")
    try:
        ai_response = requests.post(AI_SERVER_URL, json={"prompt": prompt})
        ai_data = ai_response.json()

        if ai_response.status_code != 200 or "code" not in ai_data:
            return jsonify({"status": "error", "message": "AI Server Error"}), 500

        generated_code = ai_data["code"]
    except Exception as e:
        print(f"❌ Error contacting AI server: {str(e)}")
        return jsonify({"status": "error", "message": "Failed to contact AI server"}), 500

    # Save generated code to file
    with open(LED_SCRIPT_PATH, "w") as f:
        f.write(generated_code)

    # Kill any previous script
    os.system("pkill -f led_script.js")

    # Execute the new script
    subprocess.Popen(["node", LED_SCRIPT_PATH], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    return jsonify({"status": "success", "message": "LED script updated and running"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

