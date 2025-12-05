#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pygame
import sys

# 初始化pygame
pygame.init()

# 设置屏幕
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("字体测试")

# 测试中文显示
print("测试pygame字体对中文的支持...")
print(f"pygame版本: {pygame.version.ver}")

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

    # 测试说明
    info_text = font_default.render("测试中文显示效果", True, (255, 255, 255))
    screen.blit(info_text, (50, 150))

    pygame.display.flip()

    # 等待退出
    running = True
    clock = pygame.time.Clock()

    print("默认字体测试完成，按任意键继续...")

    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                running = False

    print(f"英文文本: {text_en.get_width() x {text_en.get_height()}")
    print(f"中文文本: {text_cn.get_width()} x {text_cn.get_height()}")

    pygame.quit()

except Exception as e:
    print(f"字体测试出错: {e}")
    sys.exit(1)