"use strict";
var CPU = Class(Memory,function() {
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
        var op=this.code.getUint16(this.pc,false);
        this.pc+=2;
        return op;
    }
    
    function readInt(){

    }
    function runCycle() {
        var code=this.nextOpcode();
        switch(code>>8){//Opcode
        	case OP.add:{
        		var reg1=code&0xff;
        		code=this.nextOpcode();
        		var reg2=code>>8;
        		var reg3=code&0xff;
        		this.registers[reg3]=this.registers[reg1]+this.registers[reg2];
        		break;
        	}
        	case OP.sub:{
        		var reg1=code&0xff;
        		code=this.nextOpcode();
        		var reg2=code>>8;
        		var reg3=code&0xff;
        		this.registers[reg3]=this.registers[reg1]-this.registers[reg2];
        		break;
        	}
        	case OP.mul:{
        		var reg1=code&0xff;
        		code=this.nextOpcode();
        		var reg2=code>>8;
        		var reg3=code&0xff;
        		this.registers[reg3]=this.registers[reg1]*this.registers[reg2];
        		break;
        	}
        	case OP.div:{
        		var reg1=code&0xff;
        		code=this.nextOpcode();
        		var reg2=code>>8;
        		var reg3=code&0xff;
        		this.registers[reg3]=this.registers[reg1]/this.registers[reg2];
        		break;
        	}
        	case OP.iconst:{
        		var reg=code&0xff;
        		code=this.nextOpcode();
        		this.registers[reg]=this.loadInt(code);
        		break;
        	}
        	case OP.goto:{
        		var newIP=code&0xff;
        		this.pc=newIP;
        		break;
        	}
        	default:{
        		throw new Error("Unknown Instruction:"+code>>8);
        	}
        }
    }
    return {
        runCycle: runCycle,
        requestAnimFrame: requestAnimFrame,
        nextOpcode: nextOpcode,
        readInt:readInt
    };
});
var VM = Class(CPU, function() {
    function constructor(max_stack) {
        this.execReader = new WavesExeReader();
        this.constantTable = null;
        this.registers = null;
        this.pc = 0;
        this.max_pc = 0;
        this.max_stack = max_stack || 0xffff;
        this.fp = 0; //Stack frame pointer
        Memory.call(this);
    }

    function setup(buffer) {
    	var self=this;
        //Set the buffer to read from executable reader
        this.execReader.setBuffer(buffer);
        //Get the executable
        var exe = this.execReader.read();
        if (exe.margic != "Waves")
            throw {
                str: "Invalid Executable File",
                type: Exception.INVALID_EXE
            };
        this.constantTable = exe.constants; //Table of all constant declaration
        this.pc = exe.mainRoutineIndex; //The index in byte to the main function
        this.code = exe.routines; //The code to execute
        window.code=this.code;
        this.max_pc = (this.code.byteLength/2 )- 1; //The maximum program counter possible
        this.registers = new Int32Array(this.max_stack); //Ths registers used
        this.constantTable.map(function(item,index,arr){
        	self.memory[index]=item;
        });
        console.clear();
        console.log(this.registers);
    }

    function run(buffer) {
        var runCycle = this.runCycle.bind(this);
        try {
            this.setup(buffer);
            for(var i=0;i<this.max_pc+1;i++)
	            this.requestAnimFrame(runCycle);
        } catch (e) {
            console.error(e);
        }
    }
    return {
        constructor: constructor,
        setup: setup,
        run: run
    };
});