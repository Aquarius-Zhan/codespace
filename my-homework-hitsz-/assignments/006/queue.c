#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

typedef struct Node {
    int data;
    struct Node* next;
} Node;

typedef struct linkqueue{
    Node* front;
    Node* rear;
} LinkQueue;

// 初始化
void initQueue(LinkQueue* q) 
{
    q->front = NULL;
    q->rear = NULL;
}

//入队
void inqueue(LinkQueue* q, int value) 
{
    Node* newNode = (Node*)malloc(sizeof(Node));
    if (newNode == NULL) 
    {
        printf("内存分配失败\n");
    }
    newNode->data = value;
    newNode->next = NULL;

    if (q->front == NULL) 
    {
        q->front = newNode;
        q->rear = newNode;
    } 
    else 
    {
        q->rear->next = newNode;
        q->rear = newNode;
    }
}

//出队
bool outqueue(LinkQueue* q, int* value) 
{
    if (q->front == NULL) 
    {
        return false;
    }

    Node* temp = q->front;
    *value = temp->data;

    q->front = q->front->next;

    if (q->front == NULL) 
    {
        q->rear = NULL;
    }

    free(temp);
    return true;
}