.data
    .int count 0
    .int increment 1
    .int stop 20
.end
main:
    iconst r0 count
    iconst r1 stop
    iconst r2 increment
    .loop:
        if-eq r0 r1 .stop  ; if count equals stop then goto .stop
        call printInt r0
        call newline
        add r0 r2 r0
        goto .loop
    
    .stop:
        return
