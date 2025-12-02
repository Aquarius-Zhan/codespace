#include <stdio.h>
#include <string.h>

#define N 100 

void Reverse(char string[], int length, char stack[], int *pTop);
void Push(char c, char stack[], int *pTop);
char Pop(char stack[], int *pTop);

int main(void)
{
    char str[N + 1], stack[N + 1];//less than 101 chars
    int top = 0;

    gets(str);//get input

    Reverse(str, strlen(str), stack, &top);

    for (int i = 0 ;i < strlen(str); i ++)
    {
        printf("%c", str[i]);
    }
    printf("\n");

    return 1;
}

void Reverse(char string[], int length, char stack[], int *pTop)
{
    for (int i = 0; i < length; i ++)
    {
        Push(string[i], stack, pTop);
    }

    for (int i = 0; i < length; i ++)
    {
        string[i] = Pop(stack, pTop);
    }
}

void Push(char c, char stack[], int *pTop)
{
    stack[*pTop] = c;
    *pTop = *pTop + 1;
    printf("%d\n", *pTop);
}

char Pop(char stack[], int *pTop)
{
    *pTop = *pTop - 1;
    printf("%d\n", *pTop);
    return stack[*pTop];
}