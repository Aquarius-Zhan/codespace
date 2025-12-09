#include <stdio.h>
#include <string.h>

#define CHARSMAX 100
#define WORDSMAX 50
#define MAX 10//单词中最多字母数
int main(void)
{
    //读取输入
    char sentence[CHARSMAX];
    gets(sentence);

    //将sentence划分为word存储在words[]中,j表示存有单词的个数
    char words[WORDSMAX][MAX];
    int i = 0, j = 0;

    while (j < WORDSMAX && sentence[i] != '\0')
    {
        while ((sentence[i] == ' ' || sentence[i] == ',' || sentence[i] == '.' || sentence[i] == '!' || sentence[i] == '?') && sentence[i] != '\0') i++;
        if (sentence[i] == '\0') break;

        int n = 0;
        
        while (sentence[i] != ' ' && sentence[i] != '\0' && sentence[i] != '\n' && sentence[i] != ',' && sentence[i] != '.' && sentence[i] != '!' && sentence[i] != '?' && n < MAX-1)
        {
            words[j][n] = sentence[i];
            n++;
            i++;
        }
        words[j][n] = '\0';
        j++;

        if (sentence[i] == '\0' || sentence[i] == '\n') break;
    }
    
    //将words中的字母全小写化，标点符号及其后边所有字符改为'\0'，如果存在
    for (int k = 0; k < j; k++)
    {
        for (int l = 0; l < MAX; l++)
        {
            //小写化
            if (64 < words[k][l] && words[k][l] < 91)
            {
                words[k][l] = words[k][l] + 32;
            }
            //'0'化
            if (!(96 < words[k][l] && words[k][l] < 123) && words[k][l] != '\0')
            {
                words[k][l] = '\0';
            }
        }
    }

    //判断单词个数,diff_count表不同的单词数
    int diff_count = 0;
    char diff_words[WORDSMAX][MAX];

    for (int current = 0; current < j; current++)
    {
        int is_new = 1;  //假设是新单词
        for (int check = 0; check < diff_count; check++)
        {
            if (strcmp(diff_words[check], words[current]) == 0)
            {
                is_new = 0;
                break;
            }
        }
        if (is_new)
        {
            strcpy(diff_words[diff_count], words[current]);
            diff_count++;
        }
    }
    printf("%d", diff_count);
}
