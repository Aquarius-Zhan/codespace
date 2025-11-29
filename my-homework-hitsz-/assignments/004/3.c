#include <stdio.h>

#define MAX1 1000
#define MAX2 750

int binSearch(int expected_scores[], int score, int m);

int main(void)
{
    int m, n, sum = 0;
    scanf("%d %d", &m, &n);
    //printf("%d %d\n", m, n);
    int  predicted_scores[m], scores[n], pos[n], det[n];
    for (int i = 0; i < m; i++)
    {
        if (i == m - 1)
        {
            scanf("%d", &predicted_scores[i]);
            //printf("%d\n", predicted_scores[i]);
        }
        else
        {
            scanf("%d ", &predicted_scores[i]);
            //printf("%d ", predicted_scores[i]);
        }
    }
    for (int i = 0; i < n; i++)
    {
        if (i == n - 1)
        {
            scanf("%d", &scores[i]);
            //printf("%d\n", scores[i]);
        }
        else
        {
            scanf("%d ", &scores[i]);
            //printf("%d ", scores[i]);
        }
    }

    for (int i = 0; i < n; i++)
    {
        pos[i] = binSearch(predicted_scores, scores[i], m);
        //printf("%d", pos[i]);

        if(pos[i] == 0)
        {
            det[i] = predicted_scores[pos[i]] - scores[i];
        }
        else if (pos[i] < 0)
        {
            det[i] = scores[i] - predicted_scores[m - 1];
        }
        else
        {
            if (predicted_scores[pos[i]] - scores[i] > scores[i] - predicted_scores[pos[i] - 1])
            {
                det[i] = scores[i] - predicted_scores[pos[i] - 1];
            }
            else
            {
                det[i] = predicted_scores[pos[i]] - scores[i];
            }
        }

        sum += det[i];
    }

    printf("%d", sum);
    return 0;
}

int binSearch(int expected_scores[], int score, int m)
{
    int low = 0, high = m - 1, mid;
    //printf("%ld %ld %ld", low, high, mid);
    while (low < high)
    {
        mid = (low + high) / 2;//fule
        if (score < expected_scores[mid])
        {
            high = mid;
        }
        else 
        {
            low = mid + 1;
        }
        //printf("%d-%d", low, high);
    }
    if (expected_scores[m - 1] >= score)
    {
        return high;//找到第一个大于score的位置
    }
    else 
    {
        return -1;
    }
}