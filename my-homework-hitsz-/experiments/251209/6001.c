#include <stdio.h>

#define N 100
#define M 20

typedef struct student
{
    int id;
    int score[M];
    float ave_score;
}STUDENT;

float Func1(STUDENT *stu, int m);
int Max(STUDENT *stu, int m);
int Min(STUDENT *stu, int m);
float Print_max(STUDENT stus[], int n);

int main(void)
{
    STUDENT students[N];
    int n, m;
    scanf("%d%d", &n, &m);
    //处理边界
    if (n < 1 || n > N || m < 3 || m > M)
    {
        printf("n is larger than 0 and less than %d, m is larger than 2 and less than %d.\n", N, M);
        return 0;
    }

    //读取评分
    for (int i = 0; i < n; i ++)
    {
        for (int j = 0; j < m; j ++)
        {
            scanf("%d", &students[i].score[j]);
        }
        students[i].id = i;
    }

    //剔除一个最大和一个最小
    for (int i = 0; i < n; i ++)
    {
        students[i].ave_score = Func1(students + i, m);
    }

    printf("%.2f", Print_max(students, n));

    return 0;
}

float Func1(STUDENT *stu, int m)//剔除一个最大和一个最小, m是评委人数
{
    float sum = 0.0;//sum作为剔除最大最小的分总和
    for (int i = 0; i < m; i ++)
    {
        sum += stu -> score[i];
    }
    sum -= Max(stu, m);
    sum -= Min(stu, m);
    return sum / (m - 2);
}

int Max(STUDENT *stu, int m)
{
    int max = stu -> score[0];//
    for (int i = 1; i < m; i ++)
    {
        if (stu -> score[i] > max)
        {
            max = stu -> score[i];
        }
    }
    return max;
}

int Min(STUDENT *stu, int m)
{
    int min = stu -> score[0];
    for (int i = 1; i < m; i ++)
    {
        if (stu -> score[i] < min)
        {
            min = stu ->score[i];
        }
    }
    return min;
}

float Print_max(STUDENT stus[], int n)//n是参赛学生数
{
    float max = stus[0].ave_score;
    for (int i = 1; i < n; i ++)
    {
        if (stus[i].ave_score > max)
        {
            max = stus[i].ave_score;
        }
    }
    return max;
}