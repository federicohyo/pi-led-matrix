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

async function animateBouncingBall() {
  let ballColor = { red: 255, green: 0, blue: 0 };
  let bgIndex = 0;

  let x = 5, y = 2;  // Ball starting position
  let dx = 1, dy = 1; // Ball direction

  while (true) {
    // Cycle through background colors faster
    let bgColor = backgroundColors[bgIndex % backgroundColors.length];
    ledController.fillLeds(bgColor);
    
    // Draw the 3x3 ball
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let px = x + i;
        let py = y + j;
        
        if (px < width && py < height) {
          ledController.setLed(getIndex(px, py), ballColor);
        }
      }
    }

    // Show the frame
    ledController.show();

    // Bounce logic
    if (x + dx < 0 || x + 3 + dx > width) dx = -dx;
    if (y + dy < 0 || y + 3 + dy > height) dy = -dy;

    x += dx;
    y += dy;

    // Faster background change
    bgIndex = (bgIndex + 1) % backgroundColors.length;

    await wait(100); // Slow-motion effect
  }
}

animateBouncingBall();

