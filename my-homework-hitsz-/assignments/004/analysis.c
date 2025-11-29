#include <stdio.h>

void matrixMultiply(int n, int A[n][n], int B[n][n], int C[n][n]) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            C[i][j] = 0;
            for (int k = 0; k < n; k++) {
                C[i][j] += A[i][k] * B[k][j];
            }
        }
    }
}

int main() {
    int n = 3;
    int A[3][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    int B[3][3] = {{9, 8, 7}, {6, 5, 4}, {3, 2, 1}};
    int C[3][3];

    matrixMultiply(n, A, B, C);

    printf("Resultant Matrix:\n");
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            printf("%d ", C[i][j]);
        }
        printf("\n");
    }
    return 0;
}

//在函数matrixMultiply中，三个循环分别进行n次，由分布计数原理，共需n*n*n步。主函数中，先进行4步，再调用一次matrixMultiply函数（n^3）步，打印字符串1步，打印循环共n^2步，返回值1步。共n^3+n^2+6步
