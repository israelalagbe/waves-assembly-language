/**
 * @author Israel
 */
 "use strict";
Class(function() {
	var assembler;
	var editor;
	var fileSystem;
	return {
		constructor : function(asm, ed,fs) {
			assembler = asm;
			editor = ed;
			fileSystem=fs;
			this.init();
		},
		init : function() {
			assembler.setFileSystem(fileSystem);
			editor.onLoad(function() {

			});
			editor.onCompile(function(source) {
				assembler.assemble(source).then(function(res) {
					//editor.compileSuccess(res);
					
				}, function(res) {
					editor.compileError(res);
				});
			});
		},
		run : function() {
		},
		main:function(App){
			$(document).ready(function() {
				var app = new App(new Assembler(parser), new TestEditor, new FileSystem('http://localhost'));
				app.run();
			});
		}
	};
});
