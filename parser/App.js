/**
 * @author Israel
 */
 "use strict";
Class(function() {
	var assembler;
	var editor;
	var fileSystem;
	var virtualMachine;
	return {
		constructor : function(asm, ed,fs,vm) {
			assembler = asm;
			editor = ed;
			assembler.setFileSystem(fs);
			virtualMachine=vm;
			this.init();
		},
		init : function() {
			var self=this;
			editor.onLoad(function() {

			});
			editor.onCompile(function(source) {
				assembler.assemble(source).then(function(res) {
					self.compiledBuffer=res.buffer;
				}, function(res) {
					editor.compileError(res);
				});
			});
			editor.onRun(function(){
				if(self.compiledBuffer)
					virtualMachine.run(self.compiledBuffer);
				else
					alert("Source file not compiled");
			});
		},
		run : function() {
		},
		main:function(App){
			$(document).ready(function() {
				var asm=new Assembler(parser);
				asm.constructor();
				var app = new App(asm, new TestEditor, new FileSystem('http://localhost'),new VM);
				app.run();
			});
		}
	};
});
