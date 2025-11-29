#include <stdio.h>

#define NUM 5

typedef struct date
{
    int year;
    int month;
    int day;
}DATE;

typedef struct situation
{
    char college[40];
    char title[40];
    char position[40];
}SITUATION;

typedef struct PERSON
{
    char name[10];
    char sex[10];
    DATE borndate;
    SITUATION occupational_status;
}PERSON; 

void find_min(PERSON persons[], int n);

int main(void)
{
    

    PERSON persons[NUM] = {
    {"王伟", "男", {1998, 5, 12}, {"计算机学院", "教授", "院长"}},
    {"王芳", "女", {1985, 3, 22}, {"外语学院", "副教授", "系主任"}},
    {"张磊", "男", {1992, 8, 15}, {"经营学院", "讲师", "教师"}},
    {"刘敏", "女", {1988, 11, 30}, {"法学院", "助教", "教师"}},
    {"陈杰", "男", {1995, 7, 18}, {"艺术学院", "副教授", "副院长"}}
    };

    find_min(persons, NUM);
    return 0;
}

void find_min(PERSON p[], int n)
{
    if (n < 1)
    {
        printf("Error!\n");
    }

    int temp1 = p[0].borndate.year;//初始值
    int min_num1 = 0;//最大值的个数
    
    for (int i = 0; i < n - 1; i++)
    {
        if (p[i].borndate.year > p[i + 1].borndate.year)
        {
            temp1 = p[i + 1].borndate.year;
        }
    }
    for (int i = 0; i < n; i++)
    {
        if (p[i].borndate.year == temp1)
        {
            min_num1++;
        }
    }

    //两个及以上year相同
    if (min_num1 > 1)
    {
        int temp2 = p[0].borndate.month;//初始值
        int min_num2 = 0;//最大值的个数
    
        for (int i = 0; i < n - 1; i++)
        {
            if (p[i].borndate.month > p[i + 1].borndate.month)
            {
                temp2 = p[i + 1].borndate.month;
            }
        }
        for (int i = 0; i < n; i++)
        {
            if (p[i].borndate.month == temp2)
            {
                min_num2++;
            }
        }

        if (min_num2 > 1)
        {
            int temp3 = p[0].borndate.day;//初始值
            //int min_num3 = 0;//最大值的个数
    
            for (int i = 0; i < n - 1; i++)
            {
                if (p[i].borndate.day > p[i + 1].borndate.day)
                {
                    temp3 = p[i + 1].borndate.day;
                }
            }
            for (int i = 0; i < n; i++)
            {
                if (p[i].borndate.day == temp3)
                {
                    printf("%10s\n", p[i].name);
                }
            }
        }
        else
        {
            for (int i = 0; i < n; i++)
            {
                if (p[i].borndate.month == temp2)
                {
                    printf("%10s\n", p[i].name);
                }
            }
        }
    }
    else
    {
        for (int i = 0; i < n; i++)
            {
                if (p[i].borndate.year == temp1)
                {
                    printf("%10s\n", p[i].name);
                }
            }
    }
}