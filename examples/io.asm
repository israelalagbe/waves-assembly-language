.data
    .string prompt "Enter your name: "
    .string str "Your name is: "
.end
main:
    get r0 prompt ;Get the address of the string prompt
    call printStr r0 ;print the string at that address
    call input ;accept user input
    result r1 ;Move the address of user input stream to register 1 i.e result of function call
    get r2 str ;get the address of str string
    call printStr r2 ;print str string
    call printStr r1 ;print the user input
    