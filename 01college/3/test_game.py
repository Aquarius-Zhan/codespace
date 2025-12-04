#!/usr/bin/env python3

import sys
sys.path.append('.')

try:
    # Test imports
    import pygame
    import random
    import math

    # Test our game imports
    from hello_world_adventure import Game, GameState, Player, Enemy, Item, Platform, EnemyType, ItemType

    print("✓ All imports successful")

    # Test game initialization
    game = Game()
    print("✓ Game initialized successfully")

    # Test that all the core components are present
    assert hasattr(game, 'player')
    assert hasattr(game, 'platforms')
    assert hasattr(game, 'enemies')
    assert hasattr(game, 'items')
    assert hasattr(game, 'traps')
    assert hasattr(game, 'level_generator')
    assert hasattr(game, 'ui_renderer')
    assert hasattr(game, 'particle_system')
    assert hasattr(game, 'sound_manager')
    print("✓ All game components present")

    # Test level generation
    platforms, enemies, items, traps = game.level_generator.generate_level(1)
    print(f"✓ Level generation successful: {len(platforms)} platforms, {len(enemies)} enemies, {len(items)} items, {len(traps)} traps")

    # Test player creation
    player = Player(100, 100)
    assert player.health == 3
    assert player.max_health == 3
    assert player.max_jumps == 2
    print("✓ Player creation successful")

    # Test enemy creation
    enemy = Enemy(200, 200, EnemyType.SYNTAX_ERROR)
    assert enemy.health == 1
    assert enemy.damage == 1
    print("✓ Enemy creation successful")

    # Test item creation
    item = Item(300, 200, ItemType.HEALTH_PACK)
    assert item.value == 75
    assert not item.collected
    print("✓ Item creation successful")

    # Test platform creation
    platform = Platform(0, 500, 200, 20, "normal")
    assert not platform.broken
    assert platform.color == (180, 180, 180)
    print("✓ Platform creation successful")

    print("\n🎮 All tests passed! The game should run without errors.")
    print("\nGame Features:")
    print("- 2D Platformer with double jump mechanics")
    print("- 3 enemy types with AI behaviors")
    print("- 5 different power-ups")
    print("- 3 trap types")
    print("- Procedural level generation")
    print("- Particle effects system")
    print("- Complete UI system")
    print("- Programming theme throughout")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()