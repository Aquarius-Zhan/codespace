# Hello World Adventure

A complete 2D platformer game with roguelike elements, built in Python using Pygame.

## Game Features

### Core Mechanics
- **Platformer gameplay** similar to Super Mario
- **Double jump mechanics** - jump once in air for extra height
- **Procedurally generated levels** - every playthrough is different
- **Permanent death** - restart from level 1 when you die
- **Progressive difficulty** - enemies and challenges increase with each level

### Enemy Types (AI-Driven)
1. **Syntax Error (Red)** - Basic enemy that patrols and chases
2. **Runtime Bug (Orange)** - Jumps towards the player
3. **Logic Virus (Purple)** - Shoots projectiles from a distance

### Power-Ups
1. **Debug Potion (Cyan)** - 5 seconds of invulnerability
2. **Code Boost (Yellow)** - 10 seconds of increased speed
3. **Memory Upgrade (Green)** - Permanently increases max health
4. **Jump Extension (Blue)** - 15 seconds of triple jump capability
5. **Health Pack (Red)** - Restores 1 health point

### Trap Types
1. **Spikes** - Damage on contact with knockback
2. **Fake Platform** - Looks normal but breaks when stepped on
3. **Moving Saw** - Rotating hazard that moves back and forth

### Visual Features
- **Particle effects** for jumps, damage, pickups, and explosions
- **Cool UI** with health bars, score display, and power-up indicators
- **Programming theme** throughout the game design
- **Smooth animations** and visual feedback

## Controls

| Key | Action |
|-----|--------|
| ← → | Move left/right |
| Space | Jump (double jump available) |
| R | Restart current level |
| ESC | Pause/Menu |
| Q | Quit (from menu only) |

## How to Run

1. Make sure you have Python 3.x installed
2. Install Pygame: `pip install pygame`
3. Run the game: `python hello_world_adventure.py`

## Game Objective

- **Survive** through procedurally generated levels
- **Defeat all enemies** and **collect all items** to complete each level
- **Avoid traps** and manage your health carefully
- **Achieve high scores** by efficiently clearing levels
- **Progress as far as possible** - death means starting over!

## Technical Highlights

- **Object-oriented design** with clean class structure
- **State machine** for enemy AI behaviors
- **Collision detection** system for all game objects
- **Procedural generation** ensuring playable yet challenging levels
- **Particle system** for visual effects
- **Complete game loop** with proper state management
- **Extensible architecture** easy to modify and extend

## Programming Theme

The game features a programming/Hello World theme throughout:
- Enemy names based on programming errors (Syntax Error, Runtime Bug, Logic Virus)
- Power-ups named after programming concepts (Debug, Code Boost, Memory)
- Visual elements include code-like patterns in backgrounds and platforms
- Color scheme inspired by IDE and code editor themes

Enjoy your adventure in the world of Hello World!