function cycle() {
    for (let i = 0; i < instructionsPerFrame; i++) {
        if (pc < memory.length - 1) {
            let firstHalfCurrentInstruction = memory[pc];
            let secondHalfCurrentInstruction = memory[pc + 1];

            let opcode = firstHalfCurrentInstruction >> 4;
            let nnn = ((firstHalfCurrentInstruction & 0x0F) << 8) | secondHalfCurrentInstruction;
            let secondNibbleFirstByte = firstHalfCurrentInstruction & 0x0F;
            let firstNibbleSecondByte = (secondHalfCurrentInstruction & 0xF0) >> 4;
            let secondNibbleSecondByte = secondHalfCurrentInstruction & 0x0F;

            switch (opcode) {
                case 0: //00e0 (clear screen) or 00ee (return from subroutine)
                    switch (secondHalfCurrentInstruction) {
                        case (224):
                            clearScreen();
                            break;

                        case (238):
                            //returnfrom subroutine 00ee
                            tmpval = stack[0];
                            pc = tmpval;
                            stack.shift();
                            break;

                        default:
                            console.log("Not a valid instruction. Tried to call a thing that started with 0x0, but didn't end in 0xee or 0xe0");
                    }
                    break;

                case 1: //1nnn
                    //jump to nnn
                    pc = nnn;
                    pc -= 2;
                    numOfJumps += 2;
                    break;

                case 2: //2nnn
                    //call subroutine at nnn
                    //adds the current pc to the start of the stack
                    stack.unshift(pc);
                    //jumps to the pointer, minus two, just like in the 1nnn instructions, so that when it gets incremented by two at the end, it is the right one
                    pc = nnn - 2;
                    break;

                case 3: //3xkk
                    if (registers[secondNibbleFirstByte].read() == secondHalfCurrentInstruction) {
                        pc += 2;
                    }
                    //skip next instruction if Vx = kk
                    break;

                case 4: //4xkk
                    if (registers[secondNibbleFirstByte].read() != secondHalfCurrentInstruction) {
                        pc = pc + 2;
                    }
                    break;

                case 5: //5xy0
                    //skip next instruction if Vx = Vy
                    if (registers[secondNibbleFirstByte].read() == registers[firstNibbleSecondByte].read()) {
                        pc += 2;
                    }
                    break;

                case 6: //6xkk
                    //set Vx to kk
                    registers[secondNibbleFirstByte].write(secondHalfCurrentInstruction);
                    break;

                case 7: //7xkk
                    //set Vx = Vx + kk
                    let pt = registers[secondNibbleFirstByte].read();
                    let p = secondHalfCurrentInstruction;
                    tmpval = pt + p;
                    if(tmpval > 255){
                        registers[0xf].write(1);
                    }
                    tmpval = tmpval % 256;
                    registers[secondNibbleFirstByte].write(tmpval);
                    break;

                case 8: //8xyn
                    //lots of math things, not needed initially.
                    switch (secondNibbleSecondByte) {
                        case (0): //Vx is set to value of Vy with overflow
                            registers[secondNibbleFirstByte].write(registers[firstNibbleSecondByte].read());
                            break;

                        case (1): //Vx is set to Vx | Vy
                            registers[secondNibbleFirstByte].write(
                                registers[secondNibbleFirstByte].read() | registers[firstNibbleSecondByte].read()
                            );
                            break;

                        case (2): //Vx is set to Vx & Vy
                            registers[secondNibbleFirstByte].write(
                                registers[secondNibbleFirstByte].read() & registers[firstNibbleSecondByte].read()
                            );
                            break;

                        case (3): //Vx is set to Vx xor Vy
                            registers[secondNibbleFirstByte].write(
                                registers[secondNibbleFirstByte].read() ^ registers[firstNibbleSecondByte].read()
                            );
                            break;

                        case (4): //Vx = Vx + Vy, but if overflows over 255, it sets the flag to 1, if not, 0
                                  //Add the value of register VY to register VX
                                  //Set VF to 01 if a carry occurs
                                  //Set VF to 00 if a carry does not
                                  tmpval = registers[secondNibbleFirstByte].read();
                                  tmpval += registers[firstNibbleSecondByte].read();
                                  tmpval = tmpval % 256;
                                  registers[0xf].write(0x00);
                                  if(tmpval > 256){
                                    registers[0xf].write(0x01);
                                  }
                                  registers[secondNibbleFirstByte].write(tmpval);
                            break;
                            //LOOK AT MODULUS OF NEGATIVE NUMBERS G4G, IT HAS SOME PSEUDOCODE THAT WILL HELP WITH 5 and 7.
                        case (5): //Vx = Vx - Vy, if Vx > Vy, vf is 1. if we underflow, vf = 0
                            tmpval = registers[secondNibbleFirstByte].read() - registers[firstNibbleSecondByte].read();
                            registers[0xf].write(0x01);
                            if(tmpval < 0){registers[0xf].write(0x00);}
                            registers[secondNibbleFirstByte].write(mod(tmpval, 256));
                            break;

                        case (6):
                            if(modern == 1){
                                registers[secondNibbleFirstByte].write(registers[firstNibbleSecondByte].read());
                            }
                            registers[0xf].write(0x00);
                            tmpval = registers[secondNibbleFirstByte].read() & 0x01;
                            if(tmpval == 1){registers[0xf].write(0x01);}
                            registers[secondNibbleFirstByte].write(registers[secondNibbleFirstByte].read() >> 1);
                            break;

                        case (7):
                            //vy - vx
                            tmpval = registers[firstNibbleSecondByte].read() - registers[secondNibbleFirstByte].read();
                            registers[0xf].write(0x01);
                            if(tmpval < 0){registers[0xf].write(0x00);}
                            registers[secondNibbleFirstByte].write(mod(tmpval, 256));
                            break;

                        case (14):
                            if(modern == 1){
                                registers[secondNibbleFirstByte].write(registers[firstNibbleSecondByte].read());
                            }
                            const shiftedValue = (registers[secondNibbleFirstByte].read() << 1) % 256; // Perform left shift
                            registers[0xf].write(shiftedValue >> 7); // Set VF based on the shifted-out MSB
                            registers[secondNibbleFirstByte].write(shiftedValue); // Clear MSB and store the shifted value
                            break;

                        default:
                            console.log("Not a valid instruction!!! Tried to run a command that starts with 8.");
                    }
                    break;

                case 9: //9xy0
                    if (registers[secondNibbleFirstByte].read() == registers[firstNibbleSecondByte].read()) {}
                    else {
                        pc = pc + 2;
                    }
                    break;

                case 10: //annn
                    //sets I to nnn
                    index.write(nnn);
                    break;

                case 11: //bnnn
                    //jump to nnn + V0
                    tmpval = nnn + registers[0x00].read();
                    pc = tmpval;
                    pc = pc - 2;
                    numOfJumps += 2;
                    break;

                case 12: //cxkk
                    //Set Vx = random byte AND kk
                    tmpval = randInt(255);
                    tmpval = tmpval & secondHalfCurrentInstruction;
                    registers[secondNibbleFirstByte].write(tmpval);
                    break;

                case 13: //dxyn
                    drawSprite(registers[secondNibbleFirstByte].read(), registers[firstNibbleSecondByte].read(), secondNibbleSecondByte);
                    break;

                case 14: //Ex9e or ExA1, do later
                    switch(secondHalfCurrentInstruction) {
                        case 0x9e:
                            if(registers[secondNibbleFirstByte].read() == key){
                                pc = pc + 2;
                            }
                            break;

                        case 0xa1:
                            if(registers[secondNibbleFirstByte].read() != key){
                                pc = pc + 2;
                            }
                            break;
                    }
                    break;

                case 15: //fx(a hex byte)
                    switch (secondHalfCurrentInstruction) {
                        case 0x0A:
                            if(key != undefined){
                                registers[secondNibbleFirstByte].write(key);
                            } else {
                                pc = pc - 2;
                            }
                            break;

                        case 0x1e: //fx1e set index to index + Vx
                            index.write(index.read() + registers[secondNibbleFirstByte].read());
                            break;

                        case 0x07: //sets Vx to current value of delay timer
                            registers[secondNibbleFirstByte].write(timer);
                            break;

                        case 0x15: //sets delay timer to Vx
                            timer = registers[secondNibbleFirstByte].read();
                            break;

                        case 0x18:
                            soundTimer = registers[secondNibbleFirstByte].read();
                            break;

                        case 0x29:
                            index.write(memory[(0x50 + ((registers[secondNibbleFirstByte].read() - 1) * 5))]);
                            break;

                        case 0x33:
                            // console.log('ran 0x33');
                            // memory[index.read()] = parseInt(registers[secondNibbleFirstByte].read() / 100);
                            // memory[index.read() + 1] = parseInt(registers[secondNibbleFirstByte].read() % 100 / 10);
                            // memory[index.read() + 2] = registers[secondNibbleFirstByte].read() % 10;
                            break;
                        default:
                            console.log("Not a valid f command.");
                            console.log(firstHalfCurrentInstruction.toString(16) + secondHalfCurrentInstruction.toString(16));
                        case 0x55:
                                // for (let ipn = 0; ipn <= registers[secondNibbleFirstByte].read(); ipn++) {
                                //     memory[index.read() + ipn] = registers[ipn].read();
                                // }
                                break;
                        case 0x65:
                            // for(let i = 0; i < registers[secondNibbleFirstByte].read() % 16; i++){
                            //     registers[i].write(memory[index.read() + i]);
                            //     if(modern == 0){index.write(index.read() + 1);}
                            // }
                            break;
                    }

                    break;
                default:
                    console.log("Not a valid instruction");
            }
        }
        else {
            console.log("Memory limit reached, stopping loop.");
            run = 0;
            return;
        }

        numOfJumps -= 1;
        if (numOfJumps < 0) { numOfJumps = 0; }
        pc += 2;
    }


    timer--;
    soundTimer--;

    if (timer < 0) { timer = 0; }
    if (soundTimer < 0) { soundTimer = 0; }

    if (soundTimer > 0) {
        //make a beeping sound. continuous
    }
    else {
        //stop making noise;
    }
    if (numOfJumps > maxNumberOfJumps) {
        run = 0;
        console.log("Jumped more than " + maxNumberOfJumps + " times. Killed process. Change variable maxNumberOfJumps to allow for higher numbers of jumps;");
    }
    if (run) {
        window.requestAnimationFrame(cycle);
    }
}

cycle();