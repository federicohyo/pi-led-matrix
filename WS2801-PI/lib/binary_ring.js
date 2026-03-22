const LedController = require("ws2801-pi").default;
const width = 18, height = 8, ledController = new LedController(width * height);

async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function getIndex(x, y) { return y % 2 === 0 ? y * width + x : y * width + (width - 1 - x); }

const numParticles = 50;
let blackout = false;
let particles = [];

class Particle {
  constructor(angle) {
    this.ox = Math.floor(width / 2);  // Origin X
    this.oy = Math.floor(height / 2); // Origin Y
    this.x = this.ox + Math.floor(4 * Math.sin(angle));  // Initial position
    this.y = this.oy + Math.floor(4 * Math.cos(angle));
    this.vx = 2 * Math.cos(angle);  // Velocity X
    this.vy = 2 * Math.sin(angle);  // Velocity Y
    this.age = Math.floor(Math.random() * 200);
    this.color = blackout ? { red: 0, green: 0, blue: 0 } : { red: 255, green: 255, blue: 255 };
  }

  move() {
    let prevX = this.x, prevY = this.y;
    this.x = Math.max(0, Math.min(width - 1, this.x + Math.floor(this.vx)));
    this.y = Math.max(0, Math.min(height - 1, this.y + Math.floor(this.vy)));

    this.vx += (Math.random() - 0.5) * 0.1;
    this.vy += (Math.random() - 0.5) * 0.1;

    // Draw particle as a moving point
    ledController.setLed(getIndex(prevX, prevY), { red: 0, green: 0, blue: 0 });  // Clear previous position
    ledController.setLed(getIndex(this.x, this.y), this.color);

    this.age++;
    if (this.age > 200) {
      this.reset();  // Reset when too old
    }
  }

  reset() {
    let angle = Math.random() * Math.PI * 2;
    this.x = this.ox + Math.floor(4 * Math.sin(angle));
    this.y = this.oy + Math.floor(4 * Math.cos(angle));
    this.vx = 0;
    this.vy = 0;
    this.age = 0;
    this.color = blackout ? { red: 0, green: 0, blue: 0 } : { red: 255, green: 255, blue: 255 };
  }
}

function initializeParticles() {
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    let angle = (i / numParticles) * (Math.PI * 2);
    particles.push(new Particle(angle));
  }
}

async function animateRing() {
  initializeParticles();
  while (true) {
    ledController.fillLeds({ red: 0, green: 0, blue: 0 }); // Clear display

    particles.forEach((particle) => particle.move());

    ledController.show();

    // Randomly switch blackout mode
    if (Math.random() > 0.995) {
      blackout = !blackout;
      particles.forEach(p => p.color = blackout ? { red: 0, green: 0, blue: 0 } : { red: 255, green: 255, blue: 255 });
    }

    await wait(100);
  }
}

animateRing();

