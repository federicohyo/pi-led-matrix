const LedController = require("ws2801-pi").default;
const width = 18, height = 8, amountOfLedsOnStrip = width * height, ledController = new LedController(amountOfLedsOnStrip);
async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function getIndex(x, y) { return y % 2 === 0 ? y * width + x : y * width + (width - 1 - x); }

const bgColor = { red: 255, green: 0, blue: 255 };
const fernColor = { red: 0, green: 255, blue: 0 };

async function animateBarnsleyFern(iterations = 600) {
    let x = 0, y = 0;

    for (let i = 0; i < iterations; i++) {
        let r = Math.random();
        let newX, newY;

        if (r < 0.01) { newX = 0; newY = 0.16 * y; }
        else if (r < 0.86) { newX = 0.85 * x + 0.04 * y; newY = -0.04 * x + 0.85 * y + 1.6; }
        else if (r < 0.93) { newX = 0.2 * x - 0.26 * y; newY = 0.23 * x + 0.22 * y + 1.6; }
        else { newX = -0.15 * x + 0.28 * y; newY = 0.26 * x + 0.24 * y + 0.44; }

        x = newX;
        y = newY;

        let px = Math.floor((x + 2.5) * width / 5);
        let py = Math.floor((y * height / 10));

        if (px >= 0 && px < width && py >= 0 && py < height) {
            ledController.setLed(getIndex(px, py), fernColor);
            ledController.show();
            await wait(10);
        }
    }
}

animateBarnsleyFern();

