#include <stdio.h>

// 函数原型声明(函数的具体实现需要你在文件末尾完成)
void sort_interest(int interest[], int n);
void MergeSort(int arr[], int start, int end);
void Merge(int arr[], int start, int mid, int end);

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
void sort_interest(int interest[], int n) {
    // 请在此处编写代码
    MergeSort(interest, 0, n - 1);
}

void MergeSort(int arr[], int start, int end)
{
    if (start < end)
    {
        int mid = (start + end) / 2;
        MergeSort(arr, start, mid);
        MergeSort(arr, mid + 1, end);
        Merge(arr, start, mid, end);
    }
}

void Merge(int arr[], int start, int mid, int end)
{
    int aux[100];
    for (int i = start, j = mid + 1, k = 0; k <= end - start; k ++)
    {
        if (i == mid + 1)
        {
            aux[k] = arr[j ++];
            continue;
        }
        if (j == end + 1)
        {
            aux[k] = arr[i ++];
            continue;
        }

        if (arr[i] > arr[j])
        {
            aux[k] = arr[i ++];
        }
        else
        {
            aux[k] = arr[j ++];
        }
    }
    for (int k = 0, i = start; i <= end;i ++, k ++)
    {
        arr[i] = aux[k];
    }
}