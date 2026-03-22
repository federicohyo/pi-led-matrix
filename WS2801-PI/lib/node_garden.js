const LedController = require("ws2801-pi").default;
const width = 18, height = 8, ledController = new LedController(width * height);

async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function getIndex(x, y) { return y % 2 === 0 ? y * width + x : y * width + (width - 1 - x); }

const maxNodes = 50;  // Max number of nodes
const maxConnections = 2; // Max connections per node
const nodes = []; // Store nodes
const connections = {}; // Store connections

// Generate a random color
function randomColor() {
  return { red: Math.floor(Math.random() * 255), green: Math.floor(Math.random() * 255), blue: Math.floor(Math.random() * 255) };
}

// Initialize nodes randomly across the matrix
function initializeNodes() {
  nodes.length = 0;
  for (let i = 0; i < maxNodes; i++) {
    nodes.push({
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height),
      color: randomColor(),
      connections: []
    });
  }
}

// Find nearest nodes and create connections
function createConnections() {
  for (let i = 0; i < nodes.length; i++) {
    connections[i] = [];
    let distances = nodes
      .map((node, index) => ({
        index,
        distance: Math.hypot(nodes[i].x - node.x, nodes[i].y - node.y)
      }))
      .sort((a, b) => a.distance - b.distance);

    // Connect to the closest nodes
    for (let j = 1; j <= maxConnections; j++) {
      if (distances[j]) {
        connections[i].push(distances[j].index);
      }
    }
  }
}

// Draw nodes and their connections
async function drawNodeGarden() {
  while (true) {
    ledController.fillLeds({ red: 0, green: 0, blue: 0 });

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j of connections[i]) {
        let x1 = nodes[i].x, y1 = nodes[i].y;
        let x2 = nodes[j].x, y2 = nodes[j].y;

        // Draw connection with intermediate points
        let steps = 5;
        for (let s = 0; s <= steps; s++) {
          let px = Math.round(x1 + (x2 - x1) * (s / steps));
          let py = Math.round(y1 + (y2 - y1) * (s / steps));

          if (px >= 0 && py >= 0 && px < width && py < height) {
            ledController.setLed(getIndex(px, py), { red: 100, green: 100, blue: 100 });
          }
        }
      }
    }

    // Draw nodes
    for (let node of nodes) {
      ledController.setLed(getIndex(node.x, node.y), node.color);
    }

    ledController.show();
    await wait(500);
  }
}

// Start simulation
initializeNodes();
createConnections();
drawNodeGarden();

