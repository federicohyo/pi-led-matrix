const LedController = require("ws2801-pi").default;
const width = 18, height = 8, ledController = new LedController(width * height);

async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function getIndex(x, y) { return y % 2 === 0 ? y * width + x : y * width + (width - 1 - x); }

async function animateRainbowWave() {
  let offset = 0;
  while (true) {
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        const hue = ((i * 360 / width + j * 360 / height + offset) % 360) / 360;
        const rgb = hsvToRgb(hue, 1, 1);
        ledController.setLed(getIndex(i, j), { red: rgb[0], green: rgb[1], blue: rgb[2] });
      }
    }
    ledController.show();
    offset = (offset + 1) % 360;
    await wait(50);
  }
}

function hsvToRgb(h, s, v) {
  let r, g, b, i, f, p, q, t;
  i = Math.floor(6 * h);
  f = 6 * h - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  return [Math.round(255 * r), Math.round(255 * g), Math.round(255 * b)];
}

animateRainbowWave();