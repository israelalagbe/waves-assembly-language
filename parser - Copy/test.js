"use strict";
$(document).ready(function(){
	function assert(cond,msg){
		if(!cond){
			if(!msg)
				throw new Error("Assertion failed");
			else
				throw new Error("Assertion failed:\n"+msg);
		}
	}
	function assertThrow(fn,obj,msg){
		try{
			fn();
		}
		catch(e){
			if(obj==null)
				return;
			else if(e instanceof Error&&e.message==obj.message)
				return;
			else if(e==obj)
				return;
		}
		if(!msg)
			throw new Error("Throw Assertion failed");
		else
			throw new Error("Throw Assertion failed:\n"+msg);
	}


	var fs=new FileSystem('');
	fs.read('file2.txt').then(function(content){
		assert(content==="This is content of file2","File content assertion failed");
	},function(){
		assert(false,'cant open file');
	});
	fs.read('doesnotexist.txt').then(function(content){
		assert(false,"File should not exist");
	},function(){});

	
	var symbolTable=new SymbolTable;
	symbolTable.setData('mess',SymbolTable.DATA_TYPE_STRING,"hello world");
	assert(symbolTable.exists('mess',SymbolTable.TYPE_DATA),"Message should exist in the symbol table");
	var symbolValue=symbolTable.getData('mess');
	assert(symbolValue.type==SymbolTable.TYPE_DATA,"Message type should be data");
	assert(symbolValue.dataType==SymbolTable.DATA_TYPE_STRING,"Message dataType should be string");
	assert(symbolValue.value=='hello world',"Message value should be hello world");
	assertThrow(function(){
		symbolTable.setData('mess',SymbolTable.DATA_TYPE_STRING,"hi world");
	},new Error('Duplicate Symbol: '+"mess"),"Should throw duplicate symbol error");
	
	assert(/^_[\d]+_WV$/.test(symbolTable.newSystemData('a',4));
	assert(true5596+_+())
	symbolTable.setRoutine('testRoutine',[]);
	assert(symbolTable.exists('testRoutine',SymbolTable.TYPE_ROUTINE),"Routine should exist in the symbol table");
	var routineBody=symbolTable.getRoutine('testRoutine');
	assert(routineBody.type==SymbolTable.TYPE_ROUTINE,"Should be equal");
	assert(symbolTable.localLabelExist('testRoutine',"testLabel")==false,"Should not exist");
	symbolTable.setLocalLabel('testRoutine','testLabel',4);
	assert(symbolTable.getLocalLabel('testRoutine','testLabel')==4,"Local label value should be 4");
	assertThrow(function(){
		symbolTable.setLocalLabel('testRoutine','testLabel',5);
	},null,"Should throw an exception");

	assert(Exception.PARSE_ERROR==1,"Parse error should equal 1");
	assert(Exception.ASSEMBLE==2,"Assemble error should equal 2");
	assert(Exception.DUPLICATE_DATA==3,"Duplicate data error should equal 3");
	assert(Exception.DUPLICATE_ROUTINE==4,"Duplicate routine error should equal 4");

	var testAsm=new Assembler(parser);
	var source=[
		".data",
		".int numbera 40",
		".end data",
		".include \"file2.asm\"",
		"mea:",
		"add r0 r0 r1"].join('\n');
	testAsm.assemble(source).then(function(res) {
			/*assert(res.length==3,"Assembler result length should be 3");
			assert(res[0].type=="data_block","First type of result must be data_block");
			assert(res[1].type=="include_list","Second type of result must be include_list");
			assert(res[2].type=="routine_list","Third type of result must be routine_list");*/

		//editor.compileSuccess(res);
	}, function(res) {
		console.error(res);
		assert(false,"Error thrown in assembler"+JSON.stringify(res));
	});
	testAsm.compile_file("Notfile.asm").then(function(){
		assert(false,"File should not exist");
	},function(){});

	testAsm.compile_file("file.asm").then(function(res){
	},function(e){
		assert(false,"Error compiling file:"+JSON.stringify(e));
	});

	var source=".data .end";
	testAsm.assemble(source).then(function(res) {
		assert(false,"Should result in a syntax error")
	},
	function(error) {
		assert(typeof error.str=="string","Should be a string");
		assert(typeof error.hash=="object","Should be an object");
		assert(typeof error.type=="number","Should be a number");
		assert(error.type==Exception.PARSE_ERROR,"Should be a parse error");
	});
	testAsm.build();
	/*var a=new Promise(function(resolve,reject){
		setTimeout(function(){
			resolve("From a")
		},1000);
	});
	;
	//assert(testAsm.build()=="build");
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