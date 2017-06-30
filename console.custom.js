var log = document.querySelector( '#log' );
[ 'log' , 'warn' , 'error' ].forEach( function (verb) {
    console[verb] = ( function (method, verb, log) {
return function (text) {
            method(text);
// handle distinguishing between methods any way you'd like
var msg = document.createElement( 'code' );
            msg.classList.add(verb);
			msg.style.display="block";
			var prefix="<span ";
			var suffix="</span>";
            msg.innerHTML = verb + ': ' + text;
            log.appendChild(msg);
        };
    })(console[verb].bind(console), verb, log);
    window.onerror=function(message,source,lineno,colno,error){
        console.error(message+"--file:"+source+"--line:"+lineno);
    };
});
