/**
 * @author Israel
 */
 "use strict";
var Events = Class(function() {
	var events = {};
	function register(name, fn) {
		if (events[name]) {
			events[name].push(fn);
		} else {
			events[name] = [];
			events[name].push(fn);
		}
	}

	return {
		constructor : function(obj) {
			for (var i in obj)
			this.bind(i, obj[i]);
		},
		bind : function(event, fn) {
			register(event, fn);
			return true;
		},
		unbind : function(event, fn) {
			return false;
		},
		trigger : function(name,args) {
			var current_event = events[name];
			var fn;
			while ( fn = current_event.pop()) {
				var args=Array(arguments).shift()
				fn.apply(null,arguments);
			}
		}
	};
});
