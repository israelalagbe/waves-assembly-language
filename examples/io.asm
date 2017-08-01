.data
    .string prompt "Enter your name: "
    .string str "Your name is: "
.end
main:
    get r0 prompt         ; Load address of prompt string
    call printStr r0      ; Print prompt
    call input            ; Get user input
    result r1             ; Store input address in r1
    get r2 str            ; Load address of str string
    call printStr r2      ; Print "Your name is: "
    call printStr r1      ; Print user input
