//code here
#include <stdio.h>

int main(void)
{
    int result, num;//get initial number & another numbers for operation
    char op;//operater

    scanf("%d", &result);
    do
    {
        scanf("%c", &op);
        if (op == '=')
        {
            break;
        }
        scanf("%d", &num);

        switch(op)
        {
            case '+':
            {
                result += num;
                break;
            }
            case '-': 
            {
                result -= num;
                break;
            }
            case '*': 
            {    
                result *= num;
                break;
            }
            case '/': 
            {
                if (num == 0)
                {
                    printf("error!");
                }
                else
                {
                    result /= num;
                }
                break;
            }
            default:
            {
                printf("错误的运算符:%c", op);
                return 0;
            }
        }
    }
    while (op != '=');

    printf("%d", result);
    return 0;
}