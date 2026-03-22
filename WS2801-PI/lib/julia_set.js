const LedController = require("ws2801-pi").default;
const width = 18, height = 8, amountOfLedsOnStrip = width * height, ledController = new LedController(amountOfLedsOnStrip);
async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function getIndex(x, y) { return y % 2 === 0 ? y * width + x : y * width + (width - 1 - x); }

async function animateJuliaSet(iterations = 20) {
    const cRe = -0.7, cIm = 0.27015; // Julia Set parameters
    const zoom = 0.8;
    const offsetX = 0, offsetY = 0;

    for (let iter = 0; iter < iterations; iter++) {
        ledController.fillLeds({ red: 0, green: 0, blue: 0 });

        for (let px = 0; px < width; px++) {
            for (let py = 0; py < height; py++) {
                let x = (px - width / 2) / (zoom * width / 2) + offsetX;
                let y = (py - height / 2) / (zoom * height / 2) + offsetY;
                let i = 0;

                while (x * x + y * y < 4 && i < 16) {
                    let xtemp = x * x - y * y + cRe;
                    y = 2 * x * y + cIm;
                    x = xtemp;
                    i++;
                }

                const brightness = Math.floor((i / 16) * 255);
                ledController.setLed(getIndex(px, py), { red: brightness, green: 0, blue: 255 - brightness });
            }
        }

        ledController.show();
        await wait(200);
    }
}

animateJuliaSet();

