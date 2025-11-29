#include <stdio.h>

int max(int a, int b);
int main(void)
{
    int a, b;
    scanf("%d\n%d", &a, &b);
    printf("%d", max(a, b));
}

int max(int a, int b)
{
    if (a > b)
        return a;
    else
        return b;
}