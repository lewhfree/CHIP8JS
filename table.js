let memorydump = document.getElementById("right-table");
let registersDump = document.getElementById("far-right-table");

let from = document.getElementById("from");
let to = document.getElementById("to");

function memoryDump(){
	memorydump.innerHTML = "";
	from = from.value;
	to = to.value;
	for(let i = from; i < to; i++){
		memorydump.innerHTML += " 0x";
		memorydump.innerHTML += memory[i].toString(16);

	}

	//memorydump.innerHTML = memory;
}

function registerDump(){
	registersDump.innerHTML = "";
	for(let i = 0; i < registers.length; i++){
		registersDump.innerHTML += '<p>Register ' + i.toString(16) + ' | ' + registers[i].read().toString(16) + '</p>';
	}
}