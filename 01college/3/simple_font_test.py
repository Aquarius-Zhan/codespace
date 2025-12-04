#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pygame

# 初始化pygame
pygame.init()

# 设置屏幕
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("字体测试")

# 测试默认字体
try:
    font_default = pygame.font.Font(None, 24)

    # 创建测试窗口
    screen.fill((0, 0, 0))

    # 测试英文文本
    text_en = font_default.render("Hello World", True, (255, 255, 255))
    screen.blit(text_en, (50, 50))

    # 测试中文文本
    text_cn = font_default.render("你好世界", True, (255, 255, 255))
    screen.blit(text_cn, (50, 100))

    # 显示文本信息
    info_font = pygame.font.Font(None, 18)
    info_en = f"英文: {text_en.get_width()}x{text_en.get_height()}"
    info_cn = f"中文: {text_cn.get_width()}x{text_cn.get_height()}"

    info_text_en = info_font.render(info_en, True, (255, 255, 255))
    info_text_cn = info_font.render(info_cn, True, (255, 255, 255))

    screen.blit(info_text_en, (50, 150))
    screen.blit(info_text_cn, (50, 180))

    # 测试结论
    conclusion_font = pygame.font.Font(None, 20)
    conclusion = font_default.render("按任意键退出", True, (255, 255, 0))

    screen.blit(conclusion, (SCREEN_WIDTH//2, SCREEN_HEIGHT//2))

    pygame.display.flip()

    print("默认字体测试完成")
    print(f"pygame版本: {pygame.version.ver}")

    # 等待退出
    running = True
    clock = pygame.time.Clock()

    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    running = False

    pygame.quit()

except Exception as e:
    print(f"字体测试出错: {e}")
    import sys
    sys.exit(1)