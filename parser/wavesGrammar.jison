
%lex
%options case-insensitive

%{
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
%}

%%
/*(\r?\n)+                   {yytext='\n';return 'Newline';}    */ 
[ \s]                     /* skip whitespace */
";".*                     /*Skip comments*/

/* OPCODES DEFINITION */

"ADD"                 return 'ADD_OP';
"SUB"                   return 'SUB_OP';
"MUL"                 return 'MUL_OP';
"DIV"                 return 'DIV_OP';
"LOAD"                 return 'LOAD_OP';/*Load [memory location], destination register*/
"SYSTEM"                 return 'SYSTEM_OP';/*Call a built in routine*/
"CALL"                 return 'CALL_OP';/*Call a given routine*/
"RESULT"                return 'RESULT_OP';/*Move result of function call to register*/
"RETURN"                return 'RETURN_OP';/*Return from a called function*/
"MOVE"                 return 'MOVE_OP';/*move %sourceRegister to %destinationRegister*/
"ICONST"                 return 'ICONST_OP';/*Integer constant*/
"GOTO"                 return 'GOTO_OP';/*Goto a specific instruction*/
"GET"                 return 'GET_OP';/*Get the address of a constant*/
"STORE"                 return 'STORE_OP';/*Store r1,[r0] ;  store register, [destination memory location]*/
"IF-EQ"                 return 'IF_EQ_OP';/*If equal*/
"IF-NEQ"                 return 'IF_NEQ_OP';/*If not equal*/
"IF-GT"                 return 'IF_GT_OP';/*If greater than*/
"IF-LT"                 return 'IF_LT_OP';/*If not equal to*/


      


/*DIRECTIVE Identifiers*/
"DATA"               return 'DATA';
"END"                 return 'END';
"DEF"                 return 'DEF';
"INCLUDE"             return 'INCLUDE';
"CHAR"                return 'CHAR';
"STRING"              return 'STRING';
"INT"                 return 'INT';
/*
Others
*/

[rR][0-9]+             {
                   yytext= yytext.substr( 1,yytext.length);return"Register";
                    }  

[A-Za-z_][A-Za-z0-9_]*	{return 'Identifier'}; /* Matches an identifier or constant name */
\"([^\"]|\'\')*\"	{yytext= yytext.substr( 1,yytext.length - 2 );
                       yytext = yytext.replace( /''/g, "\'" ); return 'String_Constant'; }/*Matches a string */

\'([^\']|\'\')\'	{yytext= yytext.substr( 1,yytext.length - 2 );
                       yytext = yytext.replace( /''/g, "\'" ); return 'Char_Constant'; } /*Matches a character */

"'"             return "'";
'"'             return '"';/*Matches a quote */
0x[0-9A-F]+  return 'Integer_Constant';
\-?[0-9]+			return 'Integer_Constant';
'['                     return '[';
']'                     return ']';
'.'                     return '.'; /* Matches a dot */
':'                     return ':'; /*Matches a colon*/
','                     return ',';
'-'                     return '-';
<<EOF>>               return 'EOF';
.                     {return 'Unknown Token'; }/* Matches all token :invalid token*/


/lex

%% /* language grammar */

/*program:
    |data_block EOF{return [$1];}
    |include_block EOF{return [$1];}
    |data_block include_block EOF{return [$2];}
;*/
file:
     EOF            {return []; }/* An empty program */
     |data_block EOF{return [app.data_block($1)];}/* A complete program consisting of only data block*/
     |include_list EOF{return [app.include_list($1)];}/* A complete program consisting of only include block lists*/
     |routine_list  EOF{
          return [app.routine_list($1)];
        } /* A complete program consisting of only routine lists*/
     |include_list data_block  EOF 
         {
            return [app.include_list($1), app.data_block($2)];

          } /* A complete program consisting of only data block and include list err*/
     |data_block routine_list  EOF 
     {
        return [app.data_block($1),app.routine_list($2)];
     } /* A complete program consisting of only data block and routine list*/
     |include_list routine_list  EOF {
            return [app.include_list($1),app.routine_list($2)];

          }
    |include_list data_block  routine_list  EOF {
       return [app.include_list($1),app.data_block($2),app.routine_list($3)];

          }
;
routine_list:
    routine                {$$=[$1];}/* One routine in the routine list */
    |routine_list   routine{$1.push($2);$$=$1;}  /* Multiple routines in the routine list */
;
routine:
    Identifier ':' Empty
            {$$=$$=app.routine($1,[],@$);}
    |Identifier ':' program_list
                 {$$=$$=app.routine($1,$3,@$);}
;

program_list:
    program   {$$=[$1];}
    |local_label  {$$=[$1];}
    |program_list program {$1.push($2);$$=$1;}
    |program_list local_label {$1.push($2);$$=$1;}
;
program:
    arithmetic_instr
	  |branch_instr 
    |assign_instr
    |memory_instr
    |conditional_instr
;

branch_instr:
      GOTO_OP '.' Identifier {$$=app.program($1,[$3],@$);}
      |CALL_OP Identifier    {$$=app.program($1,[$2,null],@$);}
      |CALL_OP Identifier opn_comma Register{$$=app.program($1,[$2,$4],@$);}
      |CALL_OP Identifier opn_comma Reg_Range {$$=app.program($1,[$2,$4],@$);}
      |SYSTEM_OP Integer_Constant {$$=app.program($1,[$2,null],@$);}
      |SYSTEM_OP Integer_Constant opn_comma Register {$$=app.program($1,[$2,$4],@$);}
      |SYSTEM_OP Integer_Constant opn_comma Reg_Range {$$=app.program($1,[$2,$4],@$);}
;
arithmetic_instr:
      ADD_OP Register opn_comma Register opn_comma Register  {$$=app.program($1,[$2,$4,$6],@$);}
     |SUB_OP Register opn_comma Register opn_comma Register     {$$=app.program($1,[$2,$4,$6],@$);}
     |MUL_OP Register opn_comma Register opn_comma Register     {$$=app.program($1,[$2,$4,$6],@$);}
     |DIV_OP Register opn_comma Register opn_comma Register     {$$=app.program($1,[$2,$4,$6],@$);}

;
conditional_instr:
     IF_EQ_OP   Register opn_comma Register opn_comma '.' Identifier            {$$=app.program($1,[$2,$4,$7],@$);}
     |IF_NEQ_OP   Register opn_comma Register opn_comma '.' Identifier            {$$=app.program($1,[$2,$4,$7],@$);}
     |IF_GT_OP   Register opn_comma Register opn_comma '.' Identifier            {$$=app.program($1,[$2,$4,$7],@$);}
     |IF_LT_OP   Register opn_comma Register opn_comma '.' Identifier            {$$=app.program($1,[$2,$4,$7],@$);}
;
memory_instr:
  GET_OP Register opn_comma Identifier  {$$=app.program($1,[$2,$4],@$);}
  |STORE_OP Register   opn_comma   '[' Register ']' {$$=app.program($1,[$2,$5],@$);}
  |LOAD_OP '['  Register  ']' opn_comma Register {$$=app.program($1,[$3,$6],@$);}
  |MOVE_OP Register opn_comma Register {$$=app.program($1,[$2,$4],@$);}
  |RETURN_OP  Register       {$$=app.program($1,[$2],@$);}
  |RETURN_OP           {$$=app.program($1,[null],@$);}
  |RESULT_OP  Register       {$$=app.program($1,[$2],@$);}
;
assign_instr:
    ICONST_OP Register opn_comma Integer_Constant  {$$=app.program($1,[$2,$4],@$);}
    |ICONST_OP Register opn_comma Identifier  {$$=app.program($1,[$2,$4],@$);}
;
local_label:
    '.' Identifier ':'  {$$={'type':'local_label','label':$2,'info':@$};}
;
Reg_Range:
    Register '-' Register {$$=[$1,$3];}
;
Empty:  ;
opn_comma:
      Empty
      |','
;
include_list:
    include_block                {$$=[$1];} /* One include block in the list */
    |include_list   include_block{$1.push($2);$$=$1;} /* Multiple include blocks in the list */
;
include_block:
   '.' INCLUDE String_Constant {$$=app.include_block($3,@$);} /*One include block */
;
data_block:
    '.' DATA '.' END
                    {$$=[];} /*Empty data block */
     |'.' DATA
         const_block '.' END
                    {$$=$3;}  /*Data block that contains constant declarations*/

;
const_block: 
   const_declare          {$$=[$1];}/*Just one constant*/
   |const_block  const_declare{$1.push($2);$$=$1;} /*Two or more constants*/
;

const_declare:
'.' 'STRING' Identifier String_Constant{$$= {'type':'string','name':$3,'value':$4,'info':@$};}/*String constant*/
|'.' 'INT' Identifier Integer_Constant {$$= {'type':'integer','name':$3,'value':parseInt($4),'info':@$};}/*Integer constant*/
|'.' 'CHAR' Identifier Char_Constant {$$= {'type':'char','name':$3,'value':$4,'info':@$};}/*Char constant */
;
%%