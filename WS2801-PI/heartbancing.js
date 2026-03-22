const LedController = require('ws2801-pi').default;

const width = 18;  // Number of LEDs in width
const height = 8;  // Number of LEDs in height
const amountOfLedsOnStrip = width * height;

const ledController = new LedController(amountOfLedsOnStrip);

async function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Corrected index mapping for zigzag LED layout
function getIndex(x, y) {
  if (y % 2 === 0) {
    return y * width + x;  // Even row: left to right
  } else {
    return y * width + (width - 1 - x);  // Odd row: right to left
  }
}

// Background colors
const backgroundColors = [
  { red: 0, green: 0, blue: 20 },
  { red: 0, green: 20, blue: 0 },
  { red: 20, green: 0, blue: 0 },
  { red: 10, green: 10, blue: 10 },
];

// Larger heart shape (~8x6 pixels)
const heartPixels = [
  [2, 0], [3, 0], [4, 0], [5, 0],  
  [1, 1], [6, 1],  
  [0, 2], [7, 2],  
  [1, 3], [6, 3],  
  [2, 4], [5, 4],  
  [3, 5], [4, 5]  
];

async function animateBouncingHeart() {
  let heartColor = { red: 255, green: 0, blue: 0 }; // Red heart
  let bgIndex = 0;

  let x = 4, y = 1;  // Heart starting position
  let dx = 1, dy = 1; // Heart direction

  while (true) {
    // Cycle through background colors faster
    let bgColor = backgroundColors[bgIndex % backgroundColors.length];
    ledController.fillLeds(bgColor);
    
    // Draw the heart shape
    for (let [hx, hy] of heartPixels) {
      let px = x + hx;
      let py = y + hy;
      
      if (px < width && py < height) {
        ledController.setLed(getIndex(px, py), heartColor);
      }
    }

    // Show the frame
    ledController.show();

    // Bounce logic
    if (x + dx < 0 || x + 8 + dx > width) dx = -dx;
    if (y + dy < 0 || y + 6 + dy > height) dy = -dy;

    x += dx;
    y += dy;

    // Faster background change
    bgIndex = (bgIndex + 1) % backgroundColors.length;

    await wait(100); // Slow-motion effect
  }
}

animateBouncingHeart();

