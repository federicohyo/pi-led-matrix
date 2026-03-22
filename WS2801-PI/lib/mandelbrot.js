const LedController = require("ws2801-pi").default;
const width = 18, height = 8, ledController = new LedController(width * height);

async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function getIndex(x, y) { return y % 2 === 0 ? y * width + x : y * width + (width - 1 - x); }

// Mandelbrot set parameters
const maxIterations = 30;
const xMin = -2.0, xMax = 1.0;
const yMin = -1.0, yMax = 1.0;

// Map a value from one range to another
function map(value, inMin, inMax, outMin, outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

// Compute Mandelbrot iteration count for a given coordinate
function mandelbrot(cReal, cImag) {
  let zReal = 0, zImag = 0;
  let iteration = 0;
  while (zReal * zReal + zImag * zImag <= 4 && iteration < maxIterations) {
    let tempReal = zReal * zReal - zImag * zImag + cReal;
    zImag = 2 * zReal * zImag + cImag;
    zReal = tempReal;
    iteration++;
  }
  return iteration;
}

// Generate fractal and display it on the LED matrix
async function generateMandelbrot() {
  while (true) {
    ledController.fillLeds({ red: 0, green: 0, blue: 0 });

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cReal = map(x, 0, width, xMin, xMax);
        const cImag = map(y, 0, height, yMin, yMax);
        const iter = mandelbrot(cReal, cImag);

        // Map iteration count to color
        let color = {
          red: Math.floor((iter / maxIterations) * 255),
          green: Math.floor((Math.sin(iter / maxIterations * Math.PI) * 255)),
          blue: Math.floor((Math.cos(iter / maxIterations * Math.PI) * 255))
        };

        ledController.setLed(getIndex(x, y), color);
      }
    }

    ledController.show();
    await wait(2000); // Refresh every 2 seconds
  }
}

// Start Mandelbrot fractal animation
generateMandelbrot();

