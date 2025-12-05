#include <stdio.h>
#include <string.h>

#define MAX1 100//句子最大长度
#define MAX2 20//单词最大字符数

void Trans(char arr1[], char arr2[]);
void Extract(char arr2[], int c[], char (*words)[MAX2], int *numOfSpace);
int numOfWords(char (*words1)[MAX2], char (*words)[MAX2], int y);

int main(void)
{
    char str1[MAX1], str2[MAX1];
    char count[MAX2][MAX2], word[MAX2][MAX2];
    int x = 0, y = 0, y_cpy, c[MAX1];//str2中空格位置
    fgets(str1, MAX1, stdin);
    //printf("%s", str1);
    for (int i = 0; i < MAX1; i ++)
    {
        c[i] = 0;//initialize
    }
    for (int i = 0; i < MAX2; i ++)
    {
        strcpy(count[i], "\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0");
        //printf("%s\n", count[i]);
    }
    
    Trans(str1, str2);
    //printf("%s", str1);
    printf("%s\n", str2);
    //printf("%dhhh", strlen(str2));

    for (int i = 0; i < MAX1; i++)
    {
        while (str2[x] != ' ')
        {
            if (x == strlen(str2) - 1)
            {
                c[i] = x;
                break;
            }
            x++;
        }
        
        if (x == strlen(str2) - 1)
        {
            y = i;
            break;
        }//到最后跳出循环
        y_cpy = y;

        c[i] = x;
        if (str2[x + 1] == ' ')
        {
            x += 2;
        }
        else
        {
            x ++;
        }
    }//locate

    Extract(str2, c, count, &y);

    printf("%d", numOfWords(word, count, y_cpy));
}

void Trans(char arr1[], char arr2[])//转小写，标点转空格
{
    for (int i = 0; i < strlen(arr1); i++)
    {
        if (64 < arr1[i]  && arr1[i] < 91)
        {
            arr2[i] = arr1[i] + 32;
        }
        else if (96 < arr1[i] && arr1[i] < 123)
        {
            arr2[i] = arr1[i];
        }
        else
        {
            arr2[i] = ' ';
        }
        arr2[strlen(arr1) - 2] = '\0';
    }
}

void Extract(char arr2[], int c[], char (*words)[MAX2], int *numOfSpace)
{
    int n = 0, m;
    for (int i = 0; i < MAX2; i ++)
    {
        m = 0, n = c[*numOfSpace];
        for (int j = n; j != 0 && arr2[j] != ' '; j --)
        {
            *(*(words + i) + m) = arr2[j];
            m ++;
        }
        if (*numOfSpace == 0)
        {
            break;
        }
        *numOfSpace = *numOfSpace - 1;
    }
}

int numOfWords(char (*words1)[MAX2], char (*words)[MAX2], int y)
{
    int n = 0;
    for (int i = 0; i < y; i ++)
    {
        if (i == 0)
        {
            strcpy(words1[n], words[i]);
            n ++;
        }
        else
        {
            int repetition = 0;
            for (int j = 0; j < n; j ++)
            {
                if (strcmp(words1[j], words[i]) == 0)
                {
                    repetition ++;
                }
            }
            if (repetition != 0)
            {
                break;
            }
            else
            {
                strcpy(words1[n], words[i]);
                n ++;
            }
        }
    }
    return n;
}