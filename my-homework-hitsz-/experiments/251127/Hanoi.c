#include <stdio.h>

#define MAX 10

int Hanoi(int n, char a, char b, char c);
void Move(char a, char b, char c);

int main(void)
{
    int n;
    scanf("%d", &n);
    /*if (n < 1 || n > 10)
    {
        printf("Invalid input!");
        return 0;
    }*/
    Hanoi(n, 'A', 'B', 'C');
    return 0;
}

int Hanoi(int n, char a, char b, char c)//(n - 1) a to c
{
    if (n == 1)
    {
        Move(a, b, c);
        return 0;
    }
    Hanoi(n - 1, a, c, b);
    Move(a, b, c);
    Hanoi(n - 1, b, a, c);
    return 0;
}

void Move(char a, char b, char c)//a to c. b rests
{
    printf("Move disk from %c to %c\n", a, c);
}