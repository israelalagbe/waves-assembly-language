var parser = (function(){
var parser = {trace: function trace(){},
yy: {},
symbols_: {"error":2,"file":3,"EOF":4,"data_block":5,"include_list":6,"routine_list":7,"routine":8,"Identifier":9,":":10,"Empty":11,"program_list":12,"program":13,"local_label":14,"arithmetic_instr":15,"branch_instr":16,"assign_instr":17,"memory_instr":18,"conditional_instr":19,"GOTO_OP":20,".":21,"CALL_OP":22,"opn_comma":23,"Register":24,"Reg_Range":25,"SYSTEM_OP":26,"Integer_Constant":27,"ADD_OP":28,"SUB_OP":29,"MUL_OP":30,"DIV_OP":31,"IF_EQ_OP":32,"IF_NEQ_OP":33,"IF_GT_OP":34,"IF_LT_OP":35,"GET_OP":36,"STORE_OP":37,"[":38,"]":39,"LOAD_OP":40,"MOVE_OP":41,"RETURN_OP":42,"RESULT_OP":43,"ICONST_OP":44,"-":45,",":46,"include_block":47,"INCLUDE":48,"String_Constant":49,"DATA":50,"END":51,"const_block":52,"const_declare":53,"STRING":54,"INT":55,"CHAR":56,"Char_Constant":57,"$accept":0,"$end":1},
terminals_: {2:"error",4:"EOF",9:"Identifier",10:":",20:"GOTO_OP",21:".",22:"CALL_OP",24:"Register",26:"SYSTEM_OP",27:"Integer_Constant",28:"ADD_OP",29:"SUB_OP",30:"MUL_OP",31:"DIV_OP",32:"IF_EQ_OP",33:"IF_NEQ_OP",34:"IF_GT_OP",35:"IF_LT_OP",36:"GET_OP",37:"STORE_OP",38:"[",39:"]",40:"LOAD_OP",41:"MOVE_OP",42:"RETURN_OP",43:"RESULT_OP",44:"ICONST_OP",45:"-",46:",",48:"INCLUDE",49:"String_Constant",50:"DATA",51:"END",54:"STRING",55:"INT",56:"CHAR",57:"Char_Constant"},
productions_: [0,[3,1],[3,2],[3,2],[3,2],[3,3],[3,3],[3,3],[3,4],[7,1],[7,2],[8,3],[8,3],[12,1],[12,1],[12,2],[12,2],[13,1],[13,1],[13,1],[13,1],[13,1],[16,3],[16,2],[16,4],[16,4],[16,2],[16,4],[16,4],[15,6],[15,6],[15,6],[15,6],[19,7],[19,7],[19,7],[19,7],[18,4],[18,6],[18,6],[18,4],[18,2],[18,1],[18,2],[17,4],[17,4],[14,3],[25,3],[11,0],[23,1],[23,1],[6,1],[6,2],[47,3],[5,4],[5,5],[52,1],[52,2],[53,4],[53,4],[53,4]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */
/**/) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:return []; 
break;
case 2:return [app.data_block($$[$0-1])];
break;
case 3:return [app.include_list($$[$0-1])];
break;
case 4:
          return [app.routine_list($$[$0-1])];
        
break;
case 5:
            return [app.include_list($$[$0-2]), app.data_block($$[$0-1])];

          
break;
case 6:
        return [app.data_block($$[$0-2]),app.routine_list($$[$0-1])];
     
break;
case 7:
            return [app.include_list($$[$0-2]),app.routine_list($$[$0-1])];

          
break;
case 8:
       return [app.include_list($$[$0-3]),app.data_block($$[$0-2]),app.routine_list($$[$0-1])];

          
break;
case 9:this.$=[$$[$0]];
break;
case 10:$$[$0-1].push($$[$0]);this.$=$$[$0-1];
break;
case 11:this.$=this.$=app.routine($$[$0-2],[],this._$);
break;
case 12:this.$=this.$=app.routine($$[$0-2],$$[$0],this._$);
break;
case 13:this.$=[$$[$0]];
break;
case 14:this.$=[$$[$0]];
break;
case 15:$$[$0-1].push($$[$0]);this.$=$$[$0-1];
break;
case 16:$$[$0-1].push($$[$0]);this.$=$$[$0-1];
break;
case 22:this.$=app.program($$[$0-2],[$$[$0]],this._$);
break;
case 23:this.$=app.program($$[$0-1],[$$[$0],null],this._$);
break;
case 24:this.$=app.program($$[$0-3],[$$[$0-2],$$[$0]],this._$);
break;
case 25:this.$=app.program($$[$0-3],[$$[$0-2],$$[$0]],this._$);
break;
case 26:this.$=app.program($$[$0-1],[$$[$0],null],this._$);
break;
case 27:this.$=app.program($$[$0-3],[$$[$0-2],$$[$0]],this._$);
break;
case 28:this.$=app.program($$[$0-3],[$$[$0-2],$$[$0]],this._$);
break;
case 29:this.$=app.program($$[$0-5],[$$[$0-4],$$[$0-2],$$[$0]],this._$);
break;
case 30:this.$=app.program($$[$0-5],[$$[$0-4],$$[$0-2],$$[$0]],this._$);
break;
case 31:this.$=app.program($$[$0-5],[$$[$0-4],$$[$0-2],$$[$0]],this._$);
break;
case 32:this.$=app.program($$[$0-5],[$$[$0-4],$$[$0-2],$$[$0]],this._$);
break;
case 33:this.$=app.program($$[$0-6],[$$[$0-5],$$[$0-3],$$[$0]],this._$);
break;
case 34:this.$=app.program($$[$0-6],[$$[$0-5],$$[$0-3],$$[$0]],this._$);
break;
case 35:this.$=app.program($$[$0-6],[$$[$0-5],$$[$0-3],$$[$0]],this._$);
break;
case 36:this.$=app.program($$[$0-6],[$$[$0-5],$$[$0-3],$$[$0]],this._$);
break;
case 37:this.$=app.program($$[$0-3],[$$[$0-2],$$[$0]],this._$);
break;
case 38:this.$=app.program($$[$0-5],[$$[$0-4],$$[$0-1]],this._$);
break;
case 39:this.$=app.program($$[$0-5],[$$[$0-3],$$[$0]],this._$);
break;
case 40:this.$=app.program($$[$0-3],[$$[$0-2],$$[$0]],this._$);
break;
case 41:this.$=app.program($$[$0-1],[$$[$0]],this._$);
break;
case 42:this.$=app.program($$[$0],[null],this._$);
break;
case 43:this.$=app.program($$[$0-1],[$$[$0]],this._$);
break;
case 44:this.$=app.program($$[$0-3],[$$[$0-2],$$[$0]],this._$);
break;
case 45:this.$=app.program($$[$0-3],[$$[$0-2],$$[$0]],this._$);
break;
case 46:this.$={'type':'local_label','label':$$[$0-1],'info':this._$};
break;
case 47:this.$=[$$[$0-2],$$[$0]];
break;
case 51:this.$=[$$[$0]];
break;
case 52:$$[$0-1].push($$[$0]);this.$=$$[$0-1];
break;
case 53:this.$=app.include_block($$[$0],this._$);
break;
case 54:this.$=[];
break;
case 55:this.$=$$[$0-2];
break;
case 56:this.$=[$$[$0]];
break;
case 57:$$[$0-1].push($$[$0]);this.$=$$[$0-1];
break;
case 58:this.$= {'type':'string','name':$$[$0-1],'value':$$[$0],'info':this._$};
break;
case 59:this.$= {'type':'integer','name':$$[$0-1],'value':parseInt($$[$0]),'info':this._$};
break;
case 60:this.$= {'type':'char','name':$$[$0-1],'value':$$[$0],'info':this._$};
break;
}
},
table: [{3:1,4:[1,2],5:3,6:4,7:5,8:8,9:[1,9],21:[1,6],47:7},{1:[3]},{1:[2,1]},{4:[1,10],7:11,8:8,9:[1,9]},{4:[1,12],5:13,7:14,8:8,9:[1,9],21:[1,6],47:15},{4:[1,16],8:17,9:[1,9]},{48:[1,19],50:[1,18]},{4:[2,51],9:[2,51],21:[2,51]},{4:[2,9],9:[2,9]},{10:[1,20]},{1:[2,2]},{4:[1,21],8:17,9:[1,9]},{1:[2,3]},{4:[1,22],7:23,8:8,9:[1,9]},{4:[1,24],8:17,9:[1,9]},{4:[2,52],9:[2,52],21:[2,52]},{1:[2,4]},{4:[2,10],9:[2,10]},{21:[1,25],52:26,53:27},{49:[1,28]},{4:[2,48],9:[2,48],11:29,12:30,13:31,14:32,15:33,16:34,17:35,18:36,19:37,20:[1,43],21:[1,38],22:[1,44],26:[1,45],28:[1,39],29:[1,40],30:[1,41],31:[1,42],32:[1,53],33:[1,54],34:[1,55],35:[1,56],36:[1,47],37:[1,48],40:[1,49],41:[1,50],42:[1,51],43:[1,52],44:[1,46]},{1:[2,6]},{1:[2,5]},{4:[1,57],8:17,9:[1,9]},{1:[2,7]},{51:[1,58],54:[1,59],55:[1,60],56:[1,61]},{21:[1,62],53:63},{21:[2,56]},{4:[2,53],9:[2,53],21:[2,53]},{4:[2,11],9:[2,11]},{4:[2,12],9:[2,12],13:64,14:65,15:33,16:34,17:35,18:36,19:37,20:[1,43],21:[1,38],22:[1,44],26:[1,45],28:[1,39],29:[1,40],30:[1,41],31:[1,42],32:[1,53],33:[1,54],34:[1,55],35:[1,56],36:[1,47],37:[1,48],40:[1,49],41:[1,50],42:[1,51],43:[1,52],44:[1,46]},{4:[2,13],9:[2,13],20:[2,13],21:[2,13],22:[2,13],26:[2,13],28:[2,13],29:[2,13],30:[2,13],31:[2,13],32:[2,13],33:[2,13],34:[2,13],35:[2,13],36:[2,13],37:[2,13],40:[2,13],41:[2,13],42:[2,13],43:[2,13],44:[2,13]},{4:[2,14],9:[2,14],20:[2,14],21:[2,14],22:[2,14],26:[2,14],28:[2,14],29:[2,14],30:[2,14],31:[2,14],32:[2,14],33:[2,14],34:[2,14],35:[2,14],36:[2,14],37:[2,14],40:[2,14],41:[2,14],42:[2,14],43:[2,14],44:[2,14]},{4:[2,17],9:[2,17],20:[2,17],21:[2,17],22:[2,17],26:[2,17],28:[2,17],29:[2,17],30:[2,17],31:[2,17],32:[2,17],33:[2,17],34:[2,17],35:[2,17],36:[2,17],37:[2,17],40:[2,17],41:[2,17],42:[2,17],43:[2,17],44:[2,17]},{4:[2,18],9:[2,18],20:[2,18],21:[2,18],22:[2,18],26:[2,18],28:[2,18],29:[2,18],30:[2,18],31:[2,18],32:[2,18],33:[2,18],34:[2,18],35:[2,18],36:[2,18],37:[2,18],40:[2,18],41:[2,18],42:[2,18],43:[2,18],44:[2,18]},{4:[2,19],9:[2,19],20:[2,19],21:[2,19],22:[2,19],26:[2,19],28:[2,19],29:[2,19],30:[2,19],31:[2,19],32:[2,19],33:[2,19],34:[2,19],35:[2,19],36:[2,19],37:[2,19],40:[2,19],41:[2,19],42:[2,19],43:[2,19],44:[2,19]},{4:[2,20],9:[2,20],20:[2,20],21:[2,20],22:[2,20],26:[2,20],28:[2,20],29:[2,20],30:[2,20],31:[2,20],32:[2,20],33:[2,20],34:[2,20],35:[2,20],36:[2,20],37:[2,20],40:[2,20],41:[2,20],42:[2,20],43:[2,20],44:[2,20]},{4:[2,21],9:[2,21],20:[2,21],21:[2,21],22:[2,21],26:[2,21],28:[2,21],29:[2,21],30:[2,21],31:[2,21],32:[2,21],33:[2,21],34:[2,21],35:[2,21],36:[2,21],37:[2,21],40:[2,21],41:[2,21],42:[2,21],43:[2,21],44:[2,21]},{9:[1,66]},{24:[1,67]},{24:[1,68]},{24:[1,69]},{24:[1,70]},{21:[1,71]},{9:[1,72]},{27:[1,73]},{24:[1,74]},{24:[1,75]},{24:[1,76]},{38:[1,77]},{24:[1,78]},{4:[2,42],9:[2,42],20:[2,42],21:[2,42],22:[2,42],24:[1,79],26:[2,42],28:[2,42],29:[2,42],30:[2,42],31:[2,42],32:[2,42],33:[2,42],34:[2,42],35:[2,42],36:[2,42],37:[2,42],40:[2,42],41:[2,42],42:[2,42],43:[2,42],44:[2,42]},{24:[1,80]},{24:[1,81]},{24:[1,82]},{24:[1,83]},{24:[1,84]},{1:[2,8]},{4:[2,54],9:[2,54]},{9:[1,85]},{9:[1,86]},{9:[1,87]},{51:[1,88],54:[1,59],55:[1,60],56:[1,61]},{21:[2,57]},{4:[2,15],9:[2,15],20:[2,15],21:[2,15],22:[2,15],26:[2,15],28:[2,15],29:[2,15],30:[2,15],31:[2,15],32:[2,15],33:[2,15],34:[2,15],35:[2,15],36:[2,15],37:[2,15],40:[2,15],41:[2,15],42:[2,15],43:[2,15],44:[2,15]},{4:[2,16],9:[2,16],20:[2,16],21:[2,16],22:[2,16],26:[2,16],28:[2,16],29:[2,16],30:[2,16],31:[2,16],32:[2,16],33:[2,16],34:[2,16],35:[2,16],36:[2,16],37:[2,16],40:[2,16],41:[2,16],42:[2,16],43:[2,16],44:[2,16]},{10:[1,89]},{11:91,23:90,24:[2,48],46:[1,92]},{11:91,23:93,24:[2,48],46:[1,92]},{11:91,23:94,24:[2,48],46:[1,92]},{11:91,23:95,24:[2,48],46:[1,92]},{9:[1,96]},{4:[2,23],9:[2,23],11:91,20:[2,23],21:[2,23],22:[2,23],23:97,24:[2,48],26:[2,23],28:[2,23],29:[2,23],30:[2,23],31:[2,23],32:[2,23],33:[2,23],34:[2,23],35:[2,23],36:[2,23],37:[2,23],40:[2,23],41:[2,23],42:[2,23],43:[2,23],44:[2,23],46:[1,92]},{4:[2,26],9:[2,26],11:91,20:[2,26],21:[2,26],22:[2,26],23:98,24:[2,48],26:[2,26],28:[2,26],29:[2,26],30:[2,26],31:[2,26],32:[2,26],33:[2,26],34:[2,26],35:[2,26],36:[2,26],37:[2,26],40:[2,26],41:[2,26],42:[2,26],43:[2,26],44:[2,26],46:[1,92]},{9:[2,48],11:91,23:99,27:[2,48],46:[1,92]},{9:[2,48],11:91,23:100,46:[1,92]},{11:91,23:101,38:[2,48],46:[1,92]},{24:[1,102]},{11:91,23:103,24:[2,48],46:[1,92]},{4:[2,41],9:[2,41],20:[2,41],21:[2,41],22:[2,41],26:[2,41],28:[2,41],29:[2,41],30:[2,41],31:[2,41],32:[2,41],33:[2,41],34:[2,41],35:[2,41],36:[2,41],37:[2,41],40:[2,41],41:[2,41],42:[2,41],43:[2,41],44:[2,41]},{4:[2,43],9:[2,43],20:[2,43],21:[2,43],22:[2,43],26:[2,43],28:[2,43],29:[2,43],30:[2,43],31:[2,43],32:[2,43],33:[2,43],34:[2,43],35:[2,43],36:[2,43],37:[2,43],40:[2,43],41:[2,43],42:[2,43],43:[2,43],44:[2,43]},{11:91,23:104,24:[2,48],46:[1,92]},{11:91,23:105,24:[2,48],46:[1,92]},{11:91,23:106,24:[2,48],46:[1,92]},{11:91,23:107,24:[2,48],46:[1,92]},{49:[1,108]},{27:[1,109]},{57:[1,110]},{4:[2,55],9:[2,55]},{4:[2,46],9:[2,46],20:[2,46],21:[2,46],22:[2,46],26:[2,46],28:[2,46],29:[2,46],30:[2,46],31:[2,46],32:[2,46],33:[2,46],34:[2,46],35:[2,46],36:[2,46],37:[2,46],40:[2,46],41:[2,46],42:[2,46],43:[2,46],44:[2,46]},{24:[1,111]},{9:[2,49],21:[2,49],24:[2,49],27:[2,49],38:[2,49]},{9:[2,50],21:[2,50],24:[2,50],27:[2,50],38:[2,50]},{24:[1,112]},{24:[1,113]},{24:[1,114]},{4:[2,22],9:[2,22],20:[2,22],21:[2,22],22:[2,22],26:[2,22],28:[2,22],29:[2,22],30:[2,22],31:[2,22],32:[2,22],33:[2,22],34:[2,22],35:[2,22],36:[2,22],37:[2,22],40:[2,22],41:[2,22],42:[2,22],43:[2,22],44:[2,22]},{24:[1,115],25:116},{24:[1,117],25:118},{9:[1,120],27:[1,119]},{9:[1,121]},{38:[1,122]},{39:[1,123]},{24:[1,124]},{24:[1,125]},{24:[1,126]},{24:[1,127]},{24:[1,128]},{21:[2,58]},{21:[2,59]},{21:[2,60]},{11:91,23:129,24:[2,48],46:[1,92]},{11:91,23:130,24:[2,48],46:[1,92]},{11:91,23:131,24:[2,48],46:[1,92]},{11:91,23:132,24:[2,48],46:[1,92]},{4:[2,24],9:[2,24],20:[2,24],21:[2,24],22:[2,24],26:[2,24],28:[2,24],29:[2,24],30:[2,24],31:[2,24],32:[2,24],33:[2,24],34:[2,24],35:[2,24],36:[2,24],37:[2,24],40:[2,24],41:[2,24],42:[2,24],43:[2,24],44:[2,24],45:[1,133]},{4:[2,25],9:[2,25],20:[2,25],21:[2,25],22:[2,25],26:[2,25],28:[2,25],29:[2,25],30:[2,25],31:[2,25],32:[2,25],33:[2,25],34:[2,25],35:[2,25],36:[2,25],37:[2,25],40:[2,25],41:[2,25],42:[2,25],43:[2,25],44:[2,25]},{4:[2,27],9:[2,27],20:[2,27],21:[2,27],22:[2,27],26:[2,27],28:[2,27],29:[2,27],30:[2,27],31:[2,27],32:[2,27],33:[2,27],34:[2,27],35:[2,27],36:[2,27],37:[2,27],40:[2,27],41:[2,27],42:[2,27],43:[2,27],44:[2,27],45:[1,133]},{4:[2,28],9:[2,28],20:[2,28],21:[2,28],22:[2,28],26:[2,28],28:[2,28],29:[2,28],30:[2,28],31:[2,28],32:[2,28],33:[2,28],34:[2,28],35:[2,28],36:[2,28],37:[2,28],40:[2,28],41:[2,28],42:[2,28],43:[2,28],44:[2,28]},{4:[2,44],9:[2,44],20:[2,44],21:[2,44],22:[2,44],26:[2,44],28:[2,44],29:[2,44],30:[2,44],31:[2,44],32:[2,44],33:[2,44],34:[2,44],35:[2,44],36:[2,44],37:[2,44],40:[2,44],41:[2,44],42:[2,44],43:[2,44],44:[2,44]},{4:[2,45],9:[2,45],20:[2,45],21:[2,45],22:[2,45],26:[2,45],28:[2,45],29:[2,45],30:[2,45],31:[2,45],32:[2,45],33:[2,45],34:[2,45],35:[2,45],36:[2,45],37:[2,45],40:[2,45],41:[2,45],42:[2,45],43:[2,45],44:[2,45]},{4:[2,37],9:[2,37],20:[2,37],21:[2,37],22:[2,37],26:[2,37],28:[2,37],29:[2,37],30:[2,37],31:[2,37],32:[2,37],33:[2,37],34:[2,37],35:[2,37],36:[2,37],37:[2,37],40:[2,37],41:[2,37],42:[2,37],43:[2,37],44:[2,37]},{24:[1,134]},{11:91,23:135,24:[2,48],46:[1,92]},{4:[2,40],9:[2,40],20:[2,40],21:[2,40],22:[2,40],26:[2,40],28:[2,40],29:[2,40],30:[2,40],31:[2,40],32:[2,40],33:[2,40],34:[2,40],35:[2,40],36:[2,40],37:[2,40],40:[2,40],41:[2,40],42:[2,40],43:[2,40],44:[2,40]},{11:91,21:[2,48],23:136,46:[1,92]},{11:91,21:[2,48],23:137,46:[1,92]},{11:91,21:[2,48],23:138,46:[1,92]},{11:91,21:[2,48],23:139,46:[1,92]},{24:[1,140]},{24:[1,141]},{24:[1,142]},{24:[1,143]},{24:[1,144]},{39:[1,145]},{24:[1,146]},{21:[1,147]},{21:[1,148]},{21:[1,149]},{21:[1,150]},{4:[2,29],9:[2,29],20:[2,29],21:[2,29],22:[2,29],26:[2,29],28:[2,29],29:[2,29],30:[2,29],31:[2,29],32:[2,29],33:[2,29],34:[2,29],35:[2,29],36:[2,29],37:[2,29],40:[2,29],41:[2,29],42:[2,29],43:[2,29],44:[2,29]},{4:[2,30],9:[2,30],20:[2,30],21:[2,30],22:[2,30],26:[2,30],28:[2,30],29:[2,30],30:[2,30],31:[2,30],32:[2,30],33:[2,30],34:[2,30],35:[2,30],36:[2,30],37:[2,30],40:[2,30],41:[2,30],42:[2,30],43:[2,30],44:[2,30]},{4:[2,31],9:[2,31],20:[2,31],21:[2,31],22:[2,31],26:[2,31],28:[2,31],29:[2,31],30:[2,31],31:[2,31],32:[2,31],33:[2,31],34:[2,31],35:[2,31],36:[2,31],37:[2,31],40:[2,31],41:[2,31],42:[2,31],43:[2,31],44:[2,31]},{4:[2,32],9:[2,32],20:[2,32],21:[2,32],22:[2,32],26:[2,32],28:[2,32],29:[2,32],30:[2,32],31:[2,32],32:[2,32],33:[2,32],34:[2,32],35:[2,32],36:[2,32],37:[2,32],40:[2,32],41:[2,32],42:[2,32],43:[2,32],44:[2,32]},{4:[2,47],9:[2,47],20:[2,47],21:[2,47],22:[2,47],26:[2,47],28:[2,47],29:[2,47],30:[2,47],31:[2,47],32:[2,47],33:[2,47],34:[2,47],35:[2,47],36:[2,47],37:[2,47],40:[2,47],41:[2,47],42:[2,47],43:[2,47],44:[2,47]},{4:[2,38],9:[2,38],20:[2,38],21:[2,38],22:[2,38],26:[2,38],28:[2,38],29:[2,38],30:[2,38],31:[2,38],32:[2,38],33:[2,38],34:[2,38],35:[2,38],36:[2,38],37:[2,38],40:[2,38],41:[2,38],42:[2,38],43:[2,38],44:[2,38]},{4:[2,39],9:[2,39],20:[2,39],21:[2,39],22:[2,39],26:[2,39],28:[2,39],29:[2,39],30:[2,39],31:[2,39],32:[2,39],33:[2,39],34:[2,39],35:[2,39],36:[2,39],37:[2,39],40:[2,39],41:[2,39],42:[2,39],43:[2,39],44:[2,39]},{9:[1,151]},{9:[1,152]},{9:[1,153]},{9:[1,154]},{4:[2,33],9:[2,33],20:[2,33],21:[2,33],22:[2,33],26:[2,33],28:[2,33],29:[2,33],30:[2,33],31:[2,33],32:[2,33],33:[2,33],34:[2,33],35:[2,33],36:[2,33],37:[2,33],40:[2,33],41:[2,33],42:[2,33],43:[2,33],44:[2,33]},{4:[2,34],9:[2,34],20:[2,34],21:[2,34],22:[2,34],26:[2,34],28:[2,34],29:[2,34],30:[2,34],31:[2,34],32:[2,34],33:[2,34],34:[2,34],35:[2,34],36:[2,34],37:[2,34],40:[2,34],41:[2,34],42:[2,34],43:[2,34],44:[2,34]},{4:[2,35],9:[2,35],20:[2,35],21:[2,35],22:[2,35],26:[2,35],28:[2,35],29:[2,35],30:[2,35],31:[2,35],32:[2,35],33:[2,35],34:[2,35],35:[2,35],36:[2,35],37:[2,35],40:[2,35],41:[2,35],42:[2,35],43:[2,35],44:[2,35]},{4:[2,36],9:[2,36],20:[2,36],21:[2,36],22:[2,36],26:[2,36],28:[2,36],29:[2,36],30:[2,36],31:[2,36],32:[2,36],33:[2,36],34:[2,36],35:[2,36],36:[2,36],37:[2,36],40:[2,36],41:[2,36],42:[2,36],43:[2,36],44:[2,36]}],
defaultActions: {2:[2,1],10:[2,2],12:[2,3],16:[2,4],21:[2,6],22:[2,5],24:[2,7],27:[2,56],57:[2,8],63:[2,57],108:[2,58],109:[2,59],110:[2,60]},
parseError: function parseError(str,hash){if(hash.recoverable){this.trace(str)}else{throw new Error(str)}},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                this.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.2.1 */
var lexer = (function(){
var lexer = {

EOF:1,

parseError:function parseError(str,hash){if(this.yy.parser){this.yy.parser.parseError(str,hash)}else{throw new Error(str)}},

// resets the lexer, sets new input
setInput:function (input){this._input=input;this._more=this._backtrack=this.done=false;this.yylineno=this.yyleng=0;this.yytext=this.matched=this.match="";this.conditionStack=["INITIAL"];this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0};if(this.options.ranges){this.yylloc.range=[0,0]}this.offset=0;return this},

// consumes and returns one char from the input
input:function (){var ch=this._input[0];this.yytext+=ch;this.yyleng++;this.offset++;this.match+=ch;this.matched+=ch;var lines=ch.match(/(?:\r\n?|\n).*/g);if(lines){this.yylineno++;this.yylloc.last_line++}else{this.yylloc.last_column++}if(this.options.ranges){this.yylloc.range[1]++}this._input=this._input.slice(1);return ch},

// unshifts one char (or a string) into the input
unput:function (ch){var len=ch.length;var lines=ch.split(/(?:\r\n?|\n)/g);this._input=ch+this._input;this.yytext=this.yytext.substr(0,this.yytext.length-len-1);this.offset-=len;var oldLines=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1);this.matched=this.matched.substr(0,this.matched.length-1);if(lines.length-1){this.yylineno-=lines.length-1}var r=this.yylloc.range;this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:lines?(lines.length===oldLines.length?this.yylloc.first_column:0)+oldLines[oldLines.length-lines.length].length-lines[0].length:this.yylloc.first_column-len};if(this.options.ranges){this.yylloc.range=[r[0],r[0]+this.yyleng-len]}this.yyleng=this.yytext.length;return this},

// When called from action, caches matched text and appends it on next action
more:function (){this._more=true;return this},

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function (){if(this.options.backtrack_lexer){this._backtrack=true}else{return this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})}return this},

// retain first n characters of the match
less:function (n){this.unput(this.match.slice(n))},

// displays already matched input, i.e. for error messages
pastInput:function (){var past=this.matched.substr(0,this.matched.length-this.match.length);return(past.length>20?"...":"")+past.substr(-20).replace(/\n/g,"")},

// displays upcoming input, i.e. for error messages
upcomingInput:function (){var next=this.match;if(next.length<20){next+=this._input.substr(0,20-next.length)}return(next.substr(0,20)+(next.length>20?"...":"")).replace(/\n/g,"")},

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function (){var pre=this.pastInput();var c=new Array(pre.length+1).join("-");return pre+this.upcomingInput()+"\n"+c+"^"},

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match,indexed_rule){var token,lines,backup;if(this.options.backtrack_lexer){backup={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done};if(this.options.ranges){backup.yylloc.range=this.yylloc.range.slice(0)}}lines=match[0].match(/(?:\r\n?|\n).*/g);if(lines){this.yylineno+=lines.length}this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:lines?lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+match[0].length};this.yytext+=match[0];this.match+=match[0];this.matches=match;this.yyleng=this.yytext.length;if(this.options.ranges){this.yylloc.range=[this.offset,this.offset+=this.yyleng]}this._more=false;this._backtrack=false;this._input=this._input.slice(match[0].length);this.matched+=match[0];token=this.performAction.call(this,this.yy,this,indexed_rule,this.conditionStack[this.conditionStack.length-1]);if(this.done&&this._input){this.done=false}if(token){return token}else if(this._backtrack){for(var k in backup){this[k]=backup[k]}return false}return false},

// return next match in input
next:function (){if(this.done){return this.EOF}if(!this._input){this.done=true}var token,match,tempMatch,index;if(!this._more){this.yytext="";this.match=""}var rules=this._currentRules();for(var i=0;i<rules.length;i++){tempMatch=this._input.match(this.rules[rules[i]]);if(tempMatch&&(!match||tempMatch[0].length>match[0].length)){match=tempMatch;index=i;if(this.options.backtrack_lexer){token=this.test_match(tempMatch,rules[i]);if(token!==false){return token}else if(this._backtrack){match=false;continue}else{return false}}else if(!this.options.flex){break}}}if(match){token=this.test_match(match,rules[index]);if(token!==false){return token}return false}if(this._input===""){return this.EOF}else{return this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})}},

// return next match that has a token
lex:function lex(){var r=this.next();if(r){return r}else{return this.lex()}},

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition){this.conditionStack.push(condition)},

// pop the previously active lexer condition state off the condition stack
popState:function popState(){var n=this.conditionStack.length-1;if(n>0){return this.conditionStack.pop()}else{return this.conditionStack[0]}},

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules(){if(this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]){return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules}else{return this.conditions["INITIAL"].rules}},

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n){n=this.conditionStack.length-1-Math.abs(n||0);if(n>=0){return this.conditionStack[n]}else{return"INITIAL"}},

// alias for begin(condition)
pushState:function pushState(condition){this.begin(condition)},

// return the number of states currently on the stack
stateStackSize:function stateStackSize(){return this.conditionStack.length},
options: {"case-insensitive":true},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START
/**/) {

app={};
app.node=function(type,val){
    return {'type':type,'value':val};
}
app.debug=function(obj){
    console.log(JSON.stringify(obj));
}
app.data_block=function(val){
   return {'type':'data_block','value':val};
}
app.routine=function(label,val,info){
   return {'label':label,'value':val,'info':info};
}
app.routine_list=function(val){
    return {'type':'routine_list','value':val};
}
app.include_block=function(val,info){
  return {type:'include','value':val,'info':info};
}
app.include_list=function(val){
  return {'type':'include_list','value':val};
}
app.program=function(op,values,info){
 return {'type':'program','opcode':op,'operand':values,'info':info};  
}
app.reg=function(val){
  return {'type':'reg','value':val};
}

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:/*Skip comments*/
break;
case 2:return 28;
break;
case 3:return 29;
break;
case 4:return 30;
break;
case 5:return 31;
break;
case 6:return 40;/*Load [memory location], destination register*/
break;
case 7:return 26;/*Call a built in routine*/
break;
case 8:return 22;/*Call a given routine*/
break;
case 9:return 43;/*Move result of function call to register*/
break;
case 10:return 42;/*Return from a called function*/
break;
case 11:return 41;/*move %sourceRegister to %destinationRegister*/
break;
case 12:return 44;/*Integer constant*/
break;
case 13:return 20;/*Goto a specific instruction*/
break;
case 14:return 36;/*Get the address of a constant*/
break;
case 15:return 37;/*Store r1,[r0] ;  store register, [destination memory location]*/
break;
case 16:return 32;/*If equal*/
break;
case 17:return 33;/*If not equal*/
break;
case 18:return 34;/*If greater than*/
break;
case 19:return 35;/*If not equal to*/
break;
case 20:return 50;
break;
case 21:return 51;
break;
case 22:return 'DEF';
break;
case 23:return 48;
break;
case 24:return 56;
break;
case 25:return 54;
break;
case 26:return 55;
break;
case 27:
                   yy_.yytext= yy_.yytext.substr( 1,yy_.yytext.length);return"Register";
                    
break;
case 28:return 9
break;
case 29:yy_.yytext= yy_.yytext.substr( 1,yy_.yytext.length - 2 );
                       yy_.yytext = yy_.yytext.replace( /''/g, "\'" ); return 49; 
break;
case 30:yy_.yytext= yy_.yytext.substr( 1,yy_.yytext.length - 2 );
                       yy_.yytext = yy_.yytext.replace( /''/g, "\'" ); return 57; 
break;
case 31:return "'";
break;
case 32:return '"';/*Matches a quote */
break;
case 33:return 27;
break;
case 34:return 27;
break;
case 35:return 38;
break;
case 36:return 39;
break;
case 37:return 21; /* Matches a dot */
break;
case 38:return 10; /*Matches a colon*/
break;
case 39:return 46;
break;
case 40:return 45;
break;
case 41:return 4;
break;
case 42:return 'Unknown Token'; 
break;
}
},
rules: [/^(?:[ \s])/i,/^(?:;.*)/i,/^(?:ADD\b)/i,/^(?:SUB\b)/i,/^(?:MUL\b)/i,/^(?:DIV\b)/i,/^(?:LOAD\b)/i,/^(?:SYSTEM\b)/i,/^(?:CALL\b)/i,/^(?:RESULT\b)/i,/^(?:RETURN\b)/i,/^(?:MOVE\b)/i,/^(?:ICONST\b)/i,/^(?:GOTO\b)/i,/^(?:GET\b)/i,/^(?:STORE\b)/i,/^(?:IF-EQ\b)/i,/^(?:IF-NEQ\b)/i,/^(?:IF-GT\b)/i,/^(?:IF-LT\b)/i,/^(?:DATA\b)/i,/^(?:END\b)/i,/^(?:DEF\b)/i,/^(?:INCLUDE\b)/i,/^(?:CHAR\b)/i,/^(?:STRING\b)/i,/^(?:INT\b)/i,/^(?:[rR][0-9]+)/i,/^(?:[A-Za-z_][A-Za-z0-9_]*)/i,/^(?:"([^\"]|'')*")/i,/^(?:'([^\']|'')')/i,/^(?:')/i,/^(?:")/i,/^(?:0x[0-9A-F]+)/i,/^(?:-?[0-9]+)/i,/^(?:\[)/i,/^(?:\])/i,/^(?:\.)/i,/^(?::)/i,/^(?:,)/i,/^(?:-)/i,/^(?:$)/i,/^(?:.)/i],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42],"inclusive":true}}
};
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args){if(!args[1]){console.log("Usage: "+args[0]+" FILE");process.exit(1)}var source=require("fs").readFileSync(require("path").normalize(args[1]),"utf8");return exports.parser.parse(source)};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}