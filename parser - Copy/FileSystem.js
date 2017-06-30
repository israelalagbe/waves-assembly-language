/**
 * @author Israel
 */
"use strict";
var FileSystem = Class(function() {
    var host;
    var cwd = 'C://';
    return {
        constructor: function(host) {
            this._host = host;
        },
        read: function(fname) {
            var obj = {
                'file1.txt': "This is content of file1",
                'file2.txt': "This is content of file2",
                'file.asm': [
                    ".data",
                    ".int number 40",
                    ".end data",
                    "mea:",
                    "add r0 r0 r1"
                ].join('\n'),
                'file2.asm': [
                    ".data",
                    ".int number2 40",
                    ".end data",
                    "mea2:",
                    "add r0 r0 r1"
                ].join('\n')
            };
            var promise = new Promise(function(resolve, reject) {
                if (fname in obj)
                    resolve(obj[fname]);
                else
                    reject("No such file: " + fname);
            });
            return promise;
        }
    };
});