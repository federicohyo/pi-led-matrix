const LedController = require("ws2801-pi").default;
const width = 18, height = 8, ledController = new LedController(width * height);

async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function getIndex(x, y) { return y % 2 === 0 ? y * width + x : y * width + (width - 1 - x); }

const maxPopulation = 50, maxChildren = 4, maxAge = 250;
let globalDate = 0;
const bots = [];

// Color palette for different bot generations
const colors = [
  { red: 255, green: 55, blue: 255 },  // First generation (red)
  { red: 100, green: 10, blue: 155 },  // Second generation (green)
  { red: 100, green: 255, blue: 255 },  // Third generation (blue)
  { red: 255, green: 255, blue: 100 },  // Fourth+ (yellow)
];

// Bot class
class Bot {
  constructor(id, mother, father, generation) {
    this.id = id;
    this.mother = mother;
    this.father = father;
    this.generation = generation;
    this.age = 0;
    this.children = 0;
    this.alive = true;
    this.x = Math.floor(Math.random() * width);
    this.y = Math.floor(Math.random() * height);
    this.color = colors[Math.min(this.generation, colors.length - 1)];
  }

  move() {
    if (!this.alive) return;

    // Random movement with slight attraction to mates
    this.x = Math.max(0, Math.min(width - 1, this.x + Math.floor(Math.random() * 3) - 1));
    this.y = Math.max(0, Math.min(height - 1, this.y + Math.floor(Math.random() * 3) - 1));

    // Reproduction chance
    if (this.age > 10 && this.children < maxChildren && Math.random() > 0.95 && bots.length < maxPopulation) {
      bots.push(new Bot(bots.length, this.id, this.id, this.generation + 1));
      this.children++;
    }

    // Aging and possible death
    this.age++;
    if (this.age > maxAge) {
      this.alive = false;
    }
  }
}

function initializeColony() {
  for (let i = 0; i < 5; i++) {
    bots.push(new Bot(i, -1, -1, 0));  // Initial population
  }
}

async function animateColony() {
  initializeColony();
  while (true) {
    ledController.fillLeds({ red: 0, green: 0, blue: 0 }); // Clear display

    bots.forEach((bot) => {
      if (bot.alive) {
        bot.move();
        ledController.setLed(getIndex(bot.x, bot.y), bot.color);
      }
    });

    ledController.show();
    globalDate++;
    await wait(200);
  }
}

animateColony();

