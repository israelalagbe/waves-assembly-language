.data
    .int num1 30      ; num1 = 30
    .int num2 100     ; num2 = 100
.end
addition:
    add r0, r1, r2    ; r2 = r0 + r1
    return r2
main:
    iconst r3, num1   ; r3 = num1
    iconst r4, num2   ; r4 = num2
    call addition r3-r4
    result r5         ; r5 = result
    call printInt r5  ; print r5
