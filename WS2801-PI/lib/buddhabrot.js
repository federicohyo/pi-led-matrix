const LedController = require("ws2801-pi").default;
const width = 18, height = 8, ledController = new LedController(width * height);

async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function getIndex(x, y) { return y % 2 === 0 ? y * width + x : y * width + (width - 1 - x); }

const bailout = 200;  // Number of iterations before bail
const plots = 10;    // Number of random points plotted per frame
let exposure = Array(width * height).fill(0);
let maxExposure = 0;

// Converts exposure values into LED brightness
function getColor(value) {
  let intensity = Math.min(255, Math.floor((value / maxExposure) * 255));
  return { red: intensity, green: intensity, blue: intensity };
}

// Mandelbrot escape function
function iterate(x0, y0, drawIt) {
  let x = 0, y = 0, xNew, yNew;

  for (let i = 0; i < bailout; i++) {
    xNew = x * x - y * y + x0;
    yNew = 2 * x * y + y0;

    if (drawIt && i > 3) {
      let px = Math.floor((xNew + 2.0) / 3.0 * width);
      let py = Math.floor((yNew + 1.5) / 3.0 * height);

      if (px >= 0 && py >= 0 && px < width && py < height) {
        exposure[getIndex(px, py)]++;
        maxExposure = Math.max(maxExposure, exposure[getIndex(px, py)]);
      }
    }

    if (xNew * xNew + yNew * yNew > 4) return true;
    x = xNew;
    y = yNew;
  }
  return false;
}

// Main plotting function
async function renderBuddhabrot() {
  while (true) {
    for (let n = 0; n < plots; n++) {
      let x = Math.random() * 3.0 - 2.0;
      let y = Math.random() * 3.0 - 1.5;
      if (iterate(x, y, false)) iterate(x, y, true);
    }

    // Update LED matrix based on exposure
    ledController.fillLeds({ red: 0, green: 0, blue: 0 });
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        let color = getColor(exposure[getIndex(i, j)]);
        ledController.setLed(getIndex(i, j), color);
      }
    }

    ledController.show();
    await wait(100);
  }
}

renderBuddhabrot();

