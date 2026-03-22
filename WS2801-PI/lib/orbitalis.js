const LedController = require("ws2801-pi").default;
const width = 18, height = 8, ledController = new LedController(width * height);

async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function getIndex(x, y) { return y % 2 === 0 ? y * width + x : y * width + (width - 1 - x); }

// Number of orbiting objects
const numOrbitals = 10;
const orbitals = [];

// Generate a random color
function randomColor() {
  return { red: Math.floor(Math.random() * 255), green: Math.floor(Math.random() * 255), blue: Math.floor(Math.random() * 255) };
}

// Orbital class to represent moving points
class Orbital {
  constructor(id, parentId) {
    this.id = id;
    this.parentId = parentId;
    this.x = Math.floor(Math.random() * width);
    this.y = Math.floor(Math.random() * height);
    this.radius = parentId === id ? 0 : Math.random() * 3 + 1; // Orbital radius
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 0.1 + 0.02; // Speed of orbit
    this.color = randomColor();
  }

  update() {
    if (this.parentId !== this.id) {
      const parent = orbitals[this.parentId];
      this.angle += this.speed;
      this.x = Math.round(parent.x + this.radius * Math.cos(this.angle));
      this.y = Math.round(parent.y + this.radius * Math.sin(this.angle));
    }
  }
}

// Initialize orbitals
function initializeOrbitals() {
  orbitals.length = 0;
  for (let i = 0; i < numOrbitals; i++) {
    let parentId = i === 0 ? 0 : Math.floor(Math.random() * i); // Assign parent for orbiting
    orbitals.push(new Orbital(i, parentId));
  }
}

// Render orbitals
async function render() {
  while (true) {
    ledController.fillLeds({ red: 0, green: 0, blue: 0 });

    for (let orbital of orbitals) {
      orbital.update();
      if (orbital.x >= 0 && orbital.x < width && orbital.y >= 0 && orbital.y < height) {
        ledController.setLed(getIndex(orbital.x, orbital.y), orbital.color);
      }
    }

    ledController.show();
    await wait(100);
  }
}

// Start simulation
initializeOrbitals();
render();

