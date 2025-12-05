import pygame
import random
import sys
import math
from enum import Enum

# Initialize Pygame
pygame.init()
pygame.mixer.init()

# Screen Settings
SCREEN_WIDTH = 1024
SCREEN_HEIGHT = 768
FPS = 60

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 50, 50)
GREEN = (50, 255, 50)
BLUE = (50, 50, 255)
YELLOW = (255, 255, 50)
PURPLE = (255, 50, 255)
CYAN = (50, 255, 255)
ORANGE = (255, 150, 50)
GRAY = (128, 128, 128)
DARK_GRAY = (64, 64, 64)
BRIGHT_GREEN = (100, 255, 100)
DARK_RED = (150, 0, 0)

# Game Constants
GRAVITY = 0.8
JUMP_STRENGTH = -18
PLAYER_SPEED = 6
ENEMY_SPEED = 2
PROJECTILE_SPEED = 5
MAX_HEALTH = 3
INVULNERABLE_TIME = 120  # frames

# Particle System
class Particle:
    def __init__(self, x, y, color, velocity, lifetime=30, size=3):
        self.x = x
        self.y = y
        self.color = color
        self.vx, self.vy = velocity
        self.lifetime = lifetime
        self.max_lifetime = lifetime
        self.size = size

    def update(self):
        self.x += self.vx
        self.y += self.vy
        self.vy += 0.3  # gravity effect
        self.lifetime -= 1
        return self.lifetime > 0

    def draw(self, screen, camera_x, camera_y):
        if self.lifetime > 0:
            alpha = self.lifetime / self.max_lifetime
            size = int(self.size * alpha)
            if size > 0:
                pygame.draw.circle(screen, self.color,
                                 (int(self.x - camera_x), int(self.y - camera_y)), size)

# Particle System Manager
class ParticleSystem:
    def __init__(self):
        self.particles = []

    def create_explosion(self, x, y, color, count=20):
        for _ in range(count):
            angle = random.uniform(0, 2 * math.pi)
            speed = random.uniform(2, 8)
            velocity = (math.cos(angle) * speed, math.sin(angle) * speed)
            self.particles.append(Particle(x, y, color, velocity))

    def create_trail(self, x, y, color, count=3):
        for _ in range(count):
            velocity = (random.uniform(-2, 2), random.uniform(-2, 0))
            self.particles.append(Particle(x, y, color, velocity, 20, 2))

    def update(self):
        self.particles = [p for p in self.particles if p.update()]

    def draw(self, screen, camera_x, camera_y):
        for particle in self.particles:
            particle.draw(screen, camera_x, camera_y)

# Player Class
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
        self.invincible = 0
        self.speed_boost = 0
        self.double_jump_available = True
        self.facing_right = True

    def update(self, platforms, enemies, projectiles, events):
        # Handle input
        keys = pygame.key.get_pressed()
        self.vx = 0

        if keys[pygame.K_LEFT]:
            self.vx = -PLAYER_SPEED
            self.facing_right = False
        if keys[pygame.K_RIGHT]:
            self.vx = PLAYER_SPEED
            self.facing_right = True

        # Check for space key press event
        for event in events:
            if event.type == pygame.KEYDOWN and event.key == pygame.K_SPACE:
                if self.on_ground:
                    # First jump from ground
                    self.vy = JUMP_STRENGTH
                    self.on_ground = False
                elif self.double_jump_available:
                    # Double jump in air
                    self.vy = JUMP_STRENGTH * 0.8
                    self.double_jump_available = False

        # Apply gravity
        self.vy += GRAVITY
        self.vy = min(self.vy, 20)  # Terminal velocity

        # Move horizontally
        self.x += self.vx
        self.check_collisions(platforms, True)

        # Move vertically
        self.y += self.vy
        self.on_ground = False
        self.check_collisions(platforms, False)

        # Check enemy collisions
        if self.invincible <= 0:
            for enemy in enemies:
                if self.get_rect().colliderect(enemy.get_rect()):
                    self.take_damage()
                    return False  # Player died

            for projectile in projectiles:
                if self.get_rect().colliderect(projectile.get_rect()):
                    self.take_damage()
                    return False  # Player died

        # Update invincibility and power-ups
        if self.invincible > 0:
            self.invincible -= 1
        if self.speed_boost > 0:
            self.speed_boost -= 1

        return True  # Player alive

    def check_collisions(self, platforms, horizontal):
        player_rect = self.get_rect()

        for platform in platforms:
            if player_rect.colliderect(platform.get_rect()):
                if horizontal:
                    if self.vx > 0:  # Moving right
                        self.x = platform.x - self.width
                    elif self.vx < 0:  # Moving left
                        self.x = platform.x + platform.width
                else:
                    if self.vy > 0:  # Falling and landing
                        self.y = platform.y - self.height
                        self.vy = 0
                        if not self.on_ground:  # Just landed
                            self.on_ground = True
                            self.double_jump_available = True  # Reset double jump
                    elif self.vy < 0:  # Jumping and hitting ceiling
                        self.y = platform.y + platform.height
                        self.vy = 0

    def get_rect(self):
        return pygame.Rect(self.x, self.y, self.width, self.height)

    def take_damage(self):
        self.health -= 1
        self.invincible = INVULNERABLE_TIME

    def heal(self):
        self.health = min(self.health + 1, MAX_HEALTH)

    def draw(self, screen, camera_x, camera_y):
        color = BRIGHT_GREEN if self.invincible % 10 < 5 else GREEN
        pygame.draw.rect(screen, color,
                        (self.x - camera_x, self.y - camera_y, self.width, self.height))
        # Draw eyes
        eye_y = self.y - camera_y + 10
        if self.facing_right:
            pygame.draw.circle(screen, WHITE, (self.x - camera_x + 20, eye_y), 3)
            pygame.draw.circle(screen, BLACK, (self.x - camera_x + 22, eye_y), 2)
        else:
            pygame.draw.circle(screen, WHITE, (self.x - camera_x + 10, eye_y), 3)
            pygame.draw.circle(screen, BLACK, (self.x - camera_x + 8, eye_y), 2)

# Enemy Types
class EnemyType(Enum):
    BUG = 1  # Patrol enemy
    ERROR = 2  # Shooting enemy

# Enemy Class
class Enemy:
    def __init__(self, x, y, enemy_type):
        self.x = x
        self.y = y
        self.width = 35
        self.height = 35
        self.enemy_type = enemy_type
        self.vx = 0
        self.vy = 0
        self.health = 1
        self.shoot_cooldown = 0
        self.patrol_direction = random.choice([-1, 1])
        self.patrol_range = 150
        self.start_x = x
        self.ai_state = "patrol"  # patrol, chase, attack
        self.detection_range = 200

    def update(self, player, platforms):
        # AI behavior based on type
        if self.enemy_type == EnemyType.BUG:
            self.update_bug_ai(player, platforms)
        elif self.enemy_type == EnemyType.ERROR:
            self.update_error_ai(player, platforms)

        # Apply gravity
        self.vy += GRAVITY
        self.vy = min(self.vy, 20)

        # Move
        self.x += self.vx
        self.check_collisions(platforms, True)

        self.y += self.vy
        self.check_collisions(platforms, False)

        # Update shoot cooldown
        if self.shoot_cooldown > 0:
            self.shoot_cooldown -= 1

    def update_bug_ai(self, player, platforms):
        # Calculate distance to player
        dx = player.x - self.x
        dy = player.y - self.y
        distance = math.sqrt(dx**2 + dy**2)

        if distance < self.detection_range:
            # Chase player
            self.ai_state = "chase"
            if dx > 0:
                self.vx = ENEMY_SPEED * 1.5
            else:
                self.vx = -ENEMY_SPEED * 1.5
        else:
            # Patrol
            self.ai_state = "patrol"
            if abs(self.x - self.start_x) > self.patrol_range:
                self.patrol_direction *= -1
            self.vx = ENEMY_SPEED * self.patrol_direction

    def update_error_ai(self, player, platforms):
        # Calculate distance to player
        dx = player.x - self.x
        dy = player.y - self.y
        distance = math.sqrt(dx**2 + dy**2)

        if distance < 300:  # Attack range
            self.ai_state = "attack"
            # Shoot at player
            if self.shoot_cooldown <= 0:
                return self.create_projectile(player)
        else:
            self.ai_state = "patrol"
            # Slow patrol
            if abs(self.x - self.start_x) > 100:
                self.patrol_direction *= -1
            self.vx = ENEMY_SPEED * 0.5 * self.patrol_direction

        return None

    def check_collisions(self, platforms, horizontal):
        enemy_rect = self.get_rect()

        for platform in platforms:
            if enemy_rect.colliderect(platform.get_rect()):
                if horizontal:
                    if self.vx > 0:
                        self.x = platform.x - self.width
                    elif self.vx < 0:
                        self.x = platform.x + platform.width
                else:
                    if self.vy > 0:
                        self.y = platform.y - self.height
                        self.vy = 0
                    elif self.vy < 0:
                        self.y = platform.y + platform.height
                        self.vy = 0

    def create_projectile(self, player):
        # Calculate angle to player
        dx = player.x - self.x
        dy = player.y - self.y
        distance = math.sqrt(dx**2 + dy**2)

        if distance > 0:
            vx = (dx / distance) * PROJECTILE_SPEED
            vy = (dy / distance) * PROJECTILE_SPEED
            self.shoot_cooldown = 60  # 1 second at 60 FPS
            return Projectile(self.x + self.width // 2, self.y + self.height // 2, vx, vy)
        return None

    def get_rect(self):
        return pygame.Rect(self.x, self.y, self.width, self.height)

    def draw(self, screen, camera_x, camera_y):
        # Draw enemy based on type
        if self.enemy_type == EnemyType.BUG:
            color = ORANGE
            # Draw bug-like enemy
            pygame.draw.rect(screen, color,
                           (self.x - camera_x, self.y - camera_y, self.width, self.height))
            pygame.draw.circle(screen, RED,
                             (self.x - camera_x + self.width // 2, self.y - camera_y + self.height // 2), 8)
        else:  # ERROR
            color = DARK_RED
            # Draw error-like enemy
            pygame.draw.rect(screen, color,
                           (self.x - camera_x, self.y - camera_y, self.width, self.height))
            # Draw "X" for error
            center_x = self.x - camera_x + self.width // 2
            center_y = self.y - camera_y + self.height // 2
            pygame.draw.line(screen, WHITE, (center_x - 8, center_y - 8), (center_x + 8, center_y + 8), 3)
            pygame.draw.line(screen, WHITE, (center_x + 8, center_y - 8), (center_x - 8, center_y + 8), 3)

# Projectile Class
class Projectile:
    def __init__(self, x, y, vx, vy):
        self.x = x
        self.y = y
        self.vx = vx
        self.vy = vy
        self.width = 8
        self.height = 8
        self.lifetime = 180  # 3 seconds

    def update(self):
        self.x += self.vx
        self.y += self.vy
        self.lifetime -= 1
        return self.lifetime > 0

    def get_rect(self):
        return pygame.Rect(self.x, self.y, self.width, self.height)

    def draw(self, screen, camera_x, camera_y):
        pygame.draw.circle(screen, YELLOW,
                         (int(self.x - camera_x), int(self.y - camera_y)), 4)

# Item Types
class ItemType(Enum):
    CODE = 1  # Health
    DEBUG = 2  # Invincibility
    SPEED = 3  # Speed boost
    DOUBLE_JUMP = 4  # Double jump ability

# Item Class
class Item:
    def __init__(self, x, y, item_type):
        self.x = x
        self.y = y
        self.width = 25
        self.height = 25
        self.item_type = item_type
        self.bob_offset = random.uniform(0, math.pi * 2)
        self.collected = False

    def update(self):
        # Bob up and down
        self.bob_offset += 0.1

    def get_rect(self):
        return pygame.Rect(self.x, self.y, self.width, self.height)

    def collect(self, player):
        if self.item_type == ItemType.CODE:
            player.heal()
        elif self.item_type == ItemType.DEBUG:
            player.invincible = INVULNERABLE_TIME * 2  # 4 seconds
        elif self.item_type == ItemType.SPEED:
            player.speed_boost = 300  # 5 seconds
        elif self.item_type == ItemType.DOUBLE_JUMP:
            player.double_jump_available = True

        self.collected = True

    def draw(self, screen, camera_x, camera_y):
        if not self.collected:
            # Calculate bob position
            bob_y = math.sin(self.bob_offset) * 3

            # Draw item based on type
            if self.item_type == ItemType.CODE:
                color = GREEN
                pygame.draw.rect(screen, color,
                               (self.x - camera_x, self.y - camera_y + bob_y, self.width, self.height))
                # Draw "C" for code
                font = pygame.font.Font(None, 16)
                text = font.render("C", True, WHITE)
                screen.blit(text, (self.x - camera_x + 8, self.y - camera_y + bob_y + 5))
            elif self.item_type == ItemType.DEBUG:
                color = CYAN
                pygame.draw.circle(screen, color,
                                 (self.x - camera_x + self.width // 2, self.y - camera_y + self.height // 2 + int(bob_y)),
                                 self.width // 2)
            elif self.item_type == ItemType.SPEED:
                color = YELLOW
                # Draw lightning bolt shape
                points = [
                    (self.x - camera_x + 10, self.y - camera_y + bob_y),
                    (self.x - camera_x + 5, self.y - camera_y + 15 + bob_y),
                    (self.x - camera_x + 15, self.y - camera_y + 15 + bob_y),
                    (self.x - camera_x + 10, self.y - camera_y + 25 + bob_y),
                    (self.x - camera_x + 20, self.y - camera_y + 10 + bob_y),
                    (self.x - camera_x + 15, self.y - camera_y + 10 + bob_y),
                    (self.x - camera_x + 20, self.y - camera_y + bob_y)
                ]
                pygame.draw.polygon(screen, color, points)
            elif self.item_type == ItemType.DOUBLE_JUMP:
                color = PURPLE
                pygame.draw.rect(screen, color,
                               (self.x - camera_x, self.y - camera_y + bob_y, self.width, self.height))
                font = pygame.font.Font(None, 12)
                text = font.render("DJ", True, WHITE)
                screen.blit(text, (self.x - camera_x + 4, self.y - camera_y + bob_y + 8))

# Platform Class
class Platform:
    def __init__(self, x, y, width, height, platform_type="normal"):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.platform_type = platform_type
        self.timer = 0
        self.triggered = False
        self.falling = False
        self.fall_speed = 0

    def update(self, player):
        if self.platform_type == "fake":
            # Fake platform falls when stepped on
            player_rect = player.get_rect()
            platform_rect = self.get_rect()

            if player_rect.colliderect(platform_rect) and player.vy > 0:
                self.triggered = True

            if self.triggered:
                self.timer += 1
                if self.timer > 30:  # Fall after 0.5 seconds
                    self.falling = True

        if self.falling:
            self.fall_speed += 0.5
            self.y += self.fall_speed

    def get_rect(self):
        return pygame.Rect(self.x, self.y, self.width, self.height)

    def draw(self, screen, camera_x, camera_y):
        if self.platform_type == "fake":
            if not self.triggered:
                color = GRAY
            else:
                color = DARK_GRAY
        elif self.platform_type == "trap":
            color = DARK_RED
        else:
            color = WHITE

        pygame.draw.rect(screen, color,
                        (self.x - camera_x, self.y - camera_y, self.width, self.height))

# Level Generator
class LevelGenerator:
    def __init__(self, level_number):
        self.level_number = level_number
        self.platforms = []
        self.enemies = []
        self.items = []
        self.level_width = 3000 + (level_number * 500)
        self.generate_level()

    def generate_level(self):
        # Clear existing
        self.platforms.clear()
        self.enemies.clear()
        self.items.clear()

        # Generate ground platforms
        ground_y = SCREEN_HEIGHT - 100
        for x in range(0, self.level_width, 200):
            platform_width = random.randint(150, 250)
            self.platforms.append(Platform(x, ground_y, platform_width, 20))

        # Generate floating platforms
        for i in range(15 + self.level_number * 3):
            x = random.randint(200, self.level_width - 200)
            y = random.randint(200, ground_y - 100)
            width = random.randint(80, 200)

            # Add fake platforms occasionally
            if random.random() < 0.2 + (self.level_number * 0.05):
                platform_type = "fake"
            else:
                platform_type = "normal"

            self.platforms.append(Platform(x, y, width, 20, platform_type))

        # Generate trap platforms
        for i in range(3 + self.level_number):
            x = random.randint(400, self.level_width - 400)
            y = random.randint(300, ground_y - 150)
            self.platforms.append(Platform(x, y, 60, 15, "trap"))

        # Generate enemies
        for i in range(5 + self.level_number * 2):
            x = random.randint(300, self.level_width - 300)
            y = random.randint(100, ground_y - 150)
            enemy_type = random.choice([EnemyType.BUG, EnemyType.ERROR])
            self.enemies.append(Enemy(x, y, enemy_type))

        # Generate items
        for i in range(8 + self.level_number):
            x = random.randint(200, self.level_width - 200)
            y = random.randint(150, ground_y - 200)
            item_type = random.choice(list(ItemType))
            self.items.append(Item(x, y, item_type))

# Game Class
class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Hello World Roguelike Platformer")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.Font(None, 36)
        self.small_font = pygame.font.Font(None, 24)

        self.reset_game()

    def reset_game(self):
        self.current_level = 1
        self.player = Player(100, 400)
        self.camera_x = 0
        self.camera_y = 0
        self.score = 0
        self.game_over = False
        self.particle_system = ParticleSystem()
        self.projectiles = []
        self.load_level()

    def load_level(self):
        self.level = LevelGenerator(self.current_level)

    def handle_events(self):
        events = []
        for event in pygame.event.get():
            events.append(event)
            if event.type == pygame.QUIT:
                return None
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_r and self.game_over:
                    self.reset_game()
                elif event.key == pygame.K_ESCAPE:
                    return None
        return events

    def update(self):
        if self.game_over:
            return

        # Get events for player input
        events = self.handle_events()
        if events is None:  # Quit game
            return

        # Update player with events
        if not self.player.update(self.level.platforms, self.level.enemies, self.projectiles, events):
            # Player died - game over (roguelike permanent death)
            self.game_over = True
            self.particle_system.create_explosion(self.player.x + self.player.width // 2,
                                                self.player.y + self.player.height // 2,
                                                RED, 50)

        # Update enemies and get new projectiles
        new_projectiles = []
        for enemy in self.level.enemies:
            projectile = enemy.update(self.player, self.level.platforms)
            if projectile:
                new_projectiles.append(projectile)
        self.projectiles.extend(new_projectiles)

        # Update projectiles
        self.projectiles = [p for p in self.projectiles if p.update()]

        # Update items and check collection
        for item in self.level.items[:]:
            if not item.collected:
                item.update()
                if self.player.get_rect().colliderect(item.get_rect()):
                    item.collect(self.player)
                    self.score += 100
                    self.particle_system.create_explosion(item.x + item.width // 2,
                                                        item.y + item.height // 2,
                                                        YELLOW, 15)
                    self.level.items.remove(item)

        # Update platforms
        for platform in self.level.platforms:
            platform.update(self.player)

        # Update particle system
        self.particle_system.update()

        # Update camera to follow player
        self.camera_x = self.player.x - SCREEN_WIDTH // 2
        self.camera_y = self.player.y - SCREEN_HEIGHT // 2

        # Check if player reached end of level
        if self.player.x > self.level.level_width - 100:
            self.current_level += 1
            self.score += 1000
            self.load_level()
            self.player.x = 100
            self.player.y = 400

        # Check if player fell off the world
        if self.player.y > SCREEN_HEIGHT + 200:
            self.game_over = True

    def draw_background(self):
        # Create gradient background
        for y in range(SCREEN_HEIGHT):
            color_value = int(20 + (y / SCREEN_HEIGHT) * 30)
            color = (color_value, 0, color_value)
            pygame.draw.line(self.screen, color, (0, y), (SCREEN_WIDTH, y))

        # Draw stars
        random.seed(42)  # Fixed seed for consistent stars
        for _ in range(100):
            x = random.randint(0, SCREEN_WIDTH)
            y = random.randint(0, SCREEN_HEIGHT // 2)
            pygame.draw.circle(self.screen, WHITE, (x, y), 1)
        random.seed()  # Reset seed

    def draw_ui(self):
        # Draw health bar
        health_text = self.font.render("Health:", True, WHITE)
        self.screen.blit(health_text, (10, 10))

        for i in range(self.player.health):
            pygame.draw.rect(self.screen, RED, (120 + i * 35, 15, 30, 25))

        # Draw score
        score_text = self.font.render(f"Score: {self.score}", True, WHITE)
        self.screen.blit(score_text, (10, 50))

        # Draw level
        level_text = self.font.render(f"Hello Level {self.current_level}", True, CYAN)
        self.screen.blit(level_text, (SCREEN_WIDTH - 250, 10))

        # Draw power-up indicators
        if self.player.invincible > 0:
            inv_text = self.small_font.render(f"INVINCIBLE: {self.player.invincible // 60 + 1}s", True, CYAN)
            self.screen.blit(inv_text, (10, 90))

        if self.player.speed_boost > 0:
            speed_text = self.small_font.render(f"SPEED: {self.player.speed_boost // 60 + 1}s", True, YELLOW)
            self.screen.blit(speed_text, (10, 115))

        if self.player.double_jump_available:
            jump_text = self.small_font.render("DOUBLE JUMP READY", True, PURPLE)
            self.screen.blit(jump_text, (10, 140))

    def draw_game_over(self):
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        overlay.set_alpha(128)
        overlay.fill(BLACK)
        self.screen.blit(overlay, (0, 0))

        game_over_text = self.font.render("SYNTAX ERROR - GAME OVER", True, RED)
        text_rect = game_over_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 50))
        self.screen.blit(game_over_text, text_rect)

        score_text = self.font.render(f"Final Score: {self.score}", True, WHITE)
        score_rect = score_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2))
        self.screen.blit(score_text, score_rect)

        restart_text = self.font.render("Press R to Restart (Back to Level 1)", True, WHITE)
        restart_rect = restart_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 50))
        self.screen.blit(restart_text, restart_rect)

        permadeath_text = self.small_font.render("Roguelike Mode: Permadeath Activated - All Progress Lost", True, RED)
        death_rect = permadeath_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 100))
        self.screen.blit(permadeath_text, death_rect)

    def draw(self):
        # Draw background
        self.draw_background()

        # Draw game objects
        for platform in self.level.platforms:
            if -platform.width < platform.x - self.camera_x < SCREEN_WIDTH:
                platform.draw(self.screen, self.camera_x, self.camera_y)

        for item in self.level.items:
            if -item.width < item.x - self.camera_x < SCREEN_WIDTH:
                item.draw(self.screen, self.camera_x, self.camera_y)

        for enemy in self.level.enemies:
            if -enemy.width < enemy.x - self.camera_x < SCREEN_WIDTH:
                enemy.draw(self.screen, self.camera_x, self.camera_y)

        for projectile in self.projectiles:
            if -projectile.width < projectile.x - self.camera_x < SCREEN_WIDTH:
                projectile.draw(self.screen, self.camera_x, self.camera_y)

        # Draw player
        self.player.draw(self.screen, self.camera_x, self.camera_y)

        # Draw particles
        self.particle_system.draw(self.screen, self.camera_x, self.camera_y)

        # Draw UI
        self.draw_ui()

        # Draw game over screen
        if self.game_over:
            self.draw_game_over()

        # Draw instructions on first frame
        if self.current_level == 1 and self.player.x < 200:
            instructions = [
                "Welcome to Hello World Roguelike!",
                "Arrow Keys: Move",
                "Space: Jump (Double jump available)",
                "Collect items for power-ups",
                "Avoid enemies and traps",
                "Death = Permanent (Back to Level 1)"
            ]

            for i, instruction in enumerate(instructions):
                inst_text = self.small_font.render(instruction, True, YELLOW)
                self.screen.blit(inst_text, (SCREEN_WIDTH // 2 - 200, SCREEN_HEIGHT // 2 - 100 + i * 30))

    def run(self):
        running = True
        while running:
            # Get events and check if we should continue
            events = self.handle_events()
            if events is None:
                break

            self.update()
            self.draw()
            pygame.display.flip()
            self.clock.tick(FPS)

        pygame.quit()
        sys.exit()

# Main execution
if __name__ == "__main__":
    print("Starting Hello World Roguelike Platformer...")
    print("Controls:")
    print("- Arrow Keys: Move left/right")
    print("- Space: Jump (double jump available)")
    print("- R: Restart when game over")
    print("- ESC: Quit")
    print("\nGame Features:")
    print("- Roguelike: Permadeath, procedural levels")
    print("- Multiple enemy types with AI")
    print("- Random power-ups and items")
    print("- Deceptive traps and fake platforms")
    print("- Progressive difficulty")
    print("\nStarting game...")

    game = Game()
    game.run()