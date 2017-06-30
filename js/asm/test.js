"use strict";
$(document).ready(function() {
    function assert(cond, msg) {
        if (!cond) {
            if (!msg)
                throw new Error("Assertion failed");
            else
                throw new Error("Assertion failed:\n" + msg);
        }
    }

    function assertThrow(fn, obj, msg) {
        try {
            fn();
        } catch (e) {
            if (obj == null)
                return;
            else if (e instanceof Error && e.message == obj.message)
                return;
            else if (e == obj)
                return;
        }
        if (!msg)
            throw new Error("Throw Assertion failed");
        else
            throw new Error("Throw Assertion failed:\n" + msg);
    }


    var fs = new FileSystem('');
	fs.define('file2.txt',"This is content of file2");
    fs.read('file2.txt').then(function(content) {
        assert(content === "This is content of file2", "File content assertion failed");
    }, function() {
        assert(false, 'cant open file');
    });
    fs.read('doesnotexist.txt').then(function(content) {
        assert(false, "File should not exist");
    }, function() {});


    var symbolTable = new SymbolTable;
    symbolTable.setData('mess', SymbolTable.DATA_TYPE_STRING, "hello world");
    assert(symbolTable.exists('mess', SymbolTable.TYPE_DATA), "Message should exist in the symbol table");
    var symbolValue = symbolTable.getData('mess');
    assert(symbolValue.type == SymbolTable.TYPE_DATA, "Message type should be data");
    assert(symbolValue.dataType == SymbolTable.DATA_TYPE_STRING, "Message dataType should be string");
    assert(symbolValue.value == 'hello world\0', "Message value should be hello world");
    assertThrow(function() {
        symbolTable.setData('mess', SymbolTable.DATA_TYPE_STRING, "hi world");
    }, new Error('Duplicate Symbol: ' + "mess"), "Should throw duplicate symbol error");

//symbolTable.setData('_0_WV', SymbolTable.DATA_TYPE_STRING, "hello world");
    assert(/^_[\d]+_WV$/.test(symbolTable.newSystemData('a', SymbolTable.DATA_TYPE_CHAR)), "Should return system data in this format");

    symbolTable.setRoutine('testRoutine', []);
    assert(symbolTable.exists('testRoutine', SymbolTable.TYPE_ROUTINE), "Routine should exist in the symbol table");
    var routineBody = symbolTable.getRoutine('testRoutine');
    assert(routineBody.type == SymbolTable.TYPE_ROUTINE, "Should be equal");
    assert(symbolTable.localLabelExist('testRoutine', "testLabel") == false, "Should not exist");
    symbolTable.setLocalLabel('testRoutine', 'testLabel', 4);
    assert(symbolTable.getLocalLabel('testRoutine', 'testLabel') == 4, "Local label value should be 4");
    assertThrow(function() {
        symbolTable.setLocalLabel('testRoutine', 'testLabel', 5);
    }, null, "Should throw an exception");

    assert(Exception.PARSE_ERROR == 1, "Parse error should equal 1");
    assert(Exception.ASSEMBLE == 2, "Assemble error should equal 2");
    assert(Exception.DUPLICATE_DATA == 3, "Duplicate data error should equal 3");
    assert(Exception.DUPLICATE_ROUTINE == 4, "Duplicate routine error should equal 4");
    
    
    var testAsm = new Assembler(parser);
	testAsm.constructor();
    var source = [
        ".include \"file2.asm\"",
        ".data",
        ".int numbera 40",
        ".end",
        "main:",
        "add r0 r0 r1"
    ].join('\n');
    testAsm.assemble(source).then(function(res) {
        //assert(res.length==3,"Assembler result length should be 3");
        //assert(res[0].type=="data_block","First type of result must be data_block");
        //assert(res[1].type=="include_list","Second type of result must be include_list");
        //ssert(res[2].type=="routine_list","Third type of result must be routine_list");

        //editor.compileSuccess(res);
    }, function(res) {
        assert(false, "Error thrown in assembler" + JSON.stringify(res));
    });
    var testAsm = new Assembler(parser);
    testAsm.constructor();
    testAsm.compile_file("Notfile.asm").then(function() {
        assert(false, "File should not exist");
    }, function() {});
    testAsm.compile_file("file.asm").then(function(res) {}, function(e) {
        console.error(e);
        assert(false, "Error compiling file:" + JSON.stringify(e));
    });


    var testAsm = new Assembler(parser);
    testAsm.constructor();
    var source = ".data .end data";
    testAsm.assemble(source).then(function(res) {
            assert(false, "Should result in a syntax error")
        },
        function(error) {
            assert(typeof error.str == "string", "Should be a string");
            assert(typeof error.hash == "object", "Should be an object");
            assert(typeof error.type == "number", "Should be a number");
            assert(error.type == Exception.PARSE_ERROR, "Should be a parse error");
        });
    assertThrow(function() {
        testAsm.build();
    });
    var testAsm = new Assembler(parser);
    testAsm.constructor();
    var source = ["main:",
        ".a:",
        "add r0 r1 r2",
        "goto .c",
        ".b:"
    ].join('\n');
    testAsm.assemble(source).then(function(res) {}, function(err) {});
    assertThrow(function() {
        testAsm.build();
    }, null, "Should throw local label exception");


    

    var testAsm = new Assembler(parser);
    testAsm.constructor();
    var source = [
        ".data   .int hello 40 .string mess \"hello world\"  .char myChar 'A'   .end",
        "main:",
        ".a:",
        "add r0 r1 r2",
        "goto .a",
        "goto .b",
        ".b:",
        "system 0xff r254-r33",
        "call you r0",
        "you:",
        "call you",
        "system 0xee",
        "iconst r0 hello",
        "get r0 mess",
        "load [r0], r1",
        "store r0, [r1]",
        "move r0, r1",
        "return r55",
        "return",
        "result r10",
        ".here:",
        "if-eq r0 r1 .here",
        "if-neq r0 r1 .here",
        "if-lt r0 r1 .here",
        "if-gt r0 r1 .here"
    ].join('\n');
    testAsm.assemble(source).then(function(res) {
        var codes = res;
		var dataOffset=0;
		//Verify Magic number
		assert(String.fromCharCode(codes[0])=="W")
		assert(String.fromCharCode(codes[1])=="a")
		assert(String.fromCharCode(codes[2])=="v")
		assert(String.fromCharCode(codes[3])=="e");
		assert(String.fromCharCode(codes[4])=="s");
		//Length of the constant
		var dataLen=codes[5]<<8|codes[6];
						  //Magic + mainroutine Index+allroutineLength
		var dataLenOffSet=5+2+dataLen;
		dataOffset=dataLenOffSet+2+2;
		
        assert(codes[dataOffset+5] == 0, "The label index for goto .a must be 0");
        assert(codes[dataOffset+7] == 8, "The label index for goto .b must be 8");

        assert(codes[dataOffset+9] == 255, "The system number should be 0xff");
        assert(codes[dataOffset+10] == 254, "The start register should be 254");
        assert(codes[dataOffset+11] == 33, "The end register should be 33");



        assert(codes[dataOffset+0] == InstrBuilder.Opcodes.ADD_OP.code);
        assert(codes[dataOffset+4] == InstrBuilder.Opcodes.GOTO_OP.code);
        assert(codes[dataOffset+6] == InstrBuilder.Opcodes.GOTO_OP.code);
        assert(codes[dataOffset+8] == InstrBuilder.Opcodes.SYSTEM_OP.code);
        assert(codes[dataOffset+12] == InstrBuilder.Opcodes.CALL_OP.code);

        assert(codes[dataOffset+23] == 0xff);//Call with no argument
        assert(codes[dataOffset+24] == 0xff);//Call with no argument
		assert(codes[dataOffset+25] == 0);//padded 0
		
		assert(codes[dataOffset+26] == InstrBuilder.Opcodes.SYSTEM_OP.code);
		assert(codes[dataOffset+27] == 0xee, "System call number");
		assert(codes[dataOffset+28] == 0xff);//Call with no argument
        assert(codes[dataOffset+29] == 0xff);//Call with no argument
		
		assert(codes[dataOffset+30] == InstrBuilder.Opcodes.ICONST_OP.code);
		assert(codes[dataOffset+31] == 0);//Register 0
        assert(codes[dataOffset+34] == InstrBuilder.Opcodes.GET_OP.code);
        assert(codes[dataOffset+35] == 0);//Register 0
        //assert(codes[dataOffset+36] == 0);//Address of the message half
        //assert(codes[dataOffset+37] == 4);//Address of the message half

        assert(codes[dataOffset+38] == InstrBuilder.Opcodes.LOAD_OP.code);
        assert(codes[dataOffset+39] == 0);//Register 0
        assert(codes[dataOffset+40] == 1);//Register 1

        assert(codes[dataOffset+42] == InstrBuilder.Opcodes.STORE_OP.code);
        assert(codes[dataOffset+46] == InstrBuilder.Opcodes.MOVE_OP.code);

        assert(codes[dataOffset+50] == InstrBuilder.Opcodes.RETURN_OP.code);
        assert(codes[dataOffset+51] == 55);//Register 55
        assert(codes[dataOffset+52] == InstrBuilder.Opcodes.RETURN_OP.code);
        assert(codes[dataOffset+53] == 0xff);//no register

        assert(codes[dataOffset+54] == InstrBuilder.Opcodes.RESULT_OP.code);
        assert(codes[dataOffset+55] == 10);//Register 10

        assert(codes[dataOffset+56] == InstrBuilder.Opcodes.IF_EQ_OP.code);
        assert(codes[dataOffset+57] == 0);//Register 0
        assert(codes[dataOffset+58] == 1);//Register 1
        assert(codes[dataOffset+60] == InstrBuilder.Opcodes.IF_NEQ_OP.code);
        assert(codes[dataOffset+64] == InstrBuilder.Opcodes.IF_LT_OP.code);
        assert(codes[dataOffset+68] == InstrBuilder.Opcodes.IF_GT_OP.code);
        //console.log(codes);
    }, function(err) {
    	console.warn(err);
    }).catch(function(e){
        console.error(e)
    });
    var codes = testAsm.build();
    var reader=new WavesExeReader();
    reader.setBuffer(codes.buffer);
    //assert(reader.getMagic()=="Waves")
    //console.log(reader.read())
    var memory=new Memory();
    memory.fp=0;
    memory.max_stack=0xff;
    memory.registers = new Int32Array(memory.max_stack);
    
    
    memory.saveReg(20,0xff0ff);
    memory.fp=30;
    assert(memory.readReg(20)!=0xff0ff,"Register memory assertion failed");
    assertThrow(function(){
        memory.fp=0;
        memory.readReg(2000);
    },null,"Should throw memory access validation exception");
    //assertThrow(function(){
    var pointer=memory.allocate_memory(1);
    assert(pointer==0,"Allocated memory starting position error");
    //memory.load(0xffff);
    memory.store(0,100);
    assert(memory.load(0)==100,"Memory validation");
    var pointer=memory.allocate_memory(4);//Allocate 4 bytes for integer
    assert(pointer==1,"Allocated memory starting position error")
    memory.storeInt(1,0x0ff0f0ff);
    assert(memory.loadInt(1)==0x0ff0f0ff,"Memory validation");
    
    var pointer=memory.allocate_memory(10);
    memory.storeString("Hello World",pointer,10);
   assert (memory.load(pointer)=="H".charCodeAt(),"starting character should be H");
   assert (memory.load(pointer+5)==" ".charCodeAt(),"fifth memory location should have space");
   assert (memory.load(pointer+9)=="\0".charCodeAt(),"10th memory location should have a null byte");
   assertThrow(function(){
    memory.load(pointer+10)
   },null,"Should not have an eleventh memory location");
   //console.log("po",memory.load(pointer+9),"");
    //},null,"Should throw memory access validation exception");
    var testAsm = new Assembler(parser);
    testAsm.constructor();
    var source = [
        ".data",
        ".int me 0xffff",
        ".end",
        "main:",
        "iconst r0 me"
    ].join("\n");
    testAsm.assemble(source).then(function(res) {
        console.log(res);
        decompile(res);
        //assert(false, "Should result in a syntax error")
    },
    function(error) {
        console.error(error)
    });

    function decompile(codes){
        assert(String.fromCharCode(codes[0])=="W")
        assert(String.fromCharCode(codes[1])=="a")
        assert(String.fromCharCode(codes[2])=="v")
        assert(String.fromCharCode(codes[3])=="e");
        assert(String.fromCharCode(codes[4])=="s");
        function findOpcodeObj(opcode){
            for(var objName in InstrBuilder.Opcodes){
                var obj=InstrBuilder.Opcodes[objName];
                if(obj['code']==opcode)
                    return {name:objName,obj:obj};
            }
            return null;
        }
        var dataLen=codes[5]<<8|codes[6];
        //Magic + constant_length+constants
        var dataLenOffSet=5+2+dataLen;
        var mainRoutineIndex=codes[dataLenOffSet+1]+codes[dataLenOffSet+2];
        //console.log("main",mainRoutineIndex)
        //dataOffset + mainRoutineIndex + routineLength
        var dataOffset=dataLenOffSet+2+2;
        //console.log("data offset:",dataOffset,"Length:",codes.length);

        var result="";
        for (var i = dataOffset; i < codes.length;) {
            var current_pos=i-dataOffset;
            //alert("dd")
            if(current_pos==mainRoutineIndex)
                result+="MAIN:\n";
            var opcode=codes[i];
            var opcodeObj=findOpcodeObj(opcode);

            var op_name=opcodeObj.name;
            var op_obj=opcodeObj.obj;
            result+= i +"  -"+current_pos+ ": " + op_name+" ";
            i++;
            for (var j=0;j<op_obj.size-1;j++){
                var operand=codes[i+j];
                result+=operand+", ";
                i++;
            }
            result+='\n';
            /*if(op_name=="RETURN_OP")
                console.log(op_obj)
            result+=(i++)+": "+op_name+" ";
            for (var j=0;j<op_obj.size;j++){
                
                var operand=codes[i+j];
                result+=operand+", ";
                
            }
            result+='\n';
            
         */   
        }
        console.log(result)    
    }
    window.decompile=decompile;
    //testAsm.assemble("");
    /*var a=new Promise(function(resolve,reject){
    	setTimeout(function(){
    		resolve("From a")
    	},1000);
    });
    ;
    //assert(testAsm.build()=="build");
    
    /*
    function promiseEach(promises,fn){
    	var promise=promises.reduce(function(initialvalue,currentValue,index,arr){
    		return initialvalue.then(function(){
    			return fn(currentValue);
    		});
    	},Promise.resolve());
    	return promise;
    }
    var all=promiseEach([a,Promise.reject('from b')],function(item){
    	return item;
    });
    all.then(function(res){
    	console.log(res);
    },function(e){
    	console.log(e);
    })*/
    //Promise.race([a,b]);
    /*var all=promiseEach([a,Promise.reject('from b')])//Promise.race([a,b]);
    all.then(function(res){
    	console.log(res)
    },function(e){
    	console.log(e)
    })*/
    /*
    Reduces array into a single value
    For array.reduce
    The first value of the array will be the index to first be returned
    function(total||initialvalue, currentValue,index, arr)
    [].reduce(fn,initialValue)


    */
    
});