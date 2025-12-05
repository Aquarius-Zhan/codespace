// Trap System - Cat Mario-style traps with psychological warfare
// Implements various trap types that punish inexperience and reward memorization

class TrapSystem {
    constructor(scene) {
        this.scene = scene;
        this.traps = [];
        this.activeTriggers = [];
        this.globalEffectTimer = 0;
        this.trapEffects = [];

        this.initializeTrapTypes();
    }

    initializeTrapTypes() {
        this.trapTypes = {
            // Classic Cat Mario traps
            invisible_block: {
                create: this.createInvisibleBlock.bind(this),
                trigger: this.triggerInvisibleBlock.bind(this),
                update: this.updateInvisibleBlock.bind(this)
            },
            fake_platform: {
                create: this.createFakePlatform.bind(this),
                trigger: this.triggerFakePlatform.bind(this),
                update: this.updateFakePlatform.bind(this)
            },
            spikes: {
                create: this.createSpikes.bind(this),
                trigger: this.triggerSpikes.bind(this),
                update: this.updateSpikes.bind(this)
            },

            // Moving hazards
            saw: {
                create: this.createSaw.bind(this),
                trigger: this.triggerMovingHazard.bind(this),
                update: this.updateMovingHazard.bind(this)
            },
            laser: {
                create: this.createLaser.bind(this),
                trigger: this.triggerMovingHazard.bind(this),
                update: this.updateMovingHazard.bind(this)
            },
            spike_ball: {
                create: this.createSpikeBall.bind(this),
                trigger: this.triggerMovingHazard.bind(this),
                update: this.updateMovingHazard.bind(this)
            },

            // Trigger-based traps
            trigger: {
                create: this.createTrigger.bind(this),
                trigger: this.triggerSystemTrigger.bind(this),
                update: this.updateTrigger.bind(this)
            },

            // Environmental hazards
            falling_block: {
                create: this.createFallingBlock.bind(this),
                trigger: this.triggerFallingBlock.bind(this),
                update: this.updateFallingBlock.bind(this)
            },
            crushing_walls: {
                create: this.createCrushingWalls.bind(this),
                trigger: this.triggerCrushingWalls.bind(this),
                update: this.updateCrushingWalls.bind(this)
            },

            // Psychological traps
            fake_pickup: {
                create: this.createFakePickup.bind(this),
                trigger: this.triggerFakePickup.bind(this),
                update: this.updateFakePickup.bind(this)
            },
            teleport_trap: {
                create: this.createTeleportTrap.bind(this),
                trigger: this.triggerTeleportTrap.bind(this),
                update: this.updateTeleportTrap.bind(this)
            },

            // Visual deception traps
            illusion_platform: {
                create: this.createIllusionPlatform.bind(this),
                trigger: this.triggerIllusionPlatform.bind(this),
                update: this.updateIllusionPlatform.bind(this)
            },
            mimic_enemy: {
                create: this.createMimicEnemy.bind(this),
                trigger: this.triggerMimicEnemy.bind(this),
                update: this.updateMimicEnemy.bind(this)
            }
        };
    }

    // Create all traps from level data
    createTraps(trapData) {
        trapData.forEach(trapInfo => {
            const trapType = this.trapTypes[trapInfo.type];
            if (trapType) {
                const trap = trapType.create(trapInfo);
                this.traps.push(trap);
            }
        });
    }

    // INVISIBLE BLOCKS - The most cruel trap
    createInvisibleBlock(data) {
        const invisibleBlock = this.scene.add([
            pos(data.x, data.y),
            rect(data.width, data.height),
            color(255, 255, 255, 0), // Completely invisible
            area(),
            body({ isStatic: true }),
            'trap',
            'invisible_block',
            {
                trapType: 'invisible_block',
                visibility: 0,
                revealed: false,
                triggerOnce: data.triggerOnce || true,
                flashDuration: 0.3,
                originalColor: color(255, 255, 255, 0),
                revealColor: color(255, 100, 100, 255),
                playerHitCount: 0
            }
        ]);

        invisibleBlock.onCollide('player', () => {
            this.triggerInvisibleBlock(invisibleBlock);
        });

        return invisibleBlock;
    }

    triggerInvisibleBlock(block) {
        if (block.revealed && block.triggerOnce) return;

        block.revealed = true;
        block.playerHitCount++;

        // Visual reveal with glitch effect
        block.color = block.revealColor;
        GAME_UTILS.shakeScreen(6, 0.2);
        GAME_UTILS.applyGlitch(0.2);

        // Sound effect
        GAME_UTILS.SOUNDS.glitch();

        // Create reveal effect
        this.createRevealEffect(block.pos, block.width, block.height);

        // Player feedback - knockback and potential damage
        const player = get('player')[0];
        if (player && player.player) {
            player.player.vel.x = (player.player.pos.x > block.pos.x) ? 150 : -150;
            player.player.vel.y = -100;

            // Damage based on hit count (subtle psychological element)
            if (block.playerHitCount > 2) {
                player.player.takeDamage(1);
            }
        }

        // Fade out after reveal
        wait(block.flashDuration, () => {
            if (block && block.exists()) {
                block.opacity = 0.7;
                block.color = color(255, 150, 150, 180);
            }
        });

        wait(2, () => {
            if (block && block.exists()) {
                destroy(block);
            }
        });
    }

    updateInvisibleBlock(block) {
        // Subtle hint for observant players - occasional flicker
        if (!block.revealed && Math.random() < 0.001) {
            block.opacity = 0.1;
            wait(0.05, () => {
                if (block && block.exists()) {
                    block.opacity = 0;
                }
            });
        }
    }

    // FAKE PLATFORMS - Look safe but break
    createFakePlatform(data) {
        const fakePlatform = this.scene.add([
            pos(data.x, data.y),
            rect(data.width, data.height),
            color(GAME_UTILS.COLORS.neon.cyan),
            area(),
            body({ isStatic: true }),
            'trap',
            'fake_platform',
            'platform',
            {
                trapType: 'fake_platform',
                cracks: 0,
                maxCracks: 3,
                breaksOnTouch: data.breaksOnTouch !== false,
                delayBeforeBreak: data.delayBeforeBreak || 0.2,
                breaking: false,
                breakTimer: 0,
                shakeIntensity: 0,
                originalColor: GAME_UTILS.COLORS.neon.cyan,
                crackPositions: []
            }
        ]);

        fakePlatform.onCollide('player', () => {
            if (!fakePlatform.breaking) {
                this.triggerFakePlatform(fakePlatform);
            }
        });

        return fakePlatform;
    }

    triggerFakePlatform(platform) {
        if (platform.breaking) return;

        platform.breaking = true;
        platform.breakTimer = platform.delayBeforeBreak;
        platform.cracks++;

        // Visual feedback
        GAME_UTILS.shakeScreen(2, 0.1);
        GAME_UTILS.SOUNDS.glitch();

        // Create crack effect
        this.createCrackEffect(platform);

        // Shake platform
        platform.shakeIntensity = 3;

        if (platform.cracks >= platform.maxCracks) {
            // Final break
            wait(platform.breakTimer, () => {
                if (platform && platform.exists()) {
                    this.breakFakePlatform(platform);
                }
            });
        } else {
            // Just damaged, not broken yet
            platform.color = color(200, 100, 100);
            wait(0.5, () => {
                if (platform && platform.exists()) {
                    platform.color = platform.originalColor;
                    platform.breaking = false;
                }
            });
        }
    }

    breakFakePlatform(platform) {
        // Create debris
        for (let i = 0; i < 8; i++) {
            const debris = this.scene.add([
                pos(
                    platform.pos.x + platform.width / 2 + GAME_UTILS.randRange(-platform.width / 2, platform.width / 2),
                    platform.pos.y + platform.height / 2
                ),
                rect(GAME_UTILS.randRange(4, 12), GAME_UTILS.randRange(4, 8)),
                color(GAME_UTILS.COLORS.neon.cyan),
                area(),
                body(),
                lifespan(1),
                'trap_debris'
            ]);

            debris.vel = vec2(
                GAME_UTILS.randRange(-200, 200),
                GAME_UTILS.randRange(-300, -100)
            );

            debris.angle = GAME_UTILS.randRange(0, 360);
            debris.angularVel = GAME_UTILS.randRange(-5, 5);
        }

        // Screen effects
        GAME_UTILS.shakeScreen(4, 0.2);
        GAME_UTILS.applyGlitch(0.3);

        // Player fall through
        const player = get('player')[0];
        if (player && player.player) {
            player.player.vel.y += 100; // Extra downward force
        }

        destroy(platform);
    }

    updateFakePlatform(platform) {
        if (platform.shakeIntensity > 0) {
            platform.shakeIntensity *= 0.9;
            platform.pos.x += Math.random() * platform.shakeIntensity - platform.shakeIntensity / 2;
        }
    }

    // SPIKES - Classic but with twists
    createSpikes(data) {
        const spikeCount = Math.floor(data.width / 20);
        const spikes = [];

        for (let i = 0; i < spikeCount; i++) {
            const spike = this.scene.add([
                pos(data.x + i * 20, data.y),
                polygon([vec2(0, 0), vec2(10, 0), vec2(5, data.height)]),
                color(GAME_UTILS.COLORS.neon.red),
                area(),
                'trap',
                'hazard',
                'spikes',
                {
                    trapType: 'spikes',
                    damage: data.damage || 1,
                    retractable: data.retractable || false,
                    retracted: false,
                    retractTimer: 0,
                    retractSpeed: data.retractSpeed || 2,
                    glowIntensity: 0
                }
            ]);

            spike.onCollide('player', () => {
                this.triggerSpikes(spike);
            });

            spikes.push(spike);
        }

        return spikes;
    }

    triggerSpikes(spike) {
        const player = get('player')[0];
        if (player && player.player && !player.player.invincible) {
            player.player.takeDamage(spike.damage);

            // Knockback
            player.player.vel.x = (player.player.pos.x > spike.pos.x) ? 200 : -200;
            player.player.vel.y = -200;

            // Visual effect
            GAME_UTILS.createExplosion(spike.pos, GAME_UTILS.COLORS.neon.red, 10);
            GAME_UTILS.shakeScreen(5, 0.2);
        }
    }

    updateSpikes(spike) {
        // Retractable spikes animation
        if (spike.retractable) {
            spike.retractTimer += dt();
            if (spike.retractTimer > 3) {
                spike.retracted = !spike.retracted;
                spike.retractTimer = 0;
            }

            // Smooth animation
            const targetScale = spike.retracted ? 0.2 : 1;
            spike.scale.y = lerp(spike.scale.y || 1, targetScale, dt() * spike.retractSpeed);
        }

        // Pulsing glow effect
        spike.glowIntensity = (Math.sin(Date.now() * 0.005) + 1) * 0.5;
        if (spike.glowIntensity > 0.8) {
            spike.color = color(255, 100 + spike.glowIntensity * 155, 100);
        } else {
            spike.color = GAME_UTILS.COLORS.neon.red;
        }
    }

    // MOVING HAZARDS
    createSaw(data) {
        const saw = this.scene.add([
            pos(data.startX || data.x, data.startY || data.y),
            circle(data.width / 2),
            color(GAME_UTILS.COLORS.neon.red),
            area(),
            body(),
            'trap',
            'hazard',
            {
                trapType: 'saw',
                damage: data.damage || 1,
                moveType: data.moveType || 'horizontal',
                startX: data.startX || data.x,
                endX: data.endX || (data.x + data.width),
                startY: data.startY || data.y,
                endY: data.endY || (data.y + data.height),
                speed: data.speed || 100,
                predictable: data.predictable || false,
                rotation: 0,
                angularSpeed: 10
            }
        ]);

        saw.onCollide('player', () => {
            this.triggerMovingHazard(saw);
        });

        return saw;
    }

    createLaser(data) {
        const laser = this.scene.add([
            pos(data.startX || data.x, data.startY || data.y),
            rect(data.width || 30, data.height || 5),
            color(GAME_UTILS.COLORS.neon.magenta),
            area(),
            'trap',
            'hazard',
            {
                trapType: 'laser',
                damage: data.damage || 2,
                moveType: data.moveType || 'vertical',
                startX: data.startX || data.x,
                endX: data.endX || (data.x + data.width),
                startY: data.startY || data.y,
                endY: data.endY || (data.y + data.height),
                speed: data.speed || 150,
                predictable: data.predictable || true,
                pulsePhase: Math.random() * Math.PI * 2,
                active: true,
                activeTimer: 0
            }
        ]);

        laser.onCollide('player', () => {
            this.triggerMovingHazard(laser);
        });

        return laser;
    }

    createSpikeBall(data) {
        const spikeBall = this.scene.add([
            pos(data.startX || data.x, data.startY || data.y),
            circle(data.width / 2),
            color(GAME_UTILS.COLORS.neon.yellow),
            area(),
            body(),
            'trap',
            'hazard',
            {
                trapType: 'spike_ball',
                damage: data.damage || 2,
                moveType: data.moveType || 'circular',
                centerX: data.startX || data.x,
                centerY: data.startY || data.y,
                radius: data.radius || 100,
                angle: 0,
                angularSpeed: data.speed || 2,
                spikeCount: 8,
                spikeLength: 10
            }
        ]);

        spikeBall.onCollide('player', () => {
            this.triggerMovingHazard(spikeBall);
        });

        return spikeBall;
    }

    triggerMovingHazard(hazard) {
        const player = get('player')[0];
        if (player && player.player && !player.player.invincible) {
            player.player.takeDamage(hazard.damage);

            // Directional knockback based on hazard type
            if (hazard.trapType === 'saw' || hazard.trapType === 'spike_ball') {
                const direction = player.player.pos.sub(hazard.pos).unit();
                player.player.vel = direction.scale(300);
            } else if (hazard.trapType === 'laser') {
                player.player.vel.x = (player.player.pos.x > hazard.pos.x) ? 250 : -250;
                player.player.vel.y = -150;
            }

            // Hazard-specific effects
            if (hazard.trapType === 'saw') {
                hazard.angularSpeed = 20; // Spin faster on hit
            } else if (hazard.trapType === 'laser') {
                hazard.active = false; // Laser deactivates after hit
                wait(1, () => {
                    if (hazard && hazard.exists()) {
                        hazard.active = true;
                    }
                });
            }

            GAME_UTILS.createExplosion(hazard.pos, GAME_UTILS.COLORS.neon.red, 15);
            GAME_UTILS.shakeScreen(6, 0.3);
        }
    }

    updateMovingHazard(hazard) {
        switch (hazard.trapType) {
            case 'saw':
                this.updateSaw(hazard);
                break;
            case 'laser':
                this.updateLaser(hazard);
                break;
            case 'spike_ball':
                this.updateSpikeBall(hazard);
                break;
        }
    }

    updateSaw(saw) {
        // Movement
        if (saw.moveType === 'horizontal') {
            saw.move(saw.speed * dt(), 0);
            if (saw.pos.x >= saw.endX || saw.pos.x <= saw.startX) {
                saw.speed = -saw.speed;
            }
        } else if (saw.moveType === 'vertical') {
            saw.move(0, saw.speed * dt());
            if (saw.pos.y >= saw.endY || saw.pos.y <= saw.startY) {
                saw.speed = -saw.speed;
            }
        }

        // Rotation
        saw.rotation += dt() * saw.angularSpeed;
    }

    updateLaser(laser) {
        // Pulsing activation
        laser.activeTimer += dt();
        const pulse = Math.sin(laser.activeTimer * 3 + laser.pulsePhase);
        laser.active = pulse > 0;

        if (laser.active) {
            laser.opacity = 1;
            laser.color = GAME_UTILS.COLORS.neon.magenta;
        } else {
            laser.opacity = 0.3;
            laser.color = color(100, 50, 100);
        }

        // Movement
        if (laser.moveType === 'vertical') {
            laser.move(0, laser.speed * dt() * pulse);
            if (laser.pos.y >= laser.endY || laser.pos.y <= laser.startY) {
                laser.speed = -laser.speed;
            }
        }
    }

    updateSpikeBall(spikeBall) {
        // Circular motion
        spikeBall.angle += dt() * spikeBall.angularSpeed;
        const targetX = spikeBall.centerX + Math.cos(spikeBall.angle) * spikeBall.radius;
        const targetY = spikeBall.centerY + Math.sin(spikeBall.angle) * spikeBall.radius;
        spikeBall.pos = vec2(targetX, targetY);
    }

    // TRIGGER SYSTEM
    createTrigger(data) {
        const trigger = this.scene.add([
            pos(data.x, data.y),
            rect(data.width, data.height),
            color(255, 255, 0, 0.5), // Subtle yellow indicator
            area(),
            'trap',
            'trigger',
            {
                trapType: 'trigger',
                triggered: false,
                effects: data.effects || [],
                triggerOnce: data.triggerOnce !== false,
                cooldown: 0
            }
        ]);

        trigger.onCollide('player', () => {
            this.triggerSystemTrigger(trigger);
        });

        return trigger;
    }

    triggerSystemTrigger(trigger) {
        if (trigger.triggered && trigger.triggerOnce) return;
        if (trigger.cooldown > 0) return;

        trigger.triggered = true;
        trigger.cooldown = 1;

        // Visual feedback
        trigger.color = color(255, 100, 0);
        GAME_UTILS.shakeScreen(3, 0.2);
        GAME_UTILS.applyGlitch(0.2);

        // Execute effects with delays
        trigger.effects.forEach((effect, index) => {
            wait(effect.delay || 0, () => {
                this.executeTriggerEffect(effect);
            });
        });

        // Reset trigger
        if (!trigger.triggerOnce) {
            wait(2, () => {
                if (trigger && trigger.exists()) {
                    trigger.triggered = false;
                    trigger.color = color(255, 255, 0, 0.5);
                }
            });
        }
    }

    executeTriggerEffect(effect) {
        switch (effect.type) {
            case 'spawn_enemy':
                this.spawnTriggerEnemy(effect.parameters);
                break;
            case 'drop_spikes':
                this.dropTriggerSpikes(effect.parameters);
                break;
            case 'close_walls':
                this.closeTriggerWalls(effect.parameters);
                break;
            case 'teleport_player':
                this.teleportTriggerPlayer(effect.parameters);
                break;
            case 'screen_glitch':
                this.screenGlitchEffect(effect.parameters);
                break;
        }
    }

    spawnTriggerEnemy(params) {
        const enemyType = params.type || 'walker';
        const x = params.x || (get('player')[0]?.pos.x || 400);
        const y = params.y || 200;

        const enemy = this.scene.add([
            pos(x, y),
            rect(30, 30),
            color(GAME_UTILS.COLORS.neon.red),
            area(),
            body(),
            'enemy',
            {
                type: enemyType,
                ai: this.getEnemyAI(enemyType),
                triggered: true
            }
        ]);

        // Spawn effect
        GAME_UTILS.createExplosion(vec2(x, y), GAME_UTILS.COLORS.neon.red, 20);
        GAME_UTILS.shakeScreen(5, 0.3);
    }

    dropTriggerSpikes(params) {
        const count = params.count || 5;
        const startX = params.startX || 300;
        const spacing = params.spacing || 40;

        for (let i = 0; i < count; i++) {
            const spike = this.scene.add([
                pos(startX + i * spacing, -50),
                rect(20, 30),
                color(GAME_UTILS.COLORS.neon.red),
                area(),
                body(),
                'trap',
                'hazard',
                {
                    trapType: 'falling_spikes',
                    damage: params.damage || 1,
                    falling: true,
                    vel: vec2(0, 0)
                }
            ]);

            // Gravity for falling
            spike.gravityScale = 3;
        }

        GAME_UTILS.shakeScreen(4, 0.5);
    }

    // Helper methods
    createRevealEffect(pos, width, height) {
        for (let i = 0; i < 10; i++) {
            const particle = this.scene.add([
                pos(
                    pos.x + width / 2,
                    pos.y + height / 2
                ),
                circle(GAME_UTILS.randRange(2, 6)),
                color(255, 100, 100),
                lifespan(0.5),
                move(rand(0, 360), GAME_UTILS.randRange(50, 150))
            ]);
        }
    }

    createCrackEffect(platform) {
        // Visual crack representation
        const crackCount = GAME_UTILS.randRange(1, 3);
        for (let i = 0; i < crackCount; i++) {
            const crack = this.scene.add([
                pos(
                    platform.pos.x + GAME_UTILS.randRange(0, platform.width),
                    platform.pos.y + GAME_UTILS.randRange(0, platform.height)
                ),
                rect(GAME_UTILS.randRange(2, 8), 1),
                color(100, 50, 50),
                'crack'
            ]);
            crack.angle = GAME_UTILS.randRange(-45, 45);
        }
    }

    getEnemyAI(type) {
        // Basic AI patterns
        return {
            moveSpeed: GAME_UTILS.randRange(50, 100),
            jumpHeight: GAME_UTILS.randRange(100, 200),
            detectionRange: GAME_UTILS.randRange(200, 400)
        };
    }

    // Update all traps
    update() {
        this.traps.forEach(trap => {
            if (trap && trap.exists()) {
                const trapType = this.trapTypes[trap.trapType];
                if (trapType && trapType.update) {
                    trapType.update(trap);
                }

                // Update cooldowns
                if (trap.cooldown !== undefined) {
                    trap.cooldown = max(0, trap.cooldown - dt());
                }
            }
        });

        // Cleanup destroyed traps
        this.traps = this.traps.filter(trap => trap && trap.exists());

        // Update global effects
        this.updateGlobalEffects();
    }

    updateGlobalEffects() {
        this.globalEffectTimer += dt();

        // Subtle environmental effects
        if (Math.random() < 0.001) {
            this.createEnvironmentalGlitch();
        }
    }

    createEnvironmentalGlitch() {
        // Random screen flicker
        GAME_UTILS.applyGlitch(0.05);

        // Random color shift
        const colors = [
            GAME_UTILS.COLORS.neon.cyan,
            GAME_UTILS.COLORS.neon.magenta,
            GAME_UTILS.COLORS.neon.yellow
        ];

        get('platform').forEach(platform => {
            if (Math.random() < 0.1) {
                const originalColor = platform.color;
                platform.color = GAME_UTILS.randChoice(colors);
                wait(0.1, () => {
                    if (platform && platform.exists()) {
                        platform.color = originalColor;
                    }
                });
            }
        });
    }

    // Debug methods
    revealAllTraps() {
        this.traps.forEach(trap => {
            if (trap.trapType === 'invisible_block' && !trap.revealed) {
                trap.opacity = 0.3;
                trap.color = color(255, 200, 200, 100);
            }
        });
    }
}

// Export for use in other files
globalThis.TrapSystem = TrapSystem;