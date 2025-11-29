#include <stdio.h>
#include <string.h>

const int MAX = 9;

int main(void)
{
    char c[MAX];
    char *available[7] = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
    printf("Input:");
    for (int i = 0; ; i++)
    {
        scanf("%c", &c[i]);
        if (c[i] == '\n')
        {
            c[i] = '\0';
            break;
        }
    }

    for (int i = 0; i < 7; i++)
    {
        if (strcmp(c, available[i]) == 0)
        {
            printf("%d", i);
            return 0;
        }
    }

    printf("Error!");
    return 0;
}
