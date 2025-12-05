// Enemy Entity - Various enemy types with different behaviors
// Includes AI, patrol patterns, and player interaction

class Enemy {
    constructor(x, y, type, aiConfig) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.health = this.getEnemyHealth(type);
        this.maxHealth = this.health;
        this.ai = this.createAI(aiConfig);
        this.state = 'patrol';
        this.player = null;
        this.lastSeenPlayer = null;
        this.attackCooldown = 0;
        this.projectiles = [];

        this.createEntity();
    }

    createEntity() {
        this.entity = add([
            pos(this.x, this.y),
            rect(this.getEnemySize(this.type).x, this.getEnemySize(this.type).y),
            color(this.getEnemyColor(this.type)),
            area(),
            body(),
            'enemy',
            this.type,
            {
                enemy: this,
                vel: vec2(0, 0),
                facing: 1,
                grounded: false,
                patrolDirection: GAME_UTILS.randChoice([-1, 1]),
                jumpTimer: 0,
                attackTimer: 0,
                animationTimer: 0,
                glowIntensity: 0,
                hitFlash: 0
            }
        ]);

        this.entity.onGround(() => {
            this.entity.grounded = true;
        });

        this.entity.onCollide('player', (player) => {
            this.onPlayerCollision(player);
        });

        this.entity.onCollide('projectile', (projectile) => {
            this.takeDamage(projectile.damage);
            destroy(projectile);
        });
    }

    getEnemySize(type) {
        const sizes = {
            walker: vec2(30, 40),
            jumper: vec2(25, 35),
            shooter: vec2(35, 45),
            chaser: vec2(40, 40),
            flyer: vec2(30, 25)
        };
        return sizes[type] || sizes.walker;
    }

    getEnemyColor(type) {
        const colors = {
            walker: GAME_UTILS.COLORS.neon.red,
            jumper: GAME_UTILS.COLORS.neon.magenta,
            shooter: GAME_UTILS.COLORS.neon.yellow,
            chaser: GAME_UTILS.COLORS.neon.cyan,
            flyer: GAME_UTILS.COLORS.neon.green
        };
        return colors[type] || colors.walker;
    }

    getEnemyHealth(type) {
        const health = {
            walker: 1,
            jumper: 1,
            shooter: 2,
            chaser: 3,
            flyer: 1
        };
        return health[type] || 1;
    }

    createAI(config) {
        return {
            patrolSpeed: config.speed || 50,
            detectionRange: config.detectionRange || 200,
            jumpHeight: config.jumpHeight || 150,
            jumpInterval: config.jumpInterval || 2,
            fireRate: config.fireRate || 2,
            projectileSpeed: config.projectileSpeed || 200,
            chaseSpeed: config.speed * 1.5 || 75,
            flyHeight: config.flyHeight || 150,
            pattern: config.pattern || 'straight',
            aggressive: config.aggressive || false
        };
    }

    update() {
        if (!this.entity || !this.entity.exists()) return;

        this.updateTimers();
        this.findPlayer();
        this.updateAI();
        this.updateVisuals();
        this.updateProjectiles();
    }

    updateTimers() {
        this.attackCooldown = Math.max(0, this.attackCooldown - dt());
        this.entity.jumpTimer = Math.max(0, this.entity.jumpTimer - dt());
        this.entity.attackTimer = Math.max(0, this.entity.attackTimer - dt());
        this.entity.animationTimer += dt();
        this.entity.hitFlash = Math.max(0, this.entity.hitFlash - dt());
    }

    findPlayer() {
        const player = get('player')[0];
        if (player && player.player) {
            const distance = this.entity.pos.dist(player.player.pos);
            const angle = player.player.pos.angle(this.entity.pos);

            if (distance <= this.ai.detectionRange &&
                Math.abs(angle - (this.entity.facing > 0 ? 0 : 180)) < 90) {
                this.player = player.player;
                this.lastSeenPlayer = this.player.pos.clone();
                this.state = 'chase';
            } else if (distance > this.ai.detectionRange * 1.5) {
                this.player = null;
                this.state = 'patrol';
            }
        }
    }

    updateAI() {
        switch (this.type) {
            case 'walker':
                this.updateWalkerAI();
                break;
            case 'jumper':
                this.updateJumperAI();
                break;
            case 'shooter':
                this.updateShooterAI();
                break;
            case 'chaser':
                this.updateChaserAI();
                break;
            case 'flyer':
                this.updateFlyerAI();
                break;
        }
    }

    updateWalkerAI() {
        if (this.state === 'chase' && this.player) {
            // Move toward player
            const direction = Math.sign(this.player.pos.x - this.entity.pos.x);
            this.entity.facing = direction;
            this.entity.move(this.ai.patrolSpeed * direction * dt(), 0);

            // Jump if needed
            if (this.shouldJump()) {
                this.jump();
            }
        } else {
            // Patrol
            this.patrol();
        }
    }

    updateJumperAI() {
        if (this.state === 'chase' && this.player) {
            const direction = Math.sign(this.player.pos.x - this.entity.pos.x);
            this.entity.facing = direction;

            // Jump more frequently when chasing
            if (this.entity.jumpTimer <= 0) {
                this.jump();
                this.entity.move(this.ai.patrolSpeed * direction * dt(), 0);
                this.entity.jumpTimer = this.ai.jumpInterval * 0.5;
            }
        } else {
            this.patrol();
            if (Math.random() < 0.01) {
                this.jump();
            }
        }
    }

    updateShooterAI() {
        if (this.state === 'chase' && this.player) {
            const direction = Math.sign(this.player.pos.x - this.entity.pos.x);
            this.entity.facing = direction;

            // Keep distance and shoot
            const distance = this.entity.pos.dist(this.player.pos);
            if (distance > 100 && distance < 300) {
                // Good shooting range - stop and shoot
                if (this.entity.attackTimer <= 0) {
                    this.shoot();
                    this.entity.attackTimer = this.ai.fireRate;
                }
            } else if (distance > 300) {
                // Too far - approach
                this.entity.move(this.ai.patrolSpeed * direction * dt(), 0);
            } else {
                // Too close - back away
                this.entity.move(-this.ai.patrolSpeed * direction * dt(), 0);
            }
        } else {
            this.patrol();
        }
    }

    updateChaserAI() {
        if (this.state === 'chase' && this.player) {
            const direction = this.player.pos.sub(this.entity.pos).unit();
            this.entity.facing = Math.sign(direction.x);

            // Move toward player
            this.entity.move(this.ai.chaseSpeed * direction.x * dt(), 0);

            // Aggressive jumping
            if (this.player.pos.y < this.entity.pos.y - 50 || this.shouldJump()) {
                this.jump();
            }
        } else {
            // Fast patrol when not chasing
            this.patrol(true);
        }
    }

    updateFlyerAI() {
        if (this.state === 'chase' && this.player) {
            // Fly toward player
            const direction = this.player.pos.sub(this.entity.pos).unit();

            // Maintain height
            const targetY = this.player.pos.y - this.ai.flyHeight;
            const yDirection = Math.sign(targetY - this.entity.pos.y);

            this.entity.move(
                this.ai.patrolSpeed * direction.x * dt(),
                this.ai.patrolSpeed * yDirection * dt() * 0.5
            );

            this.entity.facing = Math.sign(direction.x);
        } else {
            // Flying pattern
            this.flyPattern();
        }
    }

    patrol(aggressive = false) {
        const speed = aggressive ? this.ai.patrolSpeed * 1.5 : this.ai.patrolSpeed;
        this.entity.move(speed * this.entity.patrolDirection * dt(), 0);

        // Turn at edges
        const nextX = this.entity.pos.x + (this.entity.patrolDirection * 50);
        if (!this.isValidPosition(nextX, this.entity.pos.y + 50)) {
            this.entity.patrolDirection *= -1;
            this.entity.facing = this.entity.patrolDirection;
        }

        // Random direction change
        if (Math.random() < 0.01) {
            this.entity.patrolDirection *= -1;
            this.entity.facing = this.entity.patrolDirection;
        }
    }

    flyPattern() {
        const time = Date.now() * 0.001;

        switch (this.ai.pattern) {
            case 'sine':
                this.entity.pos.x += Math.sin(time) * 2;
                this.entity.pos.y += Math.cos(time * 0.5) * 1;
                break;
            case 'circle':
                const radius = 50;
                this.entity.pos.x += Math.cos(time) * radius * dt();
                this.entity.pos.y += Math.sin(time) * radius * dt();
                break;
            case 'dive':
                if (Math.sin(time) > 0.8) {
                    this.entity.vel.y += 100 * dt();
                }
                break;
            default:
                this.entity.move(this.ai.patrolSpeed * this.entity.patrolDirection * dt(), 0);
        }
    }

    shouldJump() {
        // Check if there's a gap ahead
        const checkX = this.entity.pos.x + (this.entity.facing * 40);
        const checkY = this.entity.pos.y + 50;
        return !this.isValidPosition(checkX, checkY);
    }

    isValidPosition(x, y) {
        // Simple check for platform ahead
        const platforms = get('platform');
        for (const platform of platforms) {
            if (x >= platform.pos.x && x <= platform.pos.x + platform.width &&
                y >= platform.pos.y - 20 && y <= platform.pos.y + 20) {
                return true;
            }
        }
        return false;
    }

    jump() {
        if (this.entity.grounded) {
            this.entity.jump(this.ai.jumpHeight);
            GAME_UTILS.SOUNDS.jump();
        }
    }

    shoot() {
        if (this.attackCooldown > 0) return;

        const projectile = add([
            pos(
                this.entity.pos.x + (this.entity.facing * 20),
                this.entity.pos.y
            ),
            circle(5),
            color(GAME_UTILS.COLORS.neon.yellow),
            area(),
            move(0, this.ai.projectileSpeed * this.entity.facing),
            'projectile',
            'hazard',
            {
                damage: 1,
                owner: this.entity
            }
        ]);

        projectile.onCollide('platform', () => {
            destroy(projectile);
        });

        this.projectiles.push(projectile);
        this.attackCooldown = 0.5;

        GAME_UTILS.SOUNDS.glitch();
        GAME_UTILS.createExplosion(projectile.pos, GAME_UTILS.COLORS.neon.yellow, 5);
    }

    onPlayerCollision(player) {
        if (!player || !player.player) return;

        // Check if player is stomping
        const isStomping = player.player.vel.y > 100 &&
                          player.player.pos.y < this.entity.pos.y - 10;

        if (isStomping) {
            this.takeDamage(1);
            player.player.vel.y = -300; // Bounce
        } else {
            // Damage player
            player.player.takeDamage(1);

            // Knockback
            const knockbackDir = player.player.pos.sub(this.entity.pos).unit();
            player.player.vel = knockbackDir.scale(200);
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        this.entity.hitFlash = 0.3;

        // Damage effects
        GAME_UTILS.createExplosion(this.entity.pos, GAME_UTILS.COLORS.neon.red, 10);
        GAME_UTILS.shakeScreen(3, 0.1);
        GAME_UTILS.SOUNDS.hurt();

        // Knockback
        this.entity.vel.x = -this.entity.facing * 100;
        this.entity.vel.y = -100;

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        // Death effects
        GAME_UTILS.createExplosion(this.entity.pos, this.getEnemyColor(this.type), 20);
        GAME_UTILS.shakeScreen(5, 0.2);
        GAME_UTILS.SOUNDS.death();

        // Score reward
        gameState.score += this.type === 'chaser' ? 200 : 100;

        // Drop coins rarely
        if (Math.random() < 0.3) {
            const coin = add([
                pos(this.entity.pos),
                circle(8),
                color(GAME_UTILS.COLORS.neon.yellow),
                area(),
                'coin',
                {
                    value: 25
                }
            ]);
        }

        destroy(this.entity);
    }

    updateVisuals() {
        // Pulsing glow effect
        this.entity.glowIntensity = (Math.sin(this.entity.animationTimer * 5) + 1) * 0.5;

        if (this.entity.hitFlash > 0) {
            this.entity.color = rgb(255, 100, 100);
        } else {
            this.entity.color = this.getEnemyColor(this.type);
        }

        // Direction indicator
        if (this.entity.facing < 0) {
            this.entity.scale.x = -1;
        } else {
            this.entity.scale.x = 1;
        }

        // Aggressive behavior visual cues
        if (this.ai.aggressive && this.state === 'chase') {
            this.entity.color = color(255, 150, 150);
        }
    }

    updateProjectiles() {
        this.projectiles = this.projectiles.filter(p => p && p.exists());
    }

    draw() {
        if (!this.entity || !this.entity.exists()) return;

        // Enemy body
        drawRect({
            pos: this.entity.pos,
            width: this.entity.width,
            height: this.entity.height,
            color: this.entity.color,
            // Add glow effect
            outline: {
                color: this.entity.color,
                width: 2
            }
        });

        // Enemy-specific visual features
        this.drawEnemyFeatures();
    }

    drawEnemyFeatures() {
        switch (this.type) {
            case 'shooter':
                // Draw gun
                drawRect({
                    pos: vec2(
                        this.entity.pos.x + (this.entity.facing * 15),
                        this.entity.pos.y
                    ),
                    width: 15,
                    height: 8,
                    color: GAME_UTILS.COLORS.neon.magenta
                });
                break;

            case 'flyer':
                // Draw wings
                const wingFlap = Math.sin(this.entity.animationTimer * 10) * 5;
                drawRect({
                    pos: vec2(
                        this.entity.pos.x - 10,
                        this.entity.pos.y + wingFlap
                    ),
                    width: 20,
                    height: 5,
                    color: this.entity.color
                });
                drawRect({
                    pos: vec2(
                        this.entity.pos.x + 10,
                        this.entity.pos.y - wingFlap
                    ),
                    width: 20,
                    height: 5,
                    color: this.entity.color
                });
                break;

            case 'chaser':
                // Draw angry eyes
                drawCircle({
                    pos: vec2(
                        this.entity.pos.x - 5,
                        this.entity.pos.y - 5
                    ),
                    radius: 3,
                    color: rgb(255, 0, 0)
                });
                drawCircle({
                    pos: vec2(
                        this.entity.pos.x + 5,
                        this.entity.pos.y - 5
                    ),
                    radius: 3,
                    color: rgb(255, 0, 0)
                });
                break;
        }
    }
}

// Export for use in other files
globalThis.Enemy = Enemy;