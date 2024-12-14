let mSerial;
let connectButton;
let readyToReceive;

// Project variables
let targetSizeVar = 0.5,
  currentSizeVar = 0.5;
let targetRecursionDepth = 0,
  currentRecursionDepth = 0;
let currentColorIndex = 0;

const colors = [
  [32, 236, 195],
  [247, 39, 129],
  [46, 41, 128],
  [242, 244, 14],
];

let textureImage;

function preload() {
  textureImage = loadImage("./assets/texture.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  mSerial = createSerial();

  connectButton = createButton("Connect To Serial");
  connectButton.position(width / 2 - 70, height / 2);
  connectButton.mousePressed(connectToSerial);

  readyToReceive = false;
  p5grain.setup();
}

function receiveSerial() {
  let mLine = mSerial.readUntil("\n");
  if (mLine) {
    let values = mLine.trim().split(",").map(Number);
    if (values.length === 3) {
      targetRecursionDepth = int(map(values[1], 0, 4095, 1, 15)); // Depth of triangles
      targetSizeVar = map(values[2], 0, 4095, 0.1, 10); // Size multiplier
      currentColorIndex = int(map(values[0], 0, 4095, 0, colors.length - 1)); //Color cycling
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
  background(0);

  // Lerp helps animation be less jerky
  currentRecursionDepth = lerp(
    currentRecursionDepth,
    targetRecursionDepth,
    0.1
  );
  currentSizeVar = lerp(currentSizeVar, targetSizeVar, 0.1);

  //Some of this code was from attempting a tile effect with multiple Sierpinski triangles
  //The potentiometer at A0 now controls color cycling instead
  let adjustedSize = 750 * currentSizeVar;
  let spacing = adjustedSize; 
  let rows = ceil(sqrt(1)); 
  let cols = 1; 

  // Center the grid of tiles
  let startX = (width - cols * spacing) / 2 + spacing / 2;
  let startY = (height - rows * spacing) / 2 + spacing / 2;

  // Set the current color from the potentiometer value
  let [r, g, b] = colors[currentColorIndex];

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      // Set stroke color from the list
      stroke(r, g, b);
      fill(0);
      let flip = (i + j) % 2 === 1;

      push();
      translate(startX + j * spacing, startY + i * spacing);
      if (flip) {
        scale(1, -1); // Flip upside-down
      }
      drawSierpinski(
        -adjustedSize / 2,
        (adjustedSize * sqrt(3)) / 4,
        adjustedSize,
        int(currentRecursionDepth)
      );
      pop();
    }

    textureOverlay(textureImage, { animate: true });
    
  }

  if (mSerial.opened() && readyToReceive) {
    mSerial.clear();
    mSerial.write(0xab);
    readyToReceive = false;
  }

  if (mSerial.availableBytes() > 0) {
    receiveSerial();
  }
}

function drawSierpinski(x, y, l, depth) {
  if (depth === 0 || l < 2) return;

  // Draw main triangle
  triangle(x, y, x + l / 2, y - (l * sqrt(3)) / 2, x + l, y);

  // Recursion for inner triangles
  drawSierpinski(x, y, l / 2, depth - 1);
  drawSierpinski(x + l / 2, y, l / 2, depth - 1);
  drawSierpinski(x + l / 4, y - ((l / 2) * sqrt(3)) / 2, l / 2, depth - 1);
}
