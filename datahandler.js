let data;
let memoryData;
let reader;


let openFile = function(event) {
    let input = event.target;

    reader = new FileReader();
    reader.onload = function() {
        data = reader.result;
        done(reader.result);
    };
    reader.readAsArrayBuffer(input.files[0]);
};

function done(result) {
    memory = new Uint8Array(4096);
    memoryData = new Uint8Array(reader.result);

    for (let i = 0; i < registers.length; i++) {
    registers[i] = new Register();
    }

    for (let i = 0; i < memoryData.length; i++) {
        memory[0x200 + i] = memoryData[i];
    }
    run = 1;
    pc = 0x200;
    numOfJumps = 0;
    stack = [];
    timer = 255;
    soundTimer = 255;
    clearScreen();
    for(let i = 0; i < 80; i++){memory[i+0x50] = font[i];}
    cycle();
}