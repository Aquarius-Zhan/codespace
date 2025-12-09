#include <stdio.h>
#include <string.h>

#define MAX 50
#define TRANS 48

void Plus(char num[], char arr1[], char arr2[], int length1, int length2);

int main(void)
{
    char num[MAX + 2], num1[MAX + 1], num2[MAX + 1];
    int len1, len2;//数字长度
    scanf("%s", num1);
    scanf("%s", num2);

    len1 = strlen(num1);
    len2 = strlen(num2);

    int lenmax, lenmin;//长度较大者，较小者
    if (len1 > len2)
    {
        lenmax = len1;
        lenmin = len2;
    }
    else
    {
        lenmax = len2;
        lenmin = len1;
    }
    
    Plus(num, num1, num2, len1, len2);
    
    if (num[0] == '0')
    {
        for (int i = 1; i <= lenmax; i++)
        {
            printf("%c", num[i]);
        }
    }
    else
    {
        printf("%s", num);
    }
}

void Plus(char num[], char arr1[], char arr2[], int length1, int length2)
{
    int lenmax, lenmin;//长度较大者，较小者
    if (length1 > length2)
    {
        lenmax = length1;
        lenmin = length2;
    }
    else
    {
        lenmax = length2;
        lenmin = length1;
    }

    int tmp = 0;

    num[lenmax + 1] = '\0';

    for (int i = lenmax - 1; i >= lenmax - lenmin; i--)
    {
        if (length1 > length2)
        {
            num[i + 1] = (arr1[i] + arr2[i - (length1 - length2)] - TRANS * 2 + tmp) % 10 + TRANS;
            tmp = (arr1[i] + arr2[i - (length1 - length2)] - TRANS * 2 + tmp) / 10;
        }
        else
        {
            num[i + 1] = (arr2[i] + arr1[i - (length2 - length1)] - TRANS * 2 + tmp) % 10 + TRANS;
            tmp = (arr2[i] + arr1[i - (length2 - length1)] - TRANS * 2 + tmp) / 10;
        }
    }
    for (int i = lenmax - lenmin - 1; i >= 0; i--)
    {
        if (length1 > length2)
        {
            num[i + 1] = (arr1[i] + tmp - TRANS) % 10 + TRANS;
            tmp = (arr1[i] + tmp - TRANS) / 10;
        }
        else
        {
            num[i + 1] = (arr2[i] + tmp - TRANS) % 10 + TRANS;
            tmp = (arr2[i] + tmp - TRANS) / 10;
        }
    }
    num[0] = tmp + TRANS;
}