#include <stdio.h>
#include <stdlib.h>


//递归删除所有值为x的结点Node
Node *delRecursive(Node *head, int x)
{
    if (head == NULL)
    {
        return NULL;
    }
        
    head->next = delRecursive(head->next, x);

    if (head->data == x)
    {
        Node *tmp = head->next;
        free(head);
        return tmp;   // 返回被删节点的下一节点
    }
    return head;
}
//head = delRecursive(head, x)


//非递归删除所有值为x的结点Node
Node* delAll(Node *head, int x)
{
    Node fNode;         
    fNode.next = head;

    Node *p = &fNode;

    while (p->next != NULL)
    {
        if (p->next->data == x)
        {
            Node *tmp = p->next;
            p->next = tmp->next;
            free(tmp);
        }
        else
        {
            p = p->next;
        }
    }

    return fNode.next;   
}
//hedd = delAll(head, x)
