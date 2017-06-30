/**
 * @author Israel
 */
"use strict";
//require('hello')
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
                //console.error("dd")
            });
            editor.onCompile(function(source) {
                assembler.assemble(source).then(function(res) {
                    //decompile(res);
                    self.compiledBuffer = res.buffer;
                    /*$.post(
                        "bin/saveBin.php", { code: new StringView(self.compiledBuffer).toString() }
                    );*/
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
                var app = new App(asm, new WavesEditor, new FileSystem('http://localhost'), new VM);
                app.run();
            });
        }
    };
});