define('ace/mode/waves', function(require, exports, module) {
    var oop = require("ace/lib/oop");
    var TextMode = require("ace/mode/text").Mode;
    var WavesHighlightRules = require("ace/mode/waves_highlight_rules").WavesHighlightRules;

    var Mode = function() {
        this.HighlightRules = WavesHighlightRules;
    };
    oop.inherits(Mode, TextMode);

    (function() {
            // Extra logic goes here. (see below)
            this.getNextLineIndent = function(state, line, tab) {
                var indent = this.$getIndent(line);

                var tokenizedLine = this.getTokenizer().getLineTokens(line, state);

                var tokens = tokenizedLine.tokens;

                if (tokens.length && tokens[tokens.length - 1].type == "comment") {
                    return indent;
                }

                if (state == "start") {
                    var colonMatch = line.match(/^.*[:]\s*$/);
                    var dataMatch=line.match(/^.*[.]data\s*$/);
                    if (colonMatch) {
                        indent += tab;
                    }
                    else if(dataMatch){
                        indent +=tab
                    }
                }

                return indent;
            };
            window.mode=this;

        }).call(Mode.prototype);
    exports.Mode = Mode;
});
define('ace/mode/waves_highlight_rules', function(require, exports, module) {

    var oop = require("ace/lib/oop");
    var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

    var WavesHighlightRules = function() {

        this.$rules = {
            "start": [
                /*                   {
                                       token: 'entity.name.function.assembly',
                                       regex: "\\.[\\w._]+"
                                   },*/
                {
                    token: "constant.language.escape",
                    regex: /\$[\w\d]+/
                },

                {
                    token: "constant.language.boolean",
                    regex: /(?:true|false)\b/
                },
                { //Comments
                    token: 'comment.assembly',
                    regex: ';.*$'
                }, { //String
                    token: "string", // " string
                    regex: '".*?"'
                },
                { //Char
                    token: "string", // " string
                    regex: "'.'"
                },
                { //Registers
                    token: 'variable.parameter.register.assembly',
                    regex: 'r[0-9]+',
                    caseInsensitive: true
                },
                { //All opcodes
                    token: 'keyword.control.assembly',
                    regex: "\\b(call|system|add|sub|mul|div|goto|iconst|result|get|load|store|return|if-eq|if-neq|if-lt|if-gt|move)\\b",
                    caseInsensitive: true
                },
                { //All directives
                    token: 'support.function.directive.assembly',
                    regex: "\\.(?:data|end|include|string|int|string|char)",
                    //regex: '\\b(?:data|end|include|string|int|string|char)\\b',
                    caseInsensitive: true
                },
                { //Local labels
                    token: 'entity.name.function.assembly',
                    regex: "\\.[\\w._]+"
                },
                //e.g main:
                { token: 'entity.name.function.assembly', regex: '^[\\w.]+?:' },
                { token: 'entity.name.function.assembly', regex: '[\\w.]+?:$' },
                {
                    token: 'constant.language',
                    regex: "(printStr|alloc|printInt|printChar|newline|cls|input|random)"
                },
                { //Number
                    token: 'constant.character.decimal.assembly',
                    regex: '\\b[0-9]+\\b'
                },
                {
                    token: 'constant.character.hexadecimal.assembly',
                    regex: '\\b0x[A-F0-9]+\\b',
                    caseInsensitive: true
                },
                {
                    token: 'constant.character.hexadecimal.assembly',
                    regex: '\\b[A-F0-9]+h\\b',
                    caseInsensitive: true
                }
            ]
        }
        //this.addRules(newRules, "waves-");
    }

    oop.inherits(WavesHighlightRules, TextHighlightRules);

    exports.WavesHighlightRules = WavesHighlightRules;
});
