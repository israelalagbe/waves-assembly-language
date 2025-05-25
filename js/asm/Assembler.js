"use strict";
var Assembler = function() {
    var fileSystem = null;
    var symbolTable = null;
    var instrBuilder = null;

    function assembleData(obj) {
        var promise = new Promise(function(resolve, reject) {
            obj.forEach(function(elem, index, obj) {
                var data = obj[index];
                try {
                    var type;
                    if (data.type == "integer")
                        type = SymbolTable.DATA_TYPE_INT;
                    else if (data.type == "char")
                        type = SymbolTable.DATA_TYPE_CHAR;
                    else if (data.type == "string")
                        type = SymbolTable.DATA_TYPE_STRING;
                    symbolTable.setData(data.name, type, data.value);
                } catch (e) {
                    throw {
                        str: e.message,
                        hash: data.info,
                        type: Exception.DUPLICATE_DATA
                    };
                }
            });
            resolve();
        });
        return promise;
    }

    function compile_routine(obj) {
        var promise = new Promise(function(resolve, reject) {
            var totalSize = 0; //Sum of the total size of all routines
            obj.forEach(function(elem, index, obj) {
                //List of the instructions
                var instrBody = [];
                //Name of the routine
                var routine_name = obj[index].label;
                var routineSize = 0;
                var instructions = obj[index].value;
                if (instructions == undefined) console.error(obj.length)
                //Try to Add a reference to instrBody to Routine symbol table
                try {
                    symbolTable.setRoutine(routine_name, instrBody, obj[index].info);
                } catch (e) {
                    var error = {
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
                            var localLabelIndex=totalSize+routineSize;//The index of the local label into the code
                            symbolTable.setLocalLabel(routine_name, instr.label, localLabelIndex);
                        } catch (e) {
                            var error = {
                                str: e.message,
                                hash: obj.info,
                                type: Exception.DUPLICATE_LOCAL_LABEL
                            };
                            reject(error);
                        }
                    }

                }

                //Append a return statement to the end of every routine
                instrBody=instrBody.push([InstrBuilder.Opcodes.RETURN_OP.code, 0xff]);//No register as return
                routineSize+=InstrBuilder.Opcodes.RETURN_OP.size;//Add the size to the overall


                symbolTable.setRoutineIndex(routine_name, totalSize); //Set index of routine into the code
                totalSize += routineSize; //Increment the total routine size
                symbolTable.setRoutineSize(routine_name, routineSize);
            });
            resolve();
        });
        return promise;
    }

    function handleIncludes(includes) {
        var promise = new Promise(function(resolve, reject) {
            for (var i = 0; i < includes.length; i++) {
                var inc = includes[i];
                this.compile_file(inc.value).then(function(res) {
                    resolve(res);
                }, function(e) {
                    reject(e);
                });
            }
        }.bind(this));
        return promise;
    }
    //Build all routines in instruction and partially build constants
    function buildRoutine(code) {
        //The array to store binary code
        var code = [];
        //The size of the routines in byte
        var size = 0;
        //Increase the size of the instructions
        function incSize(s) {
            size += s;
        }
        //Add the routine index into the code
        function addRoutineIndex(name) {

        }
        //Get all available routine names
        var allRoutines = symbolTable.getAllRoutineNames();
        allRoutines.forEach(function(elem, index, obj) {
            //Loop over the routine names to convert it to binary
            //The first routine
            var name = allRoutines[index];
            //The data of of the routine
            var routine = symbolTable.getRoutine(name);
            //The instructions in the routine
            var instructions = routine.value;
            //Loop over the instructions to convert them
            instructions.forEach(function(elem, index, instructions) {

                var instr = instructions[index];
                var opcode = instr[0]; //First Value as opcode
                switch (opcode) {
                    case InstrBuilder.Opcodes.ADD_OP.code:
                    case InstrBuilder.Opcodes.SUB_OP.code:
                    case InstrBuilder.Opcodes.MUL_OP.code:
                    case InstrBuilder.Opcodes.DIV_OP.code:
                        {
                            code = code.concat(instr);
                            break;
                        }
                    case InstrBuilder.Opcodes.GOTO_OP.code:
                        {
                            var opcode = instr[0];
                            var localLabel = instr[1];
                            if (symbolTable.localLabelExist(name, localLabel.name)) {
                                //The index of local label into the routine
                                var index = symbolTable.getLocalLabel(name, localLabel.name);
                                code = code.concat([opcode, index]);
                            } else {
                                var error = {
                                    str: "Local label does not exist",
                                    hash: localLabel.info,
                                    type: Exception.UNKNOWN_LOCAL_LABEL
                                };
                                throw error;
                            }
                            break;
                        }
                    case InstrBuilder.Opcodes.ICONST_OP.code:
                        {
                            var opcode = instr[0];
                            var reg = instr[1];
                            var value = instr[2];
                            if (value instanceof Object) { //If it is an identifier
                                if (symbolTable.exists(value.name, SymbolTable.TYPE_DATA)) {
                                    var index = symbolTable.getDataIndex(value.name);
                                    var start = index >> 8;
                                    var end = index & 0x00ff;
                                    code = code.concat([opcode, reg, start, end]);
                                } else {
                                    var error = {
                                        str: "Data does not exist",
                                        hash: value.info,
                                        type: Exception.UNKNOWN_DATA_DFN
                                    };
                                    throw error;

                                }
                            } else {
                                //If it is of type integer
                                var dataName = symbolTable.newSystemData(value, SymbolTable.DATA_TYPE_INT);
                                var index = symbolTable.getDataIndex(dataName);
                                var start = index >> 8;
                                var end = index & 0x00ff;
                                code = code.concat([opcode, reg, start, end]);
                            }
                            break;
                        }
                    case InstrBuilder.Opcodes.SYSTEM_OP.code:
                        {
                            var opcode = instr[0];
                            var systemNo = instr[1];
                            var regRange = instr[2];
                            //Convert the int16 operand into two int8 start,end
                            var start = regRange >> 8;
                            var end = regRange & 0x00ff;
                            code = code.concat([opcode, systemNo, start, end]);
                            break;
                        }
                    case InstrBuilder.Opcodes.CALL_OP.code:
                        {
                            var opcode = instr[0];
                            var routine = instr[1];
                            if (symbolTable.exists(routine.name, SymbolTable.TYPE_ROUTINE)) {
                                var index = symbolTable.getRoutineIndex(routine.name);
                                var regRange = instr[2];
                                //Convert the int16 operand into two int8 start,end
                                var startIndex = index >> 8;
                                var endIndex = index & 0x00ff;
                                var start = regRange >> 8;
                                var end = regRange & 0x00ff;
                                code = code.concat([opcode, startIndex, endIndex, start, end, 0]); //Pad 0 to the end to satisfy 2 bytes per code
                            } else {
                                var error = {
                                    str: "Routine does not exist",
                                    hash: routine.info,
                                    type: Exception.UNKNOWN_ROUTINE
                                };
                                throw error;
                            }


                            break;
                        }
                    case InstrBuilder.Opcodes.GET_OP.code:
                        {
                            var opcode = instr[0];
                            var reg = instr[1];
                            var value = instr[2];
                            if (symbolTable.exists(value.name, SymbolTable.TYPE_DATA)) {
                                var index = symbolTable.getDataIndex(value.name);
                                var start = index >> 8;
                                var end = index & 0x00ff;
                                code = code.concat([opcode, reg, start, end]);
                            } else {
                                var error = {
                                    str: "Data does not exist",
                                    hash: value.info,
                                    type: Exception.UNKNOWN_DATA_DFN
                                };
                                throw error;

                            }

                            break;
                        }
                    case InstrBuilder.Opcodes.LOAD_OP.code:
                    case InstrBuilder.Opcodes.STORE_OP.code:
                    case InstrBuilder.Opcodes.MOVE_OP.code:
                        {
                            code = code.concat(instr);
                            code=code.concat(0); //Pad 0 to the end
                            break;
                        }
                    case InstrBuilder.Opcodes.RETURN_OP.code:
                    case InstrBuilder.Opcodes.RESULT_OP.code:
                        {
                            code = code.concat(instr);
                            break;
                        }
                    case InstrBuilder.Opcodes.IF_EQ_OP.code:
                    case InstrBuilder.Opcodes.IF_NEQ_OP.code:
                    case InstrBuilder.Opcodes.IF_GT_OP.code:
                    case InstrBuilder.Opcodes.IF_LT_OP.code:
                        {
                            var opcode = instr[0];
                            var reg1=instr[1];
                            var reg2=instr[2];
                            var localLabel = instr[3];
                            if (symbolTable.localLabelExist(name, localLabel.name)) {
                                //The index of local label into the routine
                                var index = symbolTable.getLocalLabel(name, localLabel.name);
                                code = code.concat([opcode,reg1,reg2, index]);
                            } else {
                                var error = {
                                    str: "Local label does not exist",
                                    hash: localLabel.info,
                                    type: Exception.UNKNOWN_LOCAL_LABEL
                                };
                                throw error;
                            }
                            break;
                        }
                    default:
                        {
                            throw {
                                str: "Unknown Opcode",
                                type: Exception.UNKNOWN_OPCODE
                            };
                        }
                }

            });
        });
        return code;
    }

    function fillChar(arr, int1, offset) {
        arr[offset] = int1.charCodeAt(0)
    }

    function fillInt2(arr, int4, offset) {
        arr[offset] = (int4 >> 8) & 0xff;
        arr[offset + 1] = (int4) & 0xff
    }

    function fillInt4(arr, int4, offset) {
        arr[offset] = (int4 >> 24) & 0xff;
        arr[offset + 1] = (int4 >> 16) & 0xff;
        arr[offset + 2] = (int4 >> 8) & 0xff;
        arr[offset + 3] = (int4) & 0xff
    }

    function fillString(arr, str, offset, length) {
        //Fill array with bytes in the string
        for (var i = 0; i < length; i++) {
            var charCode = str.charCodeAt(i);
            arr[offset + i] = charCode & 0xff;
        }
    }

    function fillArray(arr, srcArr, offset, length) {
        //Fill array with bytes in the string
        for (var i = 0; i < length; i++) {
            arr[offset + i] = srcArr[i];
        }
    }
    //Build the final executable
    function buildExecutable(routines) {
        var magic = "Waves"; //The magic number
        var dataBytesCount = 0; //Constants count
        var data = []; //Will contain the byte data in the symbol table
        var allData = symbolTable.getAllData(); //Get the map of all data in symbol table
        var dataNamesOffset = symbolTable.getTotalDataSize(); //Get the total size of constants in symbol table
        var mainIndex = symbolTable.getRoutineIndex('main') //Get the byte index of the main routine
        //console.warn(mainIndex)
        var routineSize = routines.length; //Size in byte of all the routines
        var finalExecutable = []; //Bytes of the final excutable code
        for (var key in allData) {
            //var constant_index=constant_count-1'
            var val = allData[key];
            if (val.dataType == SymbolTable.DATA_TYPE_CHAR) {
                fillChar(data, val.value, val.index);
                dataBytesCount += 1;
            } else if (val.dataType == SymbolTable.DATA_TYPE_INT) {
                fillInt4(data, val.value, val.index);
                dataBytesCount += 4;
            } else if (val.dataType == SymbolTable.DATA_TYPE_STRING) {
                fillString(data, val.value, val.index, val.size);
                dataBytesCount += val.size;
            } else throw new Error("Wring data type");

        }
        fillString(finalExecutable, magic, 0, 5); //Fill the executable with the magic number
        fillInt2(finalExecutable, dataBytesCount, finalExecutable.length) //Fill it with number of constants
        fillArray(finalExecutable, data, finalExecutable.length, dataBytesCount); //Fill it with the constants
        fillInt2(finalExecutable, mainIndex, finalExecutable.length) //Fill with byte index of the main routine
        fillInt2(finalExecutable, routineSize, finalExecutable.length) //Fill with total length of the routines
        fillArray(finalExecutable, routines, finalExecutable.length, routineSize); //Fill it with the routine codes
        return finalExecutable;
    }

    function build() {
        //Check if main routine exists
        if (!symbolTable.exists('main', SymbolTable.TYPE_ROUTINE)) {
            var error = {
                str: "main function doesn't exist",
                hash: { routine: 'main' },
                type: Exception.UNKNOWN_ROUTINE
            };
            throw error;
        };
        var code = buildRoutine();
        var exe = buildExecutable(code);
        return new Uint8Array(exe);
    }

    function constructor() {
        var Parser = parser.Parser;
        instrBuilder = new InstrBuilder();
        symbolTable = new SymbolTable();
        this.fileSystem = new FileSystem();
        Parser.prototype.parseError = function(str, hash) {
            throw {
                str: str,
                hash: hash,
                type: Exception.PARSE_ERROR
            };
        };
        this.parser = parser;
    }

    function compile_file(fname) {
        var that = this;
        var promise = new Promise(function(resolve, reject) {
            //Open the file
            //@param source The source file raed from file system
            that.fileSystem.read(fname).then(function(source) {
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
            }.bind(this))
            .catch(function(e) {
                    //On compile error
                    reject(e);
                });;
        }.bind(this));
        return promise;
    }
    return {
        constructor: constructor,
        //Used to set File system
        setFileSystem: function(FS) {
            this.fileSystem = FS;
            fileSystem = FS;
        },
        handleIncludes: handleIncludes,
        build: build,
        compile_file: compile_file,
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
            for (var index = 0; index < input.length; index++) {
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
                            promises.push(p);

                            break;
                        }
                    case 'routine_list':
                        {
                            var p = compile_routine(input[index].value);
                            promises.push(p);

                            break;
                        }
                };
            }
            //All the promises
            //To make sure they run one after another
            var promise = promiseEach(promises, function(item) {
                return item;
            });

            return promise;
        },
        assemble: function(source) {
            var extension=[
                    '\nprintInt:',
                    'system 0x0 r0',
                    "cls:",
                    'system 0x2',
                    'newline:',
                    "get r0 newLine",
                    'load [r0] r0',
                    "call printChar r0",
                    'printChar:',
                    'system 0x1 r0',
                    'printStr:',
                    'iconst r3 0',
                    'iconst r1 1',
                     '.loop:',
                    'load [r0] r2',
                    'if-eq r2 r3 .stop',
                    'call printChar r2',
                    'add r0 r1 r0',
                    'if-neq r2 r3 .loop',
                    '.stop:',
                    "input:",
                    "system 0x4",
                    "result r0",
                    "return r0",
                    "alloc:",
                    "system 0x3 r0",
                    "result r1",
                    "return r1",
                    "random:",
                    "system 0x5 r0",
                    "result r1",
                    "return r1"
                ].join('\n');
             
                         var self = this;
            var promise = new Promise(function(resolve, reject) {
                try {

                    symbolTable.clear();
                    symbolTable.setData('newLine', SymbolTable.DATA_TYPE_CHAR, "\n");
                    symbolTable.setData('true', SymbolTable.DATA_TYPE_INT, 1);
                    symbolTable.setData('false', SymbolTable.DATA_TYPE_INT, 0);
                    //Start compiling from top level top
                    var c = this.compile(source+extension)
                    c.then(function(res) {
                        resolve(self.build());
                    }, function(e) {
                        reject(e);
                    }).catch(function(e) {
                        reject(e);
                    });
                } catch (e) {
                    reject(e);
                }
            }.bind(this));
            return promise;

        }
    };
};