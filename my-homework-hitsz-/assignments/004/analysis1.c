#include <stdio.h>

double power(double x, int n) {
    double result = 1.0;
    while (n > 0) {
        // 如果 n 是奇数，乘以当前的 x
        if (n % 2 == 1) {
            result *= x;
        }
        // 将 x 平方，n 减半
        x *= x;
        n /= 2;
    }
    return result;
}

int main() {
    double x = 2.0;
    int n = 10;
    double result = power(x, n);

    printf("%.2f raised to the power %d is %.2f\n", x, n, result);
    return 0;
}

//power函数中，初始化1步，while循环中，每次n变为1/2，共lg(n)步，if时而执行，相当于在lg(n)前变化了系数，所以这个power函数复杂度lg(n)。主函数中，时间复杂度主要部分是power函数，所以程序的时间复杂度是lg(n)