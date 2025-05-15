.data
    .int start 1
    .int stop 101
    .int three 3
    .int five 5
    .int zero 0
    .int one 1
    .string fizz "Fizz"
    .string buzz "Buzz"
    .string fizzbuzz "FizzBuzz"
.end

main:
    iconst r0 start       ; r0 = counter (1)
    iconst r1 stop        ; r1 = 101 (loop upper bound)
    iconst r2 three       ; r2 = 3
    iconst r3 five        ; r3 = 5
    iconst r10 zero       ; r10 = 0
    iconst r11 one        ; r11 = 1

.loop:
    if-eq r0 r1 .stop     ; if counter == 101, exit loop

    ; === Compute r0 % 3 ===
    div r0 r2 r4          ; r4 = r0 / 3
    mul r4 r2 r5          ; r5 = (r0 / 3) * 3
    sub r0 r5 r6          ; r6 = r0 - r5 (i.e. r0 % 3)

    ; === Compute r0 % 5 ===
    div r0 r3 r7
    mul r7 r3 r8
    sub r0 r8 r9          ; r9 = r0 - r8 (i.e. r0 % 5)

    ; === Check if divisible by 3 and 5 ===
    if-eq r6 r10 .div_by_3
    goto .check5

.div_by_3:
    if-eq r9 r10 .fizzbuzz

    ; Only divisible by 3
    get r12 fizz
    call printStr r12
    call newline
    goto .incr

.fizzbuzz:
    get r12 fizzbuzz
    call printStr r12
    call newline
    goto .incr

.check5:
    if-eq r9 r10 .buzz

    ; Not divisible by 3 or 5
    call printInt r0
    call newline
    goto .incr

.buzz:
    get r12 buzz
    call printStr r12
    call newline

.incr:
    add r0 r11 r0         ; r0 = r0 + 1
    goto .loop

.stop:
    return