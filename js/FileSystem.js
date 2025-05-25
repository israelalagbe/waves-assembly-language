/**
 * @author Israel
 */
"use strict";
var FileSystem = Class(function() {
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
        ].join('\n'),
        'you.asm': [
            "printStr:",
            "iconst r3 40"
        ].join('\n'),
        'io.asm': [
            '.data',
            '.int newLine 10',
            '.int terminate 0',
            '.end',
            'printInt:',
            'system 0x0 r0',
            'printChar:',
            'system 0x1 r0',
            'printStr:',
            'iconst r3 terminate',
            'iconst r1 1',
            '.loop:',
            'load [r0] r2',
            'if-eq r2 r3 .stop',
            'call printChar r2',
            'add r0 r1 r0',
            'if-neq r2 r3 .loop',
            '.stop:'
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
                else {
                    $.get(fname).then(function(res) {
                        resolve(res);
                    }, function() {
                        reject("No such file: " + fname);
                    });
                }

            });
            return promise;
        },
        define: function(fname, value) {
            obj[fname] = value;
        }
    };
});