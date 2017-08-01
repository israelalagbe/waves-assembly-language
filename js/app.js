/**
 * @author Israel
 */
"use strict";
Class(function() {
    var assembler;
    var editor;
    var fileSystem;
    var virtualMachine;
    var operatingSystem;
    return {
        constructor: function(asm, ed, fs, vm) {
            assembler = asm;
            editor = ed;
            editor.setFileSystem(fs);
            assembler.setFileSystem(fs);
            virtualMachine = vm;
            operatingSystem = new OperatingSystem();
            vm.setEvents(operatingSystem.events);
            this.init();
        },
        init: function() {
            var self = this;
            editor.onLoad(function() {
                editor.loader.hide();
            });
            editor.onCompile(function(source) {
                assembler.assemble(source).then(function(res) {
                    self.compiledBuffer = res.buffer;
                    editor.compileSuccess();
                }, function(res) {
                    editor.compileError(res);
                    self.compiledBuffer = null;
                });
            });
            editor.onRun(function() {
                if (self.compiledBuffer) {
                    virtualMachine.run(self.compiledBuffer);
                } else {
                    editor.alert("Warn", "Source file not compiled");
                }
            });
        },
        run: function() {},
        main: function(App) {
            $(document).ready(function(){
                var asm = new Assembler(parser);
                asm.constructor();
                var app = new App(asm, new WavesEditor, new FileSystem(), new VM);
                app.run();
            });
        }
    };
});