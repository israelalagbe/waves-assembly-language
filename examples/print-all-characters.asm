.data
    .char colon ':'
.end
main:
    iconst r0 1 ;number 1
    iconst r3 10 ;New Line
    get r5 colon
    load [r5], r5
    
    iconst r2 0;Index
    .loop:
        system 0x0 r2;Print the number
        system 0x1 r5;Print a colon
        system 0x1 r2;Print the character
        system 0x1 r3
        add r0 r2 r2
        goto .loop
    
    
    