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
    assert(symbolValue.value == 'hello world', "Message value should be hello world");
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
        "iconst r0 hello"
    ].join('\n');
    window.asm=testAsm.assemble(source).then(function(res) {
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

        assert(codes[dataOffset+21] == 0xff);//Call with no argument
        assert(codes[dataOffset+22] == 0xff);//Call with no argument
		assert(codes[dataOffset+23] == 0);//padded 0
		
		assert(codes[dataOffset+24] == InstrBuilder.Opcodes.SYSTEM_OP.code);
		assert(codes[dataOffset+25] == 0xee, "System call number");
		assert(codes[dataOffset+26] == 0xff);//Call with no argument
        assert(codes[dataOffset+27] == 0xff);//Call with no argument
		
		assert(codes[dataOffset+28] == InstrBuilder.Opcodes.ICONST_OP.code);
		assert(codes[dataOffset+29] == 0);//Register 0
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
    memory.store(0,100);
    assert(memory.load(0)==100,"Memory validation");
    memory.storeInt(1,0x0ff0f0ff);
    assert(memory.loadInt(1)==0x0ff0f0ff,"Memory validation");
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