#include <stdio.h>
#include <stdlib.h>

// 链表节点结构
typedef struct Node {
    int data;
    struct Node* next;
} Node;

// 无头链表队列结构
typedef struct {
    Node* front;  // 队头指针
    Node* rear;   // 队尾指针
} Queue;

// 初始化队列
void initQueue(Queue* q) {
    q->front = NULL;
    q->rear = NULL;
}

// 判断队列是否为空
int isEmpty(Queue* q) {
    return q->front == NULL;
}

// 入队操作 - 在队尾添加元素
void enqueue(Queue* q, int value) {
    Node* newNode = (Node*)malloc(sizeof(Node));
    if (newNode == NULL) {
        printf("内存分配失败！\n");
        return;
    }
    newNode->data = value;
    newNode->next = NULL;

    // 边界条件：队列为空
    if (isEmpty(q)) {
        q->front = newNode;
        q->rear = newNode;
    } else {
        // 非空队列，在队尾添加节点
        q->rear->next = newNode;
        q->rear = newNode;
    }
}

// 出队操作 - 从队头删除元素
int dequeue(Queue* q, int* value) {
    // 边界条件：队列为空
    if (isEmpty(q)) {
        printf("队列为空，无法出队！\n");
        return 0;  // 返回0表示出队失败
    }

    Node* temp = q->front;
    *value = temp->data;

    // 边界条件：队列只有一个节点
    if (q->front == q->rear) {
        q->front = NULL;
        q->rear = NULL;
    } else {
        // 队列有多个节点
        q->front = temp->next;
    }

    free(temp);
    return 1;  // 返回1表示出队成功
}

// 获取队头元素（不删除）
int peek(Queue* q, int* value) {
    if (isEmpty(q)) {
        printf("队列为空！\n");
        return 0;
    }
    *value = q->front->data;
    return 1;
}

// 打印队列
void printQueue(Queue* q) {
    if (isEmpty(q)) {
        printf("队列为空\n");
        return;
    }

    printf("队列内容: ");
    Node* current = q->front;
    while (current != NULL) {
        printf("%d ", current->data);
        current = current->next;
    }
    printf("(front: %d, rear: %d)\n", q->front->data, q->rear->data);
}

// 销毁队列
void destroyQueue(Queue* q) {
    while (!isEmpty(q)) {
        int value;
        dequeue(q, &value);
    }
}

int main() {
    Queue q;
    initQueue(&q);

    printf("=== 无头链表队列测试 ===\n");

    // 测试空队列
    printf("\n1. 测试空队列:\n");
    printQueue(&q);

    // 测试入队
    printf("\n2. 测试入队操作:\n");
    enqueue(&q, 10);
    printf("入队 10: ");
    printQueue(&q);

    enqueue(&q, 20);
    printf("入队 20: ");
    printQueue(&q);

    enqueue(&q, 30);
    printf("入队 30: ");
    printQueue(&q);

    // 测试出队
    printf("\n3. 测试出队操作:\n");
    int value;
    if (dequeue(&q, &value)) {
        printf("出队 %d: ", value);
        printQueue(&q);
    }

    if (dequeue(&q, &value)) {
        printf("出队 %d: ", value);
        printQueue(&q);
    }

    // 测试边界条件：队列只剩一个元素
    printf("\n4. 测试边界条件（只剩一个元素）:\n");
    printf("当前队列: ");
    printQueue(&q);

    if (dequeue(&q, &value)) {
        printf("出队 %d: ", value);
        printQueue(&q);
    }

    // 测试边界条件：空队列出队
    printf("\n5. 测试边界条件（空队列出队）:\n");
    if (!dequeue(&q, &value)) {
        printf("空队列出队失败（预期行为）\n");
    }

    // 重新测试多次入队出队
    printf("\n6. 测试多次入队出队:\n");
    for (int i = 1; i <= 5; i++) {
        enqueue(&q, i * 100);
        printf("入队 %d: ", i * 100);
        printQueue(&q);
    }

    printf("\n清空队列:\n");
    while (!isEmpty(&q)) {
        if (dequeue(&q, &value)) {
            printf("出队 %d: ", value);
            printQueue(&q);
        }
    }

    // 销毁队列
    destroyQueue(&q);
    printf("\n队列已销毁\n");

    return 0;
}