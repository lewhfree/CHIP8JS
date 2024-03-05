const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d", {
    willReadFrequently: true
});
const imageData = ctx.createImageData(canvas.width, canvas.height);
let scale = canvas.width / 64;
ctx.scale(scale, scale);

function clearScreen() {
    for (let i = 0; i < 64; i++) {
        for (let j = 0; j < 32; j++) {
            pixelset(1, i, j);
        }
    }
}

function pixelset(on, xval, yval) {
    //1 is black (true), 0 is white (false)
    ctx.fillStyle = "rgb(" + (!on) * 255 + "," + (!on) * 255 + "," + (!on) * 255 + ")";
    ctx.fillRect(xval, yval, 1, 1);
}

function find(xcoord, ycoord) {
    //black pixel will return 0, 0, 0, 255, a white pixel will return 255, 255, 255, 255
    var ImageData = ctx.getImageData(xcoord * scale, ycoord * scale, 1, 1);
    return ImageData.data;
}

function reversePixel(xcoord, ycoord) {
    let tmppixel = find(xcoord, ycoord);
    let tmppixelval = tmppixel[0] / 255;
    pixelset(tmppixelval, xcoord, ycoord);
    if (tmppixelval) {
        registers[15].write(0x01);
    }
}

function drawSprite(xp, yp, height) {
    let pixels = new Array(height);
    for (let i = 0; i < pixels.length; i++) {
        pixels[i] = new Array(8);
    }

    let indexpointer = index.read();

    let xpos = xp & 63;
    let ypos = yp & 31;
    registers[registers.length - 1].write(0x0);

    for (let i = 0; i < height; i++) {
        let spriteData = memory[indexpointer + i];
        for (let j = 0; j < 8; j++) {
            pixels[i][j] = getNthBinaryDigit(spriteData, 7 - j);
        }
    }

    for (let i = 0; i < pixels.length; i++) {
        for (let j = 0; j < pixels[i].length; j++) {
            if (pixels[i][j] && (xp + j) < 64 && (yp + i) < 32) {
                reversePixel(xp + j, yp + i);
            }
        }
    }
}

function getNthBinaryDigit(num, n) {
    const shiftedNum = num >> n;
    const nthDigit = shiftedNum & 1;
    return nthDigit;
}