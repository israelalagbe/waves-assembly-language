/**
 * @author Israel
 */
 "use strict";
var BaseEditor=Class({
	constructor : function() {
		//this.init();
		this._events = new Events();
		//this._events.trigger('compileError',{str:"hello world"});
		//this._events.bind('compileError',this.compileError);

	},
	compileError:function(error){
		this.log("Error",error);
	},
	compileSuccess:function(res){
		this.log("Success",error);
	},
	log:function(type,obj){
		console.log(obj.str);
	},
	clearLog:function(){
		console.log('clearing log')
	},
	onCompile : function(fn) {},
	onLoad : function(fn) {}
}); 
var TestEditor = Class(BaseEditor,function() {
	return {
		constructor : function() {
			TestEditor.$super.call(this);
			this.$code = $('#code');
			this.$compileBtn = $('#compileBtn');
			this.$runBtn = $('#runBtn');
			this.$result = $('#result');
		},
		getContent:function(){
			//Use only one type of newline character
			return this.$code.val().replace(/\r?\n/g,'\n')
		}
		,
		onLoad : function(fn) {
			setTimeout(function() {
				fn();
			}, 1000);
		},
		onCompile : function(fn) {
			this.$compileBtn.click(function() {
				this.clearLog();
				fn(this.getContent());
			}.bind(this));
		},
		log:function(type,obj){
			if(type=="Error"){
				this.$code.select();
				this.$result.removeClass('success').addClass('error').html(obj.str);
			}
			else if(type=="Success"){
				this.$code.select();
				this.$result.removeClass('error').addClass('success').html(obj.str);
			}
			else{
				this.$result.removeClass('success').removeClass('error').html(obj.str);
			}
		},
		clearLog:function(){
			this.$result.removeClass('success').removeClass('error').html("");
		}
		,
		compileSuccess:function(res){
			this.$result.removeClass('error').addClass('success').html('Compilation successful');
		}
	};
});
