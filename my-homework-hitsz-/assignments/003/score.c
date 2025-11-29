#include <stdio.h>

const int MAX = 40;

int ave(int array[], int size);

int main(void)
{
    int score[MAX], n = 0, average, num = 0;
    for (int i = 0; i < MAX; i++)
    {
        scanf("%d", &score[i]);
        if (score[i] < 0)
        {
            n = i;
            break;
        }
    }

    average = ave(score, n);
    for (int i = 0; i < n; i++)
    {
        if (score[i] >= average)
        {
            num++;
        }
    }
    printf("%d", num);

    return 0;
}

int ave(int array[], int size)
{
    int sum = 0;
    for (int i = 0; i < size; i++)
    {
        sum += array[i];
    }
    return sum / size;
}