main:
    iconst r0 100 ;Load 100 into register 0
    iconst r1 50  ;Load 50 into register 1
    add r0 r1 r2  ;r2=r1+r2
    call printInt r2 ;print integer content of register 2
    call newline ;print newline character
    sub r0 r1 r2  ;r2=r1-r2
    call printInt r2
    call newline
    mul r0 r1 r2  ;r2=r1*r2
    call printInt r2
    call newline
    div r0 r1 r2  ;r2=r1/r2
    call printInt r2
    call newline