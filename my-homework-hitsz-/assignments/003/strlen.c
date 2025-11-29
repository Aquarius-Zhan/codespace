#include <stdio.h>

const int MAX = 100;

unsigned int MyStrlen(char p[]);
int main(void)
{
    char s[MAX];
    printf("Input a string to assess its length(less than 100):\n");
    for (int i = 0; ; i++)
    {
        scanf("%c", &s[i]);
        if (s[i] == '\n')
        {
            s[i] = '\0';
            break;
        }
    }

    printf("The length of the string is: %u\n", MyStrlen(s));
    return 0;
}

unsigned int MyStrlen(char p[])
{
    unsigned int len;
    len = 0;

    for ( ; p[len] != '\0'; )
    {
        len++;
    }

    return len;
}