// (c) copyright unscriptable.com / John Hann
// License MIT
// For more robust promises, see https://github.com/briancavalier/when.js.

function Promise (fn) {
	this._thens = [];
	this._catch=null;
	/*if(fn)
		this._thens.push({ resolve: function(args){
			
		},reject: function(args){
			
		} });*/
}

Promise.prototype = {

	/* This is the "front end" API. */

	// then(onResolve, onReject): Code waiting for this promise uses the
	// then() method to be notified when the promise is complete. There
	// are two completion callbacks: onReject and onResolve. A more
	// robust promise implementation will also have an onProgress handler.
	then: function (onResolve, onReject) {
		// capture calls to then()
		this._thens.push({ resolve: onResolve, reject: onReject });
		return this;
	},

	// Some promise implementations also have a cancel() front end API that
	// calls all of the onReject() callbacks (aka a "cancelable promise").
	// cancel: function (reason) {},

	/* This is the "back end" API. */

	// resolve(resolvedValue): The resolve() method is called when a promise
	// is resolved (duh). The resolved value (if any) is passed by the resolver
	// to this method. All waiting onResolve callbacks are called
	// and any future ones are, too, each being passed the resolved value.
	resolve: function (val) { this._complete('resolve', val); },

	// reject(exception): The reject() method is called when a promise cannot
	// be resolved. Typically, you'd pass an exception as the single parameter,
	// but any other argument, including none at all, is acceptable.
	// All waiting and all future onReject callbacks are called when reject()
	// is called and are passed the exception parameter.
	reject: function (ex) { this._complete('reject', ex); },
	catch:function(){

	},
	// Some promises may have a progress handler. The back end API to signal a
	// progress "event" has a single parameter. The contents of this parameter
	// could be just about anything and is specific to your implementation.
	// progress: function (data) {},

	/* "Private" methods. */
	_complete: function (which, arg) {
		// switch over to sync then()
		this.then = which === 'resolve' ?
			function (resolve, reject) { resolve && resolve(arg); } :
			function (resolve, reject) { reject && reject(arg); };
		// disallow multiple calls to resolve or reject
		this.resolve = this.reject = 
			function () { /*throw new Error('Promise already completed.');*/ };
		// complete all waiting (async) then()s
		var aThen, i = 0;
		while (aThen = this._thens[i++]) { aThen[which] && aThen[which](arg); }
		delete this._thens;
	}
};
