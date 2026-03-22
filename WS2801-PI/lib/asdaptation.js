const LedController = require("ws2801-pi").default;
const width = 18, height = 8, amountOfLedsOnStrip = width * height, ledController = new LedController(amountOfLedsOnStrip);
async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function getIndex(x, y) { return y % 2 === 0 ? y * width + x : y * width + (width - 1 - x); }

// Parameters
const numFriends = 12;
const friends = [];
const maxConnections = 4;

// Colors
const friendColor = { red: 255, green: 0, blue: 255 };
const connectionColor = { red: 255, green: 255, blue: 0 };
const backgroundColor = { red: 0, green: 0, blue: 255 };

// Friend Class
class Friend {
    constructor(id) {
        this.id = id;
        this.x = Math.floor(Math.random() * width);
        this.y = Math.floor(Math.random() * height);
        this.vx = 0;
        this.vy = 0;
        this.connections = [];
    }

    connectTo(friend) {
        if (this.connections.length < maxConnections && !this.connections.includes(friend)) {
            this.connections.push(friend);
            friend.connectTo(this);
        }
    }

    move() {
        let ax = 0, ay = 0;

        this.connections.forEach(friend => {
            let dx = friend.x - this.x;
            let dy = friend.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 1) {
                ax += dx * 0.1;
                ay += dy * 0.1;
            }
        });

        this.vx += ax * 0.05;
        this.vy += ay * 0.05;
        this.vx *= 0.9;
        this.vy *= 0.9;

        this.x = Math.max(0, Math.min(width - 1, Math.round(this.x + this.vx)));
        this.y = Math.max(0, Math.min(height - 1, Math.round(this.y + this.vy)));
    }

    draw() {
        ledController.setLed(getIndex(this.x, this.y), friendColor);
        this.connections.forEach(friend => {
            let dx = friend.x - this.x;
            let dy = friend.y - this.y;
            let steps = Math.max(Math.abs(dx), Math.abs(dy));
            for (let i = 0; i < steps; i++) {
                let cx = Math.round(this.x + (dx * i) / steps);
                let cy = Math.round(this.y + (dy * i) / steps);
                ledController.setLed(getIndex(cx, cy), connectionColor);
            }
        });
    }
}

// Initialize friends
for (let i = 0; i < numFriends; i++) {
    friends.push(new Friend(i));
}

// Randomly connect friends
for (let i = 0; i < numFriends * 2; i++) {
    let a = Math.floor(Math.random() * numFriends);
    let b = Math.floor(Math.random() * numFriends);
    if (a !== b) {
        friends[a].connectTo(friends[b]);
    }
}

// Animation Loop
async function animate() {
    while (true) {
        ledController.fillLeds(backgroundColor);

        // Move friends to happy places
        friends.forEach(friend => friend.move());

        // Draw friends & connections
        friends.forEach(friend => friend.draw());

        ledController.show();
        await wait(200);
    }
}

animate();

