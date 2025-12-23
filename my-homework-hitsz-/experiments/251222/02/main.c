 #include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

// 歌曲节点结构体
typedef struct Song {
    int id;
    char title[100];
    char artist[50];
    char filepath[300];
    struct Song* prev;
    struct Song* next;
} Song;

// 播放列表管理器
typedef struct PlaylistManager{
    Song* head;
    Song* tail;
    Song* current;
    int song_count;
} PlaylistManager;

// 函数声明
void init_playlist_manager(PlaylistManager* manager);                           // 初始化链表
int load_songs_from_file(PlaylistManager* manager, const char* filename);       // 从文件中读取到链表
void add_song(PlaylistManager* manager, const char* title, const char* artist,  // 人工增加音乐
              const char* filepath);
int delete_song_by_title(PlaylistManager* manager, const char* title);                   // 删除指定名字的音乐
int play_song_by_title(PlaylistManager* manager, const char* title);                     // 根据名字播放音乐
void display_playlist(PlaylistManager* manager);                                // 显示播放列表（正向）
void display_playlist_reverse(PlaylistManager* manager);                        // 显示播放列表（反向）
int export_playlist(PlaylistManager* manager, const char* filename);            // 导出歌单
void next_song(PlaylistManager* manager);                                       // 下一首歌
void previous_song(PlaylistManager* manager);                                   // 上一首歌
int play_song_random(PlaylistManager* manager);                                 // 随机播放音乐（非必做）
void sort_by_title(PlaylistManager* manager);                                   // 按照歌曲名排序（非必做）
void destroy_playlist(PlaylistManager* manager);                                  // 清空播放列表

// linux/Mac 版本
// void play_audio(const char* filename) {
//     char command[256];
//     FILE *mp3File = fopen(filename, "rb");
//     if (!mp3File) {
//         printf("无法打开文件 %s\n", filename);
//         return;
//     }
//     else{
//         printf("Founded File!!");
//     }
//     snprintf(command, sizeof(command), "afplay \"%s\"", filename);
//     int ret = system(command);
//     if (ret != 0) {
//         printf("播放失败或中断，请检查文件格式是否支持。\n");
//     }
// }

// Windows 版本
void play_audio(const char* filename){
    char command[256];
    FILE *mp3File = fopen(filename, "rb");
    if (!mp3File) {
        printf("无法打开文件 %s\n", filename);
        return;
    }
    else{
        printf("Founded File!!");
    }
    snprintf(command, sizeof(command), "start \"\" \"%s\"", filename);
    int ret = system(command);
    if (ret != 0) {
        printf("播放失败或中断，请检查文件格式是否支持。\n");
    }
    
    // 或者使用 Windows Media Player
    // sprintf(command, "wmplayer \"%s\"", filename);
    // system(command);
}


// 初始化播放管理器
void init_playlist_manager(PlaylistManager* manager){
    manager->head = NULL;
    manager->tail = NULL;
    manager->current = NULL;
    manager->song_count = 0;
}

// 0. 从文件读取内容构建双向链表
int load_songs_from_file(PlaylistManager* manager, const char* filename) {
    init_playlist_manager(manager);
    FILE *fp = fopen(filename, "r");
    if (fp == NULL)
    {
        printf("文件打开失败\n");
        return -1;
    }
    char line[500];
    int index = 0;//歌曲的序号

    while (fgets(line, sizeof(line), fp))
    {
        Song *song = (Song*)malloc(sizeof(Song));
        if (song == NULL)
        {
            printf("创建链表失败\n");
            return -1;
        }

        int char_index = 0, field_index = 0, num = 0;
        for (int i = 0; line[i] != '\0'; i ++)
        {
            if (line[i] == '\n')
            {
                index ++;
                song->id = index;
                num = 0;
                if (manager->head == NULL)
                {
                    manager->head = song;
                    manager->tail = song;
                    song->prev = NULL;
                    song->next = NULL;
                    }
                else
                {
                    manager->tail->next = song;
                    song->prev = manager->tail;
                    song->next = NULL;
                    manager->tail = song;
                }//创建双向链表
                break;
            }
            else if (line[i] == ',')
            {
                if (field_index == 0)
                {
                    song->title[char_index] = '\0';
                }
                else
                {
                    song->artist[char_index] = '\0';
                }
                char_index = 0;
                field_index ++;
                num ++;
            }
            else
            {
                if (field_index == 0)
                {
                    song->title[char_index] = line[i];
                }
                else if (field_index == 1)
                {
                    song->artist[char_index] = line[i];
                }
                else
                {
                    song->filepath[char_index] = line[i];
                }
                char_index ++;
            }
        }
        index ++;
        song->filepath[char_index] = '\0';
        if (num == 2)
        {
            song->id = index;
            if (manager->head == NULL)
            {
                manager->head = song;
                manager->tail = song;
                song->prev = NULL;
                song->next = NULL;
            }
            else
            {
                manager->tail->next = song;
                song->prev = manager->tail;
                song->next = NULL;
                manager->tail = song;
            }//创建双向链表
            manager->song_count = index;
            break;
        }
    }
    fclose(fp);
    return 0;
}

// 1. 在链表末尾添加歌曲
void add_song(PlaylistManager* manager, const char* title, const char* artist, const char* filepath) {
    Song *song = (Song*)malloc(sizeof(Song));
    if (song == NULL)
    {
        printf("添加歌曲失败\n");
        return;
    }

    strcpy(song->title, title);
    strcpy(song->artist, artist);
    strcpy(song->filepath, filepath);

    if (manager->head == NULL)
    {
        manager->head = song;
        manager->tail = song;
        song->prev = NULL;
        song->next = NULL;
    }
    else
    {
        manager->tail->next = song;
        song->prev = manager->tail;
        song->next = NULL;
        manager->tail = song;
    }
    manager->song_count ++;
    return;
}

// 2. 按标题删除歌曲
int delete_song_by_title(PlaylistManager* manager, const char* title) {
    if (manager->head == NULL)
    {
        printf("列表中没有歌曲可删除\n");
        return -1;
    }
    
    Song *curr = manager->head;
    while (strcmp(curr->title, title) != 0)
    {
        if (curr == manager->tail)
        {
            printf("列表中没有%s\n", title);
            return -1;
        }
        curr = curr->next;
    }
    if (curr == manager->head)
    {
        manager->current = curr->next;
        manager->head = curr->next;
        if (curr == manager->tail)
        {
            manager->tail = NULL;
        }
        if (manager->head != NULL)
        {
            manager->head->prev = NULL;
        }
    }
    else
    {
        curr->prev->next = curr->next;
        if (curr == manager->tail)
        {
            manager->tail = curr->prev;
            manager->current = manager->head;
        }
        else
        {
            manager->current = curr->next;
        }
    }

    free(curr);
    manager->song_count --;
    return 0;
}

// 3. 播放歌曲
int play_song_by_title(PlaylistManager* manager, const char* title){
    if (manager->head == NULL)
    {
        printf("列表中没有歌曲可播放\n");
        return -1;
    }

    Song *curr = manager->head;
    while (strcmp(curr->title, title) != 0)
    {
        if (curr == manager->tail)
        {
            printf("播放列表中没有%s\n", title);
            return -1;
        }
        curr = curr->next;
    }
    play_audio(curr->filepath);
    manager->current = curr;

    return 0;
}

// 4. 显示播放列表（正向遍历）
void display_playlist(PlaylistManager* manager) {
    printf("按顺序显示播放列表：\n");
    printf("title       artist      filepath\n");
    if (manager->head != NULL)
    {
        Song *song = manager->head;
        while (song != NULL)
        {
            printf("%-20s%-20s%-25s\n", song->title, song->artist, song->filepath);
            song = song->next;
        }
    }
    return;
}

// 5. 显示播放列表（反向遍历）
void display_playlist_reverse(PlaylistManager* manager) {
    printf("按逆序显示播放列表：\n");
    printf("title       artist      filepath\n");
    if (manager->tail != NULL)
    {
        Song *song = manager->tail;
        while (song != NULL)
        {
            printf("%-20s%-20s%-25s\n", song->title, song->artist, song->filepath);
            song = song->prev;
        }
    }
    return;
}

// 6. 将播放列表保存到文件
int export_playlist(PlaylistManager* manager, const char* filename) {
    FILE *fp = fopen(filename, "w");
    if (fp == NULL)
    {
        printf("保存失败\n");
        return -1;
    }

    Song *curr = manager->head;
    while (curr != NULL)
    {
        if (curr == manager->tail)
        {
            fprintf(fp, "%s,%s,%s", curr->title, curr->artist, curr->filepath);
        }
        else 
        {
            fprintf(fp, "%s,%s,%s\n", curr->title, curr->artist, curr->filepath);
        }
        curr = curr->next;
    }
    fclose(fp);
    return 0;
}

// 7. 下一首
void next_song(PlaylistManager* manager) {
    if (manager->head == NULL)
    {
        printf("当前播放列表中没有歌曲\n");
        return;
    }

    if (manager->current == manager->tail)
    {
        manager->current = manager->head;
        play_audio(manager->current->filepath);
    }
    else 
    {
        manager->current = manager->current->next;
        play_audio(manager->current->filepath);
    }
    return;
}

// 8. 上一首
void previous_song(PlaylistManager* manager) {
    if (manager->head == NULL)
    {
        printf("当前播放列表中没有歌曲\n");
        return;
    }
    
    if (manager->current == manager->head)
    {
        manager->current = manager->tail;
        play_audio(manager->current->filepath);
    }
    else 
    {
        manager->current = manager->current->prev;
        play_audio(manager->current->filepath);
    }
    return;
}

// 9. 随机播放歌曲（非必做）
int play_song_random(PlaylistManager* manager) {
    srand((unsigned)time(NULL));
    int min = 1;
    int max = 100;
    int count = rand() % (max - min + 1) + min;

    if (manager->head == NULL)
    {
        printf("当前列表中没有歌曲\n");
        return -1;
    }
    else
    {
        Song *curr = manager->current;
        for (int i = 0; i < count; i ++)
        {
            if (curr->next == NULL)
            {
                curr = manager->head;
                continue;
            }
            curr = curr->next;
        }
        play_audio(curr->filepath);
    }
    return 0;
}

// 10. 按歌曲标题排序（非必做）
void sort_by_title(PlaylistManager* manager) {
    if (manager->head == NULL || manager->head == manager->tail)
    {
        printf("无需排序\n");
        return;
    }

    int swapped;
    Song *ptr = NULL;
    Song *lptr = NULL;

    do
    {
        swapped = 0;
        ptr = manager->head;

        while (ptr->next != lptr)
        {
            if (strcmp(ptr->title, ptr->next->title) > 0)
            {
                // 交换 ptr 和 ptr->next
                Song *temp = ptr->next;

                // 处理 ptr 的前驱节点
                if (ptr == manager->head)
                {
                    manager->head = temp;
                    temp->prev = NULL;
                }
                else
                {
                    ptr->prev->next = temp;
                    temp->prev = ptr->prev;
                }

                // 处理 temp 的后继节点
                ptr->next = temp->next;
                if (temp->next != NULL)
                {
                    temp->next->prev = ptr;
                }

                // 连接 temp 和 ptr
                temp->next = ptr;
                ptr->prev = temp;

                if (temp == manager->tail)
                {
                    manager->tail = ptr;
                }

                swapped = 1;
                // 交换后，ptr 不变，继续比较新的 ptr 和 ptr->next
            }
            else
            {
                ptr = ptr->next;
            }
        }
        lptr = ptr;
    } while (swapped);

    printf("已成功排序\n");
    return;
}

// 11. 清空播放列表
void destroy_playlist(PlaylistManager* manager) {
    Song* current = manager->head;
    while (current != NULL) {
        Song* next = current->next;
        free(current);
        current = next;
    }
    init_playlist_manager(manager);
    printf("播放列表已清空\n");
}


void display_menu() {
    printf("\n");
    printf("链表音乐播放器管理器\n");
    printf("==========================================\n");
    printf("1. 添加歌曲\n");
    printf("2. 删除歌曲 (按标题)\n");
    printf("3. 播放歌曲 (按标题)\n");
    printf("4. 显示播放列表 (正向)\n");
    printf("5. 显示播放列表 (逆向)\n");
    printf("6. 导出歌单\n");
    printf("7. 切换到下一首歌\n");
    printf("8. 切换到上一首歌\n");
    printf("9. 随机播放歌曲(非必做)\n");
    printf("10. 按照歌曲名排序(非必做)\n");
    printf("11. 清空播放列表\n");
    printf("0. 退出程序\n");
    printf("==========================================\n");
    printf("请选择操作 (0-11): ");
}

// 清除输入缓冲区
void clear_input_buffer() {
    int c;
    while ((c = getchar()) != '\n' && c != EOF);
}

// 获取用户输入的字符串
void get_user_input(char* buffer, int size, const char* prompt) {
    printf("%s", prompt);
    fgets(buffer, size, stdin);

    // 去除换行符
    size_t len = strlen(buffer);
    if (len > 0 && buffer[len-1] == '\n') {
        buffer[len-1] = '\0';
    }
}

// 主函数 - 交互式程序
int main() {
    PlaylistManager manager;
    init_playlist_manager(&manager);
    load_songs_from_file(&manager,"song_list.txt");

    printf("=== 双向链表音乐播放器管理器 ===\n");
    printf("已加载 %d 首示例歌曲\n", manager.song_count);
    manager.current = manager.head;
    int choice;
    char input[100];

    do {
        display_menu();

        if (scanf("%d", &choice) != 1) {
            printf("无效输入，请输入数字\n");
            clear_input_buffer();
            continue;
        }
        clear_input_buffer();

        switch (choice) {
            case 1: {                   // 添加歌曲
                char title[100], artist[50], filepath[300];
                float duration;

                get_user_input(title, sizeof(title), "请输入歌曲标题: ");
                get_user_input(artist, sizeof(artist), "请输入作者: ");
                get_user_input(filepath, sizeof(filepath), "请输入歌曲路径: ");
                clear_input_buffer();

                add_song(&manager, title, artist, filepath);
                break;
            }
            case 2: {                   // 删除歌曲 (按标题)
                char title[100];
                get_user_input(title, sizeof(title), "请输入要删除的歌曲标题: ");
                int res = delete_song_by_title(&manager, title);
                break;
            }
            case 3: {                   // 播放歌曲（按歌曲名）
                char title[100];
                get_user_input(title, sizeof(title), "请输入要播放的歌曲标题: ");
                int res = play_song_by_title(&manager, title);
                break;
            }
            case 4: {                   // 显示播放列表（正向）
                display_playlist(&manager);
                break;
            }
            case 5: {                   // 显示播放列表（逆向）
                display_playlist_reverse(&manager);
                break;
            }
            case 6: {                   // 导出播放列表
                char path2export[300];
                get_user_input(path2export, sizeof(path2export), "请输入要导出的目标文件名: ");
                int res = export_playlist(&manager, path2export);
                break;
            }
            case 7: {                   // 播放下一首歌曲
                next_song(&manager);
                break;
            }
            case 8: {                   // 播放上一首歌曲
                previous_song(&manager);
                break;
            }
            case 9: {                   // 随机播放歌曲(非必做)
                int res = play_song_random(&manager);
                break;
            }
            case 10: {                  // 按照歌曲名排序(非必做)
                sort_by_title(&manager);
                break;
            }
            case 11: {                  // 清空播放列表
                destroy_playlist(&manager);
                break;
            }
            case 0: // 退出程序
                printf("感谢使用链表音乐播放器管理器!\n");
                break;
            default:
                printf("? 无效选择，请重新输入\n");
                break;
        }

        // 暂停，让用户看到结果
        if (choice != 0) {
            printf("\n按回车键继续...");
            getchar();
        }

    } while (choice != 0);

    // 清理内存
    destroy_playlist(&manager);

    return 0;
}