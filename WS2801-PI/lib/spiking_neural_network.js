const LedController = require("ws2801-pi").default;
const width = 18, height = 8, ledController = new LedController(width * height);

async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function getIndex(x, y) { return y % 2 === 0 ? y * width + x : y * width + (width - 1 - x); }

// Spiking neural network parameters
const NUM_NEURONS = 24;
const SPIKE_THRESHOLD = 1.0;
const DECAY_RATE = 0.95;
const REFRACTORY_PERIOD = 8;
const SPONTANEOUS_RATE = 0.015;
const CONNECTION_PROB = 0.15;
const SPIKE_WEIGHT_MIN = 0.2;
const SPIKE_WEIGHT_MAX = 0.5;

// Neurons placed on the 18x8 grid
const neurons = [];
for (let i = 0; i < NUM_NEURONS; i++) {
  const x = 1 + Math.floor(Math.random() * (width - 2));
  const y = Math.floor(Math.random() * height);
  neurons.push({
    x, y,
    potential: 0,
    spiking: false,
    refractoryTimer: 0,
    inhibitory: Math.random() < 0.2,
    connections: [],
    spikeDecay: 0, // visual decay after spike
  });
}

// Create connections with distance-based probability
for (const n1 of neurons) {
  for (const n2 of neurons) {
    if (n1 === n2) continue;
    const dx = n2.x - n1.x;
    const dy = n2.y - n1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const prob = CONNECTION_PROB * Math.max(0, 1 - dist / 14);
    if (Math.random() < prob) {
      n1.connections.push({
        target: n2,
        weight: SPIKE_WEIGHT_MIN + Math.random() * (SPIKE_WEIGHT_MAX - SPIKE_WEIGHT_MIN),
        delay: Math.max(1, Math.floor(dist * 0.5)),
      });
    }
  }
}

// Pending spikes (delayed delivery)
const pendingSpikes = [];

// Pixel brightness buffer (for glow/fade effects)
const pixelR = new Float32Array(width * height);
const pixelG = new Float32Array(width * height);
const pixelB = new Float32Array(width * height);

function addPixel(x, y, r, g, b) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const idx = y * width + x;
  pixelR[idx] = Math.min(255, pixelR[idx] + r);
  pixelG[idx] = Math.min(255, pixelG[idx] + g);
  pixelB[idx] = Math.min(255, pixelB[idx] + b);
}

async function animate() {
  let frame = 0;

  // Initial burst
  for (let i = 0; i < 5; i++) {
    const n = neurons[Math.floor(Math.random() * neurons.length)];
    n.potential = SPIKE_THRESHOLD + 0.3;
  }

  while (true) {
    // Decay pixel buffer (trail/glow fade)
    for (let i = 0; i < pixelR.length; i++) {
      pixelR[i] *= 0.7;
      pixelG[i] *= 0.7;
      pixelB[i] *= 0.7;
    }

    // Deliver pending spikes
    for (let i = pendingSpikes.length - 1; i >= 0; i--) {
      const ps = pendingSpikes[i];
      ps.delay--;
      if (ps.delay <= 0) {
        if (ps.target.refractoryTimer <= 0) {
          ps.target.potential += ps.weight;
        }
        pendingSpikes.splice(i, 1);
      } else {
        // Draw spike traveling along connection
        const t = 1 - (ps.delay / ps.totalDelay);
        const sx = Math.round(ps.sourceX + (ps.target.x - ps.sourceX) * t);
        const sy = Math.round(ps.sourceY + (ps.target.y - ps.sourceY) * t);
        if (ps.inhibitory) {
          addPixel(sx, sy, 60, 10, 10);
        } else {
          addPixel(sx, sy, 10, 60, 30);
        }
      }
    }

    // Update neurons
    for (const n of neurons) {
      if (n.refractoryTimer > 0) {
        n.refractoryTimer--;
        n.potential *= 0.85;
        n.spiking = false;
      } else {
        // Spontaneous activity
        if (Math.random() < SPONTANEOUS_RATE) {
          n.potential += 0.3 + Math.random() * 0.3;
        }

        // Leak
        n.potential *= DECAY_RATE;

        // Spike?
        if (n.potential >= SPIKE_THRESHOLD) {
          n.spiking = true;
          n.spikeDecay = 1.0;
          n.refractoryTimer = REFRACTORY_PERIOD + Math.floor(Math.random() * 4);

          // Propagate
          for (const conn of n.connections) {
            const w = conn.weight * (n.inhibitory ? -0.6 : 1.0);
            pendingSpikes.push({
              target: conn.target,
              weight: w,
              delay: conn.delay,
              totalDelay: conn.delay,
              sourceX: n.x,
              sourceY: n.y,
              inhibitory: n.inhibitory,
            });
          }
        } else {
          n.spiking = false;
        }
      }

      // Decay spike visual
      if (n.spikeDecay > 0) n.spikeDecay *= 0.8;
    }

    // Periodic stimulation wave
    if (frame % 60 === 0) {
      const count = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const n = neurons[Math.floor(Math.random() * neurons.length)];
        n.potential += 0.5 + Math.random() * 0.5;
      }
    }

    // Render neurons to pixel buffer
    for (const n of neurons) {
      const flash = n.spikeDecay;
      const pot = Math.min(1, n.potential / SPIKE_THRESHOLD);

      if (n.inhibitory) {
        // Red neuron
        const r = Math.floor(30 * pot + 225 * flash);
        const g = Math.floor(5 * pot + 20 * flash);
        const b = Math.floor(5 * pot + 20 * flash);
        addPixel(n.x, n.y, r, g, b);
      } else {
        // Green neuron
        const r = Math.floor(10 * flash);
        const g = Math.floor(30 * pot + 225 * flash);
        const b = Math.floor(15 * pot + 80 * flash);
        addPixel(n.x, n.y, r, g, b);
      }

      // Membrane potential glow on neighbors (sub-threshold activity visible)
      if (pot > 0.3) {
        const glow = pot * 0.3;
        const gr = n.inhibitory ? 15 * glow : 0;
        const gg = n.inhibitory ? 0 : 15 * glow;
        const gb = n.inhibitory ? 0 : 8 * glow;
        addPixel(n.x - 1, n.y, gr, gg, gb);
        addPixel(n.x + 1, n.y, gr, gg, gb);
        addPixel(n.x, n.y - 1, gr, gg, gb);
        addPixel(n.x, n.y + 1, gr, gg, gb);
      }
    }

    // Write pixel buffer to LEDs
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        ledController.setLed(getIndex(x, y), {
          red: Math.min(255, Math.floor(pixelR[idx])),
          green: Math.min(255, Math.floor(pixelG[idx])),
          blue: Math.min(255, Math.floor(pixelB[idx])),
        });
      }
    }
    ledController.show();

    frame++;
    await wait(50);
  }
}

animate();
