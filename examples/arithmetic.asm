main:
    iconst r0 100      ; Load 100 into register 0
    iconst r1 50       ; Load 50 into register 1
    add r0 r1 r2       ; r2 = r0 + r1
    call printInt r2   ; Print integer in register 2
    call newline       ; Print newline character
    sub r0 r1 r2       ; r2 = r0 - r1
    call printInt r2
    call newline
    mul r0 r1 r2       ; r2 = r0 * r1
    call printInt r2
    call newline
    div r0 r1 r2       ; r2 = r0 / r1
    call printInt r2
    call newline