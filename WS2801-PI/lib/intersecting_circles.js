const LedController = require("ws2801-pi").default;
const width = 18, height = 8, amountOfLedsOnStrip = width * height, ledController = new LedController(amountOfLedsOnStrip);
async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function getIndex(x, y) { return y % 2 === 0 ? y * width + x : y * width + (width - 1 - x); }

// Parameters
const numCircles = 10;
const circles = [];
const backgroundColor = { red: 255, green: 0, blue: 5 };
const circleColor = { red: 0, green: 255, blue: 255 };
const intersectionColor = { red: 255, green: 0, blue: 0 };

// Circle Class
class Circle {
    constructor(id) {
        this.id = id;
        this.x = Math.floor(Math.random() * width);
        this.y = Math.floor(Math.random() * height);
        this.radius = Math.floor(Math.random() * 3) + 1;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
    }

    move() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x += width;
        if (this.x >= width) this.x -= width;
        if (this.y < 0) this.y += height;
        if (this.y >= height) this.y -= height;
    }

    draw() {
        // Draw circle center
        ledController.setLed(getIndex(Math.round(this.x), Math.round(this.y)), circleColor);
    }
}

// Detect Intersections
function checkIntersections() {
    for (let i = 0; i < numCircles; i++) {
        for (let j = i + 1; j < numCircles; j++) {
            let dx = circles[i].x - circles[j].x;
            let dy = circles[i].y - circles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < (circles[i].radius + circles[j].radius) / 2) {
                let ix = (circles[i].x + circles[j].x) / 2;
                let iy = (circles[i].y + circles[j].y) / 2;

                if (ix >= 0 && ix < width && iy >= 0 && iy < height) {
                    ledController.setLed(getIndex(Math.round(ix), Math.round(iy)), intersectionColor);
                }
            }
        }
    }
}

// Initialize circles
for (let i = 0; i < numCircles; i++) {
    circles.push(new Circle(i));
}

// Animation Loop
async function animate() {
    while (true) {
        ledController.fillLeds(backgroundColor);

        // Move & Draw Circles
        circles.forEach(circle => {
            circle.move();
            circle.draw();
        });

        // Detect & Draw Intersections
        checkIntersections();

        ledController.show();
        await wait(150);
    }
}

animate();

