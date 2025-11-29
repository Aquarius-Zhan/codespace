#include <stdio.h>

int lcf(int a, int b);

int main(void)
{
    int a, b;
    scanf("%d\n%d", &a, &b);
    lcf(a, b);
}

int lcf(int a, int b)
{
    int num = 1;
    for (int i = 0; num % a != 0 || num % b != 0; i++)
    {
        num += 1;
    }
    printf("%d", num);
}