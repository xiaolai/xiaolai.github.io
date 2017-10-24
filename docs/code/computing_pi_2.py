# Computing π with the Wallis product
pi = 1
n = int(input('How many product terms? '))
for j in range(1, n):
    pi *= 4 * j ** 2 / (4 * j ** 2 - 1)
pi *= 2
print(pi)
