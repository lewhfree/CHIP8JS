let key = 0;
window.addEventListener('keydown', keyDown);

function keyDown(e){
    console.log(e.key);


  if (event.defaultPrevented) {
    return; // Do nothing if the event was already processed
  }

    keyD = 1;
  switch (e.key) {
    case "1":
      key = 0x1;
      break;
    case "2":
      key = 0x2;
      break;
    case "3":
      key = 0x3;
      break;
    case "4":
      key = 0xC;
      break;
    case "q":
      key = 0x4;
      break;
    case "w":
      key = 0x5;
      break;
    case "e":
      key = 0x6;
      break;
    case "r":
      key = 0xD;
      break;
    case "a":
      key = 0x7;
      break;
    case "s":
      key = 0x8;
      break;
    case "d":
      key = 0x9;
      break;
    case "f":
      key = 0xE;
      break;
    case "z":
      key = 0xA;
      break;
    case "x":
      key = 0x0;
      break;
    case "c":
      key = 0xB;
      break;
    case "v":
      key = 0xF;
      break;
    default:
      return; // Quit when this doesn't handle the key event.
  }
  // Cancel the default action to avoid it being handled twice
  event.preventDefault();

}

window.addEventListener('keyup', keyUp);

function keyUp(e){
key = undefined;
}