#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Hello World Adventure - 你好世界冒险
A 2D Platformer with Roguelike Elements - 2D平台游戏与Roguelike元素
A Super Mario-style game with programming theme and procedural generation - 超级马里奥风格编程主题游戏
"""

import pygame
import random
import sys
import math
import json
from enum import Enum
from typing import List, Tuple, Optional
from dataclasses import dataclass

# Initialize Pygame
pygame.init()
pygame.mixer.init()

# Game Constants
SCREEN_WIDTH = 1024
SCREEN_HEIGHT = 768
FPS = 60
GRAVITY = 0.8
JUMP_STRENGTH = -15
DOUBLE_JUMP_STRENGTH = -12
MOVE_SPEED = 5
MAX_HEALTH = 3

# Colors (Programming Theme)
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 50, 50)
GREEN = (50, 255, 50)
BLUE = (50, 50, 255)
YELLOW = (255, 255, 50)
PURPLE = (255, 50, 255)
CYAN = (50, 255, 255)
ORANGE = (255, 150, 50)
DARK_GRAY = (40, 40, 40)
LIGHT_GRAY = (180, 180, 180)
CODE_GREEN = (0, 255, 0)
SYNTAX_BLUE = (100, 149, 237)
BUG_RED = (220, 20, 60)

# 中文文本常量
class CN:
    """中文化文本常量"""
    # 游戏标题和菜单
    TITLE = "你好世界"
    SUBTITLE = "冒险"
    WINDOW_TITLE = "你好世界冒险"

    # 主菜单
    MENU_START = "按空格键开始"
    MENU_HELP = "按H键查看帮助"
    MENU_QUIT = "按Q键退出"
    CREDITS = "编程主题Roguelike平台游戏"

    # HUD显示
    HUD_HEALTH = "生命值: {0}/{1}"
    HUD_SCORE = "分数: {0}"
    HUD_LEVEL = "关卡: {0}"
    HUD_DEBUG_MODE = "调试模式: {0}秒"
    HUD_SPEED_BOOST = "代码加速: {0}秒"
    HUD_TRIPLE_JUMP = "三段跳: {0}秒"

    # 控制说明
    CONTROLS = [
        "方向键: 左右移动",
        "空格键: 跳跃",
        "R键: 重新开始",
        "ESC键: 菜单"
    ]

    # 游戏状态
    PAUSED = "暂停"
    CONTINUE = "按空格继续"
    GAME_OVER = "游戏结束"
    LEVEL_COMPLETE = "关卡 {0} 完成!"
    FINAL_SCORE = "最终分数: {0}"
    LEVEL_REACHED = "到达关卡: {0}"
    PLAY_AGAIN = "按空格重新开始"
    BACK_MENU = "按ESC返回菜单"

    # 敌人类型
    SYNTAX_ERROR = "语法错误"
    RUNTIME_BUG = "运行时错误"
    LOGIC_VIRUS = "逻辑病毒"

    # 道具类型
    DEBUG_POTION = "调试药水"
    CODE_BOOST = "代码加速"
    MEMORY_UPGRADE = "内存升级"
    JUMP_EXTENSION = "跳跃扩展"
    HEALTH_PACK = "生命补给"

    # 陷阱类型
    SPIKE_TRAP = "尖刺陷阱"
    FAKE_PLATFORM = "伪装平台"
    MOVING_SAW = "移动锯片"

    # 控制台输出
    START_MESSAGE = "启动你好世界冒险..."
    LOADING_ASSETS = "加载游戏资源..."
    GAME_LOADED = "游戏加载成功!"
    GOOD_LUCK = "祝你好运, 程序员!"

class GameState(Enum):
    MENU = 1
    PLAYING = 2
    PAUSED = 3
    GAME_OVER = 4
    LEVEL_COMPLETE = 5

class ItemType(Enum):
    DEBUG_POTION = 1
    CODE_BOOST = 2
    MEMORY_UPGRADE = 3
    JUMP_EXTENSION = 4
    HEALTH_PACK = 5

class EnemyType(Enum):
    SYNTAX_ERROR = 1
    RUNTIME_BUG = 2
    LOGIC_VIRUS = 3

@dataclass
class Particle:
    x: float
    y: float
    vx: float
    vy: float
    color: Tuple[int, int, int]
    lifetime: int
    size: int

class Player:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.width = 30
        self.height = 40
        self.vx = 0
        self.vy = 0
        self.on_ground = False
        self.health = MAX_HEALTH
        self.max_health = MAX_HEALTH  # Add this line
        self.max_jumps = 2  # Double jump
        self.jumps_remaining = 2
        self.invulnerable_timer = 0
        self.speed_boost = 1.0
        self.speed_boost_timer = 0
        self.extra_jumps = 0
        self.extra_jumps_timer = 0
        self.score = 0
        self.facing_right = True

    def update(self, platforms, traps):
        # Update velocity with gravity
        self.vy += GRAVITY
        if self.vy > 20:  # Terminal velocity
            self.vy = 20

        # Update position
        self.x += self.vx * self.speed_boost
        self.y += self.vy

        # Screen boundaries
        if self.x < 0:
            self.x = 0
        if self.x > SCREEN_WIDTH - self.width:
            self.x = SCREEN_WIDTH - self.width

        # Platform collision
        self.on_ground = False
        player_rect = pygame.Rect(self.x, self.y, self.width, self.height)

        for platform in platforms:
            if player_rect.colliderect(platform.rect):
                if self.vy > 0:  # Falling
                    self.y = platform.rect.top - self.height
                    self.vy = 0
                    self.on_ground = True
                    self.jumps_remaining = self.max_jumps + (1 if self.extra_jumps > 0 else 0)
                elif self.vy < 0:  # Jumping up
                    self.y = platform.rect.bottom
                    self.vy = 0

        # Trap collision
        for trap in traps:
            if trap.active and player_rect.colliderect(trap.rect):
                trap.trigger(self)

        # Update timers
        if self.invulnerable_timer > 0:
            self.invulnerable_timer -= 1
        if self.speed_boost_timer > 0:
            self.speed_boost_timer -= 1
            if self.speed_boost_timer == 0:
                self.speed_boost = 1.0
        if self.extra_jumps_timer > 0:
            self.extra_jumps_timer -= 1
            if self.extra_jumps_timer == 0:
                self.extra_jumps = 0

        # Fall damage
        if self.y > SCREEN_HEIGHT:
            self.take_damage(999)  # Instant death
            return False
        return True

    def move_left(self):
        self.vx = -MOVE_SPEED
        self.facing_right = False

    def move_right(self):
        self.vx = MOVE_SPEED
        self.facing_right = True

    def stop_horizontal(self):
        self.vx = 0

    def jump(self):
        if self.jumps_remaining > 0:
            if self.jumps_remaining == self.max_jumps + (1 if self.extra_jumps > 0 else 0):
                self.vy = JUMP_STRENGTH
            else:
                self.vy = DOUBLE_JUMP_STRENGTH
            self.jumps_remaining -= 1
            return True
        return False

    def take_damage(self, amount):
        if self.invulnerable_timer <= 0:
            self.health -= amount
            self.invulnerable_timer = 120  # 2 seconds of invulnerability

    def heal(self, amount):
        self.health = min(self.health + amount, MAX_HEALTH)

    def apply_power_up(self, item_type):
        if item_type == ItemType.DEBUG_POTION:
            self.invulnerable_timer = 300  # 5 seconds
        elif item_type == ItemType.CODE_BOOST:
            self.speed_boost = 1.5
            self.speed_boost_timer = 600  # 10 seconds
        elif item_type == ItemType.MEMORY_UPGRADE:
            self.max_health += 1
            self.health += 1
        elif item_type == ItemType.JUMP_EXTENSION:
            self.extra_jumps = 1
            self.extra_jumps_timer = 900  # 15 seconds
        elif item_type == ItemType.HEALTH_PACK:
            self.heal(1)

    def draw(self, screen):
        # Flashing effect when invulnerable
        if self.invulnerable_timer > 0 and self.invulnerable_timer % 10 < 5:
            return

        # Player body
        color = CODE_GREEN if self.invulnerable_timer > 0 else WHITE
        pygame.draw.rect(screen, color, (self.x, self.y, self.width, self.height))
        pygame.draw.rect(screen, BLACK, (self.x, self.y, self.width, self.height), 2)

        # Eyes
        eye_y = self.y + 10
        if self.facing_right:
            pygame.draw.circle(screen, BLACK, (self.x + 20, eye_y), 3)
            pygame.draw.circle(screen, BLACK, (self.x + 25, eye_y), 3)
        else:
            pygame.draw.circle(screen, BLACK, (self.x + 5, eye_y), 3)
            pygame.draw.circle(screen, BLACK, (self.x + 10, eye_y), 3)

        # Health bar
        bar_width = 40
        bar_height = 6
        bar_x = self.x - 5
        bar_y = self.y - 15
        pygame.draw.rect(screen, RED, (bar_x, bar_y, bar_width, bar_height))
        pygame.draw.rect(screen, GREEN, (bar_x, bar_y, bar_width * (self.health / self.max_health), bar_height))
        pygame.draw.rect(screen, BLACK, (bar_x, bar_y, bar_width, bar_height), 1)

class Enemy:
    def __init__(self, x, y, enemy_type):
        self.x = x
        self.y = y
        self.type = enemy_type
        self.state = "patrol"
        self.state_timer = 0
        self.direction = random.choice([-1, 1])
        self.target_x = x
        self.target_y = y
        self.attack_cooldown = 0

        if enemy_type == EnemyType.SYNTAX_ERROR:
            self.width = 35
            self.height = 35
            self.speed = 2
            self.health = 1
            self.damage = 1
            self.color = BUG_RED
            self.detection_range = 150
        elif enemy_type == EnemyType.RUNTIME_BUG:
            self.width = 30
            self.height = 30
            self.speed = 3
            self.health = 2
            self.damage = 1
            self.color = ORANGE
            self.detection_range = 200
            self.jump_cooldown = 0
        elif enemy_type == EnemyType.LOGIC_VIRUS:
            self.width = 25
            self.height = 25
            self.speed = 1.5
            self.health = 1
            self.damage = 2
            self.color = PURPLE
            self.detection_range = 300
            self.shoot_cooldown = 0

    def update(self, player, platforms):
        # State machine
        distance_to_player = math.sqrt((self.x - player.x)**2 + (self.y - player.y)**2)

        if distance_to_player < self.detection_range:
            self.state = "chase"
        else:
            self.state = "patrol"

        if self.attack_cooldown > 0:
            self.attack_cooldown -= 1
        if hasattr(self, 'jump_cooldown') and self.jump_cooldown > 0:
            self.jump_cooldown -= 1
        if hasattr(self, 'shoot_cooldown') and self.shoot_cooldown > 0:
            self.shoot_cooldown -= 1

        # Execute state behavior
        if self.state == "patrol":
            self.patrol_behavior(platforms)
        elif self.state == "chase":
            self.chase_behavior(player, platforms)

    def patrol_behavior(self, platforms):
        # Simple back and forth movement
        self.x += self.speed * self.direction
        self.state_timer += 1

        if self.state_timer > 60 or self.x < 50 or self.x > SCREEN_WIDTH - 50:
            self.direction *= -1
            self.state_timer = 0

    def chase_behavior(self, player, platforms):
        dx = player.x - self.x
        dy = player.y - self.y
        distance = math.sqrt(dx**2 + dy**2)

        if self.type == EnemyType.SYNTAX_ERROR:
            # Move towards player
            if distance > 0:
                self.x += (dx / distance) * self.speed
                self.y += (dy / distance) * self.speed * 0.5

        elif self.type == EnemyType.RUNTIME_BUG:
            # Jump towards player
            if distance > 40:
                self.x += (dx / distance) * self.speed
                if self.jump_cooldown == 0 and dy < -50:
                    self.y -= 8  # Jump
                    self.jump_cooldown = 30

        elif self.type == EnemyType.LOGIC_VIRUS:
            # Shoot at player
            if distance > 0:
                self.x += (dx / distance) * self.speed * 0.5

        # Keep enemy on screen
        self.x = max(0, min(self.x, SCREEN_WIDTH - self.width))

    def can_attack(self, player):
        distance = math.sqrt((self.x - player.x)**2 + (self.y - player.y)**2)

        if self.attack_cooldown > 0:
            return False

        if self.type == EnemyType.SYNTAX_ERROR or self.type == EnemyType.RUNTIME_BUG:
            return distance < 40
        elif self.type == EnemyType.LOGIC_VIRUS:
            return distance < 250 and self.shoot_cooldown == 0

        return False

    def attack(self, player):
        if self.type == EnemyType.LOGIC_VIRUS:
            self.shoot_cooldown = 60
            return Projectile(self.x + self.width//2, self.y + self.height//2,
                            player.x + player.width//2, player.y + player.height//2,
                            self.damage)
        else:
            self.attack_cooldown = 60
            player.take_damage(self.damage)
            return None

    def take_damage(self, amount):
        self.health -= amount
        return self.health <= 0

    def draw(self, screen):
        # Enemy body
        pygame.draw.rect(screen, self.color, (self.x, self.y, self.width, self.height))
        pygame.draw.rect(screen, BLACK, (self.x, self.y, self.width, self.height), 2)

        # Enemy type indicators
        if self.type == EnemyType.SYNTAX_ERROR:
            # X marks the spot
            pygame.draw.line(screen, WHITE, (self.x+5, self.y+5), (self.x+self.width-5, self.y+self.height-5), 2)
            pygame.draw.line(screen, WHITE, (self.x+self.width-5, self.y+5), (self.x+5, self.y+self.height-5), 2)
        elif self.type == EnemyType.RUNTIME_BUG:
            # Exclamation mark
            pygame.draw.circle(screen, WHITE, (self.x + self.width//2, self.y + 8), 3)
            pygame.draw.rect(screen, WHITE, (self.x + self.width//2 - 2, self.y + 15, 4, 8))
        elif self.type == EnemyType.LOGIC_VIRUS:
            # Target symbol
            center_x = self.x + self.width//2
            center_y = self.y + self.height//2
            pygame.draw.circle(screen, WHITE, (center_x, center_y), 8, 2)
            pygame.draw.circle(screen, WHITE, (center_x, center_y), 2)

        # 显示敌人类型名称（在敌人上方）
        enemy_name = ""
        if self.type == EnemyType.SYNTAX_ERROR:
            enemy_name = CN.SYNTAX_ERROR
        elif self.type == EnemyType.RUNTIME_BUG:
            enemy_name = CN.RUNTIME_BUG
        elif self.type == EnemyType.LOGIC_VIRUS:
            enemy_name = CN.LOGIC_VIRUS

        # 绘制敌人名称
        if enemy_name:
            name_text = pygame.font.Font(None, 16).render(enemy_name, True, RED)
            name_rect = name_text.get_rect(center=(self.x + self.width//2, self.y - 20))
            screen.blit(name_text, name_rect)

class Projectile:
    def __init__(self, x, y, target_x, target_y, damage):
        self.x = x
        self.y = y
        self.damage = damage
        self.speed = 5

        # Calculate direction to target
        dx = target_x - x
        dy = target_y - y
        distance = math.sqrt(dx**2 + dy**2)

        if distance > 0:
            self.vx = (dx / distance) * self.speed
            self.vy = (dy / distance) * self.speed
        else:
            self.vx = 0
            self.vy = 0

        self.width = 8
        self.height = 8
        self.lifetime = 120

    def update(self):
        self.x += self.vx
        self.y += self.vy
        self.lifetime -= 1

        return (self.lifetime > 0 and
                0 < self.x < SCREEN_WIDTH and
                0 < self.y < SCREEN_HEIGHT)

    def check_collision(self, player):
        projectile_rect = pygame.Rect(self.x, self.y, self.width, self.height)
        player_rect = pygame.Rect(player.x, player.y, player.width, player.height)

        if projectile_rect.colliderect(player_rect):
            player.take_damage(self.damage)
            return True
        return False

    def draw(self, screen):
        pygame.draw.circle(screen, PURPLE, (int(self.x), int(self.y)), 4)
        pygame.draw.circle(screen, WHITE, (int(self.x), int(self.y)), 2)

class Item:
    def __init__(self, x, y, item_type):
        self.x = x
        self.y = y
        self.type = item_type
        self.width = 25
        self.height = 25
        self.collected = False
        self.bob_offset = random.random() * math.pi * 2
        self.glow_offset = random.random() * math.pi * 2

        # Set properties based on type
        if item_type == ItemType.DEBUG_POTION:
            self.color = CYAN
            self.value = 100
        elif item_type == ItemType.CODE_BOOST:
            self.color = YELLOW
            self.value = 150
        elif item_type == ItemType.MEMORY_UPGRADE:
            self.color = GREEN
            self.value = 200
        elif item_type == ItemType.JUMP_EXTENSION:
            self.color = SYNTAX_BLUE
            self.value = 150
        elif item_type == ItemType.HEALTH_PACK:
            self.color = RED
            self.value = 75

    def update(self, player):
        if self.collected:
            return False

        # Check collection
        item_rect = pygame.Rect(self.x, self.y, self.width, self.height)
        player_rect = pygame.Rect(player.x, player.y, player.width, player.height)

        if item_rect.colliderect(player_rect):
            player.apply_power_up(self.type)
            player.score += self.value
            self.collected = True
            return True
        return False

    def draw(self, screen, time):
        if self.collected:
            return

        # Bobbing effect
        bob_y = self.y + math.sin(time * 0.002 + self.bob_offset) * 3

        # Glow effect
        glow_size = 2 + math.sin(time * 0.003 + self.glow_offset) * 1

        # Draw glow
        for i in range(3):
            alpha = 50 - i * 15
            glow_color = (*self.color, alpha)
            glow_rect = pygame.Rect(self.x - glow_size - i*2, bob_y - glow_size - i*2,
                                  self.width + glow_size*2 + i*4, self.height + glow_size*2 + i*4)
            s = pygame.Surface((glow_rect.width, glow_rect.height))
            s.set_alpha(alpha)
            s.fill(self.color)
            screen.blit(s, glow_rect)

        # Draw item
        pygame.draw.rect(screen, self.color, (self.x, bob_y, self.width, self.height))
        pygame.draw.rect(screen, WHITE, (self.x, bob_y, self.width, self.height), 2)

        # Draw icon
        center_x = self.x + self.width // 2
        center_y = int(bob_y) + self.height // 2

        if self.type == ItemType.DEBUG_POTION:
            # Shield icon
            pygame.draw.polygon(screen, WHITE,
                              [(center_x, center_y-8), (center_x-6, center_y),
                               (center_x, center_y+8), (center_x+6, center_y)])
        elif self.type == ItemType.CODE_BOOST:
            # Lightning bolt
            points = [(center_x-4, center_y-8), (center_x+2, center_y-2),
                     (center_x-2, center_y+2), (center_x+4, center_y+8)]
            pygame.draw.lines(screen, WHITE, False, points, 3)
        elif self.type == ItemType.MEMORY_UPGRADE:
            # Plus sign
            pygame.draw.line(screen, WHITE, (center_x-6, center_y), (center_x+6, center_y), 3)
            pygame.draw.line(screen, WHITE, (center_x, center_y-6), (center_x, center_y+6), 3)
        elif self.type == ItemType.JUMP_EXTENSION:
            # Arrow up
            pygame.draw.polygon(screen, WHITE,
                              [(center_x, center_y-8), (center_x-4, center_y),
                               (center_x+4, center_y)])
        elif self.type == ItemType.HEALTH_PACK:
            # Heart shape
            pygame.draw.circle(screen, WHITE, (center_x-4, center_y-2), 4)
            pygame.draw.circle(screen, WHITE, (center_x+4, center_y-2), 4)

        # 显示道具类型名称（在道具上方）
        item_name = ""
        if self.type == ItemType.DEBUG_POTION:
            item_name = CN.DEBUG_POTION
        elif self.type == ItemType.CODE_BOOST:
            item_name = CN.CODE_BOOST
        elif self.type == ItemType.MEMORY_UPGRADE:
            item_name = CN.MEMORY_UPGRADE
        elif self.type == ItemType.JUMP_EXTENSION:
            item_name = CN.JUMP_EXTENSION
        elif self.type == ItemType.HEALTH_PACK:
            item_name = CN.HEALTH_PACK

        # 绘制道具名称
        if item_name:
            name_text = pygame.font.Font(None, 16).render(item_name, True, WHITE)
            name_rect = name_text.get_rect(center=(center_x, center_y - 25))
            screen.blit(name_text, name_rect)

class Platform:
    def __init__(self, x, y, width, height, platform_type="normal"):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.type = platform_type
        self.rect = pygame.Rect(x, y, width, height)
        self.broken = False  # Initialize for all platform types

        if platform_type == "normal":
            self.color = LIGHT_GRAY
        elif platform_type == "moving":
            self.color = ORANGE
            self.move_speed = 2
            self.move_range = 100
            self.start_x = x
            self.direction = 1
        elif platform_type == "breakable":
            self.color = (139, 69, 19)
            self.break_timer = 0

    def update(self):
        if self.type == "moving":
            self.x += self.move_speed * self.direction
            if abs(self.x - self.start_x) > self.move_range:
                self.direction *= -1
            self.rect.x = self.x

        elif self.type == "breakable":
            if self.break_timer > 0:
                self.break_timer -= 1
                if self.break_timer == 0:
                    self.broken = True

    def trigger_break(self):
        if self.type == "breakable" and self.break_timer == 0:
            self.break_timer = 30

    def draw(self, screen):
        if self.broken:
            return

        if self.type == "breakable" and self.break_timer > 0:
            # Flashing effect before breaking
            if self.break_timer % 6 < 3:
                color = self.color
            else:
                color = RED
        else:
            color = self.color

        pygame.draw.rect(screen, color, self.rect)
        pygame.draw.rect(screen, BLACK, self.rect, 2)

        # Draw platform pattern
        if self.type == "normal":
            # Draw code-like pattern
            for i in range(0, self.width, 20):
                pygame.draw.line(screen, DARK_GRAY,
                               (self.x + i, self.y),
                               (self.x + i, self.y + self.height), 1)

class Trap:
    def __init__(self, x, y, trap_type="spike"):
        self.x = x
        self.y = y
        self.type = trap_type
        self.active = True

        if trap_type == "spike":
            self.width = 30
            self.height = 20
            self.damage = 1
            self.rect = pygame.Rect(x, y, self.width, self.height)
        elif trap_type == "fake_platform":
            self.width = 80
            self.height = 15
            self.damage = 999  # Instant death
            self.rect = pygame.Rect(x, y, self.width, self.height)
            self.triggered = False
        elif trap_type == "moving_saw":
            self.width = 40
            self.height = 40
            self.damage = 2
            self.rect = pygame.Rect(x, y, self.width, self.height)
            self.angle = 0
            self.move_speed = 3
            self.move_range = 150
            self.start_x = x
            self.direction = 1

    def update(self):
        if self.type == "moving_saw":
            self.angle += 10
            self.x += self.move_speed * self.direction
            if abs(self.x - self.start_x) > self.move_range:
                self.direction *= -1
            self.rect.x = self.x

        elif self.type == "fake_platform":
            if self.triggered:
                self.active = False

    def trigger(self, player):
        if not self.active:
            return

        if self.type == "moving_saw":
            player.take_damage(self.damage)
        elif self.type == "spike":
            player.take_damage(self.damage)
            # Knockback
            player.vy = JUMP_STRENGTH * 0.8
            player.vx = (1 if player.x < self.x + self.width/2 else -1) * 5
        elif self.type == "fake_platform" and not self.triggered:
            self.triggered = True
            # Small delay before platform disappears
            pygame.time.set_timer(pygame.USEREVENT + 1, 500)

    def draw(self, screen):
        if not self.active:
            return

        if self.type == "spike":
            # Draw triangle spikes
            points = []
            for i in range(3):
                spike_x = self.x + i * 10 + 5
                points.append((spike_x, self.y + self.height))
                points.append((spike_x + 5, self.y))
                points.append((spike_x + 10, self.y + self.height))
            pygame.draw.polygon(screen, RED, points)
            pygame.draw.polygon(screen, BLACK, points, 2)

        elif self.type == "fake_platform":
            # Draw fake platform (looks normal but will break)
            if not self.triggered:
                pygame.draw.rect(screen, LIGHT_GRAY, self.rect)
                pygame.draw.rect(screen, BLACK, self.rect, 2)
                # Subtle hint: slightly different color
                pygame.draw.rect(screen, (200, 200, 200),
                               (self.x + 5, self.y + 3, self.width - 10, 3))

        elif self.type == "moving_saw":
            # Draw spinning saw
            center_x = self.x + self.width // 2
            center_y = self.y + self.height // 2

            # Draw saw blades
            for i in range(8):
                angle = math.radians(self.angle + i * 45)
                x1 = center_x + math.cos(angle) * 15
                y1 = center_y + math.sin(angle) * 15
                x2 = center_x + math.cos(angle + math.radians(22.5)) * 20
                y2 = center_y + math.sin(angle + math.radians(22.5)) * 20
                pygame.draw.line(screen, DARK_GRAY, (x1, y1), (x2, y2), 3)

            # Center circle
            pygame.draw.circle(screen, RED, (center_x, center_y), 8)
            pygame.draw.circle(screen, BLACK, (center_x, center_y), 8, 2)

class LevelGenerator:
    def __init__(self):
        self.current_level = 1
        self.difficulty = 1.0

    def generate_level(self, level_number):
        self.current_level = level_number
        self.difficulty = 1.0 + (level_number - 1) * 0.3

        platforms = []
        enemies = []
        items = []
        traps = []

        # Always create ground platforms
        for i in range(0, SCREEN_WIDTH, 150):
            platforms.append(Platform(i, SCREEN_HEIGHT - 40, 150, 40, "normal"))

        # Generate platforms
        platform_count = 8 + int(level_number * 2)
        for i in range(platform_count):
            x = random.randint(50, SCREEN_WIDTH - 150)
            y = random.randint(200, SCREEN_HEIGHT - 150)
            width = random.randint(60, 120)
            height = 15

            # Random platform type based on difficulty
            rand = random.random()
            if rand < 0.7:
                platform_type = "normal"
            elif rand < 0.85:
                platform_type = "moving"
            else:
                platform_type = "breakable"

            platforms.append(Platform(x, y, width, height, platform_type))

        # Generate enemies
        enemy_count = 3 + int(level_number * 1.5)
        for i in range(enemy_count):
            x = random.randint(100, SCREEN_WIDTH - 100)
            y = random.randint(100, SCREEN_HEIGHT - 200)

            # Random enemy type
            enemy_type = random.choice(list(EnemyType))
            enemies.append(Enemy(x, y, enemy_type))

        # Generate items
        item_count = 4 + int(level_number)
        for i in range(item_count):
            x = random.randint(50, SCREEN_WIDTH - 100)
            y = random.randint(150, SCREEN_HEIGHT - 250)

            # Random item type with weighted probability
            item_weights = [0.3, 0.25, 0.15, 0.2, 0.1]  # Debug, Boost, Memory, Jump, Health
            item_type = random.choices(list(ItemType), weights=item_weights)[0]
            items.append(Item(x, y, item_type))

        # Generate traps
        trap_count = 2 + int(level_number * 0.8)
        for i in range(trap_count):
            x = random.randint(100, SCREEN_WIDTH - 150)
            y = random.randint(200, SCREEN_HEIGHT - 100)

            # Random trap type
            trap_type = random.choice(["spike", "fake_platform", "moving_saw"])
            traps.append(Trap(x, y, trap_type))

        return platforms, enemies, items, traps

class ParticleSystem:
    def __init__(self):
        self.particles = []

    def create_explosion(self, x, y, color, count=20):
        for _ in range(count):
            angle = random.random() * math.pi * 2
            speed = random.uniform(2, 8)
            self.particles.append(Particle(
                x=x, y=y,
                vx=math.cos(angle) * speed,
                vy=math.sin(angle) * speed,
                color=color,
                lifetime=random.randint(20, 40),
                size=random.randint(2, 5)
            ))

    def create_jump_effect(self, x, y):
        for _ in range(10):
            angle = random.random() * math.pi * 2
            speed = random.uniform(1, 3)
            self.particles.append(Particle(
                x=x, y=y,
                vx=math.cos(angle) * speed,
                vy=random.uniform(-2, 0),
                color=CYAN,
                lifetime=random.randint(15, 25),
                size=random.randint(1, 3)
            ))

    def create_damage_effect(self, x, y):
        for _ in range(15):
            angle = random.random() * math.pi * 2
            speed = random.uniform(1, 5)
            self.particles.append(Particle(
                x=x, y=y,
                vx=math.cos(angle) * speed,
                vy=math.sin(angle) * speed,
                color=RED,
                lifetime=random.randint(20, 35),
                size=random.randint(2, 4)
            ))

    def update(self):
        for particle in self.particles[:]:
            particle.x += particle.vx
            particle.y += particle.vy
            particle.vy += 0.3  # Gravity
            particle.lifetime -= 1

            if particle.lifetime <= 0:
                self.particles.remove(particle)

    def draw(self, screen):
        for particle in self.particles:
            alpha = particle.lifetime / 40
            size = int(particle.size * alpha)
            if size > 0:
                pygame.draw.circle(screen, particle.color,
                                 (int(particle.x), int(particle.y)), size)

class UIRenderer:
    def __init__(self, screen):
        self.screen = screen
        self.font_large = pygame.font.Font(None, 72)
        self.font_medium = pygame.font.Font(None, 36)
        self.font_small = pygame.font.Font(None, 24)

        # Create background surface for UI
        self.ui_surface = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        self.ui_surface.set_alpha(180)

    def draw_hud(self, player, level, time):
        # Health display
        health_text = self.font_medium.render(CN.HUD_HEALTH.format(player.health, player.max_health),
                                           True, WHITE)
        self.screen.blit(health_text, (20, 20))

        # Score display
        score_text = self.font_medium.render(CN.HUD_SCORE.format(player.score), True, WHITE)
        self.screen.blit(score_text, (20, 60))

        # Level display
        level_text = self.font_medium.render(CN.HUD_LEVEL.format(level), True, WHITE)
        self.screen.blit(level_text, (20, 100))

        # Power-up indicators
        y_offset = 140
        if player.invulnerable_timer > 0:
            inv_text = self.font_small.render(CN.HUD_DEBUG_MODE.format(player.invulnerable_timer//60),
                                             True, CYAN)
            self.screen.blit(inv_text, (20, y_offset))
            y_offset += 25

        if player.speed_boost_timer > 0:
            boost_text = self.font_small.render(CN.HUD_SPEED_BOOST.format(player.speed_boost_timer//60),
                                               True, YELLOW)
            self.screen.blit(boost_text, (20, y_offset))
            y_offset += 25

        if player.extra_jumps_timer > 0:
            jump_text = self.font_small.render(CN.HUD_TRIPLE_JUMP.format(player.extra_jumps_timer//60),
                                              True, SYNTAX_BLUE)
            self.screen.blit(jump_text, (20, y_offset))

        # Controls help
        controls = CN.CONTROLS

        for i, control in enumerate(controls):
            control_text = self.font_small.render(control, True, LIGHT_GRAY)
            self.screen.blit(control_text, (SCREEN_WIDTH - 180, 20 + i * 25))

    def draw_menu(self):
        self.ui_surface.fill(BLACK)
        self.screen.blit(self.ui_surface, (0, 0))

        # Title
        title_text = self.font_large.render(CN.TITLE, True, CODE_GREEN)
        title_rect = title_text.get_rect(center=(SCREEN_WIDTH//2, 150))
        self.screen.blit(title_text, title_rect)

        subtitle_text = self.font_medium.render(CN.SUBTITLE, True, WHITE)
        subtitle_rect = subtitle_text.get_rect(center=(SCREEN_WIDTH//2, 220))
        self.screen.blit(subtitle_text, subtitle_rect)

        # Menu options
        options = [
            CN.MENU_START,
            CN.MENU_HELP,
            CN.MENU_QUIT
        ]

        for i, option in enumerate(options):
            option_text = self.font_medium.render(option, True, WHITE)
            option_rect = option_text.get_rect(center=(SCREEN_WIDTH//2, 350 + i * 50))
            self.screen.blit(option_text, option_rect)

        # Credits
        credit_text = self.font_small.render(CN.CREDITS,
                                           True, LIGHT_GRAY)
        credit_rect = credit_text.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT - 50))
        self.screen.blit(credit_text, credit_rect)

    def draw_game_over(self, score, level):
        self.ui_surface.fill(BLACK)
        self.screen.blit(self.ui_surface, (0, 0))

        # Game Over text
        game_over_text = self.font_large.render(CN.GAME_OVER, True, RED)
        game_over_rect = game_over_text.get_rect(center=(SCREEN_WIDTH//2, 200))
        self.screen.blit(game_over_text, game_over_rect)

        # Stats
        score_text = self.font_medium.render(CN.FINAL_SCORE.format(score), True, WHITE)
        score_rect = score_text.get_rect(center=(SCREEN_WIDTH//2, 300))
        self.screen.blit(score_text, score_rect)

        level_text = self.font_medium.render(CN.LEVEL_REACHED.format(level), True, WHITE)
        level_rect = level_text.get_rect(center=(SCREEN_WIDTH//2, 350))
        self.screen.blit(level_text, level_rect)

        # Restart option
        restart_text = self.font_medium.render(CN.PLAY_AGAIN, True, WHITE)
        restart_rect = restart_text.get_rect(center=(SCREEN_WIDTH//2, 450))
        self.screen.blit(restart_text, restart_rect)

        menu_text = self.font_medium.render(CN.BACK_MENU, True, WHITE)
        menu_rect = menu_text.get_rect(center=(SCREEN_WIDTH//2, 500))
        self.screen.blit(menu_text, menu_rect)

    def draw_level_complete(self, level, score):
        self.ui_surface.fill(BLACK)
        self.screen.blit(self.ui_surface, (0, 0))

        # Level Complete text
        complete_text = self.font_large.render(CN.LEVEL_COMPLETE.format(level), True, GREEN)
        complete_rect = complete_text.get_rect(center=(SCREEN_WIDTH//2, 250))
        self.screen.blit(complete_text, complete_rect)

        # Continue option
        continue_text = self.font_medium.render(CN.CONTINUE, True, WHITE)
        continue_rect = continue_text.get_rect(center=(SCREEN_WIDTH//2, 400))
        self.screen.blit(continue_text, continue_rect)

class SoundManager:
    def __init__(self):
        self.enabled = True
        self.sounds = {}
        self.load_sounds()

    def load_sounds(self):
        try:
            # Since we can't load actual sound files, we'll generate simple sound effects
            self.create_jump_sound()
            self.create_damage_sound()
            self.create_pickup_sound()
        except:
            self.enabled = False

    def create_jump_sound(self):
        # Create a simple jump sound
        sample_rate = 22050
        duration = 0.1
        frequency = 400

        # Generate square wave
        samples = int(sample_rate * duration)
        waves = []
        for i in range(samples):
            t = i / sample_rate
            value = 127 if math.sin(2 * math.pi * frequency * t) > 0 else -127
            waves.append([value, value])

    def create_damage_sound(self):
        # Create damage sound
        pass

    def create_pickup_sound(self):
        # Create pickup sound
        pass

    def play_sound(self, sound_name):
        if self.enabled and sound_name in self.sounds:
            self.sounds[sound_name].play()

    def play_jump(self):
        self.play_sound("jump")

    def play_damage(self):
        self.play_sound("damage")

    def play_pickup(self):
        self.play_sound("pickup")

class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption(CN.WINDOW_TITLE)
        self.clock = pygame.time.Clock()
        self.running = True
        self.state = GameState.MENU

        self.player = None
        self.platforms = []
        self.enemies = []
        self.items = []
        self.traps = []
        self.projectiles = []

        self.level_generator = LevelGenerator()
        self.ui_renderer = UIRenderer(self.screen)
        self.particle_system = ParticleSystem()
        self.sound_manager = SoundManager()

        self.current_level = 1
        self.game_time = 0

    def start_new_game(self):
        self.current_level = 1
        self.start_level()

    def start_level(self):
        self.player = Player(100, 300)
        self.platforms, self.enemies, self.items, self.traps = \
            self.level_generator.generate_level(self.current_level)
        self.projectiles = []
        self.state = GameState.PLAYING

    def next_level(self):
        self.current_level += 1
        self.start_level()

    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False

            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    if self.state == GameState.PLAYING:
                        self.state = GameState.PAUSED
                    elif self.state in [GameState.PAUSED, GameState.GAME_OVER]:
                        self.state = GameState.MENU

                elif event.key == pygame.K_q and self.state == GameState.MENU:
                    self.running = False

                elif event.key == pygame.K_SPACE:
                    if self.state == GameState.MENU:
                        self.start_new_game()
                    elif self.state == GameState.PLAYING:
                        if self.player and self.player.jump():
                            self.particle_system.create_jump_effect(
                                self.player.x + self.player.width//2,
                                self.player.y + self.player.height
                            )
                            self.sound_manager.play_jump()
                    elif self.state == GameState.PAUSED:
                        self.state = GameState.PLAYING
                    elif self.state == GameState.GAME_OVER:
                        self.start_new_game()
                    elif self.state == GameState.LEVEL_COMPLETE:
                        self.next_level()

                elif event.key == pygame.K_r and self.state == GameState.PLAYING:
                    self.start_new_game()

                elif event.key == pygame.K_h and self.state == GameState.MENU:
                    # Show help (for now, just continue to game)
                    self.start_new_game()

    def update(self):
        if self.state != GameState.PLAYING:
            return

        self.game_time += 1

        # Handle input
        keys = pygame.key.get_pressed()
        if self.player:
            if keys[pygame.K_LEFT]:
                self.player.move_left()
            elif keys[pygame.K_RIGHT]:
                self.player.move_right()
            else:
                self.player.stop_horizontal()

        # Update game objects
        if self.player:
            if not self.player.update(self.platforms, self.traps):
                # Player died
                self.state = GameState.GAME_OVER
                self.particle_system.create_explosion(
                    self.player.x + self.player.width//2,
                    self.player.y + self.player.height//2,
                    RED, 50
                )
                return

        # Update platforms
        for platform in self.platforms:
            platform.update()
            if platform.type == "breakable" and platform.break_timer == 1:
                # Platform just broke
                self.particle_system.create_explosion(
                    platform.x + platform.width//2,
                    platform.y + platform.height//2,
                    platform.color, 15
                )

        # Update enemies
        for enemy in self.enemies[:]:
            enemy.update(self.player, self.platforms)

            if enemy.can_attack(self.player):
                projectile = enemy.attack(self.player)
                if projectile:
                    self.projectiles.append(projectile)
                    self.sound_manager.play_damage()

            if enemy.health <= 0:
                self.enemies.remove(enemy)
                self.player.score += 50
                self.particle_system.create_explosion(
                    enemy.x + enemy.width//2,
                    enemy.y + enemy.height//2,
                    enemy.color, 30
                )

        # Update items
        for item in self.items[:]:
            if item.update(self.player):
                self.items.remove(item)
                self.particle_system.create_explosion(
                    item.x + item.width//2,
                    item.y + item.height//2,
                    item.color, 20
                )
                self.sound_manager.play_pickup()

        # Update traps
        for trap in self.traps:
            trap.update()

        # Update projectiles
        for projectile in self.projectiles[:]:
            if not projectile.update():
                self.projectiles.remove(projectile)
            elif projectile.check_collision(self.player):
                self.projectiles.remove(projectile)
                self.particle_system.create_damage_effect(
                    projectile.x, projectile.y
                )

        # Update particles
        self.particle_system.update()

        # Check level completion
        if len(self.enemies) == 0 and len(self.items) == 0:
            self.state = GameState.LEVEL_COMPLETE

        # Check player death
        if self.player and self.player.health <= 0:
            self.state = GameState.GAME_OVER

    def draw(self):
        # Clear screen
        self.screen.fill(BLACK)

        if self.state == GameState.MENU:
            self.ui_renderer.draw_menu()
        elif self.state == GameState.GAME_OVER:
            self.ui_renderer.draw_game_over(
                self.player.score if self.player else 0,
                self.current_level
            )
        elif self.state == GameState.LEVEL_COMPLETE:
            self.ui_renderer.draw_level_complete(
                self.current_level - 1,
                self.player.score if self.player else 0
            )
        else:
            # Draw game world
            # Draw background pattern (code-like)
            for y in range(0, SCREEN_HEIGHT, 40):
                for x in range(0, SCREEN_WIDTH, 30):
                    if random.random() < 0.1:
                        char = random.choice(["{", "}", "(", ")", ";", "//"])
                        text = self.ui_renderer.font_small.render(char, True, (20, 20, 20))
                        self.screen.blit(text, (x, y))

            # Draw platforms
            for platform in self.platforms:
                platform.draw(self.screen)

            # Draw traps
            for trap in self.traps:
                trap.draw(self.screen)

            # Draw items
            for item in self.items:
                item.draw(self.screen, self.game_time)

            # Draw enemies
            for enemy in self.enemies:
                enemy.draw(self.screen)

            # Draw projectiles
            for projectile in self.projectiles:
                projectile.draw(self.screen)

            # Draw player
            if self.player:
                self.player.draw(self.screen)

            # Draw particles
            self.particle_system.draw(self.screen)

            # Draw HUD
            self.ui_renderer.draw_hud(self.player, self.current_level, self.game_time)

            # Draw pause overlay
            if self.state == GameState.PAUSED:
                self.ui_renderer.ui_surface.fill(BLACK)
                self.screen.blit(self.ui_renderer.ui_surface, (0, 0))

                pause_text = self.ui_renderer.font_large.render(CN.PAUSED, True, WHITE)
                pause_rect = pause_text.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT//2))
                self.screen.blit(pause_text, pause_rect)

                continue_text = self.ui_renderer.font_medium.render(CN.CONTINUE, True, WHITE)
                continue_rect = continue_text.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT//2 + 60))
                self.screen.blit(continue_text, continue_rect)

        # Update display
        pygame.display.flip()

    def run(self):
        while self.running:
            self.handle_events()
            self.update()
            self.draw()
            self.clock.tick(FPS)

        pygame.quit()
        sys.exit()

def main():
    """Main function to run the Hello World Adventure game"""
    print(CN.START_MESSAGE)
    print(CN.LOADING_ASSETS)

    game = Game()
    print(CN.GAME_LOADED)
    print("Controls:")
    for control in CN.CONTROLS:
        print(f"  {control}")
    print(f"  Q - {CN.MENU_QUIT} (from menu)")
    print(f"\n{CN.GOOD_LUCK}")

    game.run()

if __name__ == "__main__":
    main()