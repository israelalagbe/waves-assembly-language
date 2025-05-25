.data
    .string str "hello world" ; Declare a string constant
.end
main:
    get r0 str ; Get address of the string
    call printStr r0 ; Print the string