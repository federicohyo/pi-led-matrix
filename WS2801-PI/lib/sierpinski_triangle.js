const LedController = require("ws2801-pi").default;
const width = 18, height = 8, amountOfLedsOnStrip = width * height, ledController = new LedController(amountOfLedsOnStrip);
async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function getIndex(x, y) { return y % 2 === 0 ? y * width + x : y * width + (width - 1 - x); }

async function animateSierpinski(iterations = 1000) {
    ledController.fillLeds({ red: 0, green: 0, blue: 0 });

    // Triangle vertices adapted to LED matrix size
    const A = [width / 2, 0];
    const B = [0, height - 1];
    const C = [width - 1, height - 1];

    let x = A[0], y = A[1];

    for (let i = 0; i < iterations; i++) {
        let r = Math.random();
        if (r < 1 / 3) {
            x = (x + A[0]) / 2;
            y = (y + A[1]) / 2;
        } else if (r < 2 / 3) {
            x = (x + B[0]) / 2;
            y = (y + B[1]) / 2;
        } else {
            x = (x + C[0]) / 2;
            y = (y + C[1]) / 2;
        }

        let px = Math.floor(x);
        let py = Math.floor(y);
        if (px >= 0 && px < width && py >= 0 && py < height) {
            ledController.setLed(getIndex(px, py), { red: 255, green: 255, blue: 0 });
        }

        if (i % 50 === 0) {
            ledController.show();
            await wait(50);
        }
    }

    ledController.show();
}

animateSierpinski();

