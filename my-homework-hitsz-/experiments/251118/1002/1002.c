#include <stdio.h>

int calyrd(int n);
int calmthd(int n1, int n2, int array[]);
int is_valid(int n1, int n2, int n3, int array[]);
void judge(int n);

const int YEAR = 1990;
const int MONTH = 1;
const int DAY = 1;

int main(void)
{
    //set the start day

    int mth[12] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    int year, month, day;
    int yr_dbtw, mth_dbtw, dbtw;//days between

    //get input
    scanf("%4d-%2d-%2d", &year, &month, &day);

    //calculate dyas between
    yr_dbtw = calyrd(year);
    mth_dbtw = calmthd(month, year, mth);
    dbtw = day + mth_dbtw + yr_dbtw;

    //judge
    if (is_valid((int) year, (int) month, (int) day, mth) == 1)
    {
        printf("Invalid input");
    }
    else if (is_valid(year, month, day, mth) == 0)
    {
        judge(dbtw);
    }
}

//transfer years to days
int calyrd(int n)
{
    //run nian(not include year)
    int a = (n - YEAR + 1) / 4 - (n - 1901) / 100 + (n - 1601) / 400;
    return 365 * (n - YEAR) + a;
}

int calmthd(int n1, int n2, int array[])
{
    int b = 0;
    //if year is run nian
    if ((n2 % 4 == 0 && n2 % 100 != 0) || n2 % 400 == 0)
    {
        for (int i = 0; i < n1 - 1; i++)
        {
            if (i == 1)
            {
                b += array[i] + 1;
            }
            else
            {
                b+= array[i];
            }
        }
    }
    //if year isn't run nian
    else 
    {
        for (int i = 0; i < n1 - 1; i++)
        {
            b += array[i];
        }
    }
    return b;
}

int is_valid(int n1, int n2, int n3, int array[])
{
    if ((n1 >= 1990 && n2 >= 1 && n2 <= 12 && n3 >= 1 && n3 <= 31) && ((n1 % 4 == 0 && n1 % 100 != 0) || (n1 % 400 == 0)))
    {
        if (n2 == 2 && 0 < n3 && n3 < 30)
        {
            return 0;
        }
        else
        {
            return 1;
        }
    }
    else if ((n1 >= 1990 && n2 >= 1 && n2 <= 12 && n3 >= 1 && n3 <= 31) && (0 < n3 && n3 < array[n2 - 1] + 1))
    {
        return 0;
    }
    else 
    {
        return 1;
    }
}

void judge(int n)
{
    int c = n % 5;
    if (c == 1 || c == 2 || c == 3)
    {
        printf("working");
    }
    else
    {
        printf("rest");
    }
}