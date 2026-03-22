from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)
CORS(app)

LED_SCRIPT_PATH = "led_script.js"

@app.route('/led', methods=['POST'])
def update_led():
    try:
        data = request.get_json(force=True)  # Force parsing JSON
        print(f"📡 Received Request: {data}")  # Debugging log

        if not data or "code" not in data:
            print("❌ Error: No valid 'code' field in request!")
            return jsonify({"status": "error", "message": "No valid 'code' field in request"}), 400

        generated_code = data["code"]

        # Save generated code to file
        with open(LED_SCRIPT_PATH, "w") as f:
            f.write(generated_code)

        # Kill any previous script
        os.system("pkill -f led_script.js")
        

        # Execute the new script
        subprocess.Popen(["node", LED_SCRIPT_PATH], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        return jsonify({"status": "success", "message": "LED script updated and running"}), 200
    except Exception as e:
        print(f"🔥 Flask Error: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

