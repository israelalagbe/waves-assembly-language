.data
    .string prompt "Guess a number beween 1 and 10: "
    .string correct "Correct! You guessed it!"
    .string wrong "Wrong! The correct number was: "
.end

main:
    .start:
    call random          ; generates 1–100
    result r0            ; r0 = random number

    ; Reduce r0 to 1–10 → r0 = ((r0 - 1) / 10) + 1
    iconst r10 1
    sub r0 r10 r0        ; r0 = r0 - 1
    iconst r11 10
    div r0 r11 r0        ; r0 = r0 / 10
    add r0 r10 r0        ; r0 = r0 + 1

    get r1 prompt
    call printStr r1     ; show prompt

    call input
    result r2            ; r2 = user guess

    if-eq r2 r0 .correct

    ; Wrong guess
    get r3 wrong
    call printStr r3     ; print "Wrong! The correct number was: "
    call printInt r0     ; print the actual number
    call newline
    
    ; Start again
    call newline
    goto .start

.correct:
    get r3 correct
    call printStr r3
    call newline
    
    ; Start again
    call newline
    goto .start