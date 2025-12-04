// Game UI System - Cyberpunk/glitch art interface
// Manages all UI elements, animations, and visual feedback

class GameUI {
    constructor() {
        this.elements = {};
        this.animations = [];
        this.notifications = [];
        this.menuOpen = false;
        this.currentMenu = null;

        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        // Health display
        this.elements.healthDisplay = document.querySelector('.health-display');

        // Score display
        this.elements.scoreDisplay = document.querySelector('.score-display');

        // Letters display
        this.elements.lettersDisplay = document.querySelector('.letters-display');

        // Create custom UI elements
        this.createCustomElements();
    }

    createCustomElements() {
        // Create menu button
        const menuButton = document.createElement('div');
        menuButton.className = 'menu-button';
        menuButton.innerHTML = '⚙️';
        menuButton.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 24px;
            cursor: pointer;
            z-index: 1000;
            opacity: 0.8;
            transition: all 0.3s;
        `;
        document.body.appendChild(menuButton);
        this.elements.menuButton = menuButton;

        // Create pause menu
        const pauseMenu = document.createElement('div');
        pauseMenu.className = 'pause-menu';
        pauseMenu.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            font-family: 'Orbitron', sans-serif;
        `;
        pauseMenu.innerHTML = `
            <div class="menu-content" style="
                background: linear-gradient(135deg, #1a0033, #0a0a0a);
                border: 2px solid #00ffff;
                border-radius: 10px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 0 30px #00ffff;
                color: #00ffff;
            ">
                <h2 style="font-size: 36px; margin-bottom: 30px; text-shadow: 0 0 20px #00ffff;">
                    HELLO, ROGUE WORLD!
                </h2>
                <div class="menu-stats" style="margin-bottom: 30px; font-size: 18px;">
                    <div>Level: <span id="currentLevel">1</span></div>
                    <div>Score: <span id="currentScore">0</span></div>
                    <div>Deaths: <span id="currentDeaths">0</span></div>
                </div>
                <div class="menu-buttons">
                    <button class="menu-btn" data-action="resume" style="
                        background: #00ffff;
                        color: #0a0a0a;
                        border: none;
                        padding: 15px 30px;
                        margin: 10px;
                        font-size: 18px;
                        font-weight: bold;
                        cursor: pointer;
                        border-radius: 5px;
                        transition: all 0.3s;
                    ">RESUME</button>
                    <button class="menu-btn" data-action="restart" style="
                        background: #ff00ff;
                        color: #0a0a0a;
                        border: none;
                        padding: 15px 30px;
                        margin: 10px;
                        font-size: 18px;
                        font-weight: bold;
                        cursor: pointer;
                        border-radius: 5px;
                        transition: all 0.3s;
                    ">RESTART</button>
                    <button class="menu-btn" data-action="upgrades" style="
                        background: #ffff00;
                        color: #0a0a0a;
                        border: none;
                        padding: 15px 30px;
                        margin: 10px;
                        font-size: 18px;
                        font-weight: bold;
                        cursor: pointer;
                        border-radius: 5px;
                        transition: all 0.3s;
                    ">UPGRADES</button>
                </div>
                <div style="margin-top: 30px; font-size: 14px; opacity: 0.7;">
                    Press ESC or P to pause
                </div>
            </div>
        `;
        document.body.appendChild(pauseMenu);
        this.elements.pauseMenu = pauseMenu;

        // Create upgrades menu
        const upgradesMenu = document.createElement('div');
        upgradesMenu.className = 'upgrades-menu';
        upgradesMenu.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 3000;
            font-family: 'Orbitron', sans-serif;
            overflow-y: auto;
        `;
        upgradesMenu.innerHTML = `
            <div class="upgrades-content" style="
                background: linear-gradient(135deg, #1a0033, #0a0a0a);
                border: 2px solid #ffff00;
                border-radius: 15px;
                padding: 40px;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                color: #ffff00;
            ">
                <h2 style="font-size: 42px; margin-bottom: 30px; text-align: center; text-shadow: 0 0 20px #ffff00;">
                    UPGRADES
                </h2>
                <div style="text-align: center; margin-bottom: 30px; font-size: 20px;">
                    Total Coins: <span id="totalCoins" style="color: #00ffff;">0</span>
                </div>
                <div class="upgrade-list" id="upgradeList">
                    <!-- Upgrades will be populated here -->
                </div>
                <div style="text-align: center; margin-top: 30px;">
                    <button class="menu-btn back-btn" style="
                        background: #ff00ff;
                        color: #0a0a0a;
                        border: none;
                        padding: 15px 40px;
                        font-size: 20px;
                        font-weight: bold;
                        cursor: pointer;
                        border-radius: 8px;
                        transition: all 0.3s;
                    ">BACK</button>
                </div>
            </div>
        `;
        document.body.appendChild(upgradesMenu);
        this.elements.upgradesMenu = upgradesMenu;

        // Create notification container
        const notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 1500;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 300px;
        `;
        document.body.appendChild(notificationContainer);
        this.elements.notificationContainer = notificationContainer;
    }

    setupEventListeners() {
        // Menu button
        this.elements.menuButton.addEventListener('click', () => {
            this.togglePauseMenu();
        });

        // Pause menu buttons
        this.elements.pauseMenu.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleMenuAction(action);
            });
        });

        // Upgrades menu back button
        this.elements.upgradesMenu.querySelector('.back-btn').addEventListener('click', () => {
            this.closeUpgradesMenu();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
                e.preventDefault();
                this.togglePauseMenu();
            }
        });

        // Menu button hover effects
        this.elements.menuButton.addEventListener('mouseenter', () => {
            this.elements.menuButton.style.transform = 'scale(1.2)';
            this.elements.menuButton.style.opacity = '1';
        });

        this.elements.menuButton.addEventListener('mouseleave', () => {
            this.elements.menuButton.style.transform = 'scale(1)';
            this.elements.menuButton.style.opacity = '0.8';
        });

        // Menu button hover effects
        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.1)';
                btn.style.boxShadow = '0 0 20px currentColor';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
                btn.style.boxShadow = 'none';
            });
        });
    }

    togglePauseMenu() {
        this.menuOpen = !this.menuOpen;

        if (this.menuOpen) {
            this.openPauseMenu();
        } else {
            this.closePauseMenu();
        }
    }

    openPauseMenu() {
        this.menuOpen = true;
        this.elements.pauseMenu.style.display = 'flex';
        this.updatePauseMenuStats();

        // Add glitch effect
        GAME_UTILS.applyGlitch(0.2);

        // Pause game
        if (typeof pauseGame === 'function') {
            pauseGame();
        }
    }

    closePauseMenu() {
        this.menuOpen = false;
        this.elements.pauseMenu.style.display = 'none';

        // Resume game
        if (typeof resumeGame === 'function') {
            resumeGame();
        }
    }

    updatePauseMenuStats() {
        document.getElementById('currentLevel').textContent = gameState.currentLevel;
        document.getElementById('currentScore').textContent = gameState.score;
        document.getElementById('currentDeaths').textContent = gameState.deaths;
    }

    handleMenuAction(action) {
        switch (action) {
            case 'resume':
                this.closePauseMenu();
                break;
            case 'restart':
                this.restartGame();
                break;
            case 'upgrades':
                this.openUpgradesMenu();
                break;
        }
    }

    openUpgradesMenu() {
        this.elements.pauseMenu.style.display = 'none';
        this.elements.upgradesMenu.style.display = 'flex';
        this.populateUpgrades();
        this.currentMenu = 'upgrades';
    }

    closeUpgradesMenu() {
        this.elements.upgradesMenu.style.display = 'none';
        this.elements.pauseMenu.style.display = 'flex';
        this.currentMenu = 'pause';
    }

    populateUpgrades() {
        const upgradeList = document.getElementById('upgradeList');
        document.getElementById('totalCoins').textContent = gameState.totalCoins;

        const upgrades = [
            {
                id: 'doubleJump',
                name: 'DOUBLE JUMP',
                description: 'Jump twice in mid-air',
                cost: 100,
                purchased: gameState.upgrades.doubleJump,
                icon: '🦘'
            },
            {
                id: 'extraHealth',
                name: 'EXTRA HEALTH',
                description: '+1 maximum health',
                cost: 150,
                purchased: gameState.upgrades.extraHealth,
                icon: '❤️'
            },
            {
                id: 'dash',
                name: 'DASH ABILITY',
                description: 'Quick dash through enemies',
                cost: 200,
                purchased: gameState.upgrades.dash,
                icon: '⚡'
            },
            {
                id: 'magnet',
                name: 'COIN MAGNET',
                description: 'Attract nearby coins',
                cost: 125,
                purchased: gameState.upgrades.magnet,
                icon: '🧲'
            },
            {
                id: 'speedBoost',
                name: 'SPEED BOOST',
                description: '20% faster movement',
                cost: 175,
                purchased: gameState.upgrades.speedBoost,
                icon: '💨'
            }
        ];

        upgradeList.innerHTML = '';

        upgrades.forEach(upgrade => {
            const upgradeElement = document.createElement('div');
            upgradeElement.className = 'upgrade-item';
            upgradeElement.style.cssText = `
                background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1));
                border: 2px solid ${upgrade.purchased ? '#00ff00' : '#ffff00'};
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                transition: all 0.3s;
                position: relative;
                overflow: hidden;
            `;

            if (upgrade.purchased) {
                upgradeElement.style.borderColor = '#00ff00';
                upgradeElement.style.background = 'linear-gradient(135deg, rgba(0, 255, 0, 0.2), rgba(0, 100, 0, 0.1))';
            }

            upgradeElement.innerHTML = `
                <div class="upgrade-info" style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                        <span style="font-size: 32px;">${upgrade.icon}</span>
                        <h3 style="margin: 0; font-size: 24px; color: ${upgrade.purchased ? '#00ff00' : '#ffff00'};">
                            ${upgrade.name}
                            ${upgrade.purchased ? ' ✓' : ''}
                        </h3>
                    </div>
                    <p style="margin: 0; font-size: 14px; opacity: 0.8;">${upgrade.description}</p>
                </div>
                <div class="upgrade-cost" style="text-align: center; margin-left: 20px;">
                    ${upgrade.purchased ?
                        '<span style="color: #00ff00; font-size: 20px;">OWNED</span>' :
                        `<div style="color: #ffff00; font-size: 20px; font-weight: bold;">
                            ${upgrade.cost}
                            <div style="font-size: 12px;">COINS</div>
                        </div>`
                    }
                    ${!upgrade.purchased ? `
                        <button class="buy-btn" data-upgrade="${upgrade.id}" style="
                            background: ${gameState.totalCoins >= upgrade.cost ? '#00ff00' : '#ff0000'};
                            color: #0a0a0a;
                            border: none;
                            padding: 10px 20px;
                            margin-top: 10px;
                            font-size: 16px;
                            font-weight: bold;
                            cursor: pointer;
                            border-radius: 5px;
                            transition: all 0.3s;
                        " ${gameState.totalCoins < upgrade.cost ? 'disabled' : ''}>
                            BUY
                        </button>
                    ` : ''}
                </div>
            `;

            // Add hover effect
            upgradeElement.addEventListener('mouseenter', () => {
                if (!upgrade.purchased) {
                    upgradeElement.style.transform = 'scale(1.02)';
                    upgradeElement.style.boxShadow = '0 0 20px #ffff00';
                }
            });

            upgradeElement.addEventListener('mouseleave', () => {
                upgradeElement.style.transform = 'scale(1)';
                upgradeElement.style.boxShadow = 'none';
            });

            upgradeList.appendChild(upgradeElement);
        });

        // Setup buy buttons
        upgradeList.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const upgradeId = e.target.dataset.upgrade;
                this.purchaseUpgrade(upgradeId, upgrades.find(u => u.id === upgradeId));
            });
        });
    }

    purchaseUpgrade(upgradeId, upgradeData) {
        if (gameState.totalCoins < upgradeData.cost) {
            this.showNotification('Not enough coins!', 'error');
            return;
        }

        if (gameState.upgrades[upgradeId]) {
            this.showNotification('Already owned!', 'info');
            return;
        }

        // Purchase upgrade
        gameState.totalCoins -= upgradeData.cost;
        gameState.upgrades[upgradeId] = true;

        // Save progression
        GAME_UTILS.saveProgression();

        // Update UI
        this.populateUpgrades();
        this.showNotification(`${upgradeData.name} purchased!`, 'success');

        // Apply upgrade effects
        this.applyUpgradeEffects(upgradeId);
    }

    applyUpgradeEffects(upgradeId) {
        switch (upgradeId) {
            case 'doubleJump':
                // Update player jump count
                const player = get('player')[0];
                if (player && player.player) {
                    player.player.maxJumps = 2;
                }
                break;

            case 'extraHealth':
                // Update player max health
                const player2 = get('player')[0];
                if (player2 && player.player) {
                    player2.player.maxHealth = 4;
                    player2.player.health = 4;
                    this.updateHealthDisplay();
                }
                break;

            case 'dash':
                // Enable dash ability
                const player3 = get('player')[0];
                if (player3 && player.player) {
                    player3.player.dashCooldown = 0;
                }
                break;
        }

        // Visual feedback
        GAME_UTILS.createExplosion(vec2(width() / 2, height() / 2), GAME_UTILS.COLORS.neon.yellow, 30);
        GAME_UTILS.shakeScreen(5, 0.3);
        GAME_UTILS.SOUNDS.victory();
    }

    restartGame() {
        gameState.currentLevel = 1;
        gameState.lettersCollected = [];
        gameState.deaths = 0;
        this.closePauseMenu();

        // Restart scene
        scene('main');
    }

    updateHealthDisplay(health, maxHealth) {
        if (!this.elements.healthDisplay) return;

        let hearts = '';
        for (let i = 0; i < maxHealth; i++) {
            if (i < health) {
                hearts += '❤️';
            } else {
                hearts += '🖤';
            }
        }

        this.elements.healthDisplay.textContent = hearts;

        // Add pulse animation
        this.elements.healthDisplay.style.animation = 'pulse 0.3s ease-out';
        setTimeout(() => {
            this.elements.healthDisplay.style.animation = 'glitch 2s infinite';
        }, 300);
    }

    updateScoreDisplay(score) {
        if (!this.elements.scoreDisplay) return;

        // Animate number change
        const currentScore = parseInt(this.elements.scoreDisplay.textContent.replace('SCORE: ', ''));
        const targetScore = score;
        const diff = targetScore - currentScore;
        const steps = 20;
        const stepValue = diff / steps;
        let currentStep = 0;

        const animation = setInterval(() => {
            currentStep++;
            const displayScore = Math.floor(currentScore + stepValue * currentStep);
            this.elements.scoreDisplay.textContent = `SCORE: ${displayScore}`;

            if (currentStep >= steps) {
                clearInterval(animation);
                this.elements.scoreDisplay.textContent = `SCORE: ${targetScore}`;
            }
        }, 30);

        // Add glow effect for score increases
        if (diff > 0) {
            this.elements.scoreDisplay.style.textShadow = '0 0 20px #ff00ff';
            setTimeout(() => {
                this.elements.scoreDisplay.style.textShadow = '0 0 10px #ff00ff';
            }, 1000);
        }
    }

    updateLettersDisplay(letters) {
        const letterElements = document.querySelectorAll('.letter');
        letterElements.forEach(element => {
            const letter = element.dataset.letter;
            if (letters.includes(letter)) {
                element.classList.add('collected');
            }
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const colors = {
            info: '#00ffff',
            success: '#00ff00',
            error: '#ff0000',
            warning: '#ffff00'
        };

        notification.style.cssText = `
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid ${colors[type]};
            border-radius: 8px;
            padding: 15px 20px;
            color: ${colors[type]};
            font-family: 'Orbitron', sans-serif;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 0 20px ${colors[type]};
            animation: slideInRight 0.3s ease-out;
            z-index: 2000;
        `;

        notification.textContent = message;

        this.elements.notificationContainer.appendChild(notification);

        // Auto-remove after delay
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showDeathScreen() {
        const deathScreen = document.createElement('div');
        deathScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 4000;
            font-family: 'Orbitron', sans-serif;
        `;

        deathScreen.innerHTML = `
            <div style="
                text-align: center;
                color: #ff0000;
                animation: glitch 0.5s infinite;
            ">
                <h1 style="
                    font-size: 72px;
                    margin-bottom: 20px;
                    text-shadow: 0 0 30px #ff0000;
                ">YOU DIED!</h1>
                <div style="font-size: 24px; margin-bottom: 30px; color: #ff00ff;">
                    Deaths: ${gameState.deaths}
                </div>
                <button id="retryBtn" style="
                    background: #ff0000;
                    color: #0a0a0a;
                    border: none;
                    padding: 20px 40px;
                    font-size: 24px;
                    font-weight: bold;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                ">TRY AGAIN</button>
            </div>
        `;

        document.body.appendChild(deathScreen);

        document.getElementById('retryBtn').addEventListener('click', () => {
            document.body.removeChild(deathScreen);
            scene('main');
        });

        // Auto-retry after delay
        setTimeout(() => {
            if (document.body.contains(deathScreen)) {
                document.body.removeChild(deathScreen);
                scene('main');
            }
        }, 5000);
    }

    // Initialize the UI system
    init() {
        // Add custom styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }

            .notification {
                transform-origin: right center;
            }

            .menu-btn:hover:active {
                transform: scale(0.95);
            }

            .buy-btn:hover:active {
                transform: scale(0.95);
            }

            .buy-btn:disabled {
                cursor: not-allowed;
                opacity: 0.5;
            }
        `;
        document.head.appendChild(style);

        this.showNotification('Game initialized!', 'info');
    }
}

// Export for use in other files
globalThis.GameUI = GameUI;