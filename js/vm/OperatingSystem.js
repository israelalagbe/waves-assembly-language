var Console=Class({
	constructor:function(){
		var self=this;
		window.C=this;
		this.$backdrop=$('.backdrop');
		this.$content=$('#console .window-content');
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
		this.$content.on("keypress keyup keydown paste cut",function(e){
			self.handle_change(e);
		})
		.blur(function(){
			self.make_editable(false);
		})
		;
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
		}
		else if(e.keyCode==key_enter){
			e.preventDefault();
			this.events.emit('console.inputFinish',[changedContent]);
			self.make_editable(false);
			self.log("\n");
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
	},
	make_editable:function(state){
		this.$content.attr('contenteditable',state);
	},
	setText:function(text){
		this.$content.text(text);
	},
	getText:function(){
		return this.$content.text();
	}
	,
	log:function(text){

		this.setText(this.getText()+text);
	},
	input:function(){
		var self=this;
			self.make_editable(true);
		self.$content.trigger('focus');
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