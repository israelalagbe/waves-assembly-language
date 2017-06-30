Function.prototype.debounce = function (threshold, execAsap) {
 
    var func = this, timeout;
 
    return function debounced () {
        var obj = this, args = arguments;
        function delayed () {
            if (!execAsap)
                func.apply(obj, args);
            timeout = null; 
        };
 
        if (timeout)
            clearTimeout(timeout);
        else if (execAsap)
            func.apply(obj, args);
 
        timeout = setTimeout(delayed, threshold || 100); 
    };
 
};
$(function(){
	var g=$('#grammar');
	var s=$('#source');
	var btn=$('#parse_btn');
	g.load('wavesGrammer.jison',null,function(){
		var compile_btn=$('#process_btn');
		compile_btn.click();
	});
	
	s.keyup(function(){
		btn.click();
	}.debounce(500));
	
});