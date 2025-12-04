// Hello, Rogue World! - Main Game Entry Point
// A chaotic blend of Mario physics, Cat Mario traps, and Roguelike randomness

// Initialize Kaboom.js with cyberpunk settings
kaboom({
    width: 800,
    height: 600,
    background: [0, 0, 0],
    canvas: document.getElementById('gameCanvas'),

    // Global game settings
    gravity: 1600,
    debug: false,

    // Cyberpunk visual effects
    pixelDensity: 1,
    crisp: true,

    // Global input settings
    buttons: {
        left: {
            keyboard: ["left", "a"],
        },
        right: {
            keyboard: ["right", "d"],
        },
        up: {
            keyboard: ["up", "w", "space"],
        },
        down: {
            keyboard: ["down", "s"],
        },
        jump: {
            keyboard: ["space", "up", "w"],
        },
        action: {
            keyboard: ["e", "enter"],
        },
    },

    // Global shaders and effects
    shaders: {
        // Glitch effect shader
        glitch: `
            uniform float time;
            vec4 frag(vec2 pos, vec4 color) {
                float glitch = step(0.98, sin(time * 10.0)) +
                               step(0.98, sin(time * 7.0)) *
                               vec2(sin(time * 100.0) * 0.01, 0.0);
                vec2 newPos = pos + glitch;
                return frag(newPos, color);
            }
        `,

        // Scanline effect
        scanline: `
            uniform float time;
            vec4 frag(vec2 pos, vec4 color) {
                float scanline = sin(pos.y * 1000.0 + time * 5.0) * 0.04;
                return vec4(color.rgb * (1.0 - scanline), color.a);
            }
        `
    }
});

// Global game state
globalThis.gameState = {
    // Player progression
    score: 0,
    highScore: parseInt(localStorage.getItem('hrw_highScore') || '0'),
    totalCoins: parseInt(localStorage.getItem('hrw_totalCoins') || '0'),

    // Meta-progression
    upgrades: {
        doubleJump: false,
        extraHealth: false,
        dash: false,
        magnet: false,
    },

    // Session stats
    deaths: 0,
    levelsCompleted: 0,
    lettersCollected: [],

    // Current run state
    currentLevel: 1,
    runStartTime: Date.now(),

    // Unlock flags
    unlockedSkins: ['default'],
    currentSkin: 'default',
};

// Load saved progression
function loadProgression() {
    const saved = localStorage.getItem('hrw_upgrades');
    if (saved) {
        gameState.upgrades = JSON.parse(saved);
    }

    const unlocked = localStorage.getItem('hrw_unlockedSkins');
    if (unlocked) {
        gameState.unlockedSkins = JSON.parse(unlocked);
    }
}

// Save progression
function saveProgression() {
    localStorage.setItem('hrw_upgrades', JSON.stringify(gameState.upgrades));
    localStorage.setItem('hrw_unlockedSkins', JSON.stringify(gameState.unlockedSkins));
    localStorage.setItem('hrw_highScore', gameState.highScore.toString());
    localStorage.setItem('hrw_totalCoins', gameState.totalCoins.toString());
}

// Screen shake utility
function shakeScreen(intensity = 5, duration = 0.3) {
    shake(intensity, duration);
}

// Glitch effect utility
function applyGlitch(duration = 0.2) {
    const glitchShader = getShader('glitch');
    if (glitchShader) {
        useShader(glitchShader);
        wait(duration, () => useShader(null));
    }
}

// Cyberpunk color palette
const COLORS = {
    neon: {
        cyan: '#00ffff',
        magenta: '#ff00ff',
        yellow: '#ffff00',
        green: '#00ff00',
        red: '#ff0044',
        blue: '#0088ff',
    },
    dark: {
        bg: '#0a0a0a',
        platform: '#1a1a2e',
        text: '#cccccc',
    }
};

// Game sounds (using web audio API for simple sounds)
const SOUNDS = {
    jump: () => playTone(200, 0.1),
    land: () => playTone(100, 0.05),
    coin: () => playTone(800, 0.1),
    hurt: () => playTone(100, 0.2),
    death: () => playTone(50, 0.5),
    victory: () => {
        playTone(400, 0.1);
        wait(0.1, () => playTone(500, 0.1));
        wait(0.2, () => playTone(600, 0.2));
    },
    glitch: () => playTone(100 + Math.random() * 900, 0.05),
};

// Simple tone generator for sound effects
function playTone(frequency, duration) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        // Audio not supported, fail silently
    }
}

// Utility functions for game mechanics
function lerp(start, end, t) {
    return start + (end - start) * t;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function chance(probability) {
    return Math.random() < probability;
}

function randRange(min, max) {
    return Math.random() * (max - min) + min;
}

function randChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Particle effects
function createExplosion(pos, color = COLORS.neon.magenta, count = 20) {
    for (let i = 0; i < count; i++) {
        add([
            pos(...pos),
            circle(randRange(1, 4)),
            color(color),
            lifespan(0.5),
            move(rand(0, 360), randRange(100, 300)),
            opacity(1),
            {
                update() {
                    this.opacity -= dt() * 2;
                    this.scale -= dt() * 3;
                }
            }
        ]);
    }
}

function createCollectEffect(pos, color = COLORS.neon.yellow) {
    for (let i = 0; i < 10; i++) {
        add([
            pos(...pos),
            rect(2, 2),
            color(color),
            lifespan(0.8),
            move(rand(-45, 45), randRange(50, 150)),
            {
                update() {
                    this.angle += dt() * 10;
                    this.scale -= dt();
                }
            }
        ]);
    }
}

// Initialize game
function initGame() {
    console.log('Initializing game...');

    try {
        loadProgression();
        console.log('Progression loaded');

        // Start with main menu or first level
        scene('main');
        console.log('Main scene started');

        // Save game state periodically
        loop(5, () => {
            saveProgression();
        });

        console.log('Game initialization complete');
    } catch (error) {
        console.error('Error during game initialization:', error);
        // Try to hide loading screen even if game fails
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        }, 1000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting game initialization...');
    initGame();
});

// Export global functions for other scripts
globalThis.GAME_UTILS = {
    shakeScreen,
    applyGlitch,
    createExplosion,
    createCollectEffect,
    COLORS,
    SOUNDS,
    gameState,
    saveProgression,
    loadProgression,
    playTone,
    chance,
    randRange,
    randChoice,
    lerp,
    clamp
};