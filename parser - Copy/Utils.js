"use strict";
var SymbolTable = Class(function() {
    var dataTable = {};
    var routineTable = {};
    return {
        $statics: {
            TYPE_DATA: 1,
            TYPE_ROUTINE: 2,
            DATA_TYPE_CHAR: 3,
            DATA_TYPE_INT: 4,
            DATA_TYPE_STRING: 5,
        },
        setData: function(key, dataType, val) {
            if (this.exists(key, SymbolTable.TYPE_DATA))
                throw new Error('Duplicate Symbol: ' + key);
            dataTable[key] = { type: SymbolTable.TYPE_DATA, dataType: dataType, value: val };
        },
        getData: function(key) {
            return dataTable[key];
        },
        setRoutine: function(key, val, opt) {
            if (this.exists(key, SymbolTable.TYPE_ROUTINE))
                throw new Error('Duplicate Routine: ' + key);
            routineTable[key] = { type: SymbolTable.TYPE_ROUTINE, value: val, local_labels: {}, opt: opt };
        },
        getRoutine: function(key) {
            return routineTable[key];
        },
        getLocalLabel: function(routineName, labelName) {
            /*if(!this.exists(routineName,SymbolTable.TYPE_ROUTINE))
            	throw new Error('Routine does not exists');*/
            var routineValue = this.getRoutine(routineName);
            return routineValue.local_labels[labelName];
        },
        setLocalLabel: function(routineName, labelName, val) {
            if (this.localLabelExist(routineName, labelName))
                throw new Error('Duplicate Local Label: ' + labelName);
            routineTable[routineName].local_labels[labelName] = val;
        },
        localLabelExist: function(routineName, labelName) {
            var routineValue = this.getRoutine(routineName);
            return labelName in routineValue.local_labels;
        },
        exists: function(key, type) {
            if (type == SymbolTable.TYPE_DATA)
                return (key in dataTable);
            else if (type == SymbolTable.TYPE_ROUTINE)
                return (key in routineTable);
            //return (key in Table)&&type==Table[key].type;
        },
        clear: function() {
            //Clear the symbol table and begin a new one
            dataTable = {};
            routineTable = {};
        }
    };
});
var Exception = Class({
    $const: {
        PARSE_ERROR: 1,
        ASSEMBLE: 2,
        DUPLICATE_DATA: 3,
        DUPLICATE_ROUTINE: 4,
        DUPLICATE_LOCAL_LABEL: 5,

        REG_RANGE_ERROR: 6,
        FILE_ERROR: 7
    }
});
var InstrBuilder = Class(
    function() {
        return {
            $statics: {
                Opcodes: {},
                Operands: {
                    Reg: 10,
                    Number: 20,
                    Identifier: 30,
                    RegRange: 40
                },
                OP_MAP: {},
                get_op_code: function(name) {
                    return InstrBuilder.OP_MAP[name];
                }
            },
            constructor: function() {
                InstrBuilder.Opcodes = {
                    ADD_OP: {
                        code: 0,
                        size: 4,
                        opcode_count: 3,
                        opcodes: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg]
                    },
                    SUB_OP: {
                        code: 1,
                        size: 4,
                        opcode_count: 3,
                        opcodes: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg]
                    },
                    MUL_OP: {
                        code: 2,
                        size: 4,
                        opcode_count: 3,
                        opcodes: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg]
                    },
                    DIV_OP: {
                        code: 3,
                        size: 4,
                        opcode_count: 3,
                        opcodes: [InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg, InstrBuilder.Operands.Reg]
                    }
                };
                InstrBuilder.OP_MAP = {
                    add: InstrBuilder.Opcodes.ADD_OP,
                    sub: InstrBuilder.Opcodes.SUB_OP,
                    mul: InstrBuilder.Opcodes.MUL_OP,
                    div: InstrBuilder.Opcodes.DIV_OP
                };
            },
            parseReg: function(val) {
                if (val < 0 || val > 0xff)
                    return Number(val);
                else
                    return null;

            },
            convertInstruction: function(obj) {
                var opcode_spec = InstrBuilder.OP_MAP[obj.opcode];
                var instr = [];
                //Push the instruction
                instr.push(opcode_spec.code);
                //Push the operands
                for (var i = 0; i < opcode_spec.opcode_count; i++) {
                    var operandType = opcode_spec.opcodes[i];
                    switch (operandType) {
                        case InstrBuilder.Operands.Reg:
                            {
                                var reg = Number(obj.operand[i]);
                                if (reg < 0 || reg > 0xff) {
                                    throw {
                                        str: "Register should be in range r0-r255",
                                        hash: obj.info,
                                        type: Exception.REG_RANGE_ERROR
                                    };
                                }
                                //Push the operand
                                instr.push(reg)
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