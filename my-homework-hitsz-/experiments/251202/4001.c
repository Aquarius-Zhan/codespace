#include <stdio.h>

#define ROW 20
#define COL 5

int is_good(int t, int seat[][COL]);
void not_good(int t, int seat[][COL]);

int main (void)
{
    int n, seat[ROW][COL], x;
    x = -1;

    for (int i = 0; i < ROW; i++)
    {
        for (int j = 0; j < COL; j++)
        {
            seat[i][j] = 0;
        }
    }//initialize seat status 0

    scanf("%d", &n);
    if (n < 1 || n > 5)
    {
        printf("Invalid output, n is required less than 6 and greater than 0.\n");
        return 0;
    }//is valid or not
    
    int t[n];   
    for (int i = 0; i < n; i++)
    {
        scanf("%d", t + i);
    }

    for (int i = 0; i < n; i++)
    {
        x = is_good(t[i], seat);
        if (x == 0)
        {
            not_good(t[i], seat);
        }
    }
    return 0;
}

int is_good(int t, int seat[][COL])//t for tickets, whether available consistent seats in same row exist(good) or not
{
    for (int i = 0; i < ROW; i++)
    {
        int k = -1;//k is the first one seat whose status num is 0;
        for (int j = 0; j < COL + 1 - t; j++)
        {
            if (seat[i][j] == 0)
            {
                k = j;
                break;
            }
        }
        if (k != -1)
        {
            for (int j = k; j < k + t; j++)
            {
                seat[i][j] = 1;//seat is bought
                if (j < 4)
                {
                    printf("%d%c", i + 1, j + 65);
                    if (j - k + 1 != t)
                    {
                        printf(" ");
                    }
                }
                else 
                {
                    printf("%d%c", i + 1, j + 66);
                    if (j - k + 1 != t)
                    {
                        printf(" ");
                    }
                }
            }
            printf("\n");
            return 1;//good
        }
    }

    return 0;
}

void not_good(int t, int seat[][COL])
{
    int res = 0;//for check if available tickets is enough
    for (int i = 0; i < ROW; i++)
    {
        if (res == t)
        {
            break;
        }

        for (int j = 0; j < COL; j++)
        {
            if (res == t)
            {
                break;
            }

            if (seat[i][j] == 0)
            {
                seat[i][j] = 1;
                res++;
                if (j < 4)
                {
                    printf("%d%c", i + 1, j + 65);
                    if (res != t - 1)
                    {
                        printf(" ");
                    }
                }
                else 
                {
                    printf("%d%c", i + 1, j + 66);
                    if (res != t - 1)
                    {
                        printf(" ");
                    }
                }
            }
        }
    }
    printf("\n");
}

