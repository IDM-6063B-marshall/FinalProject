let mSerial;
let connectButton;
let readyToReceive;

// Project variables
let shapeOrientation = 0; 
let sizeVar = 0.5;
let recursionDepth = 0; // number of inner triangles

function setup() {
  createCanvas(windowWidth, windowHeight);

  mSerial = createSerial();

  connectButton = createButton("Connect To Serial");
  connectButton.position(width / 2 - 70, height / 2); 
  connectButton.mousePressed(connectToSerial);
  
  readyToReceive = false;
}

function receiveSerial() {
  let mLine = mSerial.readUntil("\n"); 
  if (mLine) {
    let values = mLine.trim().split(",").map(Number); 
    if (values.length === 3) {
      // Map Arduino potentiometer values to project variables
      shapeOrientation = map(values[0], 0, 4095, 0, 360); // 0-360 degrees
      recursionDepth = int(map(values[1], 0, 4095, 1, 10)); 
      sizeVar = map(values[2], 0, 4095, 0.1, 1); 
    }
  }
  readyToReceive = true;
}

function connectToSerial() {
  if (!mSerial.opened()) {
    mSerial.open(9600);
    connectButton.hide();
    readyToReceive = true;
  }
}

function draw() {
  background(255);

  // Center canvas and rotate shape
  push();
  translate(width / 2, height / 2);
  rotate(radians(shapeOrientation));

  // Adjust size
  let adjustedSize = 700 * sizeVar;

  // Draw Sierpinski triangle
  drawSierpinski(-adjustedSize / 2, adjustedSize * sqrt(3) / 4, adjustedSize, recursionDepth);

  pop();

  // Handle serial communication
  if (mSerial.opened() && readyToReceive) {
    mSerial.clear();
    mSerial.write(0xAB);
    readyToReceive = false;
  }

  if (mSerial.availableBytes() > 0) {
    receiveSerial();
  }
}

function drawSierpinski(x, y, l, depth) {
//borrowed some logic from https://editor.p5js.org/hanxyn888@gmail.com/sketches/pMGvcy3Ue
  if (depth === 0 || l < 2) return; 

  // Draw main triangle
  triangle(x, y, x + l / 2, y - l * sqrt(3) / 2, x + l, y);

  // Recursive calls for smaller triangles
  drawSierpinski(x, y, l / 2, depth - 1);
  drawSierpinski(x + l / 2, y, l / 2, depth - 1);
  drawSierpinski(x + l / 4, y - (l / 2) * sqrt(3) / 2, l / 2, depth - 1);
}
