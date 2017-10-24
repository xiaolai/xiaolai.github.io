# Computing π with Leibniz's formula
pi, sign = 0, 1
n = 6
terms = 10 ** n
for i in range(terms * 2):
    if i/2 != int(i/2):
        pi = pi + 4 * sign / i
        print(pi)
        sign = sign * -1
