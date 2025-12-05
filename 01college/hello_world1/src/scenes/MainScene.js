// Main Scene - Core gameplay loop
// Manages game state, player interaction, and level progression

scene('main', () => {
    // Scene setup
    console.log('Creating main scene...');

    try {
        const levelGenerator = new LevelGenerator(gameState.currentLevel);
        console.log('LevelGenerator created');
        const levelData = levelGenerator.getLevelData();
        console.log('Level data retrieved');
        const trapSystem = new TrapSystem(null); // Pass null as scene parameter for now
        console.log('TrapSystem created');

        // Game entities
        let player = null;
        let camera = null;
        let background = null;
        let goal = null;
        let levelComplete = false;
        let gameTime = 0;
        let letterCount = 0;

        // Initialize scene
        initializeScene();
        console.log('Scene initialized');

    } catch (error) {
        console.error('Error in scene setup:', error);
        // Try to hide loading screen even if scene fails
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }

    function initializeScene() {
        // Set up camera
        setCameraScale(1);
        setCameraPos(0, 0);

        // Create background
        createBackground();

        // Create level
        createLevel();

        // Spawn player
        spawnPlayer();

        // Create UI
        setupUI();

        // Start game loop
        onUpdate(update);
        onDraw(draw);
    }

    function createBackground() {
        // Cyberpunk background with binary rain
        add([
            rect(width(), height()),
            color(10, 0, 20),
            z(-100)
        ]);

        // Binary code rain effect
        for (let i = 0; i < 20; i++) {
            add([
                text('01010101', {
                    size: 12,
                    font: 'monospace'
                }),
                pos(GAME_UTILS.randRange(0, width()), -100),
                color(0, 255, 255, 50),
                z(-99),
                {
                    speed: GAME_UTILS.randRange(50, 150),
                    update() {
                        this.move(0, this.speed * dt());
                        if (this.pos.y > height()) {
                            this.pos.y = -100;
                            this.pos.x = GAME_UTILS.randRange(0, width());
                        }
                    }
                }
            ]);
        }

        // Background buildings/cyberpunk skyline
        createSkyline();
    }

    function createSkyline() {
        const buildingCount = 15;
        for (let i = 0; i < buildingCount; i++) {
            const width = GAME_UTILS.randRange(60, 150);
            const height = GAME_UTILS.randRange(100, 400);
            const x = i * (width() / buildingCount);

            add([
                rect(width, height),
                color(20, 20, 40, 150),
                pos(x, height() - height),
                z(-98)
            ]);

            // Glowing windows
            const windowRows = Math.floor(height / 30);
            const windowCols = Math.floor(width / 20);

            for (let row = 0; row < windowRows; row++) {
                for (let col = 0; col < windowCols; col++) {
                    if (GAME_UTILS.chance(0.3)) {
                        add([
                            rect(10, 10),
                            color(GAME_UTILS.randChoice([
                                GAME_UTILS.COLORS.neon.cyan,
                                GAME_UTILS.COLORS.neon.magenta,
                                GAME_UTILS.COLORS.neon.yellow
                            ]), 100),
                            pos(
                                x + col * 20 + 5,
                                height() - height + row * 30 + 10
                            ),
                            z(-97)
                        ]);
                    }
                }
            }
        }
    }

    function createLevel() {
        // Safety check
        if (!levelData) {
            console.error('Level data is undefined!');
            return;
        }

        console.log('Creating level with data:', levelData);

        // Create platforms
        if (levelData.platforms && Array.isArray(levelData.platforms)) {
            levelData.platforms.forEach(platform => {
                const platformEntity = add([
                    pos(platform.x, platform.y),
                    rect(platform.width, platform.height),
                    color(getPlatformColor(platform)),
                    area(),
                    body({ isStatic: true }),
                    'platform',
                    platform
                ]);

                // Moving platforms
                if (platform.moving) {
                    setupMovingPlatform(platformEntity, platform);
                }
            });
        } else {
            console.error('Platforms array is missing or not an array:', levelData.platforms);
        }

        // Create traps
        if (levelData.traps && Array.isArray(levelData.traps)) {
            trapSystem.createTraps(levelData.traps);
        } else {
            console.warn('Traps array is missing or not an array');
        }

        // Create enemies
        if (levelData.enemies && Array.isArray(levelData.enemies)) {
            levelData.enemies.forEach(enemyData => {
                const enemy = new Enemy(
                    enemyData.x,
                    enemyData.y,
                    enemyData.type,
                    enemyData.ai
                );
            });
        } else {
            console.warn('Enemies array is missing or not an array');
        }

        // Create collectibles
        if (levelData.collectibles && Array.isArray(levelData.collectibles)) {
            levelData.collectibles.forEach(collectibleData => {
                createCollectible(collectibleData);
            });
        } else {
            console.warn('Collectibles array is missing or not an array');
        }

        // Create letters
        if (levelData.letters && Array.isArray(levelData.letters)) {
            levelData.letters.forEach(letterData => {
                createLetter(letterData);
            });
        } else {
            console.warn('Letters array is missing or not an array');
        }

        // Create goal
        if (levelData.goal) {
            createGoal(levelData.goal);
        } else {
            console.warn('Goal data is missing');
        }

        // Create decorations
        if (levelData.decorations && Array.isArray(levelData.decorations)) {
            levelData.decorations.forEach(decorationData => {
                createDecoration(decorationData);
            });
        } else {
            console.warn('Decorations array is missing or not an array');
        }
    }

    function getPlatformColor(platform) {
        const colors = {
            ground: rgb(26, 26, 46),
            normal: rgb(0, 255, 255),
            ceiling: rgb(0, 136, 255),
            wall: rgb(255, 0, 255),
            goal_platform: rgb(255, 255, 0)
        };
        return colors[platform.type] || colors.normal;
    }

    function setupMovingPlatform(platformEntity, data) {
        platformEntity.moveData = {
            startX: data.x,
            startY: data.y,
            endX: data.x + (data.moveRange || 100),
            endY: data.y,
            speed: data.speed || 50,
            direction: 1,
            moving: true
        };

        platformEntity.onUpdate(() => {
            if (!platformEntity.moveData.moving) return;

            const move = platformEntity.moveData;
            const targetX = move.direction > 0 ? move.endX : move.startX;

            platformEntity.pos.x = lerp(
                platformEntity.pos.x,
                targetX,
                move.speed * dt()
            );

            if (Math.abs(platformEntity.pos.x - targetX) < 5) {
                move.direction *= -1;
            }

            // Move player if standing on platform
            const player = get('player')[0];
            if (player && player.player &&
                player.player.pos.y < platformEntity.pos.y &&
                Math.abs(player.player.pos.x - platformEntity.pos.x) < platformEntity.width) {
                player.player.moveX(move.speed * move.direction * dt());
            }
        });
    }

    function createCollectible(data) {
        const collectible = add([
            pos(data.x, data.y),
            data.type === 'coin' ? circle(8) : rect(12, 12),
            color(data.special ? GAME_UTILS.COLORS.neon.yellow : GAME_UTILS.COLORS.neon.cyan),
            area(),
            'collectible',
            'coin',
            data
        ]);

        collectible.onCollide('player', (player) => {
            collectCoin(collectible, data, player);
        });

        if (data.floating) {
            setupFloatingAnimation(collectible);
        }
    }

    function collectCoin(collectible, data, playerEntity) {
        const player = playerEntity.player;
        if (!player) return;

        // Score
        const scoreValue = data.value || (data.special ? 50 : 10);
        gameState.score += scoreValue;
        gameState.totalCoins++;

        // Effects
        GAME_UTILS.createCollectEffect(collectible.pos, GAME_UTILS.COLORS.neon.yellow);
        GAME_UTILS.SOUNDS.coin();
        GAME_UTILS.shakeScreen(2, 0.1);

        // Power-up effects
        if (data.type === 'powerup') {
            applyPowerUp(data.powerType, player);
        }

        updateScoreDisplay();

        destroy(collectible);
    }

    function createLetter(data) {
        const letter = add([
            pos(data.x, data.y),
            text(data.letter, {
                size: 24,
                font: 'orbitron',
                weight: 'bold'
            }),
            color(GAME_UTILS.COLORS.neon.yellow),
            area(),
            'collectible',
            'letter',
            data,
            {
                letter: data.letter,
                collected: false,
                glowIntensity: 1,
                floatOffset: data.floatOffset || 0,
                collected: false
            }
        ]);

        letter.onCollide('player', (player) => {
            collectLetter(letter, player);
        });

        setupLetterAnimation(letter);
    }

    function collectLetter(letter, playerEntity) {
        const player = playerEntity.player;
        if (!player || letter.collected) return;

        letter.collected = true;
        player.collectLetter(letter);

        // Update UI
        const letterElement = document.querySelector(`[data-letter="${letter.letter}"]`);
        if (letterElement) {
            letterElement.classList.add('collected');
        }

        // Effects
        GAME_UTILS.createExplosion(letter.pos, GAME_UTILS.COLORS.neon.yellow, 15);
        GAME_UTILS.shakeScreen(4, 0.2);
        GAME_UTILS.SOUNDS.victory();

        gameState.score += 500;
        updateScoreDisplay();

        destroy(letter);
    }

    function setupLetterAnimation(letter) {
        letter.onUpdate(() => {
            // Floating animation
            const floatY = Math.sin(Date.now() * 0.002 + letter.floatOffset * Math.PI) * 10;
            letter.pos.y += floatY * dt();

            // Glowing effect
            letter.glowIntensity = (Math.sin(Date.now() * 0.005) + 1) * 0.5;
            letter.color = color(255, 255, 100 + letter.glowIntensity * 155);

            // Rotation
            letter.angle = Math.sin(Date.now() * 0.001) * 10;
        });
    }

    function setupFloatingAnimation(entity) {
        entity.onUpdate(() => {
            const floatY = Math.sin(Date.now() * 0.003) * 5;
            entity.move(0, floatY * dt());
        });
    }

    function createGoal(data) {
        goal = add([
            pos(data.x, data.y),
            rect(data.width, data.height),
            color(GAME_UTILS.COLORS.neon.yellow),
            area(),
            'goal',
            data
        ]);

        goal.onCollide('player', (player) => {
            if (!levelComplete) {
                completeLevel(player);
            }
        });

        // Flag animation
        goal.onUpdate(() => {
            goal.color = color(
                255,
                255,
                100 + Math.sin(Date.now() * 0.005) * 155
            );
            goal.scale.y = 1 + Math.sin(Date.now() * 0.003) * 0.05;
        });
    }

    function createDecoration(data) {
        const decoration = add([
            pos(data.x, data.y),
            data.type === 'background' ? rect(data.size, data.size) : circle(data.size),
            color(data.color || GAME_UTILS.COLORS.neon.cyan),
            opacity(data.opacity || 0.5),
            z(-50),
            'decoration',
            data
        ]);

        decoration.onUpdate(() => {
            // Subtle animation
            decoration.angle += dt() * (data.animationSpeed || 0.5);
        });
    }

    function spawnPlayer() {
        player = new Player(
            levelData.playerStart.x,
            levelData.playerStart.y
        );
    }

    function setupUI() {
        updateHealthDisplay();
        updateScoreDisplay();
        updateLettersDisplay();
    }

    function updateHealthDisplay() {
        const healthDisplay = document.querySelector('.health-display');
        if (healthDisplay && player) {
            let hearts = '';
            for (let i = 0; i < player.maxHealth; i++) {
                if (i < player.health) {
                    hearts += '❤️';
                } else {
                    hearts += '🖤';
                }
            }
            healthDisplay.textContent = hearts;
        }
    }

    function updateScoreDisplay() {
        const scoreDisplay = document.querySelector('.score-display');
        if (scoreDisplay) {
            scoreDisplay.textContent = `SCORE: ${gameState.score}`;
        }
    }

    function updateLettersDisplay() {
        // Reset all letters
        document.querySelectorAll('.letter').forEach(letter => {
            letter.classList.remove('collected');
        });
    }

    function applyPowerUp(powerType, player) {
        switch (powerType) {
            case 'extra_jump':
                player.maxJumps = 3;
                setTimeout(() => { player.maxJumps = gameState.upgrades.doubleJump ? 2 : 1; }, 10000);
                break;

            case 'speed_boost':
                player.speed = 300;
                setTimeout(() => { player.speed = 200; }, 8000);
                break;

            case 'invincibility':
                player.invincible = true;
                player.invincibleTime = 5;
                setTimeout(() => { player.invincible = false; }, 5000);
                break;

            case 'magnet_coins':
                // Magnet effect handled in player collect logic
                setTimeout(() => { /* magnet expires */ }, 15000);
                break;
        }

        // Visual feedback
        add([
            text(powerType.replace('_', ' ').toUpperCase(), {
                size: 20,
                font: 'orbitron'
            }),
            pos(player.pos.x, player.pos.y - 50),
            color(GAME_UTILS.COLORS.neon.cyan),
            lifespan(2),
            anchor('center')
        ]);
    }

    function update() {
        gameTime += dt();

        // Update player
        if (player && player.entity && player.entity.exists()) {
            player.update();
        }

        // Update enemies
        get('enemy').forEach(enemy => {
            if (enemy.enemy) {
                enemy.enemy.update();
            }
        });

        // Update traps
        trapSystem.update();

        // Camera follow
        updateCamera();

        // Check for player death
        checkPlayerState();

        // Update background effects
        updateBackgroundEffects();
    }

    function updateCamera() {
        if (!player || !player.entity || !player.entity.exists()) return;

        const targetX = player.entity.pos.x - width() / 2;
        const targetY = player.entity.pos.y - height() / 2;

        // Smooth camera follow
        camera = vec2(
            lerp(camera?.x || 0, targetX, dt() * 5),
            Math.max(0, lerp(camera?.y || 0, targetY, dt() * 3))
        );

        setCameraPos(camera.x, camera.y);

        // Camera bounds
        const maxCameraX = Math.max(0, levelGenerator.width - width());
        camera.x = clamp(camera.x, 0, maxCameraX);
        camera.y = clamp(camera.y, -height(), 0);
    }

    function checkPlayerState() {
        if (!player || !player.entity || !player.entity.exists()) {
            // Player died
            gameState.deaths++;
            wait(1, () => {
                scene('main');
            });
            return;
        }

        // Update UI
        if (player.health !== parseInt(document.querySelector('.health-display')?.textContent?.match(/❤️/g)?.length || 0)) {
            updateHealthDisplay();
        }

        // Check for fall
        if (player.entity.pos.y > levelGenerator.height) {
            player.die();
        }
    }

    function updateBackgroundEffects() {
        // Parallax effect for background elements
        get('decoration').forEach(decoration => {
            if (decoration.z < -90) { // Background elements
                const parallaxAmount = 0.3;
                decoration.pos.x -= camera.x * dt() * parallaxAmount * 0.01;
            }
        });

        // Occasional screen glitch effect
        if (GAME_UTILS.chance(0.001)) {
            GAME_UTILS.applyGlitch(0.1);
        }
    }

    function completeLevel(player) {
        if (levelComplete) return;

        levelComplete = true;

        // Calculate bonuses
        const timeBonus = Math.max(0, 1000 - Math.floor(gameTime * 10));
        const deathPenalty = Math.max(0, -gameState.deaths * 100);
        const levelScore = 1000 + timeBonus + deathPenalty;

        gameState.score += levelScore;
        gameState.levelsCompleted++;

        // Visual effects
        GAME_UTILS.shakeScreen(10, 0.5);
        GAME_UTILS.SOUNDS.victory();
        GAME_UTILS.createExplosion(goal.pos, GAME_UTILS.COLORS.neon.yellow, 50);

        // Victory message
        const victoryText = add([
            text('LEVEL COMPLETE!', {
                size: 48,
                font: 'orbitron'
            }),
            pos(width() / 2, height() / 2),
            anchor('center'),
            color(GAME_UTILS.COLORS.neon.yellow),
            lifespan(3),
            scale(0),
            {
                update() {
                    this.scale = lerp(this.scale, 1, dt() * 8);
                    this.angle = Math.sin(Date.now() * 0.01) * 5;
                }
            }
        ]);

        // Score breakdown
        const scoreText = add([
            text(`Score: ${levelScore}`, {
                size: 24,
                font: 'orbitron'
            }),
            pos(width() / 2, height() / 2 + 60),
            anchor('center'),
            color(GAME_UTILS.COLORS.neon.cyan),
            lifespan(3)
        ]);

        // Next level
        wait(3, () => {
            gameState.currentLevel++;
            gameState.lettersCollected = [];
            scene('main');
        });
    }

    function draw() {
        // Draw UI elements
        onDraw(() => {
            // Draw player
            if (player && player.entity && player.entity.exists()) {
                player.draw();
            }

            // Draw enemies
            get('enemy').forEach(enemy => {
                if (enemy.enemy) {
                    enemy.enemy.draw();
                }
            });

            // Goal indicator
            if (goal && goal.exists()) {
                // Draw flag
                drawRect({
                    pos: goal.pos,
                    width: 5,
                    height: 60,
                    color: GAME_UTILS.COLORS.neon.yellow
                });

                // Flag cloth
                const wave = Math.sin(Date.now() * 0.003) * 5;
                drawPolygon({
                    pts: [
                        vec2(goal.pos.x + 5, goal.pos.y),
                        vec2(goal.pos.x + 35 + wave, goal.pos.y + 15),
                        vec2(goal.pos.x + 5, goal.pos.y + 30)
                    ],
                    color: GAME_UTILS.COLORS.neon.yellow
                });
            }

            // Debug info (if enabled)
            if (GAME_UTILS.gameState.debug) {
                drawDebugInfo();
            }
        });
    }

    function drawDebugInfo() {
        // Player position
        if (player && player.entity && player.entity.exists()) {
            drawText({
                text: `Player: ${Math.floor(player.entity.pos.x)}, ${Math.floor(player.entity.pos.y)}`,
                pos: vec2(10, height() - 60),
                size: 16,
                color: rgb(255, 255, 255)
            });

            // Player velocity
            drawText({
                text: `Vel: ${Math.floor(player.entity.vel.x)}, ${Math.floor(player.entity.vel.y)}`,
                pos: vec2(10, height() - 40),
                size: 16,
                color: rgb(255, 255, 255)
            });

            // On ground indicator
            drawText({
                text: `Grounded: ${player.onGround}`,
                pos: vec2(10, height() - 20),
                size: 16,
                color: rgb(255, 255, 255)
            });
        }

        // Game time
        drawText({
            text: `Time: ${gameTime.toFixed(1)}`,
            pos: vec2(10, 10),
            size: 16,
            color: rgb(255, 255, 255)
        });

        // Active traps
        const trapCount = trapSystem.traps.length;
        drawText({
            text: `Traps: ${trapCount}`,
            pos: vec2(10, 30),
            size: 16,
            color: rgb(255, 255, 255)
        });

        // Camera position
        if (camera) {
            drawText({
                text: `Camera: ${Math.floor(camera.x)}, ${Math.floor(camera.y)}`,
                pos: vec2(10, 50),
                size: 16,
                color: rgb(255, 255, 255)
            });
        }
    }

    // Handle keyboard shortcuts
    onKeyPress('f3', () => {
        GAME_UTILS.gameState.debug = !GAME_UTILS.gameState.debug;
    });

    onKeyPress('r', () => {
        scene('main');
    });

    onKeyPress('escape', () => {
        // Return to menu (implement menu scene later)
        gameState.currentLevel = 1;
        scene('main');
    });
});