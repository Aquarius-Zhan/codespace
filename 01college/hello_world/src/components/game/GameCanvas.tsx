import { useEffect, useRef, useState } from 'react';
import type { Difficulty } from '@/types/types';
import { GAME_CONFIG } from '@/game/constants';
import { Card } from '@/components/ui/card';

interface GameCanvasProps {
  difficulty: Difficulty;
  onLevelComplete: (collectedItems: string[], playerStats: PlayerStats) => void;
  onDeath: () => void;
  currentLevel: number;
}

interface PlayerStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
}

export function GameCanvas({ difficulty, onLevelComplete, onDeath, currentLevel }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [collectedItems, setCollectedItems] = useState<string[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    attack: 10,
    defense: 5,
  });
  
  const gameStateRef = useRef({
    player: { x: 50, y: 400, vx: 0, vy: 0, width: GAME_CONFIG.PLAYER_SIZE, height: GAME_CONFIG.PLAYER_SIZE },
    platforms: [] as Array<{ x: number; y: number; width: number; height: number }>,
    traps: [] as Array<{ x: number; y: number; width: number; height: number; type: string; time: number }>,
    items: [] as Array<{ x: number; y: number; width: number; height: number; letter: string; collected: boolean }>,
    goal: { x: 750, y: 100, width: 40, height: 40 },
    keys: { left: false, right: false, up: false },
    isGrounded: false,
    jumpCount: 0,
    startTime: Date.now(),
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;
    
    generateLevel(state, difficulty, currentLevel);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') state.keys.left = true;
      if (e.key === 'ArrowRight') state.keys.right = true;
      if (e.key === 'ArrowUp' || e.key === ' ') {
        e.preventDefault();
        state.keys.up = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') state.keys.left = false;
      if (e.key === 'ArrowRight') state.keys.right = false;
      if (e.key === 'ArrowUp' || e.key === ' ') state.keys.up = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationId: number;
    let lastTime = Date.now();

    const gameLoop = () => {
      const now = Date.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      update(state, dt, difficulty, setPlayerStats);
      render(ctx, state, currentLevel);

      const collected = state.items.filter(item => item.collected).map(item => item.letter);
      if (collected.length !== collectedItems.length) {
        setCollectedItems(collected);
      }

      if (checkGoalReached(state)) {
        // 所有关卡完成时都调用onLevelComplete，让父组件决定如何处理
        onLevelComplete(collected, playerStats);
        return;
      }

      if (checkDeath(state)) {
        onDeath();
        return;
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [difficulty, currentLevel, onLevelComplete, onDeath]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 属性状态栏 */}
      <Card className="w-full max-w-[800px] p-4 bg-card/50 backdrop-blur">
        <div className="grid grid-cols-2 gap-4">
          {/* HP条 */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-red-500">❤️ HP</span>
              <span>{playerStats.hp}/{playerStats.maxHp}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${(playerStats.hp / playerStats.maxHp) * 100}%` }}
              />
            </div>
          </div>

          {/* MP条 */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-blue-500">💧 MP</span>
              <span>{playerStats.mp}/{playerStats.maxMp}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(playerStats.mp / playerStats.maxMp) * 100}%` }}
              />
            </div>
          </div>

          {/* 攻击力 */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-orange-500">⚔️ 攻击力</span>
            <span className="text-sm font-bold">{playerStats.attack}</span>
          </div>

          {/* 防御力 */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-green-500">🛡️ 防御力</span>
            <span className="text-sm font-bold">{playerStats.defense}</span>
          </div>
        </div>
      </Card>

      {/* 关卡和道具信息 */}
      <div className="flex justify-between w-full max-w-[800px] px-4">
        <div className="text-sm font-medium">
          关卡: {currentLevel + 1}/{GAME_CONFIG.TOTAL_LEVELS}
        </div>
        <div className="text-sm font-medium">
          道具: {collectedItems.length}
        </div>
      </div>
      
      {/* 游戏画布 */}
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.WIDTH}
        height={GAME_CONFIG.HEIGHT}
        className="border-2 border-border rounded-lg bg-background shadow-lg"
      />
      
      {/* 操作提示 */}
      <div className="text-xs text-muted-foreground">
        使用方向键或空格键控制 | ← → 移动 | ↑ 跳跃（支持二连跳）
      </div>
    </div>
  );
}

function generateLevel(state: any, difficulty: Difficulty, levelIndex: number) {
  const playerSize = GAME_CONFIG.PLAYER_SIZE;
  state.player = { x: 50, y: 400, vx: 0, vy: 0, width: playerSize, height: playerSize };
  state.platforms = [];
  state.traps = [];
  state.items = [];
  state.isGrounded = false;
  state.jumpCount = 0;

  const platformCount = difficulty === 'easy' ? 12 : difficulty === 'normal' ? 10 : 8;
  const trapCount = difficulty === 'easy' ? 3 : difficulty === 'normal' ? 5 : 7;
  const itemCount = 2;

  const minWidth = GAME_CONFIG.MIN_PLATFORM_WIDTH;
  const maxWidth = GAME_CONFIG.MAX_PLATFORM_WIDTH;

  state.platforms.push({ x: 0, y: 550, width: 180, height: GAME_CONFIG.PLATFORM_HEIGHT });

  for (let i = 1; i < platformCount; i++) {
    const x = (GAME_CONFIG.WIDTH / platformCount) * i + (Math.random() - 0.5) * 40;
    const y = 500 - Math.sin(i * 0.8 + levelIndex) * 150 - 50;
    const width = minWidth + Math.random() * (maxWidth - minWidth);
    state.platforms.push({ x, y, width, height: GAME_CONFIG.PLATFORM_HEIGHT });
  }

  state.platforms.push({ x: 680, y: 120, width: 120, height: GAME_CONFIG.PLATFORM_HEIGHT });

  const letters = ['H', 'E', 'L', 'L', 'O', 'W', 'O', 'R', 'L', 'D'];
  for (let i = 0; i < trapCount; i++) {
    const x = 150 + (i * (GAME_CONFIG.WIDTH - 250) / trapCount);
    const y = 300 + Math.sin(i + levelIndex) * 100;
    const type = letters[(levelIndex + i) % letters.length];
    state.traps.push({ x, y, width: 40, height: 40, type, time: 0 });
  }

  for (let i = 0; i < itemCount; i++) {
    const x = 200 + (i * 400);
    const y = 250 + Math.cos(levelIndex + i) * 80;
    const letter = letters[(levelIndex * 2 + i) % letters.length];
    state.items.push({ x, y, width: 30, height: 30, letter, collected: false });
  }

  state.goal = { x: 750, y: 100, width: 40, height: 40 };
}

function update(state: any, dt: number, difficulty: Difficulty, setPlayerStats: React.Dispatch<React.SetStateAction<PlayerStats>>) {
  const player = state.player;
  const gravity = GAME_CONFIG.GRAVITY;
  const speed = GAME_CONFIG.PLAYER_SPEED;
  const jumpPower = GAME_CONFIG.PLAYER_JUMP;

  if (state.keys.left) player.vx = -speed;
  else if (state.keys.right) player.vx = speed;
  else player.vx = 0;

  player.vy += gravity * dt;

  player.x += player.vx * dt;
  player.y += player.vy * dt;

  player.x = Math.max(0, Math.min(GAME_CONFIG.WIDTH - player.width, player.x));

  state.isGrounded = false;
  const tolerance = 8;
  
  for (const platform of state.platforms) {
    if (
      player.x + player.width > platform.x &&
      player.x < platform.x + platform.width &&
      player.y + player.height >= platform.y - tolerance &&
      player.y + player.height <= platform.y + platform.height + tolerance &&
      player.vy >= 0
    ) {
      player.y = platform.y - player.height;
      player.vy = 0;
      state.isGrounded = true;
      state.jumpCount = 0;
    }
  }

  if (state.keys.up && state.jumpCount < 2) {
    player.vy = jumpPower;
    state.jumpCount++;
    state.keys.up = false;
  }

  for (const trap of state.traps) {
    trap.time += dt;
  }

  // 道具收集逻辑 - 收集道具时提升属性
  for (const item of state.items) {
    if (!item.collected && checkCollision(player, item)) {
      item.collected = true;
      
      // 根据字母类型提升不同属性（不区分大小写）
      setPlayerStats(prev => {
        const newStats = { ...prev };
        const letter = item.letter.toUpperCase();
        
        switch (letter) {
          case 'H': // Health - 增加HP和最大HP
            newStats.hp = Math.min(prev.maxHp + 10, prev.hp + 15);
            newStats.maxHp += 10;
            break;
          case 'E': // Energy - 增加MP和最大MP
            newStats.mp = Math.min(prev.maxMp + 10, prev.mp + 15);
            newStats.maxMp += 10;
            break;
          case 'L': // Level - 全属性小幅提升
            newStats.attack += 2;
            newStats.defense += 1;
            newStats.maxHp += 5;
            break;
          case 'O': // Offense - 增加攻击力
            newStats.attack += 3;
            break;
          case 'W': // Ward - 增加防御力
            newStats.defense += 3;
            break;
          case 'R': // Recovery - 大量恢复HP和MP
            newStats.hp = Math.min(prev.maxHp, prev.hp + 25);
            newStats.mp = Math.min(prev.maxMp, prev.mp + 15);
            break;
          case 'D': // Defense - 增加防御力和HP
            newStats.defense += 2;
            newStats.maxHp += 5;
            break;
          default:
            // 默认增加少量HP和MP
            newStats.hp = Math.min(prev.maxHp, prev.hp + 8);
            newStats.mp = Math.min(prev.maxMp, prev.mp + 5);
        }
        
        return newStats;
      });
    }
  }
}

function render(ctx: CanvasRenderingContext2D, state: any, levelIndex: number) {
  ctx.clearRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);

  // 获取CSS变量的实际颜色值
  const getColor = (varName: string) => {
    const root = document.documentElement;
    const value = getComputedStyle(root).getPropertyValue(varName).trim();
    return value ? `hsl(${value})` : '#000000';
  };

  // 渲染平台
  ctx.fillStyle = getColor('--game-platform');
  ctx.strokeStyle = getColor('--foreground');
  ctx.lineWidth = 1;
  for (const platform of state.platforms) {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
  }

  // 渲染陷阱
  for (const trap of state.traps) {
    ctx.fillStyle = getColor('--game-trap');
    ctx.save();
    ctx.translate(trap.x + trap.width / 2, trap.y + trap.height / 2);
    
    switch (trap.type) {
      case 'H':
        ctx.fillRect(-15, -20, 8, 40);
        ctx.fillRect(7, -20, 8, 40);
        ctx.fillRect(-15, -4, 30, 8);
        break;
      case 'E':
        ctx.fillRect(-15, -20, 30, 8);
        ctx.fillRect(-15, -4, 25, 8);
        ctx.fillRect(-15, 12, 30, 8);
        break;
      case 'L':
        ctx.fillRect(-15, -20, 8, 40);
        ctx.fillRect(-15, 12, 30, 8);
        break;
      case 'O':
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = getColor('--background');
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'W':
        ctx.beginPath();
        ctx.moveTo(-20, 20);
        ctx.lineTo(-10, -20);
        ctx.lineTo(0, 20);
        ctx.lineTo(10, -20);
        ctx.lineTo(20, 20);
        ctx.lineTo(10, 10);
        ctx.lineTo(0, 10);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.fill();
        break;
      case 'R':
        ctx.fillRect(-15, -20, 8, 40);
        ctx.beginPath();
        ctx.arc(5, -10, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(5, 0);
        ctx.lineTo(15, 20);
        ctx.lineTo(5, 20);
        ctx.closePath();
        ctx.fill();
        break;
      case 'D':
        ctx.fillRect(-15, -20, 8, 40);
        ctx.beginPath();
        ctx.ellipse(5, 0, 12, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      default:
        ctx.fillRect(-20, -20, 40, 40);
    }
    
    ctx.restore();
  }

  // 渲染道具
  for (const item of state.items) {
    if (!item.collected) {
      ctx.fillStyle = getColor('--game-item');
      ctx.beginPath();
      ctx.arc(item.x + 15, item.y + 15, 15, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = getColor('--foreground');
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = getColor('--foreground');
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.letter, item.x + 15, item.y + 15);
    }
  }

  // 渲染终点星星
  ctx.fillStyle = getColor('--game-goal');
  ctx.save();
  ctx.translate(state.goal.x + 20, state.goal.y + 20);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = Math.cos(angle) * 18;
    const y = Math.sin(angle) * 18;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = getColor('--foreground');
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // 渲染玩家
  const player = state.player;
  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;
  
  ctx.save();
  ctx.translate(centerX, centerY);
  
  ctx.fillStyle = getColor('--game-player');
  ctx.beginPath();
  ctx.roundRect(-player.width / 2, -player.height / 2, player.width, player.height, 6);
  ctx.fill();
  
  ctx.strokeStyle = 'hsl(0 0% 100%)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.fillStyle = 'hsl(0 0% 100%)';
  ctx.beginPath();
  ctx.arc(-6, -4, 3, 0, Math.PI * 2);
  ctx.arc(6, -4, 3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = 'hsl(0 0% 100%)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 2, 6, 0, Math.PI);
  ctx.stroke();
  
  ctx.restore();
}

function checkCollision(a: any, b: any) {
  return (
    a.x < b.x + (b.width || 30) &&
    a.x + a.width > b.x &&
    a.y < b.y + (b.height || 30) &&
    a.y + a.height > b.y
  );
}

function checkGoalReached(state: any) {
  return checkCollision(state.player, state.goal);
}

function checkDeath(state: any) {
  if (state.player.y > GAME_CONFIG.HEIGHT) return true;
  
  for (const trap of state.traps) {
    if (checkCollision(state.player, trap)) return true;
  }
  
  return false;
}
