#include <stdio.h>

// 函数原型声明(函数的具体实现需要你在文件末尾完成)
void sort_interest(int *interest, int n);

int main() {
    int n;
    scanf("%d", &n);
    int interest[100];
    for (int i = 0; i < n; i++) {
        scanf("%d", &interest[i]);
    }
    sort_interest(interest, n);
    for (int i = 0; i < n; i++) {
        if (i > 0) {
            printf(" ");
        }
        printf("%d", interest[i]);
    }
    printf("\n");
    return 0;
}

// 你需要实现的函数
void sort_interest(int *interest, int n) {
    // 请在此处编写代码
    int aux[100];
    for (int i = 1; i < n; i ++)
    {
        for (int j = i - 1; j >= 0; j --)
        {
            if (*(interest + j) >= *(interest + i))
            {
                for (int k = j + 1, l = 0; k <= i - 1; k ++, l ++)
                {
                    aux[l] = *(interest + k);
                }
                *(interest + j + 1) = *(interest + i);
                for (int k = j + 2, l = 0; k <= i; k ++, l ++)
                {
                    *(interest + k) = aux[l];
                }
                break;
            }
            if (j == 0 && *(interest) < *(interest + i))
            {
                for (int k = 0, l = 0; k <= i - 1; k ++, l ++)
                {
                    aux[l] = *(interest + k);
                }
                *(interest) = *(interest + i);
                for (int k = 1, l = 0; k <= i; k ++, l ++)
                {
                    *(interest + k) = aux[l];
                }
            }
        }
    }
}