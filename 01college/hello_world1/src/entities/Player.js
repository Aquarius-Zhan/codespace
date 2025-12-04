// Player Character - Mario-style physics with cyberpunk aesthetics
// Handles movement, jumping, and combat mechanics

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.health = gameState.upgrades.extraHealth ? 4 : 3;
        this.maxHealth = this.health;
        this.invincible = false;
        this.invincibleTime = 0;
        this.jumpCount = 0;
        this.maxJumps = gameState.upgrades.doubleJump ? 2 : 1;
        this.dashCooldown = 0;
        this.dashSpeed = 400;
        this.onGround = false;
        this.trail = [];

        this.createEntity();
    }

    createEntity() {
        // Create the player entity
        this.entity = add([
            pos(this.x, this.y),
            rect(24, 32),
            color(GAME_UTILS.COLORS.neon.cyan),
            area(),
            body(),
            {
                player: this,

                // Movement parameters (tuned for Mario feel)
                speed: 200,
                jumpForce: 550,
                accel: 800,
                friction: 900,
                airFriction: 600,
                gravityScale: 1.0,
                coyoteTime: 0,
                jumpBuffer: 0,
                justJumped: false,

                // Animation and effects
                squishScale: vec2(1, 1),
                rotation: 0,
                eyeOffset: vec2(0, 0),
                dashDirection: vec2(0, 0),
                dashing: false,
                dashTime: 0,

                // Collection and state
                lettersCollected: [],
                currentLevel: gameState.currentLevel,
            }
        ]);

        // Setup collision handlers
        this.entity.onCollide('enemy', (enemy) => {
            this.onEnemyCollision(enemy);
        });

        this.entity.onCollide('hazard', (hazard) => {
            this.takeDamage(1);
        });

        this.entity.onCollide('letter', (letter) => {
            this.collectLetter(letter);
        });

        this.entity.onCollide('coin', (coin) => {
            this.collectCoin(coin);
        });

        this.entity.onGround(() => {
            this.onGround = true;
            this.coyoteTime = 0.1; // Coyote time for forgiving jumps
            this.justJumped = false;
            this.jumpCount = 0;
            this.createLandingEffect();
        });

        this.entity.onFallOff(() => {
            this.die();
        });
    }

    update() {
        if (!this.entity.exists()) return;

        this.updateMovement();
        this.updatePhysics();
        this.updateVisualEffects();
        this.updateInvincibility();
        this.updateDash();
    }

    updateMovement() {
        const { speed, accel, friction, airFriction } = this.entity;
        const left = isKeyDown('left');
        const right = isKeyDown('right');

        // Horizontal movement with acceleration
        if (left) {
            this.entity.move(-accel * dt(), 0);
            this.entity.facing = -1;
        } else if (right) {
            this.entity.move(accel * dt(), 0);
            this.entity.facing = 1;
        } else {
            // Apply friction
            const currentFriction = this.onGround ? friction : airFriction;
            this.entity.vel.x = lerp(this.entity.vel.x, 0, currentFriction * dt());
        }

        // Clamp horizontal speed
        this.entity.vel.x = clamp(this.entity.vel.x, -speed, speed);

        // Jump input handling with buffer
        if (isKeyDown('jump')) {
            this.entity.jumpBuffer = 0.1;
        } else {
            this.entity.jumpBuffer = 0;
        }

        // Jump execution
        if (this.entity.jumpBuffer > 0 &&
            (this.onGround || this.coyoteTime > 0 || this.jumpCount < this.maxJumps) &&
            !this.entity.justJumped) {

            this.jump();
        }

        // Dash input
        if (isKeyPressed('action') && this.dashCooldown <= 0 && gameState.upgrades.dash) {
            this.dash();
        }

        // Update timers
        this.coyoteTime = max(0, this.coyoteTime - dt());
        this.entity.jumpBuffer = max(0, this.entity.jumpBuffer - dt());
        this.onGround = this.entity.isGrounded();
    }

    jump() {
        const { jumpForce } = this.entity;

        // Apply jump force with slight variation for feel
        const force = this.jumpCount === 0 ? jumpForce : jumpForce * 0.8;
        this.entity.jump(force);

        this.jumpCount++;
        this.entity.justJumped = true;
        this.coyoteTime = 0;
        this.onGround = false;

        // Visual and audio feedback
        this.createJumpEffect();
        GAME_UTILS.SOUNDS.jump();

        // Schedule next jump possibility
        setTimeout(() => {
            if (this.entity && this.entity.exists()) {
                this.entity.justJumped = false;
            }
        }, 100);
    }

    dash() {
        if (this.dashCooldown > 0 || !gameState.upgrades.dash) return;

        const inputX = isKeyDown('right') - isKeyDown('left');
        const inputY = isKeyDown('down') - isKeyDown('up');
        let direction = vec2(inputX, inputY).unit();

        // Default to facing direction if no input
        if (direction.len() === 0) {
            direction = vec2(this.entity.facing || 1, 0);
        }

        this.entity.dashing = true;
        this.entity.dashTime = 0.2;
        this.entity.dashDirection = direction;
        this.dashCooldown = 0.5;

        // Set dash velocity
        this.entity.vel = direction.scale(this.dashSpeed);

        // Make invincible during dash
        this.invincible = true;
        this.invincibleTime = this.entity.dashTime;

        // Create dash trail
        this.createDashEffect();
        GAME_UTILS.SOUNDS.glitch();
    }

    updateDash() {
        this.dashCooldown = max(0, this.dashCooldown - dt());

        if (this.entity.dashTime > 0) {
            this.entity.dashTime -= dt();
            this.entity.vel = this.entity.dashDirection.scale(this.dashSpeed);

            if (this.entity.dashTime <= 0) {
                this.entity.dashing = false;
                this.entity.vel = this.entity.dashDirection.scale(this.speed * 0.5);
            }
        }
    }

    updatePhysics() {
        // Maintain minimum fall speed for better game feel
        if (this.entity.vel.y < -100) {
            this.entity.vel.y = lerp(this.entity.vel.y, -100, dt() * 5);
        }
    }

    updateVisualEffects() {
        // Invincibility flashing
        if (this.invincible) {
            this.entity.opacity = 0.5 + Math.sin(Date.now() * 0.01) * 0.5;
        } else {
            this.entity.opacity = 1;
        }

        // Dash trail effect
        if (this.entity.dashing) {
            this.createDashTrail();
        }

        // Eye tracking for personality
        const mousePos = mousePos();
        const toMouse = mousePos.sub(this.entity.pos);
        this.entity.eyeOffset = toMouse.unit().scale(2);
    }

    updateInvincibility() {
        if (this.invincibleTime > 0) {
            this.invincibleTime -= dt();
            if (this.invincibleTime <= 0) {
                this.invincible = false;
                this.entity.opacity = 1;
            }
        }
    }

    onEnemyCollision(enemy) {
        if (!this.entity || !this.entity.exists() || !enemy || !enemy.exists()) return;

        // Check if we're stomping the enemy
        const isStomping = this.entity.vel.y > 100 &&
                          this.entity.pos.y < enemy.pos.y - 10;

        if (isStomping && !this.entity.dashing) {
            // Stomp the enemy
            this.entity.vel.y = -300; // Bounce
            enemy.takeDamage(1);
            GAME_UTILS.createExplosion(enemy.pos, GAME_UTILS.COLORS.neon.yellow, 10);
            GAME_UTILS.SOUNDS.land();
        } else if (this.entity.dashing) {
            // Dash through enemy
            enemy.takeDamage(1);
            GAME_UTILS.createExplosion(enemy.pos, GAME_UTILS.COLORS.neon.magenta, 15);
        } else {
            // Take damage from enemy
            this.takeDamage(1);

            // Knockback
            const knockbackDir = this.entity.pos.sub(enemy.pos).unit();
            this.entity.vel = knockbackDir.scale(200);
        }
    }

    takeDamage(amount) {
        if (this.invincible || this.entity.dashing) return;

        this.health -= amount;
        this.invincible = true;
        this.invincibleTime = 1.5;

        // Screen shake and effects
        GAME_UTILS.shakeScreen(8, 0.3);
        GAME_UTILS.applyGlitch(0.3);
        GAME_UTILS.createExplosion(this.entity.pos, GAME_UTILS.COLORS.neon.red, 20);
        GAME_UTILS.SOUNDS.hurt();

        // Knockback
        this.entity.vel.x = (Math.random() - 0.5) * 200;
        this.entity.vel.y = -150;

        this.updateHealthUI();

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        if (!this.entity || !this.entity.exists()) return;

        gameState.deaths++;

        // Death effects
        GAME_UTILS.shakeScreen(15, 0.5);
        GAME_UTILS.applyGlitch(0.5);
        GAME_UTILS.createExplosion(this.entity.pos, GAME_UTILS.COLORS.neon.red, 40);
        GAME_UTILS.SOUNDS.death();

        // Destroy player
        destroy(this.entity);

        // Reset scene after delay
        wait(1, () => {
            scene('main');
        });
    }

    collectLetter(letter) {
        if (!letter || !letter.exists()) return;

        const letterChar = letter.letter;
        if (!this.lettersCollected.includes(letterChar)) {
            this.lettersCollected.push(letterChar);

            // Update UI
            const letterElement = document.querySelector(`[data-letter="${letterChar}"]`);
            if (letterElement) {
                letterElement.classList.add('collected');
            }

            // Effects
            GAME_UTILS.createCollectEffect(letter.pos, GAME_UTILS.COLORS.neon.yellow);
            GAME_UTILS.shakeScreen(3, 0.1);
            GAME_UTILS.SOUNDS.coin();

            // Score bonus
            gameState.score += 500;
            this.updateScoreUI();

            // Check if all letters collected
            if (this.lettersCollected.length === 5) {
                this.perfectRunBonus();
            }
        }

        destroy(letter);
    }

    collectCoin(coin) {
        if (!coin || !coin.exists()) return;

        gameState.score += 100;
        gameState.totalCoins++;

        // Magnet effect if unlocked
        if (gameState.upgrades.magnet) {
            const coins = get('coin');
            coins.forEach(c => {
                if (c && c.exists() && c.pos.dist(this.entity.pos) < 100) {
                    c.moveTo(this.entity.pos, 300);
                }
            });
        }

        GAME_UTILS.createCollectEffect(coin.pos, GAME_UTILS.COLORS.neon.yellow);
        GAME_UTILS.SOUNDS.coin();
        this.updateScoreUI();

        destroy(coin);
    }

    perfectRunBonus() {
        gameState.score += 2000;
        GAME_UTILS.SOUNDS.victory();
        GAME_UTILS.shakeScreen(5, 0.2);

        // Victory message
        add([
            text("PERFECT!", { size: 48, font: "orbitron" }),
            pos(width() / 2, height() / 2),
            anchor("center"),
            color(GAME_UTILS.COLORS.neon.yellow),
            lifespan(2),
            scale(0),
            {
                update() {
                    this.scale = lerp(this.scale, 1, dt() * 10);
                    this.angle += dt() * 5;
                }
            }
        ]);
    }

    createJumpEffect() {
        // Dust particles
        for (let i = 0; i < 5; i++) {
            add([
                pos(
                    this.entity.pos.x + rand(-10, 10),
                    this.entity.pos.y + this.entity.height / 2
                ),
                circle(rand(2, 4)),
                color(255, 255, 255, 150),
                lifespan(0.3),
                move(rand(-90, -45), rand(50, 150)),
                {
                    update() {
                        this.scale = lerp(this.scale, 0, dt() * 8);
                    }
                }
            ]);
        }

        // Player squish animation
        this.entity.squishScale = vec2(1.2, 0.8);
        setTimeout(() => {
            if (this.entity && this.entity.exists()) {
                this.entity.squishScale = vec2(0.9, 1.1);
                setTimeout(() => {
                    if (this.entity && this.entity.exists()) {
                        this.entity.squishScale = vec2(1, 1);
                    }
                }, 50);
            }
        }, 50);
    }

    createLandingEffect() {
        for (let i = 0; i < 8; i++) {
            add([
                pos(
                    this.entity.pos.x + rand(-15, 15),
                    this.entity.pos.y + this.entity.height / 2
                ),
                rect(rand(2, 6), rand(2, 6)),
                color(255, 255, 255, 200),
                lifespan(0.4),
                move(rand(90, 135), rand(20, 100)),
                {
                    update() {
                        this.scale = lerp(this.scale, 0, dt() * 10);
                    }
                }
            ]);
        }
        GAME_UTILS.SOUNDS.land();
    }

    createDashEffect() {
        // Initial dash burst
        for (let i = 0; i < 12; i++) {
            add([
                pos(this.entity.pos),
                circle(rand(3, 8)),
                color(GAME_UTILS.COLORS.neon.magenta),
                lifespan(0.5),
                move(this.entity.facing * 180, rand(-30, 30), rand(200, 400)),
                {
                    update() {
                        this.opacity = lerp(this.opacity, 0, dt() * 8);
                        this.scale = lerp(this.scale, 0, dt() * 6);
                    }
                }
            ]);
        }
    }

    createDashTrail() {
        if (Math.random() < 0.7) { // Don't create trail every frame
            add([
                pos(this.entity.pos.x - this.entity.facing * 10, this.entity.pos.y),
                rect(20, this.entity.height * 0.8),
                color(GAME_UTILS.COLORS.neon.magenta),
                opacity(0.5),
                lifespan(0.2),
                {
                    update() {
                        this.opacity = lerp(this.opacity, 0, dt() * 10);
                        this.scale.x = lerp(this.scale.x, 0, dt() * 8);
                    }
                }
            ]);
        }
    }

    updateHealthUI() {
        const healthDisplay = document.querySelector('.health-display');
        if (healthDisplay) {
            let hearts = '';
            for (let i = 0; i < this.maxHealth; i++) {
                if (i < this.health) {
                    hearts += '❤️';
                } else {
                    hearts += '🖤';
                }
            }
            healthDisplay.textContent = hearts;
        }
    }

    updateScoreUI() {
        const scoreDisplay = document.querySelector('.score-display');
        if (scoreDisplay) {
            scoreDisplay.textContent = `SCORE: ${gameState.score}`;
        }
    }

    draw() {
        if (!this.entity || !this.entity.exists()) return;

        // Main body
        drawSprite({
            pos: this.entity.pos,
            size: vec2(this.entity.width, this.entity.height),
            scale: this.entity.squishScale,
            angle: this.entity.rotation,
            color: this.invincible ?
                rgb(255, 100 + Math.sin(Date.now() * 0.02) * 155, 100) :
                GAME_UTILS.COLORS.neon.cyan,
            // Add glow effect
            outline: {
                color: this.entity.dashing ? GAME_UTILS.COLORS.neon.magenta : GAME_UTILS.COLORS.neon.cyan,
                width: 2,
            }
        });

        // Eyes (simple representation)
        const eyeSize = 3;
        const eyeY = this.entity.pos.y - this.entity.height / 4;

        // Left eye
        drawCircle({
            pos: vec2(this.entity.pos.x - 5, eyeY).add(this.entity.eyeOffset),
            radius: eyeSize,
            color: rgb(0, 0, 0),
        });

        // Right eye
        drawCircle({
            pos: vec2(this.entity.pos.x + 5, eyeY).add(this.entity.eyeOffset),
            radius: eyeSize,
            color: rgb(0, 0, 0),
        });
    }
}

// Export for use in other files
globalThis.Player = Player;