# Pi LED Matrix

AI-powered LED matrix controller for a Raspberry Pi with an 18x8 WS2801 LED strip wired in a zigzag pattern.

Describe an animation in plain text, and OpenAI generates the Node.js code to run it on the LED matrix in real time.

## Architecture

```
[React UI] --prompt--> [OpenAI API] --JS code--> [Flask Server on Pi] --SPI--> [WS2801 LED Strip]
```

- **led-control-ui/** — React frontend where you type animation descriptions (e.g. "bouncing heart", "rainbow wave"). Calls OpenAI to generate executable Node.js LED code, then POSTs it to the Flask server.
- **WS2801-PI/** — Raspberry Pi backend:
  - `led_server.py` — Flask server (port 5000) that receives generated JS code, saves it, and executes it via Node.js
  - `led_server_ubuntu.py` — Alternative server variant that delegates AI generation to a separate Ubuntu machine
  - `run_led_matrix.sh` — Screensaver mode: randomly cycles through animation presets every 30 seconds
  - `led_script.js` — The currently running animation (overwritten on each request)
  - `lib/` — 15 generative art animation presets

## Hardware

- Raspberry Pi (any model with SPI)
- WS2801 LED strip, 144 LEDs (18 wide x 8 tall), zigzag wiring
- SPI connection (MOSI + SCLK)

## Animation Presets

The `WS2801-PI/lib/` directory contains presets that run in screensaver mode:

| Animation | Description |
|-----------|-------------|
| Barnsley Fern | Fractal fern rendered iteratively |
| Mandelbrot | Mandelbrot set zoom |
| Julia Set | Julia set fractal |
| Buddhabrot | Buddhabrot rendering |
| Henon | Henon map attractor |
| Henon Phase | Henon phase-space visualization |
| Sierpinski Triangle | Sierpinski fractal |
| Binary Ring | Binary ring pattern |
| Node Garden | Connected node network |
| Orbitalis | Orbital mechanics simulation |
| Intersecting Circles | Overlapping circle patterns |
| Robotic Colony | Swarm behavior simulation |
| Sand Traveler | Sand particle physics |
| Substrate | Crystal growth simulation |
| Adaptation | Adaptive pattern generation |

## Setup

### Raspberry Pi

```bash
# Install the WS2801 C driver
cd rpi_ws281x
mkdir build && cd build
cmake .. && make
sudo make install

# Install Node.js dependencies
cd ~/led/WS2801-PI
npm install

# Install Python dependencies
pip install flask flask-cors

# Start the LED server
python3 led_server.py

# Or enable screensaver mode
bash run_led_matrix.sh
```

### React Frontend

```bash
cd led-control-ui
cp .env.example .env.local
# Edit .env.local and add your OpenAI API key
npm install
npm start
```

The UI runs on port 3000 by default.

### Systemd Service (auto-start on boot)

Create `/etc/systemd/system/led_script.service`:

```ini
[Unit]
Description=LED Animation Script
After=network.target

[Service]
ExecStart=/home/pi/led/WS2801-PI/run_led_matrix.sh
WorkingDirectory=/home/pi/led/WS2801-PI
Restart=always
User=pi

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable led_script.service
sudo systemctl start led_script.service
```

### Crontab (on the Pi)

```cron
@reboot cd /home/pi/led/led-control-ui && npm start -- --host 0.0.0.0
@reboot cd /home/pi/led/WS2801-PI && python3 led_server.py
```

## LED Addressing

The strip uses a zigzag layout:

```
Row 0 (even): left -> right  [0,  1,  2,  ... 17]
Row 1 (odd):  right -> left  [35, 34, 33, ... 18]
Row 2 (even): left -> right  [36, 37, 38, ... 53]
...
```

Index mapping:
```javascript
function getIndex(x, y) {
  return y % 2 === 0 ? y * width + x : y * width + (width - 1 - x);
}
```

## License

WS2801-PI library by [Steffen Knaup](https://github.com/SteffenKn/WS2801-PI) — MIT License.
