const LedController = require("ws2801-pi").default;
const width = 18, height = 8, ledController = new LedController(width * height);

async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function getIndex(x, y) { return y % 2 === 0 ? y * width + x : y * width + (width - 1 - x); }

// Colors: current attractor points (bright) and past points (dimmed)
const attractorColor = { red: 150, green: 120, blue: 50 };  // Bright orange
const fadeColor = { red: 80, green: 40, blue: 255 };         // Dimmed brownish-red

const a = 1.4, b = 0.3;  // Standard Hénon map parameters
const maxParticles = 50; // Number of simultaneous moving points
const particles = new Array(maxParticles).fill().map(() => ({ x: Math.random(), y: Math.random() }));

// Store the last drawn points to fade them later
let lastDrawnPoints = [];

function henonStep(particle) {
  const newX = 1 - a * particle.x * particle.x + particle.y;
  const newY = b * particle.x;
  particle.x = newX;
  particle.y = newY;
}

async function drawHenonMap() {
  while (true) {
    // Fade old points
    for (let [px, py] of lastDrawnPoints) {
      if (px >= 0 && px < width && py >= 0 && py < height) {
        ledController.setLed(getIndex(px, py), fadeColor);
      }
    }

    // Clear last drawn points and prepare for the new iteration
    lastDrawnPoints = [];

    for (let i = 0; i < maxParticles; i++) {
      henonStep(particles[i]);

      // Scale attractor coordinates to LED matrix space
      let px = Math.floor(((particles[i].x + 1.5) / 3) * width);
      let py = Math.floor(((particles[i].y + 0.5) / 1) * height);

      if (px >= 0 && px < width && py >= 0 && py < height) {
        ledController.setLed(getIndex(px, py), attractorColor);
        lastDrawnPoints.push([px, py]);  // Store new points to fade next frame
      }
    }

    ledController.show();
    await wait(100);
  }
}

drawHenonMap();

