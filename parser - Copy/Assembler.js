"use strict";
var Assembler = Class(function() {
    var fileSystem = null;
    var symbolTable = null;
    var instrBuilder = null;

    function assembleData(obj) {
        var promise = new Promise(function(resolve,reject) {
            for (var index in obj) {
                var data = obj[index];
                try {
                    symbolTable.setData(data.name, data.type, data.value);
                } catch (e) {
                    throw {
                        str: e.message,
                        hash: data.info,
                        type: Exception.DUPLICATE_DATA
                    };
                }
            }
            resolve();
        });
        return promise;
    }

    function compile_routine(obj) {
        var promise = new Promise(function(resolve,reject) {
            for (var index in obj) {
                //List of the instructions
                var instrBody = [];
                //Name of the routine
                var routine_name = obj[index].label;
                var routineSize = 0;
                var instructions = obj[index].value;
                //Try to Add a reference to instrBody to Routine symbol table
                try {
                    symbolTable.setRoutine(routine_name, instrBody);
                } catch (e) {
                    var error= {
                        str: e.message,
                        hash: obj[index].info,
                        type: Exception.DUPLICATE_ROUTINE
                    };
                    reject(error);
                }

                for (var i = 0; i < instructions.length; i++) {
                    var instr = instructions[i];
                    if (instr.type == "program") {
                        //Convert the instructions into numbers
                        var convertedInstr = instrBuilder.convertInstruction(instr);
                        //Push converted instruction into the instrution list
                        instrBody.push(convertedInstr);
                        //Increment the size of the routine
                        routineSize += InstrBuilder.OP_MAP[instr.opcode].size;
                    } else {
                        //Try to set the local label
                        try {
                            symbolTable.setLocalLabel(routine_name, instr.label, routineSize);
                        } catch (e) {
                            var error= {
                                str: e.message,
                                hash: obj.info,
                                type: Exception.DUPLICATE_LOCAL_LABEL
                            };
                            reject(error);
                        }
                    }

                }
                //this.InstrBuilder.OP_MAP[name];
                //console.log(symbolTable.getRoutine(routine_name))

            }
            resolve();
        });
        return promise;
    }

    function handleIncludes(includes) {
        var promise = new Promise(function(resolve, reject) {
            for (var i in includes) {
                var inc = includes[i];
                if (inc.type == "include_js") {

                } else {
                    this.compile_file(inc.value).then(function(res) {
                        resolve(res);
                    }, function(e) {
                        reject(e);
                    });
                }
            }
        }.bind(this));
        /*for(var i in includes){
            var inc=includes[i];
            if(inc.type=="include_js"){
                //console.log("Including js"+inc.value)
                fileSystem.read(inc.value).then(function(){

                },function(res){
                    console.log(res)
                });
            }
            else{

                var promise=this.compile_file(inc.value).then(function(res){
                    console.log(res)
                },function(e){
                    return e;
                });
                //console.log("Including asm"+inc.value)
                promises.push(promise);
            }
        }*/
        return promise;
    }

    function build() {
        //Check if main routine exists
        if (!symbolTable.exists('main', SymbolTable.TYPE_ROUTINE)) {

        };
    }
    return {
        constructor: function(parser) {
            var Parser = parser.Parser;
            instrBuilder = new InstrBuilder();
            symbolTable = new SymbolTable();
            Parser.prototype.parseError = function(str, hash) {
                throw {
                    str: str,
                    hash: hash,
                    type: Exception.PARSE_ERROR
                };
            };
            this.parser = parser;
        },
        //Used to set File system
        setFileSystem: function(FS) {
            fileSystem = FS;
        },
        handleIncludes: handleIncludes,
        build: build,
        compile_file: function(fname) {
            var that = this;
            var promise = new Promise(function(resolve, reject) {
                //Open the file
                //@string source The source file raed from file system
                fileSystem.read(fname).then(function(source) {
                    //resolve(content);
                    that.compile(source).then(function(res) {
                        //Compilation success
                        resolve(res);
                    }, function(e) {
                        //On compile error
                        reject(e);
                    });
                }, function(e) {
                    //File reading error
                    var error = {
                        str: e,
                        hash: { file: fname },
                        type: Exception.FILE_ERROR
                    };
                    reject(error);
                });
            });
            return promise;
        },
        compile: function(source) {
            function promiseEach(promises, fn) {
                var p = promises.reduce(function(initialvalue, currentValue, index, arr) {
                    return initialvalue.then(function() {
                        return fn(currentValue);
                    });
                }, Promise.resolve());
                return p;
            }
            var promises = [];
            var input = this.parser.parse(source);
            var done_including = false;
            for (var index in input) {
                //console.log(input[index]);
                switch (input[index].type) {

                    case 'data_block':
                        {
                            var p = assembleData(input[index].value);
                            promises.push(p);
                            break;
                        }
                    case 'include_list':
                        {
                            var p = this.handleIncludes(input[index].value);
                            /*.then(function(res) {
                                                                resolve(input);
                                                            }, function(e) {
                                                                reject(e);
                                                            });*/
                            promises.push(p);
                            break;
                        }
                    case 'routine_list':
                        {
                            var p = compile_routine(input[index].value);
                            promises.push(p);
                            break
                        }
                };
            }
            //All the promises
            //To make sure they run one after another
            var promise = promiseEach(promises,function(item){
                return item;
            });
            /*.then(function(){

                        },function(){

                        })*/
            ;
            return promise;
        },
        assemble: function(source) {
            var promise = new Promise(function(resolve, reject) {
                try {
                    symbolTable.clear();
                    //Start compiling from top level top
                    var c=this.compile(source)
                    c.then(function(res) {
                        resolve(res);
                    }, function(e) {
                        reject(e);
                    });
                    //resolve(result);
                } catch (e) {
                    reject(e);
                }
            }.bind(this));
            return promise;

        }
    };
});