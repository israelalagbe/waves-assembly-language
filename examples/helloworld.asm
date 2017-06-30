.data
    .string str "hello world" ;Declare the string constant
.end
main:
    get r0 str ;Get the address of the string
    call printStr r0 ;Call the printString function