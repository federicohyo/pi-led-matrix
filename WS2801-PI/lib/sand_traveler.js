const LedController = require("ws2801-pi").default;
const width = 18, height = 8, ledController = new LedController(width * height);

async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function getIndex(x, y) { return y % 2 === 0 ? y * width + x : y * width + (width - 1 - x); }

const maxCities = 8;  // Number of "cities" that move and leave trails
const travelersPerCity = 4; // Number of travelers per city
const cities = []; // Store cities
const travelers = []; // Store their movements

// Generate a random color
function randomColor() {
  return { red: Math.floor(Math.random() * 255), green: Math.floor(Math.random() * 255), blue: Math.floor(Math.random() * 255) };
}

// Initialize cities at random positions
function initializeCities() {
  cities.length = 0;
  for (let i = 0; i < maxCities; i++) {
    cities.push({
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height),
      color: randomColor(),
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2
    });
  }
}

// Create travelers that move between cities
function initializeTravelers() {
  travelers.length = 0;
  for (let city of cities) {
    for (let i = 0; i < travelersPerCity; i++) {
      travelers.push({
        x: city.x,
        y: city.y,
        targetCity: Math.floor(Math.random() * maxCities),
        progress: 0,
        color: city.color
      });
    }
  }
}

// Move cities slightly over time
function updateCities() {
  for (let city of cities) {
    city.x = Math.max(0, Math.min(width - 1, city.x + city.vx));
    city.y = Math.max(0, Math.min(height - 1, city.y + city.vy));
    if (Math.random() < 0.1) {
      city.vx = (Math.random() - 0.5) * 2;
      city.vy = (Math.random() - 0.5) * 2;
    }
  }
}

// Move travelers toward their destination city
function updateTravelers() {
  for (let traveler of travelers) {
    let target = cities[traveler.targetCity];

    traveler.x += (target.x - traveler.x) * 0.1;
    traveler.y += (target.y - traveler.y) * 0.1;

    traveler.progress += 0.02;
    if (traveler.progress >= 1) {
      traveler.targetCity = Math.floor(Math.random() * maxCities);
      traveler.progress = 0;
    }
  }
}

// Render the scene
async function render() {
  while (true) {
    ledController.fillLeds({ red: 0, green: 0, blue: 0 });

    // Draw travelers leaving faint trails
    for (let traveler of travelers) {
      let x = Math.round(traveler.x);
      let y = Math.round(traveler.y);
      if (x >= 0 && y >= 0 && x < width && y < height) {
        ledController.setLed(getIndex(x, y), {
          red: traveler.color.red / 2,
          green: traveler.color.green / 2,
          blue: traveler.color.blue / 2
        });
      }
    }

    // Draw cities
    for (let city of cities) {
      ledController.setLed(getIndex(city.x, city.y), city.color);
    }

    ledController.show();
    updateCities();
    updateTravelers();
    await wait(200);
  }
}

// Start simulation
initializeCities();
initializeTravelers();
render();

