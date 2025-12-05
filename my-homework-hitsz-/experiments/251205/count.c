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
    int c[MAX2];//str2中空格位置
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
    //printf("%s\n", str2);
    //printf("%dhhh", strlen(str2));到这都能跑ε=ε=ε=(~￣▽￣)~
    int x = 0, y, y_cpy;
    for (int i = 0; i < MAX2; i++)
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
            printf("%d", y);
            y_cpy = y;
            break;
        }//到最后跳出循环
        
        c[i] = x;
        if (str2[x + 1] == ' ')
        {
            x += 2;
        }
        else
        {
            x ++;
        }
        printf("%d ", c[i]);
    }//locate也ok
    c[y] = strlen(str2);
    //y++;
    //printf("y is %d ", y);
    //printf("c[y] is %d ", c[y]);
    Extract(str2, c, count, &y);//ok

    printf("%d ", numOfWords(word, count, y_cpy));
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
        //printf("n is %d", n);//ok
        for (int j = n - 1; j > -1 && arr2[j] != ' '; j --)
        {
            //printf("j is %d ", n, j);
            *(*(words + i) + m) = arr2[j];
            //printf("%c ", arr2[j]);
            m ++;
        }
        //printf("words[i] is %s ", *(words + i));
        if (*numOfSpace == 0)
        {
            break;
        }
        *numOfSpace = *numOfSpace - 1;
    }
}//ok
                    //word                  //count
int numOfWords(char (*words1)[MAX2], char (*words)[MAX2], int y)
{
    int n = 0;
    for (int i = 0; i < y + 1; i ++)//y + 1是单词数
    {
        if (i == 0)
        {
            strcpy(words1[n], words[i]);
            printf(" word[%d] is %s", n, words1[n]);
            n ++;
            printf("n is %d\n", n);
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
                printf("word[%d] is %s, count[%d] is %s, repetition is %d\n", j, words1[j], i, words[i], repetition);
            }
            
            if (repetition == 0)
            {
                strcpy(words1[n], words[i]);
                printf("word[%d] is %s", n, words1[n]);
                n ++;
                printf(" n is %d\n", n);
            }
        }
    }
    return n;
}