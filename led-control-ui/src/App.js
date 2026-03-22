import { useState } from "react";
import React from "react";

const Button = ({ onClick, children }) => (
  <button className="p-2 bg-blue-500 text-white rounded" onClick={onClick}>
    {children}
  </button>
);

const Input = ({ value, onChange, placeholder }) => (
  <input
    className="p-2 border border-gray-300 rounded"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
  />
);

const Card = ({ children, onClick }) => (
  <div className="p-4 border border-gray-300 rounded cursor-pointer hover:shadow-lg" onClick={onClick}>
    {children}
  </div>
);

const CardContent = ({ children }) => <div>{children}</div>;

const LED_SERVER_URL = "https://a2d2-95-99-4-69.ngrok-free.app/led"  
//"https://ba99-95-99-4-69.ngrok-free.app/led";  // Sends code to LED matrix
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";  // Calls OpenAI


const animations = [
  { name: "Bouncing Heart", prompt: "Show a bouncing heart" },
  { name: "Rainbow Wave", prompt: "Create a flowing rainbow wave" },
  { name: "Scrolling Text", prompt: "Display scrolling text" },
];


async function generateLEDCode(prompt) {
  console.log("🚀 Sending request to OpenAI with prompt:", prompt);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,  // OpenAI API Key
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You generate ONLY executable Node.js code for an LED matrix using ws2801-pi. No explanations, just JavaScript. As example of working code please refer to this which also contains the size and the library to use: const LedController = require('ws2801-pi').default; const width = 18;  // Number of LEDs in width const height = 8;  // Number of LEDs in height const amountOfLedsOnStrip = width * height; const ledController = new LedController(amountOfLedsOnStrip); async function wait(ms) { return new Promise((resolve) => { setTimeout(resolve, ms); }); } // Corrected index mapping for zigzag LED layout function getIndex(x, y) {  if (y % 2 === 0) { return y * width + x;  // Even row: left to right } else { return y * width + (width - 1 - x);  // Odd row: right to left } } // Background colors const backgroundColors = [ { red: 0, green: 0, blue: 20 }, { red: 0, green: 20, blue: 0 }, { red: 20, green: 0, blue: 0 }, { red: 10, green: 10, blue: 10 }, ]; async function animateBouncingBall() { let ballColor = { red: 255, green: 0, blue: 0 }; let bgIndex = 0;  let x = 5, y = 2;  // Ball starting position let dx = 1, dy = 1; // Ball direction while (true) { // Cycle through background colors faster let bgColor = backgroundColors[bgIndex % backgroundColors.length];  ledController.fillLeds(bgColor); // Draw the 3x3 ball for (let i = 0; i < 3; i++) {  for (let j = 0; j < 3; j++) { let px = x + i; let py = y + j;  if (px < width && py < height) { ledController.setLed(getIndex(px, py), ballColor);} } } // Show the frame ledController.show(); // Bounce logic if (x + dx < 0 || x + 3 + dx > width) dx = -dx; if (y + dy < 0 || y + 3 + dy > height) dy = -dy; x += dx; y += dy; // Faster background change bgIndex = (bgIndex + 1) % backgroundColors.length; await wait(100); // Slow-motion effect} }  animateBouncingBall();  " },
          { role: "user", content: `Generate Node.js code for an LED matrix that ${prompt}. ledController.clear() does not exists as a function. As example of working code please refer to this which also contains the size and the library to use: const LedController = require("ws2801-pi").default; const width = 18;  // Number of LEDs in width const height = 8;  // Number of LEDs in height const amountOfLedsOnStrip = width * height; const ledController = new LedController(amountOfLedsOnStrip); async function wait(ms) { return new Promise((resolve) => { setTimeout(resolve, ms); }); } // Corrected index mapping for zigzag LED layout function getIndex(x, y) {  if (y % 2 === 0) { return y * width + x;  // Even row: left to right } else { return y * width + (width - 1 - x);  // Odd row: right to left } } // Background colors const backgroundColors = [ { red: 0, green: 0, blue: 20 }, { red: 0, green: 20, blue: 0 }, { red: 20, green: 0, blue: 0 }, { red: 10, green: 10, blue: 10 }, ]; async function animateBouncingBall() { let ballColor = { red: 255, green: 0, blue: 0 }; let bgIndex = 0;  let x = 5, y = 2;  // Ball starting position let dx = 1, dy = 1; // Ball direction while (true) { // Cycle through background colors faster let bgColor = backgroundColors[bgIndex % backgroundColors.length];  ledController.fillLeds(bgColor); // Draw the 3x3 ball for (let i = 0; i < 3; i++) {  for (let j = 0; j < 3; j++) { let px = x + i; let py = y + j;  if (px < width && py < height) { ledController.setLed(getIndex(px, py), ballColor);} } } // Show the frame ledController.show(); // Bounce logic if (x + dx < 0 || x + 3 + dx > width) dx = -dx; if (y + dy < 0 || y + 3 + dy > height) dy = -dy; x += dx; y += dy; // Faster background change bgIndex = (bgIndex + 1) % backgroundColors.length; await wait(100); // Slow-motion effect} }  animateBouncingBall(); another example of a heart buncing const LedController=require('ws2801-pi').default,width=18,height=8,amountOfLedsOnStrip=width*height,ledController=new LedController(amountOfLedsOnStrip);async function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms));}function getIndex(x,y){return y%2===0?y*width+x:y*width+(width-1-x);}const heartShape=["  111  111  ","   111111   ","    1111    ","     11     "],heartColor={red:255,green:0,blue:0},bgColor={red:0,green:0,blue:0};async function animateBouncingHeart(){let x=5,y=2,dx=1,dy=1;while(!0){ledController.fillLeds(bgColor);for(let row=0;row<heartShape.length;row++)for(let col=0;col<heartShape[row].length;col++)if("1"===heartShape[row][col]){let px=x+col-5,py=y+row-2;if(px>=0&&px<width&&py>=0&&py<height)ledController.setLed(getIndex(px,py),heartColor);}ledController.show(),(x+dx<0||x+6+dx>width)&&(dx=-dx),(y+dy<0||y+4+dy>height)&&(dy=-dy),x+=dx,y+=dy,await wait(150);}}animateBouncingHeart(); another example of a rainbow wave  const LedController=require("ws2801-pi").default,width=18,height=8,amountOfLedsOnStrip=width*height,ledController=new LedController(amountOfLedsOnStrip);async function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms));}function getIndex(x,y){return y%2===0?y*width+x:y*width+(width-1-x);}async function animateRainbowWave(){let offset=0;while(!0){for(let i=0;i<width;i++)for(let j=0;j<height;j++){const hue=((i*360/width+j*360/height+offset)%360)/360,rgb=hsvToRgb(hue,1,1);ledController.setLed(getIndex(i,j),{red:rgb[0],green:rgb[1],blue:rgb[2]});}ledController.show(),offset=(offset+1)%360,await wait(50);}}function hsvToRgb(h,s,v){let r,g,b,i,f,p,q,t;i=Math.floor(6*h),f=6*h-i,p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s);switch(i%6){case 0:r=v,g=t,b=p;break;case 1:r=q,g=v,b=p;break;case 2:r=p,g=v,b=t;break;case 3:r=p,g=q,b=v;break;case 4:r=t,g=p,b=v;break;case 5:r=v,g=p,b=q;break;}return[Math.round(255*r),Math.round(255*g),Math.round(255*b)];}animateRainbowWave(); another example of text rolling const LedController = require("ws2801-pi").default;
const width = 18, height = 8, ledController = new LedController(width * height);

async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function getIndex(x, y) { return y % 2 === 0 ? y * width + x : y * width + (width - 1 - x); }

const textColor = { red: 255, green: 255, blue: 0 }, bgColor = { red: 0, green: 0, blue: 0 };
const font = { H: ["101", "101", "111", "101", "101"], E: ["111", "100", "110", "100", "111"], 
               L: ["100", "100", "100", "100", "111"], O: ["111", "101", "101", "101", "111"] };

const message = ["H", "E", "L", "L", "O"], messageWidth = message.length * 4;

async function scrollText() {
  while (true) {
    for (let offset = -messageWidth; offset <= width; offset++) {
      ledController.fillLeds(bgColor);
      for (let i = 0; i < message.length; i++) {
        let letter = font[message[i]];
        for (let row = 0; row < letter.length; row++) {
          for (let col = 0; col < letter[row].length; col++) {
            if (letter[row][col] === "1") {
              let px = col + i * 4 + offset, py = row + 2;
              if (px >= 0 && px < width && py >= 0 && py < height) 
                ledController.setLed(getIndex(px, py), textColor);
            }
          }
        }
      }
      ledController.show();
      await wait(100);
    }
  }
}

scrollText();

 ` }
        ],
        max_tokens: 2000,
      }),
    });

    console.log("📡 OpenAI API Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenAI API Error Response:", errorText);
      throw new Error(`OpenAI Error: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ OpenAI Response Data:", data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("⚠️ Unexpected API response format:", data);
      throw new Error("Unexpected API response format");
    }

    let generatedCode = data.choices[0].message.content.trim();

    // Ensure only pure JavaScript is returned
    generatedCode = generatedCode
      .replace(/^js\s*/i, "")
      .replace(/^javascript\s*/i, "")
      .replace(/```javascript/g, "")
      .replace(/```/g, "")
      .trim();

    console.log("🎯 Final Cleaned Code:", generatedCode);

    return generatedCode;  // Return the generated JavaScript
  } catch (error) {
    console.error("🔥 OpenAI API Error:", error);
    throw error;
  }
}





export default function LEDControl() {
  const [customPrompt, setCustomPrompt] = useState("");
  const [status, setStatus] = useState("");

const sendGeneratedCode = async (prompt) => {
  setStatus("Generating code...");

  try {
    // 1️⃣ First, request OpenAI to generate LED animation code
    let code = await generateLEDCode(prompt);
    console.log("✅ Generated Code:", code);

    // 2️⃣ Ensure JSON is properly formatted
    const payload = JSON.stringify({ code });

    console.log("📡 Sending Payload to LED Server:", payload);

    // 3️⃣ Send the generated code to the LED server
    const response = await fetch(LED_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
    });

    console.log("📡 LED Server Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ LED Server Error Response:", errorText);
      throw new Error(`LED Server Error: ${errorText}`);
    }

    const data = await response.json();
    setStatus(data.message || "Success!");
  } catch (error) {
    setStatus("Error generating code");
    console.error("🔥 Error in sendGeneratedCode:", error);
  }
};





  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">LED Matrix Control</h1>
      <p>Select an animation or enter a text description:</p>

      <div className="grid grid-cols-3 gap-4">
        {animations.map((anim, index) => (
          <Card key={index} className="p-2 cursor-pointer hover:shadow-lg" onClick={() => sendGeneratedCode(anim.prompt)}>
            <CardContent>{anim.name}</CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <Input
          placeholder="Describe an LED animation"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
        />
        <Button onClick={() => sendGeneratedCode(customPrompt)}>Generate & Send Code</Button>
      </div>

      {status && <p className="text-green-500">{status}</p>}
    </div>
  );
}

