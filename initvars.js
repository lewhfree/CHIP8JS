//there are 16 registers
let registers = new Array(16);

//4 kb memory. max amount a 12 bit pointer can reach.
let memory = new Uint8Array(4096);

//512 in decimal, skip the first 0x200 because old computers stored things in these first bytes. We don't useally store anything tho
//The only thing that should be stored in these bytes is the font.
let pc = 0x200;

//cant have it too high, or else it will start frame skipping the program
//cycle runs at the refresh rate of the monitor, so it will only be able to draw once per run
//but if there are lots of consecutive screen writes, the for loop will handle them, and it won't be able to render them all
let instructionsPerFrame = 10;

//index register,is able to point at any instruction
let index = new Register();
index.write(0x00);

//turns of the main loop if the pointer goes out of memeory bounds. Gets changed in two places, near the bottom of the main loop, and in datahandler.
let run = 1;

//these make sure infinite loops don't make the tab realllly slow by decrementing it by 1 every time cycle runs,
//but increasing it by 2 each time a jump happens. This means that only runaway infinite loops can kill the interpreter.
let maxNumberOfJumps = 2000;
let numOfJumps = 0;
//tmpval just is a random value that any function or anything can use.
//i use it to store intermediary values.
let tmpval;

//modern mode - some instructions were changed on the chip-48 and super-chip that make certain games make-or-break
//this option triggers an if-else statement in ambiguous instructions to do the different things based on the variable
//changes are fx55, bnnn, and EVENTUALLY DISPLAY RESOLUTION (TODOu TASK).
let modern = 1;

//amiga mode - the amiga interpreter changed something funny about the fx1e command
//I am including this option in just for compatibilities sake.
let amiga = 0;

//makes all the pixels black.
clearScreen();

//stack is just an array. when you call 2nnn, it pushes the current pc to the stack, and jumps to nnn.
//00ee just gets the most recent thing on the stack, jumps to it, and then deletes it off the stack.
let stack = [];

//sets up registers. there are 16, 0x0-0xf. each register has a read() and write() function that does exactly what it sounds like
for (let i = 0; i < registers.length; i++) {
    registers[i] = new Register();
}

let keyd = 0;

let timer = 255;
let soundTimer = 255;
let font = [
0xF0, 0x90, 0x90, 0x90, 0xF0, // 0 starts at 0x50
0x20, 0x60, 0x20, 0x20, 0x70, // 1
0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
0x90, 0x90, 0xF0, 0x10, 0x10, // 4
0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
0xF0, 0x10, 0x20, 0x40, 0x40, // 7
0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
0xF0, 0x90, 0xF0, 0x90, 0x90, // A
0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
0xF0, 0x80, 0x80, 0x80, 0xF0, // C
0xE0, 0x90, 0x90, 0x90, 0xE0, // D
0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
0xF0, 0x80, 0xF0, 0x80, 0x80  // F
];

for(let i = 0; i < 80; i++){
    memory[i+0x50] = font[i];
}