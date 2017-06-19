# The submatrix median problem

Given a matrix full of integer values:

```
  1 2 3 4
  5 6 7 8
  9 1 2 3 
  1 5 9 8
```

You are expected to receive queries like this one:

```
  [2, 3, 4, 4]
```

Which actually specifies coordinates of a submatrix (one-based indexing) inside the former matrix.
In this case the submatrix ends up being:

```
  7 8
  2 3
  9 8
```

The aim of the exercise is to calculate the "median" value of the elements inside the submatrix.
In order to do that, you should list the elements of the submatrix (in an orderded way):
            
```
  2, 3, 7, 8, 8, 9
```

And:
 * If the length of the list is odd, then the "median" is the element at the length/2 position.
 * If the length of the list is even, then the "median" is the average beetwen the element at the length/2 position and the one in the length/2 - 1 position. If the number is not integer you should round it down.

For the example shown above:
  * The lenght is 6.
  * As it's even, we'll use two elements of the array to calculate the median:
      - (6/2) = 3 => 8
      - (6/2) - 1 = 2 => 7
  * Finally:
      - 8 + 7 = 15 / 2 = 7.5 ~ rounded down ~ (7)