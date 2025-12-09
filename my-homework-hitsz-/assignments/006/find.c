#include <stdio.h>
#include <stdlib.h>

int Find(Node *head, int k)
{
    int num;//节点数
    Node *pt;
    Node *prept = NULL;
    pt = head;
    
    if (pt == NULL || k < 1)
    {
        num = 0;
        return 0;
    }
    else
    {
        num = 1;
        prept = pt->next;
    }
    
    while (prept != NULL)
    {
        num ++;
        pt = prept;
        prept = pt->next;
    }//成功得出节点数

    if (num < k)
    {
        return 0;
    }
    else
    {
        pt = head;
        for (int i = 0; i < num - k; i ++)
        {
            pt = pt->next;
        }
        printf("/*相应占位符*/", pt->data);
        return 1;
    }
}