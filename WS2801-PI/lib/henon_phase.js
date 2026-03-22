const LedController = require("ws2801-pi").default;
const width = 18, height = 8, ledController = new LedController(width * height);

async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function getIndex(x, y) { return y % 2 === 0 ? y * width + x : y * width + (width - 1 - x); }

// Color variations similar to your reference palette
const palette = [
  { red: 255, green: 120, blue: 50 },  // Warm orange
  { red: 200, green: 50, blue: 30 },   // Deep red
  { red: 100, green: 255, blue: 100 }, // Neon green
  { red: 50, green: 100, blue: 255 },  // Cool blue
  { red: 255, green: 200, blue: 0 }    // Bright yellow
];

const fadeColor = { red: 255, green: 50, blue: 50 }; // Dimmed background fade

const a = 1.4, b = 0.3;  // Standard Hénon map parameters
const maxParticles = 150; // Number of simultaneous moving points
const particles = new Array(maxParticles).fill().map(() => ({
  x: Math.random(), 
  y: Math.random(),
  color: palette[Math.floor(Math.random() * palette.length)]
}));

let lastDrawnPoints = [];

function henonStep(particle) {
  const newX = 1 - a * particle.x * particle.x + particle.y;
  const newY = b * particle.x;
  particle.x = newX;
  particle.y = newY;
}

async function drawHenonMap() {
  while (true) {
    // Fade previous points instead of clearing them
    for (let [px, py] of lastDrawnPoints) {
      if (px >= 0 && px < width && py >= 0 && py < height) {
        ledController.setLed(getIndex(px, py), fadeColor);
      }
    }

    lastDrawnPoints = [];

    for (let i = 0; i < maxParticles; i++) {
      henonStep(particles[i]);

      let px = Math.floor(((particles[i].x + 1.5) / 3) * width);
      let py = Math.floor(((particles[i].y + 0.5) / 1) * height);

      if (px >= 0 && px < width && py >= 0 && py < height) {
        ledController.setLed(getIndex(px, py), particles[i].color);
        lastDrawnPoints.push([px, py]);  // Store points for next fade step
      }
    }

    ledController.show();
    await wait(100);
  }
}

drawHenonMap();

