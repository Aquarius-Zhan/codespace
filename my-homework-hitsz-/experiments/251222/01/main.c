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
void display_playlist(PlaylistManager* manager);                                // 显示播放列表
int delete_songs_by_title(PlaylistManager* manager, const char* title);         // 删除指定名字的音乐
int play_song_by_title(PlaylistManager* manager, const char* title);            // 根据名字播放音乐
int export_playlist(PlaylistManager* manager, const char* filename);            // 导出播放列表
int play_song_random(PlaylistManager* manager);                                 // 随机播放音乐（非必做）
void destroy_playlist(PlaylistManager* manager);                                // 清空列表

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

// 0. 从文件中读取到链表
int load_songs_from_file(PlaylistManager* manager, const char* filename){
    init_playlist_manager(manager);
    FILE* mp3file = fopen(filename, "r");
    if (!mp3file) 
    {
        printf("无法打开文件 %s\n", filename);
        return 1;
    }
    char line[450];
    
    while (fgets(line, sizeof(line), mp3file))
    {
        Song *curr_song = (Song*) malloc(sizeof(Song));
        char *target = curr_song->title;//初始化为指向曲名的指针
        int char_index = 0, field_index = 0;//(field_index:0 for title, 1 for artist, 2 for filepath)
        int index = 0, num = 0;
        for (int i = 0; line[i] != '\0'; i ++)
        {
            char c = line[i];
            if (c == '\n')
            {
                index ++;
                curr_song->id = index;
                if (index == 1)
                {
                    manager->head = curr_song;
                    manager->tail = curr_song;
                    curr_song->next = NULL;
                }
                else
                {
                    manager->tail->next = curr_song;
                    manager->tail = curr_song;
                    curr_song->next = NULL;
                }
                manager->song_count ++;
                num = 0;
                break;
            }
            else if (c == ',')
            {
                target[char_index] = '\0';
                char_index = 0;
                field_index ++;
                num ++;

                if (field_index == 1) target = curr_song->artist;
                if (field_index == 2) target = curr_song->filepath;
            }
            else
            {
                target[char_index ++] = c;
            }
        }
        if (num == 2)
        {
            index ++;
            curr_song->id = index;
            if (manager->head == NULL)
            {
                manager->head = curr_song;
                manager->tail = curr_song;
                curr_song->next = NULL;
            }
            else
            {
                manager->tail->next = curr_song;
                manager->tail = curr_song;
                curr_song->next = NULL;
            }
            manager->song_count ++;
        }
    }
    fclose(mp3file);
    return 0;
}


// 1. 在链表末尾添加歌曲
void add_song(PlaylistManager* manager, const char* title, const char* artist, 
              const char* filepath) {
        Song *curr_song = (Song*) malloc(sizeof(Song));
        strcpy(curr_song->title, title);
        strcpy(curr_song->artist, artist);
        strcpy(curr_song->filepath, filepath);

        if (manager->tail == NULL)
        {
            manager->head = curr_song;
            manager->tail = curr_song;
            manager->current = curr_song;
            curr_song->id = 1;
            manager->song_count ++;
        }
        else
        {
            curr_song->id = manager->tail->id + 1;
            manager->tail->next = curr_song;
            manager->tail = curr_song;
            manager->song_count ++;
        }
    return;
}

// 2. 显示播放列表
void display_playlist(PlaylistManager* manager) {
    if (manager->head == NULL)
    {
        printf("播放列表暂无音乐\n");
    }
    else
    {
        Song *song = manager->head;
        
        printf("当前列表中有%d首音乐\n", manager->song_count);
        printf("title                 artist                filepath\n");

        while (song != NULL)
        {
            printf("%-20s  %-20s  %-25s\n", song->title, song->artist, song->filepath);
            song = song->next;
        }
    }
    return;
}

// 3. 删除歌曲
int delete_songs_by_title(PlaylistManager* manager, const char* title) {
    Song *pre = NULL, *curr = NULL;
    curr = manager->head;
    if (curr == NULL)
    {
        printf("播放列表为空\n");
        return -1;
    }
    while (strcmp(curr->title, title) != 0)
    {
        if (curr->id == manager->song_count)
        {
            printf("播放列表中没有这首歌\n");
            return -1;
        }
        pre = curr;
        curr = curr->next;
    }
    if (pre == NULL) 
    {// 删除的是头节点
        manager->head = curr->next;
        if (curr == manager->tail) 
        {
        manager->tail = NULL;
        }
    } 
    else 
    {
        pre->next = curr->next;
        if (curr == manager->tail) 
        {
        manager->tail = pre;
        }
    }
    free(curr);
    return 0;
}

// 4. 播放歌曲
int play_song_by_title(PlaylistManager* manager, const char* title){
    Song *pre = NULL, *curr = NULL;
    curr = manager->head;
    if (curr == NULL) return -1;
    while (strcmp(curr->title, title) != 0)
    {
        if (curr->id == manager->song_count)
        {
            printf("播放列表中没有这首歌\n");
            return -1;
        }
        pre = curr;
        curr = curr->next;
    }
    play_audio(curr->filepath);
    return 0;
}

// 5. 将播放列表保存到文件
int export_playlist(PlaylistManager* manager, const char* filename) {
    FILE *fp = fopen(filename, "w");
    Song *curr = manager->head;
    if (fp == NULL)
    {
        printf("保存失败\n");
        return -1;
    }
    if (curr == NULL)
    {
        
    }
    else
    {
        while (curr->next != NULL)
        {
            fprintf(fp, "%s,%s,%s\n", curr->title, curr->artist, curr->filepath);
            curr = curr->next;
        }
        fprintf(fp, "%s,%s,%s", curr->title, curr->artist, curr->filepath);
    }
    return 0;
}

// 6. 随机播放歌曲（非必做）
int play_song_random(PlaylistManager* manager) {
    srand((unsigned)time(NULL));

    int min = 5;
    int max = 50;
    int count = rand() % (max - min + 1) + min;

    if (manager->head == NULL)
    {
        printf("当前列表中没有歌曲\n");
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
    }
    return 0;

    return 0;
}

// 7. 销毁整个链表
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
    printf("1. 人工添加歌曲\n");
    printf("2. 显示播放列表\n");
    printf("3. 删除歌曲 (按标题)\n");
    printf("4. 播放歌曲 (按标题)\n");
    printf("5. 导出歌单\n");
    printf("6. 随机播放歌曲(非必做)\n");
    printf("7. 清空播放列表\n");
    printf("0. 退出程序\n");
    printf("==========================================\n");
    printf("请选择操作 (0-7): ");
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

    printf("=== 链表音乐播放器管理器 ===\n");
    printf("已加载 %d 首示例歌曲\n", manager.song_count);

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
            case 1: {               // 添加歌曲
                char title[100], artist[50], filepath[300];
                float duration;

                get_user_input(title, sizeof(title), "请输入歌曲标题: ");
                get_user_input(artist, sizeof(artist), "请输入作者: ");
                get_user_input(filepath, sizeof(filepath), "请输入歌曲路径: ");
                clear_input_buffer();

                add_song(&manager, title, artist, filepath);
                break;
            }
            case 2:{                // 显示播放列表 (正向)
                display_playlist(&manager);
                break;
            }
            case 3: {               // 删除歌曲 (按标题)
                char title[100];
                get_user_input(title, sizeof(title), "请输入要删除的歌曲标题: ");
                delete_songs_by_title(&manager, title);
                break;
            }
            case 4: {                 // 按歌曲名播放歌曲
                char title[100];
                get_user_input(title, sizeof(title), "请输入要播放的歌曲标题: ");
                int res = play_song_by_title(&manager, title);
                break;
            }
            case 5: {
                char path2export[300];
                get_user_input(path2export, sizeof(path2export), "请输入要导出的目标文件名: ");
                export_playlist(&manager, path2export);
                break;
            }
            case 6: {
                int res = play_song_random(&manager);
                break;
            }
            case 7: {
                destroy_playlist(&manager);
                break;
            }
            case 0: // 退出程序
                printf("感谢使用链表音乐播放器管理器!\n");
                break;

            default:
                printf("无效选择，请重新输入\n");
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
