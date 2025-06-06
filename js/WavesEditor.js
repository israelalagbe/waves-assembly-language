/**
 * @author Israel
 */
"use strict";
 var BaseEditor = Class({
     constructor: function() {
         this._events = new Events();

     },
     compileError: function(error) {
         console.error(error)
         this.log("Error", error);
     },
     compileSuccess: function(res) {
         this.log("Success", {
         	str:"Compilation Successful"
         });
     },
     log: function(type, obj) {
         console.log(obj.str);
     },
     clearLog: function() {
         console.log('clearing log')
     },
     setFileSystem:function(fs){
        this.fs=fs;
     },
     onCompile: function(fn) {},
     onRun: function(fn) {},
     onLoad: function(fn) {
         this._events.bind('load', fn);
     }
 });
 var WavesEditor = Class(BaseEditor, {
     constructor: function() {
     	var self=this;
         this._events = new Events();
         this.loader=$('#loader_backdrop');
         this.$compileBtn = $('#compileBtn');
         this.$runBtn = $('#runBtn');
         this.$aboutBtn = $('#aboutBtn');
         
         this.$saveBtn = $('#saveBtn');
         this.$closeBtn = $('#closeBtn');

         this.$fontSelect=$('#fontSelect');
         this._editor = ace.edit("editor");
         window.edit=this._editor;
         this._editor.setTheme("ace/theme/monokai");
         this.$logger=$("#logger");
         
         this._editor.getSession().setMode("ace/mode/waves");
         var self=this;
         setTimeout(function(){
            var file=store.get('file.asm')||'.data\n    .string text "Hello World"\n .end\n main:\n     get r0 text\n     call printStr r0\n';
            self._editor.session.setValue(file);
         	self._events.emit('load');
         });
         $('#loadExamples').find('a').click(function(e){
            self.loader.show();
            e.preventDefault();
            var filename=$(this).data('name');
            self.fs.read("examples/"+filename).then(function(content){
                //Success
                self._editor.session.setValue(content);
                self.loader.hide();
            },function(err){
                //Error
                self.loader.hide();
                console.error(err);
            });
         });
         this.$fontSelect.on('change',function(){
         	var $this=$(this);
            $('#appbar a,#appbar select,#editor').css('font-size',$this.val());
         });
         $('.themes-select').children().click(function(e){
         	e.preventDefault();
         	var theme=$(this).find('a').data('theme');
         	self._editor.setTheme(theme);
         });
         this.$aboutBtn.on('click',function(e){
            e.preventDefault();
            metroDialog.open('#about');
         });

         this.$saveBtn.on('click',function(e){
            e.preventDefault();
            var val=self._editor.session.getValue();
            store.set('file.asm',val);
            $.Notify({
                 caption: 'Status',
                 content: 'File Successfully saved',
                  type: 'success'
            });
         });
         this.$closeBtn.on('click',function(e){
            e.preventDefault();
            self._editor.session.setValue("")
         });
     },
     getContent: function() {
         return this._editor.session.getValue();
     },
     alert: function(type, content) {
         var options = { 'background-color': "white" };
         if (type == "Warn")
             options = { 'background-color': "yellow" };
         else if (type == "Error")
             options = { 'background-color': "red" };
         $.Dialog({
             title: "Message",
             content: content,
             actions: [{
                 title: "Ok",
                 onclick: function(el) {
                     $(el).data('dialog').close();
                 }
             }],
             options: options
         }).css(options);
     },
     compileError: function(error) {
     	this.alert("Error", "Compilation Error<br /> See log for details");
         this.log("Error", error);
     },
     formatError:function(e){
     	var str=e.str;
        if(e.type==Exception.DUPLICATE_DATA)
            console.error(e.info)
     	while(str.search('\n')!=-1){
     		str=str.replace('\n',"<br>");
     	}
     	return str;
     }
     ,
     log: function(type, obj) {
     	if(type=="Error"){
     		this.$logger.css({
     			"color":"red",
     			"border-top-color":"red" 
     		})
     		.find('#logger_message')
     		.html(this.formatError(obj));
     	}
     	else{
     		this.$logger.css({
     			"color":"blue",
     			"border-top-color":"blue" 
     		})
     		.find('#logger_message')
     		.html(this.formatError(obj));
     	}
     	showMetroCharm(this.$logger);
     },
     onCompile: function(fn) {
         this.$compileBtn.click(function() {
             this.clearLog();
             fn(this.getContent());
         }.bind(this));
     },
     onRun: function(fn) {
         var self = this;
         this.$runBtn.click(function() {
             this.clearLog();
             try {
                 fn.debounce(50)();
             } catch (e) {
             	console.error(e)
                 self.log("Error", {str:e.message});
             }
         }.bind(this));
     }
 });