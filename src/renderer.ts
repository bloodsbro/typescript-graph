// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as InfiniteLoop from 'infinite-loop';

const canvas = document.getElementById("canvasBlock") as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const calcLoop = new InfiniteLoop;
const renderLoop = new InfiniteLoop;
const fpsLoop = new InfiniteLoop;

let frame = 0, fps = 0;
let lastTimeFrame = Date.now();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const mapPixels: [[[number, number, number, number]]] = [];
initMap(canvas.width, canvas.height);

function initMap(width: number, height: number) {
  for(let idx = 0; idx < width; idx ++) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mapPixels[idx] = [];
    for(let idy = 0; idy < height; idy ++) {
      mapPixels[idx][idy] = [0, 0, 0, 0];
    }
  }
}

const objects: Rect[]= [];
class Rect {
  x = 0;
  y = 0;
  width = 0;
  height = 0;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

objects.push(new Rect(1, 1, 100, 100));

function checkRange(num1: number, range1: number, range2: number) {
  return num1 >= range1 && num1 <= range2;
}

function setPixel(x: number, y: number, color: [number, number, number, number]) {
  mapPixels[x][y] = color;
}

function clearScreen() {
  for(let idx = 0; idx < canvas.width; idx ++) {
    for(let idy = 0; idy < canvas.height; idy ++) {
      hidePixel(idx, idy);
    }
  }
}

function hidePixel(x: number, y: number) {
  mapPixels[x][y][3] = 0;
}

function drawPixels(mapPixels: [[[number, number, number, number]]]) {
  const image = ctx.createImageData(canvas.width, canvas.height);

  let pixel = 0;
  for(let idx = 0; idx < canvas.width; idx ++) {
    for(let idy = 0; idy < canvas.height; idy ++) {
      for(let channel = 0; channel < 4; channel++) {
        image.data[pixel] = mapPixels[idx][idy][channel];
        pixel ++;
      }
    }
  }

  ctx.putImageData(image, 0, 0, 0, 0, canvas.width, canvas.height);
}

calcLoop.add(() => {
  ++frame;
  clearScreen();

  for (let x = 0; x < canvas.width; ++x) {
    for (let y = 0; y < canvas.height; ++y) {
      for (const obj of objects) {
        if (checkRange(x, obj.x - (obj.width / 2), obj.x + (obj.width / 2))) {
          if (checkRange(y, obj.y - (obj.height / 2), obj.y + (obj.height / 2))) {
            setPixel(x, y, [255, 0, 0, 255]);
          }
        }
      }
    }
  }
});

renderLoop.add(() => {
  drawPixels(mapPixels);
});

fpsLoop.add(() => {
  const time = Date.now();
  if (time - lastTimeFrame >= 1000) {
    fps = frame;

    lastTimeFrame = time;
    frame = 0;
  }

  document.title = `FRAME: ${frame} / FPS: ${fps}`;
});

calcLoop.run();

fpsLoop.setInterval(20);
fpsLoop.run();

renderLoop.setInterval(20);
renderLoop.run();