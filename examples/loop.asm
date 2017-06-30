.data
    .int count 0
    .int increment 1
    .int stop 20
.end
main:
    iconst r0 count
    iconst r1 stop
    iconst r2 increment
    .loop: ;Local label
    ;if count equals stop then goto .stop
    if-eq r0 r1 .stop 
    ;else
    call printInt r0  ;print count
    call newline   ;call newline function
    add r0 r2 r0 ;count=count+increment
    goto .loop   ;go back to .loop local label
    
    .stop: ;local label stop
        return  ;Exit the main routine