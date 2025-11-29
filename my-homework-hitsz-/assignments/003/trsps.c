#include <stdio.h>

const int N = 10;

void Transpose(int a[][N], int n);
void Swap(int *x, int *y);

int main()
{
    int n, matrix[n][N];
    printf("Input the size of the square matrix (n x n), n <= 10:\n");
    scanf("%d", &n);

    for (int i = 0; i < n; i++)
    {
        for (int j = 0; j < n; j++)
        {
            scanf("%d", &matrix[i][j]);
        }
    }

    Transpose(matrix, n);

    for (int i = 0; i < n; i++)
    {
        for (int j = 0; j < n; j++)
        {
            printf("%d ", matrix[i][j]);
        }
        printf("\n");
    }
}

void Transpose(int a[][N], int n)
{
    for (int i = 0; i < n; i++)
    {
        for (int j = i + 1; j < n; j++)
        {
            Swap(&a[i][j], &a[j][i]);
        }
    }
}

void Swap(int *x, int *y)
{
    int temp;
    temp = *x;
    *x = *y;
    *y = temp;
}