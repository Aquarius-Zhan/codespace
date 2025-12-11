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
    int k = 0;
    for (int i = 0; i < n - 1; i ++)
    {
        k = i;
        for (int j = i + 1; j < n; j ++)
        {
            if (*(interest + k) < *(interest + j)) k = j;
        }
        int temp = *(interest + i);
        *(interest + i) = *(interest + k);
        *(interest + k) = temp;
    }
}