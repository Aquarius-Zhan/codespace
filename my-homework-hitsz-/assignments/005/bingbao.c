#include <stdio.h>

int countSteps(int *pNum);

int main(void)
{
    int n, step;//初始数
    scanf("%d", &n);
    
    if (n < 1)
    {
        printf("Invalid input.\n");
        return 0;
    }

    step = countSteps(&n);
    printf("%d", step);

    return 1;
}
int countSteps(int *pNum)
{
    if (*pNum == 1)
    {
        return 0;
    }

    if (*pNum % 2 == 0)
    {
        *pNum = *pNum / 2;
        return 1 + countSteps(pNum);
    }
    else
    {
        *pNum = *pNum * 3 + 1;
        return 1 + countSteps(pNum);
    }
} 