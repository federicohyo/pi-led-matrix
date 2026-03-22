const LedController = require("ws2801-pi").default;
const width = 18, height = 8, amountOfLedsOnStrip = width * height, ledController = new LedController(amountOfLedsOnStrip);
async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function getIndex(x, y) { return y % 2 === 0 ? y * width + x : y * width + (width - 1 - x); }

// Grid to track crack positions
let grid = Array.from({ length: width * height }, () => false);

// Crack colors
const crackColor = { red: 0, green: 0, blue: 0 };
const sandColors = [
    { red: 0, green: 235, blue: 205 },  // Light Beige
    { red: 0, green: 180, blue: 150 },  // Brown Tint
    { red: 10, green: 120, blue: 100 }   // Darker Edges
];

// Create cracks at random positions
async function createCrack() {
    let x = Math.floor(Math.random() * width);
    let y = Math.floor(Math.random() * height);
    let angle = Math.random() * Math.PI * 2;
    let steps = Math.floor(Math.random() * 12) + 6;

    for (let i = 0; i < steps; i++) {
        if (x < 0 || x >= width || y < 0 || y >= height) break;
        let index = getIndex(x, y);
        if (grid[index]) break;  // Stop if crack already exists

        grid[index] = true;
        ledController.setLed(index, crackColor);

        // Create sand effect around cracks
        for (let j = 0; j < sandColors.length; j++) {
            let sx = x + Math.floor(Math.cos(angle + j * 0.5));
            let sy = y + Math.floor(Math.sin(angle + j * 0.5));
            if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
                let sIndex = getIndex(sx, sy);
                ledController.setLed(sIndex, sandColors[j]);
            }
        }

        // Move the crack forward
        x += Math.cos(angle);
        y += Math.sin(angle);
        await wait(100);
    }
}

// Main execution wrapped in async IIFE
(async function animateCracks() {
    ledController.fillLeds({ red: 255, green: 255, blue: 255 });  // White background
    ledController.show();
    for (let i = 0; i < 5; i++) {
        await createCrack();
        ledController.show();
    }
})();

