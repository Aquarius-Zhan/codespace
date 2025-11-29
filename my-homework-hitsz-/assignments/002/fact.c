#include <stdio.h>

unsigned long fact(int n);

int main(void)
{
    int n;
    scanf("%d", &n);
    printf("%lu\n", fact(n));
}

unsigned long fact(int n)
{
    if (n == 1 || n == 0)
    {
        return 1;
    }
    else
    {
        return n * fact(n - 1);
    }
}