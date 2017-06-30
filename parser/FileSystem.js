/**
 * @author Israel
 */
"use strict";
var FileSystem = Class(function() {
    var host;
    var cwd = 'C://';
	var obj = {
                'file1.txt': "This is content of file1",
                'file2.txt': "This is content of file2",
                'file.asm': [
                    ".data",
                    ".int number 40",
                    ".end",
                    "mea:",
                    "add r0 r0 r1"
                ].join('\n'),
                'file2.asm': [
                    ".data",
                    ".int number2 40",
                    ".end",
                    "mea2:",
                    "add r0 r0 r1"
                ].join('\n')
            };
    return {
        constructor: function(host) {
            this._host = host;
        },
        read: function(fname) {
            
            var promise = new Promise(function(resolve, reject) {
                if (fname in obj)
                    resolve(obj[fname]);
                else
                    reject("No such file: " + fname);
            });
            return promise;
        },
		//Set a file system with manipulated values
		define:function(fname,value){
			obj[fname]=value;
		}
    };
});