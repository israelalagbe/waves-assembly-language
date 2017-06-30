"use strict";
var WavesExeReader = Class({
    setBuffer: function(buffer) {
        this._view = new DataView(buffer); //The arra
        this._strView = new StringView(buffer);
    },
    read: function() {
        var margic = this._strView.subview(0, 5).toString(); //5 bytes
        var constant_lenght = this._view.getUint16(5); //2 byte
        var constants = new Uint8Array(this._view.buffer, 7, constant_lenght); //Read the constant data
        var mainRoutineIndex = this._view.getUint16(5 + 2 + constant_lenght);
        var routines_length = this._view.getUint16(5 + 2 + constant_lenght + 2);
        var routines = new DataView(this._view.buffer, 5 + 2 + constant_lenght + 2 + 2, routines_length); //Read the routines
        return {
            margic: margic,
            constant_lenght: constant_lenght,
            constants: constants,
            mainRoutineIndex: mainRoutineIndex,
            routines_length: routines_length,
            routines: routines
        };
    }
});
Function.prototype.debounce = function (threshold, execAsap) {
 
    var func = this, timeout;
 
    return function debounced () {
        var obj = this, args = arguments;
        function delayed () {
            if (!execAsap)
                func.apply(obj, args);
            timeout = null; 
        };
 
        if (timeout)
            clearTimeout(timeout);
        else if (execAsap)
            func.apply(obj, args);
 
        timeout = setTimeout(delayed, threshold || 100); 
    };
 
}
// Array.map polyfill
/*
if (Array.prototype.map === undefined) {
  Array.prototype.map = function(fn) {
    var rv = [];
    
    for(var i=0, l=this.length; i<l; i++)
      rv.push(fn(this[i]));

    return rv;
  };
}
if (Uint8Array.prototype.map === undefined) {
    Uint8Array.prototype.map = function(fn) {
    var rv = [];
    
    for(var i=0, l=this.length; i<l; i++)
      rv.push(fn(this[i]));

    return rv;
  };
}


// Array.filter polyfill
if (Array.prototype.filter === undefined) {
  Array.prototype.filter = function(fn) {
    var rv = [];
    
    for(var i=0, l=this.length; i<l; i++)
      if (fn(this[i])) rv.push(this[i]);

    return rv;
  };
}
*/
var OP={
	add:0,
	sub:1,
	mul:2,
	div:3,
	iconst:4,
	system:5,
	goto:6,
	call:7,
    get:8,
    load:9,
    store:10,
    move:11,
    return:12,
    result:13,
    if_eq:14,
    if_neq:15,
    if_gt:16,
    if_lt:17
};
var Memory=Class({
	constructor:function(){
		this.memory=new Uint8Array(0xffff);
        this.heap_start=-1;
        this.heap_stop=-1;
	},
    readReg:function(address){
        var absoluteAddress=this.fp+address;
        if (absoluteAddress < 0 || absoluteAddress >= this.max_stack) {
            throw "Register access violation at " + absoluteAddress;
        }
        return this.registers[absoluteAddress];
    },
    saveReg:function(address, value){
        var absoluteAddress=this.fp+address;
        if (absoluteAddress < 0 || absoluteAddress >= this.max_stack) {
            throw "Register access violation at " + absoluteAddress;
        }
        this.registers[absoluteAddress]=value;
    },
	load:function(address){
    	if (address < 0 ||address>this.heap_stop || address >= this.memory.byteLength) {
            throw "Memory access violation at " + address;
        }
        return this.memory[address];
    },
	store:function(address,byte){
    	if (address < 0 || address<this.heap_start||address>this.heap_stop|| address >= this.memory.byteLength) {
            throw "Memory access violation at " + address;
        }
       this.memory[address]=byte;
    },
    storeInt:function(address,value){
        this.store(address,(value>>24)&0xff);
        this.store(address+1,(value>>16)&0xff);
        this.store(address+2,(value>>8)&0xff);
        this.store(address+3,(value)&0xff);
    },
    loadInt:function(address){
        return this.load(address)<<24|this.load(address+1)<<16|this.load(address+2)<<8|this.load(address+3);
    },
    allocate_memory:function(size){
        if(size+this.heap_stop>= this.memory.byteLength){
            throw "Memory full";
        }
        var current_heap=this.heap_stop;
        if(size>0)
            current_heap+=1;
        this.heap_stop+=size;
        //Zero pad the memory
        for (var i=current_heap; i<current_heap+size; i++) {
            this.store(i,0);
        }
        return current_heap;
    },
    storeString:function(str,pointer,length){
        var writeSize=str.length;
        if(writeSize>=length)
            writeSize=length-1;//Save a byte for null
        for (var i = pointer;i<pointer+writeSize;i++) {
            var byte=str.charCodeAt(i-pointer);
            this.store(i,byte);//);
        }
        this.store(pointer+writeSize,"\0");//Store the null byte
        return pointer;
    }
});