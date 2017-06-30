/**
 * @author Israel
 */
 "use strict";
var Events = Class(function() {
	

	return {
		constructor : function(obj) {
			 
			this.events = {};
			for (var i in obj)
			this.bind(i, obj[i]);
		},
		bind : function(event, fn) {
			this.register(event, fn);
		},
		register:function register(name, fn) {
			if (this.events[name]) {
				this.events[name].push(fn);
			
			} else {
				this.events[name] = [fn];
			}
		},
		unbind : function(event) {
			
			return false;
		},
		emit : function(name,args) {
			//args=args||[];
			var current_event = this.events[name]||[];
			
			var fn;
			while ( fn = current_event.pop()) {
				fn.apply(null,args);
			}
		}
	};
});