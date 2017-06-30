"use strict";
var CPU = Class(Memory, function() {
    var requestAnimFrame = (function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 0);
            };
    })().bind(window);

    function nextOpcode() {
        var op = this.code.getUint16(this.pc, false);
        this.pc += 2;
        return op;
    }

    function readInt() {

    }

    function runCycle() {
        var self = this;
        var code = this.nextOpcode();
        //console.error(code >> 8);
        switch (code >> 8) { //Opcode
            case OP.add:
                {
                    //First byte for first register
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    //Second byte for second register
                    var reg2 = code >> 8;
                    //Third byte for third register
                    var reg3 = code & 0xff;
                    //Third reg=first reg value + second reg value 
                    this.registers[reg3 + this.fp] = this.registers[reg1 + this.fp] + this.registers[reg2 + this.fp];
                    break;
                }
            case OP.sub:
                {
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    var reg2 = code >> 8;
                    var reg3 = code & 0xff;
                    this.registers[reg3 + this.fp] = this.registers[reg1 + this.fp] - this.registers[reg2 + this.fp];
                    break;
                }
            case OP.mul:
                {
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    var reg2 = code >> 8;
                    var reg3 = code & 0xff;
                    this.registers[reg3 + this.fp] = this.registers[reg1 + this.fp] * this.registers[reg2 + this.fp];
                    break;
                }
            case OP.div:
                {
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    var reg2 = code >> 8;
                    var reg3 = code & 0xff;
                    this.registers[reg3 + this.fp] = this.registers[reg1 + this.fp] / this.registers[reg2 + this.fp];
                    break;
                }
            case OP.iconst:
                {
                    var reg = code & 0xff;
                    code = this.nextOpcode();
                    this.registers[reg + this.fp] = this.loadInt(code);
                    break;
                }
            case OP.goto:
                {
                    var newIP = code & 0xff;
                    this.pc = newIP;
                    break;
                }
            case OP.if_eq:
                {
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    var reg2 = code >> 8;
                    var newIP = code & 0xff;
                    if (this.registers[reg1 + this.fp] == this.registers[reg2 + this.fp]) {
                        this.pc = newIP;
                    }
                    break;
                }
            case OP.if_neq:
                {
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    var reg2 = code >> 8;
                    var newIP = code & 0xff;
                    if (this.registers[reg1 + this.fp] != this.registers[reg2 + this.fp]) {
                        this.pc = newIP;
                    }
                    break;
                }
            case OP.if_lt:
                {
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    var reg2 = code >> 8;
                    var newIP = code & 0xff;
                    if (this.registers[reg1 + this.fp] < this.registers[reg2 + this.fp]) {
                        this.pc = newIP;
                    }
                    break;
                }
            case OP.if_gt:
                {
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    var reg2 = code >> 8;
                    var newIP = code & 0xff;
                    if (this.registers[reg1 + this.fp] > this.registers[reg2 + this.fp]) {
                        this.pc = newIP;
                    }
                    break;
                }
            case OP.call:
                {
                    var a = code & 0xff;
                    code = this.nextOpcode();
                    var addr = (a << 8) | (code >> 8); //The address of the routine
                    //console.log("call",addr)
                    var b = code & 0xff;
                    code = this.nextOpcode();
                    var regRange = (b << 8) | (code >> 8); //The register range
                    //Get the args to the function
                    var args = [];
                    if (!(regRange == 0xffff)) {
                        var regStart = regRange >> 8;
                        var regEnd = regRange & 0xff;
                        var index = regStart;
                        do {
                            args.push(this.registers[index + this.fp]);
                            index++;
                        } while (index <= regEnd);
                    }
                    this.resultValue = 0;
                    this.registers[this.fp + 0xff] = this.pc; //Save the address of last call to register
                    this.fp += (0xff + 1); //Increment fp by number of save register+Beginning register of next function
                    this.pc = addr;
                    //Save 254 registers
                    args.forEach(function(elem, index, obj) {
                        self.registers[index + self.fp] = elem; //Save the arguments into the registers
                    });
                    break;
                }
            case OP.system:
                {
                    var systemRoutineCode = code & 0xff;
                    code = this.nextOpcode();
                    var args = [];
                    if (!(code == 0xffff)) {
                        var regStart = code >> 8;
                        var regEnd = code & 0xff;
                        var index = regStart;
                        do {
                            args.push(this.readReg(index));
                            index++;
                        } while (index <= regEnd);
                    }
                    this.callSystemRoutine(systemRoutineCode, args);
                    //this.events.emit('console.log', [args.toString()])
                    //this.events.emit('console.log',[args])
                    break;
                }
            case OP.get:
                {
                    var reg = code & 0xff;
                    code = this.nextOpcode();
                    this.registers[reg + this.fp] = code;
                    break;
                }
            case OP.load:
                {
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    var reg2 = code >> 8;
                    var addr = this.readReg(reg1); //get the adress of memory location stored in register
                    this.saveReg(reg2, this.load(addr)); //read the value at the address and store it in register
                    break;
                }
            case OP.store:
                {
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    var reg2 = code >> 8;
                    var val = this.readReg(reg1); //reg value
                    var addr = this.readReg(reg2); //address to store to
                    this.store(addr, val);
                    break;
                }
            case OP.move:
                {
                    var reg1 = code & 0xff;
                    code = this.nextOpcode();
                    var reg2 = code >> 8;
                    var val = this.readReg(reg1); //reg value
                    this.saveReg(reg2, val);
                    break;
                }
            case OP.return:
                {
                    var reg1 = code & 0xff;
                    this.resultValue = (reg1 == 0xff) ? 0 : this.readReg(reg1); //If reg1 ==no register i.e 0xff, function result=0, else normal thing
                    if (this.fp == 0) { //If there is no other function on stack frame
                        this.stop();
                    } else {

                        var return_address = this.registers[this.fp - 1];
                        this.fp = (this.fp - 0xff) - 1;
                        this.pc = return_address;
                    }

                    break;
                }
            case OP.result:
                {
                    var reg = code & 0xff;
                    this.registers[reg + this.fp] = this.resultValue;
                    break;
                }
            default:
                {
                    this.stop();
                    var currentPc = this.pc + 2;
                    this.events.emit("console.log", ["Unknown Opcode: " + (code >> 8) + " at pc: " + currentPc]);
                    throw new Error("Unknown Instruction:" + (code >> 8) + " at pc: " + currentPc);
                }
        }
    }
    return {
        runCycle: runCycle,
        requestAnimFrame: requestAnimFrame,
        nextOpcode: nextOpcode,
        readInt: readInt
    };
});
var VM = Class(CPU, function() {
    function constructor(max_stack) {
        this.execReader = new WavesExeReader();
        this.constantTable = null;
        this.registers = null;
        this.pc = 0;
        this.max_pc = 0;
        //this.max_stack = max_stack || 0xffff;
        this.max_stack = 1000;
        this.fp = 0; //Stack frame pointer
        this.pendingIO = false;
        this.resultValue = 0;
        Memory.call(this);
    }

    function setup(buffer) {
        var self = this;
        //Set the buffer to read from executable reader
        this.execReader.setBuffer(buffer);
        //Get the executable
        this.pendingIO = false;
        var exe = this.execReader.read();
        if (exe.margic != "Waves")
            throw {
                str: "Invalid Executable File",
                type: Exception.INVALID_EXE
            };
        this.fp = 0;
        this.constantTable = exe.constants; //Table of all constant declaration
        console.warn(exe.mainRoutineIndex)
        this.pc = exe.mainRoutineIndex; //The index in byte to the main function
        this.code = exe.routines; //The code to execute
        this.max_pc = (this.code.byteLength) - 1; //The maximum program counter possible
        this.registers = new Int32Array(this.max_stack); //Ths registers used
        for (var i = 0;i<this.constantTable.byteLength;i++) {
            var item=this.constantTable[i];
            self.memory[i] = item;
        }
       /*     console.log(this.constantTable.byteLength)
        this.constantTable.map(function(item, index, arr) {
            self.memory[index] = item;
        });*/
        this.heap_start = this.constantTable.length;
        this.heap_stop = this.heap_start;
        console.log("heap_start", this.heap_start);
        this.memory_offset = (this.constantTable.byteLength - 1);
        this.inputStreamLength = 100;
        this.inputStreamPointer = this.allocate_memory(this.inputStreamLength);
        //console.clear();
        console.log(new Uint8Array(this.code.buffer, this.code.byteOffset));
        //console.log(this.registers);
    }

    function run(buffer) {
        var self = this;
        this.events.emit('console.open', [function() {
            var runCycle = self.runCycle.bind(self);
            var timeout=8;
            self.setup(buffer);
            //console.log("pc: ",self.pc);
            self.interval = setInterval(function runable() {
                try {
                    if (self.pendingIO) {
                        clearInterval(self.interval);
                        self.interval=null;
                        self.events.bind('IOFinish',function(){
                            if(!self.interval)
                                self.interval = setInterval(runable,timeout);
                        });
                    } else if (self.pc <= self.max_pc)
                        runCycle();
                    else
                        self.stop();
                    //self.requestAnimFrame(runCycle);
                } catch (e) {
                    console.error(e);
                    self.events.emit('console.log',[e]);
                    self.stop();
                }
                //else
                //self.stop();
            }, timeout);



        }]);
        this.events.bind('console.close', function() {
            self.stop();
        });
        window.ev = this.events;

    }

    function stop() {
        console.error("stoppin app")
        clearInterval(this.interval);
    }

    function callSystemRoutine(id, args) {
        var self = this;
        switch (id) {
            case 0: //printInt(int val)
                {
                    this.events.emit('console.log', [args[0]]); //Print integer in reg
                    break
                }
            case 1: //printChar(char val)
                {
                    //console.log(args)
                    this.events.emit('console.log', [String.fromCharCode(args[0])]); //Print the charcter in the register
                    break
                }
            case 2: //cls(void) clear the screen
                {
                    //console.log(args)
                    this.events.emit('console.clear', []); //Print the charcter in the register
                    break
                }
            case 3: //int alloc(int size)allocate a memory of length size and return the address
                {
                    this.resultValue = this.allocate_memory(args[0]);
                    break
                }
            case 4: //int input(int pointer,int size) get some data from input stream
                {
                    this.pendingIO = true;
                    this.events.emit('console.input');
                    this.events.bind('console.inputFinish', function(text) {
                        self.resultValue = self.storeString(text, self.inputStreamPointer, self.inputStreamLength);
                        self.pendingIO = false;
                        self.events.emit('IOFinish');
                        //console.log(text)
                    });
                    //this.resultValue=this.allocate_memory(args[0]);
                    break
                }
            default:
                {
                    var errMessage = "Invalid System Call Number: " + id;
                    this.events.emit('console.log', [errMessage]);
                    throw new Error(errMessage);

                }
        }
    }

    function setEvents(events) {
        this.events = events;
    }
    return {
        constructor: constructor,
        setup: setup,
        run: run,
        setEvents: setEvents,
        callSystemRoutine:callSystemRoutine,
        stop: stop
    };
});