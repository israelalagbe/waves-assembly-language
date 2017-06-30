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
var OP={
	add:0,
	sub:1,
	mul:2,
	div:3,
	iconst:4,
	system:5,
	goto:6,
	call:7
};
var Memory=Class({
	constructor:function(){
		this.memory=new Uint8Array(0xffff);
        this.memory_offset=0;
	},
	load:function(address){
    	if (address < 0 || address >= this.memory.byteLength) {
            throw "Memory access violation at " + address;
        }
        return this.memory[address];
    },
	store:function(address,byte){
    	if (address < 0 || address >= this.memory.byteLength) {
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
    }
});