// Level Generator - Procedural level creation with Cat Mario-style traps
// Generates challenging but fair levels that are always different

class LevelGenerator {
    constructor(levelNumber = 1) {
        this.levelNumber = levelNumber;
        this.width = 2400; // Long levels for exploration
        this.height = 800;
        this.cellSize = 40; // Grid size for generation
        this.gridWidth = Math.floor(this.width / this.cellSize);
        this.gridHeight = Math.floor(this.height / this.cellSize);

        // Level difficulty scaling
        this.difficulty = Math.min(levelNumber * 0.2, 1.5);

        // Theme and visual settings
        this.currentTheme = this.selectTheme();

        // Generated level data
        this.platforms = [];
        this.traps = [];
        this.enemies = [];
        this.collectibles = [];
        this.letters = [];
        this.decorations = [];

        // Player start and goal positions
        this.playerStart = vec2(100, this.height - 200);
        this.goalPosition = vec2(this.width - 200, this.height - 300);

        this.generate();
    }

    selectTheme() {
        const themes = ['cyberpunk', 'glitch', 'binary', 'neon'];
        return themes[Math.floor(this.levelNumber / 3) % themes.length];
    }

    generate() {
        // Clear existing level
        this.clearLevel();

        // Generate level components
        this.generateBasePlatforms();
        this.generateMainPath();
        this.generateTraps();
        this.generateEnemies();
        this.generateCollectibles();
        this.generateLetters();
        this.generateGoal();
        this.generateDecorations();

        // Spawn player at start
        this.spawnPlayer();
    }

    clearLevel() {
        // Destroy all existing game objects (only if they exist)
        try {
            const platforms = get('platform');
            if (platforms && platforms.forEach) {
                platforms.forEach(p => destroy(p));
            }
        } catch (e) {
            // Ignore if scene not yet initialized
        }

        try {
            const traps = get('trap');
            if (traps && traps.forEach) {
                traps.forEach(t => destroy(t));
            }
        } catch (e) {
            // Ignore if scene not yet initialized
        }

        try {
            const enemies = get('enemy');
            if (enemies && enemies.forEach) {
                enemies.forEach(e => destroy(e));
            }
        } catch (e) {
            // Ignore if scene not yet initialized
        }

        try {
            const coins = get('coin');
            if (coins && coins.forEach) {
                coins.forEach(c => destroy(c));
            }
        } catch (e) {
            // Ignore if scene not yet initialized
        }

        try {
            const letters = get('letter');
            if (letters && letters.forEach) {
                letters.forEach(l => destroy(l));
            }
        } catch (e) {
            // Ignore if scene not yet initialized
        }

        try {
            const hazards = get('hazard');
            if (hazards && hazards.forEach) {
                hazards.forEach(h => destroy(h));
            }
        } catch (e) {
            // Ignore if scene not yet initialized
        }

        try {
            const decorations = get('decoration');
            if (decorations && decorations.forEach) {
                decorations.forEach(d => destroy(d));
            }
        } catch (e) {
            // Ignore if scene not yet initialized
        }

        // Clear arrays
        this.platforms = [];
        this.traps = [];
        this.enemies = [];
        this.collectibles = [];
        this.letters = [];
        this.decorations = [];
    }

    generateBasePlatforms() {
        // Ground level
        this.platforms.push({
            x: 0,
            y: this.height - 40,
            width: this.width,
            height: 40,
            type: 'ground'
        });

        // Ceiling in some areas
        if (this.levelNumber > 2) {
            const ceilingSections = Math.floor(this.width / 600);
            for (let i = 0; i < ceilingSections; i++) {
                if (GAME_UTILS.chance(0.6)) {
                    this.platforms.push({
                        x: i * 600 + GAME_UTILS.randRange(50, 150),
                        y: 0,
                        width: GAME_UTILS.randRange(200, 400),
                        height: 20,
                        type: 'ceiling'
                    });
                }
            }
        }

        // Side walls
        this.platforms.push({
            x: -20,
            y: 0,
            width: 20,
            height: this.height,
            type: 'wall'
        });

        this.platforms.push({
            x: this.width,
            y: 0,
            width: 20,
            height: this.height,
            type: 'wall'
        });
    }

    generateMainPath() {
        const sections = Math.floor(this.width / 300);
        let currentX = 200;
        let currentY = this.height - 200;

        for (let section = 0; section < sections; section++) {
            const sectionType = this.selectSectionType(section, sections);
            const pathWidth = GAME_UTILS.randRange(200, 400);

            switch (sectionType) {
                case 'platforming':
                    this.generatePlatformingSection(currentX, currentY, pathWidth);
                    break;
                case 'vertical':
                    currentY = this.generateVerticalSection(currentX, currentY, pathWidth);
                    break;
                case 'maze':
                    this.generateMazeSection(currentX, currentY, pathWidth);
                    break;
                case 'trap_heavy':
                    this.generateTrapHeavySection(currentX, currentY, pathWidth);
                    break;
            }

            currentX += pathWidth + GAME_UTILS.randRange(50, 100);
        }

        // Ensure path to goal
        this.generatePathToGoal();
    }

    selectSectionType(index, total) {
        const isEarly = index < total * 0.3;
        const isLate = index > total * 0.7;

        const types = [];
        if (!isLate) types.push('platforming');
        if (this.levelNumber > 1) types.push('vertical');
        if (this.levelNumber > 2) types.push('maze');
        if (!isEarly) types.push('trap_heavy');

        return GAME_UTILS.randChoice(types);
    }

    generatePlatformingSection(x, y, width) {
        const platformCount = GAME_UTILS.randRange(3, 6);
        const spacing = width / platformCount;

        for (let i = 0; i < platformCount; i++) {
            const platformX = x + i * spacing + GAME_UTILS.randRange(-20, 20);
            const platformY = y + GAME_UTILS.randRange(-150, 150);
            const platformWidth = GAME_UTILS.randRange(80, 150);

            this.platforms.push({
                x: platformX,
                y: platformY,
                width: platformWidth,
                height: 20,
                type: 'normal',
                moving: GAME_UTILS.chance(0.2 * this.difficulty)
            });

            // Add some coins on platforms
            if (GAME_UTILS.chance(0.6)) {
                this.collectibles.push({
                    x: platformX + platformWidth / 2,
                    y: platformY - 30,
                    type: 'coin',
                    count: GAME_UTILS.randRange(1, 3)
                });
            }
        }

        // Connect platforms with gaps
        this.createJumpsBetweenPlatforms();
    }

    generateVerticalSection(x, y, width) {
        const height = GAME_UTILS.randRange(300, 500);
        const platformSpacing = GAME_UTILS.randRange(120, 180);
        const platforms = Math.ceil(height / platformSpacing);

        for (let i = 0; i < platforms; i++) {
            const platformY = y - i * platformSpacing;
            const isOffset = GAME_UTILS.chance(0.3);

            this.platforms.push({
                x: x + (isOffset ? 60 : 0),
                y: platformY,
                width: 100,
                height: 20,
                type: 'normal',
                moving: false
            });

            if (isOffset) {
                this.platforms.push({
                    x: x,
                    y: platformY + 40,
                    width: 80,
                    height: 20,
                    type: 'normal',
                    moving: false
                });
            }
        }

        return y - height;
    }

    generateMazeSection(x, y, width) {
        const cellSize = 80;
        const cols = Math.floor(width / cellSize);
        const rows = GAME_UTILS.randRange(2, 4);

        // Create maze walls
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cellX = x + col * cellSize;
                const cellY = y - row * cellSize;

                // Random wall placement ensuring path exists
                if (GAME_UTILS.chance(0.3)) {
                    this.platforms.push({
                        x: cellX,
                        y: cellY,
                        width: GAME_UTILS.randChoice([cellSize, cellSize / 2]),
                        height: GAME_UTILS.randChoice([20, cellSize / 2]),
                        type: 'wall'
                    });
                }

                // Floating platforms in maze
                if (GAME_UTILS.chance(0.2)) {
                    this.platforms.push({
                        x: cellX + 20,
                        y: cellY + 20,
                        width: cellSize - 40,
                        height: 15,
                        type: 'normal',
                        moving: false
                    });
                }
            }
        }

        // Add hidden trap platforms
        this.addHiddenTrapsInSection(x, y - rows * cellSize, width, rows * cellSize);
    }

    generateTrapHeavySection(x, y, width) {
        // Create platforms specifically designed for traps
        const platforms = GAME_UTILS.randRange(4, 7);
        for (let i = 0; i < platforms; i++) {
            const platformX = x + (i * width / platforms);
            const platformY = y + GAME_UTILS.randRange(-200, 200);
            const isTrap = GAME_UTILS.chance(0.6);

            if (isTrap) {
                // Create fake platform that falls
                this.traps.push({
                    x: platformX,
                    y: platformY,
                    width: GAME_UTILS.randRange(80, 120),
                    height: 20,
                    type: 'fake_platform',
                    fallDelay: GAME_UTILS.randRange(0.1, 0.5),
                    invisibility: GAME_UTILS.chance(0.3)
                });
            } else {
                // Safe platform
                this.platforms.push({
                    x: platformX,
                    y: platformY,
                    width: GAME_UTILS.randRange(80, 120),
                    height: 20,
                    type: 'normal',
                    moving: false
                });
            }

            // Add spikes below some platforms
            if (GAME_UTILS.chance(0.4)) {
                this.traps.push({
                    x: platformX + 20,
                    y: platformY + 25,
                    width: GAME_UTILS.randRange(40, 80),
                    height: 15,
                    type: 'spikes'
                });
            }
        }
    }

    createJumpsBetweenPlatforms() {
        // This would create jump gaps - implemented in platform spawning
        // The difficulty of jumps scales with level
    }

    addHiddenTrapsInSection(x, y, width, height) {
        const trapCount = Math.floor(width / 200) * this.difficulty;

        for (let i = 0; i < trapCount; i++) {
            const trapX = x + GAME_UTILS.randRange(20, width - 20);
            const trapY = y + GAME_UTILS.randRange(20, height - 20);

            this.traps.push({
                x: trapX,
                y: trapY,
                width: GAME_UTILS.randRange(40, 80),
                height: GAME_UTILS.randRange(10, 30),
                type: 'invisible_block'
            });
        }
    }

    generateTraps() {
        // Add invisible blocks in critical jump locations
        this.generateInvisibleBlocks();

        // Add fake blocks that look safe
        this.generateFakeBlocks();

        // Add moving hazards
        this.generateMovingHazards();

        // Add trigger traps
        this.generateTriggerTraps();
    }

    generateInvisibleBlocks() {
        const blockCount = Math.floor(this.difficulty * 5);

        for (let i = 0; i < blockCount; i++) {
            // Find strategic locations for invisible blocks
            const x = GAME_UTILS.randRange(300, this.width - 300);
            const y = GAME_UTILS.randRange(200, this.height - 100);

            this.traps.push({
                x: x,
                y: y,
                width: GAME_UTILS.randRange(20, 40),
                height: GAME_UTILS.randRange(20, 40),
                type: 'invisible_block',
                triggerOnce: true
            });
        }
    }

    generateFakeBlocks() {
        const fakeCount = Math.floor(this.difficulty * 3);

        for (let i = 0; i < fakeCount; i++) {
            const x = GAME_UTILS.randRange(200, this.width - 200);
            const y = GAME_UTILS.randRange(100, this.height - 100);

            this.traps.push({
                x: x,
                y: y,
                width: GAME_UTILS.randRange(60, 100),
                height: 20,
                type: 'fake_block',
                breaksOnTouch: true,
                delayBeforeBreak: GAME_UTILS.randRange(0.1, 0.3)
            });
        }
    }

    generateMovingHazards() {
        const hazardCount = Math.floor(this.difficulty * 4);

        for (let i = 0; i < hazardCount; i++) {
            const path = this.generateMovingPath();
            const hazardType = GAME_UTILS.randChoice(['saw', 'laser', 'spike_ball']);

            this.traps.push({
                ...path,
                type: hazardType,
                speed: GAME_UTILS.randRange(50, 150) * this.difficulty,
                damage: 1,
                predictable: GAME_UTILS.chance(0.7) // Some patterns, some random
            });
        }
    }

    generateMovingPath() {
        const startX = GAME_UTILS.randRange(100, this.width - 100);
        const startY = GAME_UTILS.randRange(100, this.height - 100);
        const pathLength = GAME_UTILS.randRange(100, 400);
        const isHorizontal = GAME_UTILS.chance(0.6);

        if (isHorizontal) {
            return {
                x: startX,
                y: startY,
                width: pathLength,
                height: 30,
                moveType: 'horizontal',
                startX: startX,
                endX: startX + pathLength,
                startY: startY,
                endY: startY
            };
        } else {
            return {
                x: startX,
                y: startY,
                width: 30,
                height: pathLength,
                moveType: 'vertical',
                startX: startX,
                endX: startX,
                startY: startY,
                endY: startY + pathLength
            };
        }
    }

    generateTriggerTraps() {
        const triggerCount = Math.floor(this.difficulty * 2);

        for (let i = 0; i < triggerCount; i++) {
            const trigger = {
                x: GAME_UTILS.randRange(200, this.width - 200),
                y: GAME_UTILS.randRange(100, this.height - 100),
                width: 60,
                height: 10,
                type: 'trigger',
                triggered: false,
                effects: []
            };

            // Add effects to trigger
            const effectCount = GAME_UTILS.randRange(1, 3);
            for (let j = 0; j < effectCount; j++) {
                trigger.effects.push({
                    type: GAME_UTILS.randChoice(['spawn_enemy', 'drop_spikes', 'close_walls']),
                    delay: j * 0.2,
                    parameters: {}
                });
            }

            this.traps.push(trigger);
        }
    }

    generateEnemies() {
        const enemyCount = Math.floor(this.difficulty * 8);
        const enemyTypes = this.getAvailableEnemyTypes();

        for (let i = 0; i < enemyCount; i++) {
            const enemyType = GAME_UTILS.randChoice(enemyTypes);
            const position = this.findValidEnemyPosition();

            this.enemies.push({
                x: position.x,
                y: position.y,
                type: enemyType,
                ai: this.getEnemyAI(enemyType),
                health: this.getEnemyHealth(enemyType)
            });
        }
    }

    getAvailableEnemyTypes() {
        const types = ['walker', 'jumper'];
        if (this.levelNumber > 2) types.push('shooter');
        if (this.levelNumber > 4) types.push('chaser');
        if (this.levelNumber > 6) types.push('flyer');
        return types;
    }

    findValidEnemyPosition() {
        let attempts = 0;
        while (attempts < 50) {
            const x = GAME_UTILS.randRange(200, this.width - 200);
            const y = GAME_UTILS.randRange(100, this.height - 200);

            // Check if position is valid (not inside walls, on platform, etc.)
            if (this.isValidEnemyPosition(x, y)) {
                return { x, y };
            }
            attempts++;
        }
        // Fallback position
        return { x: 300, y: this.height - 100 };
    }

    isValidEnemyPosition(x, y) {
        // Check if position is on a platform
        for (const platform of this.platforms) {
            if (x >= platform.x - 20 && x <= platform.x + platform.width + 20 &&
                y >= platform.y - 50 && y <= platform.y + 20) {
                return true;
            }
        }
        return false;
    }

    getEnemyAI(type) {
        const aiPatterns = {
            walker: {
                patrol: true,
                speed: GAME_UTILS.randRange(30, 60),
                turnAtEdges: true,
                chasePlayer: GAME_UTILS.chance(0.3)
            },
            jumper: {
                jumpHeight: GAME_UTILS.randRange(100, 200),
                jumpInterval: GAME_UTILS.randRange(1, 3),
                moveSpeed: GAME_UTILS.randRange(20, 40),
                chasePlayer: true
            },
            shooter: {
                fireRate: GAME_UTILS.randRange(2, 4),
                projectileSpeed: GAME_UTILS.randRange(150, 250),
                range: GAME_UTILS.randRange(200, 400),
                patrol: false,
                aimAtPlayer: true
            },
            chaser: {
                speed: GAME_UTILS.randRange(80, 120),
                detectionRange: GAME_UTILS.randRange(150, 300),
                jumpChase: this.levelNumber > 5
            },
            flyer: {
                flyHeight: GAME_UTILS.randRange(100, 300),
                speed: GAME_UTILS.randRange(40, 80),
                pattern: GAME_UTILS.randChoice(['sine', 'circle', 'dive']),
                aggressive: GAME_UTILS.chance(0.6)
            }
        };

        return aiPatterns[type] || aiPatterns.walker;
    }

    getEnemyHealth(type) {
        const healthMap = {
            walker: 1,
            jumper: 1,
            shooter: 2,
            chaser: 3,
            flyer: 1
        };
        return healthMap[type] || 1;
    }

    generateCollectibles() {
        const coinCount = GAME_UTILS.randRange(15, 30) * this.difficulty;

        for (let i = 0; i < coinCount; i++) {
            const position = this.findValidCollectiblePosition();

            this.collectibles.push({
                x: position.x,
                y: position.y,
                type: 'coin',
                value: GAME_UTILS.randChoice([10, 25, 50]),
                floating: GAME_UTILS.chance(0.3),
                special: GAME_UTILS.chance(0.1) // Bonus coins
            });
        }

        // Power-ups
        this.generatePowerUps();
    }

    findValidCollectiblePosition() {
        let attempts = 0;
        while (attempts < 30) {
            const x = GAME_UTILS.randRange(50, this.width - 50);
            const y = GAME_UTILS.randRange(50, this.height - 100);

            // Check if position is in open air or on platform
            if (this.isValidCollectiblePosition(x, y)) {
                return { x, y };
            }
            attempts++;
        }
        return { x: 100, y: 100 };
    }

    isValidCollectiblePosition(x, y) {
        // Simple check - avoid walls
        return x > 20 && x < this.width - 20 && y > 20 && y < this.height - 60;
    }

    generatePowerUps() {
        const powerUpCount = Math.floor(this.difficulty * 2);
        const powerUpTypes = this.getAvailablePowerUps();

        for (let i = 0; i < powerUpCount; i++) {
            const position = this.findValidCollectiblePosition();
            const powerType = GAME_UTILS.randChoice(powerUpTypes);

            this.collectibles.push({
                x: position.x,
                y: position.y,
                type: 'powerup',
                powerType: powerType,
                duration: this.getPowerUpDuration(powerType)
            });
        }
    }

    getAvailablePowerUps() {
        const types = ['extra_jump', 'speed_boost'];
        if (this.levelNumber > 3) types.push('invincibility');
        if (this.levelNumber > 5) types.push('magnet_coins');
        return types;
    }

    getPowerUpDuration(type) {
        const durations = {
            extra_jump: 10,
            speed_boost: 8,
            invincibility: 5,
            magnet_coins: 15
        };
        return durations[type] || 10;
    }

    generateLetters() {
        const letters = ['H', 'e', 'l', 'l', 'o'];
        const positions = this.generateLetterPositions();

        letters.forEach((letter, index) => {
            if (index < positions.length) {
                this.letters.push({
                    x: positions[index].x,
                    y: positions[index].y,
                    letter: letter,
                    collected: false,
                    glowIntensity: 1,
                    floatOffset: index * 0.5
                });
            }
        });
    }

    generateLetterPositions() {
        const positions = [];
        const spacing = (this.width - 400) / 6; // Spread letters across level

        for (let i = 0; i < 5; i++) {
            const baseX = 200 + (i + 1) * spacing;
            const baseY = this.height - 200 - (i * 30); // Slight elevation increase

            // Add some randomness
            positions.push({
                x: baseX + GAME_UTILS.randRange(-50, 50),
                y: baseY + GAME_UTILS.randRange(-100, 100)
            });
        }

        // Shuffle positions for unpredictability
        return positions.sort(() => Math.random() - 0.5);
    }

    generateGoal() {
        // Create goal platform
        this.platforms.push({
            x: this.goalPosition.x - 100,
            y: this.goalPosition.y,
            width: 200,
            height: 30,
            type: 'goal_platform'
        });

        // Goal flag (will be created in scene)
        this.goal = {
            x: this.goalPosition.x,
            y: this.goalPosition.y - 60,
            type: 'flag',
            width: 20,
            height: 80
        };
    }

    generatePathToGoal() {
        // Ensure there's always a path to the goal
        const lastPlatformX = this.goalPosition.x - 200;
        const lastPlatformY = this.goalPosition.y;

        // Create a series of platforms leading to goal
        const pathPlatforms = GAME_UTILS.randRange(3, 5);
        for (let i = 0; i < pathPlatforms; i++) {
            const platformX = lastPlatformX - (pathPlatforms - i) * 120;
            const platformY = lastPlatformY - GAME_UTILS.randRange(50, 150);

            this.platforms.push({
                x: platformX,
                y: platformY,
                width: GAME_UTILS.randRange(100, 150),
                height: 20,
                type: 'normal',
                moving: false
            });
        }
    }

    generateDecorations() {
        const decorationCount = GAME_UTILS.randRange(20, 40);

        for (let i = 0; i < decorationCount; i++) {
            const x = GAME_UTILS.randRange(0, this.width);
            const y = GAME_UTILS.randRange(0, this.height);
            const type = GAME_UTILS.randChoice(['glitch_particle', 'binary_code', 'neon_wire']);

            this.decorations.push({
                x: x,
                y: y,
                type: type,
                size: GAME_UTILS.randRange(5, 20),
                animationSpeed: GAME_UTILS.randRange(0.5, 2),
                color: GAME_UTILS.randChoice([
                    GAME_UTILS.COLORS.neon.cyan,
                    GAME_UTILS.COLORS.neon.magenta,
                    GAME_UTILS.COLORS.neon.yellow
                ])
            });
        }

        // Background elements
        this.generateBackgroundElements();
    }

    generateBackgroundElements() {
        const bgCount = GAME_UTILS.randRange(10, 20);

        for (let i = 0; i < bgCount; i++) {
            const x = GAME_UTILS.randRange(0, this.width);
            const y = GAME_UTILS.randRange(0, this.height / 2);

            this.decorations.push({
                x: x,
                y: y,
                type: 'background',
                subtype: GAME_UTILS.randChoice(['building', 'tower', 'antenna']),
                size: GAME_UTILS.randRange(50, 150),
                opacity: GAME_UTILS.randRange(0.1, 0.3)
            });
        }
    }

    spawnPlayer() {
        // Player spawning is handled in the main scene
        // This just sets the start position
        gameState.playerStart = this.playerStart;
    }

    // Helper methods for scene creation
    createPlatforms(scene) {
        this.platforms.forEach(platform => {
            const platformEntity = scene.add([
                pos(platform.x, platform.y),
                rect(platform.width, platform.height),
                color(this.getPlatformColor(platform)),
                area(),
                body({ isStatic: true }),
                'platform'
            ]);

            if (platform.moving) {
                platformEntity.move = true;
                platformEntity.moveSpeed = GAME_UTILS.randRange(50, 100);
                platformEntity.moveRange = GAME_UTILS.randRange(50, 150);
                platformEntity.originalPos = vec2(platform.x, platform.y);
                platformEntity.moveDirection = GAME_UTILS.randChoice([-1, 1]);
            }
        });
    }

    getPlatformColor(platform) {
        const colors = {
            ground: GAME_UTILS.COLORS.dark.platform,
            normal: GAME_UTILS.COLORS.neon.cyan,
            ceiling: GAME_UTILS.COLORS.neon.blue,
            wall: GAME_UTILS.COLORS.neon.magenta,
            goal_platform: GAME_UTILS.COLORS.neon.yellow
        };
        return colors[platform.type] || GAME_UTILS.COLORS.neon.cyan;
    }

    // Export level data for scene use
    getLevelData() {
        return {
            platforms: this.platforms,
            traps: this.traps,
            enemies: this.enemies,
            collectibles: this.collectibles,
            letters: this.letters,
            decorations: this.decorations,
            goal: this.goal,
            playerStart: this.playerStart,
            theme: this.currentTheme
        };
    }
}

// Export for use in other files
globalThis.LevelGenerator = LevelGenerator;