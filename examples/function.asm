.data
    .int num1 30 ;Declare integer constant num1=30
    .int num2 100;Declare integer constant num2=100
.end
addition:
    add r0, r1, r2 ;r2=r0+r1
    return r2
main:
    iconst r3, num1 ;Move the num1 to register 3
    iconst r4, num2 ;Move the num2 to register 4
    call addition r3-r4 ;Push register 3 to 4 on the call stack and call addition function
    result r5 ;move the result to register 5
    call printInt r5 ;print the value in register 5
    