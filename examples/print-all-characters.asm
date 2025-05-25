.data
    .char colon ':'
.end
main:
    iconst r0 1         ; number 1
    iconst r3 10        ; new line character
    get r5 colon
    load [r5], r5

    iconst r2 0         ; index
.loop:
    system 0x0 r2       ; print the number
    system 0x1 r5       ; print a colon
    system 0x1 r2       ; print the character
    system 0x1 r3       ; print new line
    add r0 r2 r2
    goto .loop
