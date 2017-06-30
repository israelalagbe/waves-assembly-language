var Console=Class({
	constructor:function(){
		var self=this;
		window.C=this;
		this.$backdrop=$('.backdrop');
		this.$content=$('#console .window-content');
		//console.log(this.$backdrop.show())
		this.events.bind('console.open',this.open.bind(this));
		this.events.bind('console.show',this.show.bind(this));
		this.events.bind('console.log',this.log.bind(this));
		this.events.bind('console.hide',this.hide.bind(this));
		this.events.bind('console.clear',this.clear.bind(this));
		this.events.bind('console.close',this.close.bind(this));
		this.events.bind('console.input',this.input.bind(this));
		this.inputStream="";
		this.oldInputContent="";
		$('#console .btn-close').click(function(){
			self.events.emit('console.close');
		});
		//this.$content.click(function(){
			//self.make_editable(true);
			//this.focus();
			//this.blur();
			//self.$content.trigger('blur');
			//self.$content.attr('contenteditable',"true");
			//elf.events.emit('console.input');
		//})
		this.$content.on("keypress keyup keydown paste cut",function(e){
			self.handle_change(e);
			//e.preventDefault();
			//console.log(e)
		})
		.blur(function(){
			self.make_editable(false);
		})
		;
		//this.events.bind('console.inputFinish',function(text){
		//	console.log("input is:",'"'+text+'"')
		//});
	},
	handle_change:function(e){
		var self=this;
		var key_backspace=8;
		var key_enter=13;
		var key_delete=46;
		var inputStream=this.$content.text();
		var changedContent=inputStream.substr(this.oldInputContent.length);
		if (e.keyCode==key_backspace||e.type=="cut"||e.type=="paste") {
			if (changedContent.length==0) {
				e.preventDefault();
			}
			//console.log(this.inputStream,this.oldInputContent)
		}
		else if(e.keyCode==key_enter){
			//e.preventDefault();
			//this.log("\n");//Add a newline manually
			//this.make_editable(false);
			e.preventDefault();
			this.events.emit('console.inputFinish',[changedContent]);
			self.make_editable(false);
			self.log("\n");
			//(function(){
				//self.setCursorToEnd(self.$content.get(0));
				
				//self.setText(self.getText()+"\n");
				//self.log(" ");
				
				//elf.$content.trigger('blur');
			//}.debounce(20))();
		}
	}
	,
	setCursorToEnd:function(el){
		if (el.innerText.length>0) {
		var range=document.createRange();
		var sel=window.getSelection();
		range.setStart(el,1);
		range.collapse(true);
		sel.removeAllRanges();
		sel.addRange(range);
		el.focus();
	}
		//this.$content.
	}
	,
	make_editable:function(state){
		this.$content.attr('contenteditable',state);
		//this.setCursorToEnd(this.$content.get(0));
	},
	setText:function(text){
		this.$content.text(text);
	},
	getText:function(){
		return this.$content.text();
	}
	,
	log:function(text){

		/*var oldText=this.$content.text();
		if(oldText!="")
			oldText+="\n";
		this.$content.text(oldText+text);*/
		//console.error(text)
		//var oldText=this.$content.text();
		//this.$content.text(oldText+text);
		//console.log("logging: ",'"'+text+'"')
		this.setText(this.getText()+text);
	},
	input:function(){
		var self=this;
			self.make_editable(true);
		self.$content.trigger('focus');
		//self.log("\r");
		//self.log("");
		self.setCursorToEnd(self.$content.get(0));
		self.oldInputContent=self.$content.text();
		
		
	},
	clear:function(){
		this.$content.empty();
	},
	open:function(cb){
		this.show(cb);
	},
	show:function(cb){
		this.$backdrop.show(cb);
	},
	hide:function(cb){
		this.$backdrop.hide(cb);
	},
	close:function(cb){
		this.hide(cb);
		this.clear();
	}
});
var OperatingSystem=Class(Console,{
	constructor:function(){
		this.events=new Events;
		Console.call(this);	
	}
});