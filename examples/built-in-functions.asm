.data
    .string hello "hello world"
    .string hi "hi world"
    .int terminate 0
    .int newLine 10
.end
printInt:
    system 0x0 r0
    return
printChar:
    system 0x1 r0
    return
printStr:
    iconst r3 terminate
    iconst r1 1
     .loop:
    load [r0] r2
    call printChar r2
    add r0 r1 r0
    if-neq r2 r3 .loop
    
    return
main:
    get r0 hello
    get r1 hi
    call printStr r0
    call printStr r1