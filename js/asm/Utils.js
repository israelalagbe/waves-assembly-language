"use strict";
var SymbolTable = function() {
    var dataTable = {};
    var routineTable = {};
    var systemDataIndex = 0;//For system variables or unnamed variables
    var allDataSize = 0; //Data sizes in bytes
    SymbolTable.TYPE_DATA = 1;
    SymbolTable.TYPE_ROUTINE = 2;
    SymbolTable.DATA_TYPE_CHAR = 3;
    SymbolTable.DATA_TYPE_INT = 4;
    SymbolTable.DATA_TYPE_STRING = 5;
    return {
        //To know the type of data stored
        //Set a constant
        setData: function(key, dataType, val) {
            if (this.exists(key, SymbolTable.TYPE_DATA))
                throw new Error('Duplicate Symbol: ' + key);
            var size = 0;
            if (dataType == SymbolTable.DATA_TYPE_CHAR)
                size = 1;
            else if (dataType == SymbolTable.DATA_TYPE_INT)
                size = 4;
            else if (dataType == SymbolTable.DATA_TYPE_STRING){
                val+="\0";//Append a null variable to the end of the string
                size = val.length;
            }
            var before=allDataSize;
            dataTable[key] = { type: SymbolTable.TYPE_DATA, dataType: dataType, value: val, index: allDataSize,size:size,before:before };
            allDataSize += size;
        },
        //Get the stored constant
        getData: function(key) {
            return dataTable[key];
        },
        //Get the byte index in the symbol table
        getDataIndex: function(key) {
            return dataTable[key].index;
        },
        getAllData: function() {
            return dataTable;
        },
		
		getTotalDataSize: function() {
            return allDataSize;
        },
        //Store a routine
        setRoutine: function(key, val, info) {
            if (this.exists(key, SymbolTable.TYPE_ROUTINE))
                throw new Error('Duplicate Routine: ' + key);
            routineTable[key] = { type: SymbolTable.TYPE_ROUTINE, value: val, local_labels: {}, info: info };
        },
        //Get the stored routine
        getRoutine: function(key) {
            return routineTable[key];
        },
		getAllRoutines: function() {
            return routineTable;
        },
        //Get all stored routine
        getAllRoutineNames: function(key) {
            var arr = [];
            for (var key in routineTable)
                arr.push(key);
            return arr;
        },
        //Set routine size in byte
        setRoutineSize: function(name, size) {
            routineTable[name].size = size;
        },
        //Get routine size in byte
        getRoutineSize: function(name) {
            return routineTable[name].size;
        },
        //Set routine index in byte
        setRoutineIndex: function(name, index) {
            routineTable[name].index = index;
        },
        //Get routine index in byte
        getRoutineIndex: function(name) {
            return routineTable[name].index;
        },
        //Get a local label
        getLocalLabel: function(routineName, labelName) {
            /*if(!this.exists(routineName,SymbolTable.TYPE_ROUTINE))
                throw new Error('Routine does not exists');*/
            var routineValue = this.getRoutine(routineName);
            if (routineValue)
                return routineValue.local_labels[labelName];
        },
        //Set a local label under a routine name
        setLocalLabel: function(routineName, labelName, val) {
            if (this.localLabelExist(routineName, labelName))
                throw new Error('Duplicate Local Label: ' + labelName);
            routineTable[routineName].local_labels[labelName] = val;
        },
        //Check if a local label exist
        localLabelExist: function(routineName, labelName) {
            var routineValue = this.getRoutine(routineName) || {};
            return (labelName in (routineValue.local_labels));
        },
        //Check if routine or constant exist
        exists: function(key, type) {
            if (type == SymbolTable.TYPE_DATA)
                return (key in dataTable);
            else if (type == SymbolTable.TYPE_ROUTINE)
                return (key in routineTable);
            //return (key in Table)&&type==Table[key].type;
        },
        //DataType for storing unnamed integer value in the symbol table
        newSystemData: function(value, dataType) {
            var prefix = "_";
            var suffix = '_WV';
            var dataName = prefix + (systemDataIndex++) + suffix; //New system data name
            while (this.exists(dataName, SymbolTable.TYPE_DATA))
                dataName = prefix + (systemDataIndex++) + suffix; //Choose another one
            this.setData(dataName, dataType, value);
            return dataName;
        },
        clear: function() {
            //Clear the symbol table and begin a new one
            dataTable = {};
            routineTable = {};
            systemDataIndex = 0;
            allDataSize = 0; //Data sizes in bytes
        }
    };
};
//All exception codes used in the application
var Exception = Class({
    $const: {
        PARSE_ERROR: 1,
        ASSEMBLE: 2,
        DUPLICATE_DATA: 3,
        DUPLICATE_ROUTINE: 4,
        DUPLICATE_LOCAL_LABEL: 5,
        UNKNOWN_OPERAND_TYPE: 6,
        INVALID_OPERAND_TYPE: 7,
        REG_RANGE_ERROR: 8,
        UNKNOWN_ROUTINE: 9,
        INTEGER_RANGE_ERROR: 10,
        FILE_ERROR: 11,
        UNKNOWN_LOCAL_LABEL: 12,
        UNKNOWN_OPCODE: 13,
        UNKNOWN_DATA_DFN: 14,//Unknow data definition
        INVALID_EXE:15//Invalid executable file
    }
});
var InstrBuilder = Class(
    function() {
        return {
            $statics: {
                Opcodes: {},
                Operands: {
                    Reg: 1,
                    Integer: 2,
                    Identifier: 4,
                    RegRange: 8,
                    NoReg: 16,
					Null:32
                },
                OP_MAP: {},
                get_op_code: function(name) {
                    return InstrBuilder.OP_MAP[name];
                }
            },
            constructor: function() {
                InstrBuilder.Opcodes = {
                    ADD_OP: {
                        code: 0, //The opcode number
                        size: 4, //The size of the instruction in byte
                        operand_count: 3, //The number of operand
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg]
                    },
                    SUB_OP: {
                        code: 1,
                        size: 4,//byte
                        operand_count: 3,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg]
                    },
                    MUL_OP: {
                        code: 2,
                        size: 4,
                        operand_count: 3,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg]
                    },
                    DIV_OP: {
                        code: 3,
                        size: 4,
                        operand_count: 3,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg]
                    },
                    ICONST_OP: {
                        code: 4,
                        size: 4,//1 byte for opcode and 1 for  reg&& 2 byte for operand index into the code
                        operand_count: 2,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Integer|InstrBuilder.Operands.Identifier]
                    },
                    SYSTEM_OP: {
                        code: 5,
                        size: 4,//1 byte opcode, 1 byte integer, 2 byte reg range
                        operand_count: 2,
                        operands: [InstrBuilder.Operands.Integer, InstrBuilder.Operands.Reg | InstrBuilder.Operands.RegRange | InstrBuilder.Operands.NoReg]
                    },
                    GOTO_OP: {
                        code: 6,
                        size: 2,//1 bye opcode, 1 for index into local label routine table
                        operand_count: 1,
                        operands: [InstrBuilder.Operands.Identifier]
                    },
                    CALL_OP: {
                        code: 7,
                        size: 6,//1 byte opcode, 2 identifier index, 2 register range
                        operand_count: 2,
                        operands: [InstrBuilder.Operands.Identifier, InstrBuilder.Operands.Reg | InstrBuilder.Operands.RegRange | InstrBuilder.Operands.NoReg]
                    },
                    GET_OP: {
                        code: 8,
                        size: 4,//1 bye opcode,1 for reg, 2 for index into constant table
                        operand_count: 2,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Identifier]
                    },
                    LOAD_OP: {
                        code: 9,
                        size: 4,//1 bye opcode,1 for reg, 1 for reg, 1 for null
                        operand_count: 2,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg]
                    },
                    STORE_OP: {
                        code: 10,
                        size: 4,//1 bye opcode,1 for reg, 1 for reg, 1 for null
                        operand_count: 2,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg]
                    },
                    MOVE_OP: {
                        code: 11,
                        size: 4,//1 bye opcode,1 for reg, 1 for reg, 1 for null
                        operand_count: 2,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg]
                    },
                    RETURN_OP: {
                        code: 12,
                        size: 2,//1 bye opcode,1 for reg
                        operand_count: 1,
                        operands: [InstrBuilder.Operands.Reg|InstrBuilder.Operands.NoReg]
                    },
                    RESULT_OP: {
                        code: 13,
                        size: 2,//1 bye opcode,1 for reg
                        operand_count: 1,
                        operands: [InstrBuilder.Operands.Reg]
                    },
                    IF_EQ_OP: {
                        code: 14,
                        size: 4,//1 bye opcode,1 for reg,1 for reg,1 for index into routine list
                        operand_count: 3,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Identifier]
                    },
                    IF_NEQ_OP: {
                        code: 15,
                        size: 4,//1 bye opcode,1 for reg,1 for reg,1 for index into routine list
                        operand_count: 3,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Identifier]
                    },
                    IF_GT_OP: {
                        code: 16,
                        size: 4,//1 bye opcode,1 for reg,1 for reg,1 for index into routine list
                        operand_count: 3,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Identifier]
                    },
                    IF_LT_OP: {
                        code: 17,
                        size: 4,//1 bye opcode,1 for reg,1 for reg,1 for index into routine list
                        operand_count: 3,
                        operands: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Identifier]
                    }
                };
                InstrBuilder.OP_MAP = {
                    add: InstrBuilder.Opcodes.ADD_OP,
                    sub: InstrBuilder.Opcodes.SUB_OP,
                    mul: InstrBuilder.Opcodes.MUL_OP,
                    div: InstrBuilder.Opcodes.DIV_OP,
                    iconst: InstrBuilder.Opcodes.ICONST_OP,
                    system: InstrBuilder.Opcodes.SYSTEM_OP,
                    goto: InstrBuilder.Opcodes.GOTO_OP,
                    call: InstrBuilder.Opcodes.CALL_OP,
                    get:  InstrBuilder.Opcodes.GET_OP,
                    load:  InstrBuilder.Opcodes.LOAD_OP,
                    store:  InstrBuilder.Opcodes.STORE_OP,
                    move:  InstrBuilder.Opcodes.MOVE_OP,
                    return:  InstrBuilder.Opcodes.RETURN_OP,
                    result:  InstrBuilder.Opcodes.RESULT_OP,

                    "if-eq":InstrBuilder.Opcodes.IF_EQ_OP,
                    "if-neq":InstrBuilder.Opcodes.IF_NEQ_OP,
                    "if-gt":InstrBuilder.Opcodes.IF_GT_OP,
                    "if-lt":InstrBuilder.Opcodes.IF_LT_OP,
                };
            },
            //Parse a numeric value into an integer 
            parseInteger: function(val, info) {
                var num = Number(val);
                if (num > this.max_int) {
                    throw {
                        str: "Max Integer value supported reached",
                        hash: info,
                        type: Exception.INTEGER_RANGE_ERROR
                    };
                }
                var integer = num | 0; //Convert to signed integer
                return integer;
            },
            //Parse a register number
            parseReg: function(val, info) {
                var reg = Number(val);
                if (reg < 0 || reg > 0xfe) {
                    throw {
                        str: "Register should be in range r0-r254",
                        hash: info,
                        type: Exception.REG_RANGE_ERROR
                    };
                }
                return reg;
            },
            //Parse a range of registers into an int16 value
            parseRegRange: function(start, stop, info) {
                var range = this.parseReg(start, info) << 8 | this.parseReg(stop, info);
                return range;
            },
            //Convert each instruction to binary or partial binary format
            convertInstruction: function(obj) {
                this.max_int = 0xffffffff; //Max value of integer supported

                var opcode_spec = InstrBuilder.OP_MAP[obj.opcode]; //Get the specification of the opcode
                var instr = [];
                //Push the instruction
                instr.push(opcode_spec.code);
                //Push the operands


                for (var i = 0; i < opcode_spec.operand_count; i++) {
                    var operandType = opcode_spec.operands[i];
                    var operand = obj.operand[i];

                    switch (operandType) {
                        case InstrBuilder.Operands.Reg:
                            {
                                var reg = this.parseReg(operand, obj.info);
                                //Push the operand
                                instr.push(reg);
                                break;
                            }
                        case InstrBuilder.Operands.Integer:
                            {
                                var integer = this.parseInteger(operand, obj.info);
                                //Push the operand
                                instr.push(integer);
                                break;
                            }
                        case InstrBuilder.Operands.Integer|InstrBuilder.Operands.Identifier:
                            {
                                if (/^[0-9]+$/.test(operand)){
                                    instr.push(this.parseInteger(operand, obj.info));
                                }else{
                                     instr.push({name:operand,info:obj.info});
                                };
                                break;
                            }
                        case InstrBuilder.Operands.Reg | InstrBuilder.Operands.RegRange | InstrBuilder.Operands.NoReg:
                            {
                                if (operand instanceof Object) {
                                    var range = this.parseRegRange(operand[0], operand[1], obj.info);
                                } else if (operand === null) { //Instruction with no register
                                    var range = 0xff << 8 | 0xff;//Register at 0xff will not be used
                                } else {
                                    var range = this.parseRegRange(operand, operand, obj.info);
                                }
                                instr.push(range);
                                break;
                            }
                        case InstrBuilder.Operands.Reg | InstrBuilder.Operands.NoReg:
                            {
                                var reg;
                                if (operand === null) { //Instruction with no register
                                    reg = 0xff;//Register at 0xff will not be used
                                } else {
                                    reg = this.parseReg(operand,obj.info);
                                }
                                instr.push(reg);
                                break;
                            }
                        case InstrBuilder.Operands.Identifier:
                            {
                                //Don't convert yet because of other unresolved symbol
                                instr.push({ name: operand, info: obj.info });
                                break;
                            }
                        default:
                            {
                                throw {
                                    str: "Unknown Operand Type",
                                    hash: obj.info,
                                    type: Exception.UNKNOWN_OPERAND_TYPE
                                };
                            }
                    }
                }
                return instr;
            },
            validateOperand: function(str, value) {
                switch (code) {
                    case InstrBuilder.Operands.Reg:
                        {}
                }
            }
        }
    });