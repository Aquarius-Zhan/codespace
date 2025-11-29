#include <stdio.h>

int max_diff(int arr[], int m, int n);

int main(void)
{
    int length = 0, pure_score = 0;
    scanf("%d", &length);
    int array[length];
    for (int i = 0; i < length; i++)
    {
        scanf("%d", &array[i]);
    }

    pure_score += max_diff(array, 0, length - 1);

    if (pure_score >= 0)
    {
        printf("true");
    }
    else
    {
        printf("false");
    }
}

int max_diff(int arr[], int m, int n)
{
    if (m == n)
    {
        return arr[m];
    }

    int score1 = arr[m] - max_diff(arr, m + 1, n);
    int score2 = arr[n] - max_diff(arr, m, n - 1);

    if (score1 > score2)
    {
        return score1;
    }
    else
    {
        return score2;
    }
}