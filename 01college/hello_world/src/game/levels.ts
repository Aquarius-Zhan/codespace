import type { LevelData, Difficulty } from '@/types/types';

// 生成关卡数据（60个预设关卡）
export const generateLevels = (): Record<Difficulty, LevelData[]> => {
  const levels: Record<Difficulty, LevelData[]> = {
    easy: [],
    normal: [],
    hard: [],
  };

  // 简单难度 - 20个关卡
  for (let i = 0; i < 20; i++) {
    levels.easy.push({
      id: `easy_${i}`,
      difficulty: 'easy',
      complexity: Math.floor(i / 5) + 1, // 1-4
      platforms: generatePlatforms('easy', i),
      traps: generateTraps('easy', i),
      items: generateItems(i),
      goal: { x: 750, y: 100 },
    });
  }

  // 普通难度 - 20个关卡
  for (let i = 0; i < 20; i++) {
    levels.normal.push({
      id: `normal_${i}`,
      difficulty: 'normal',
      complexity: Math.floor(i / 5) + 4, // 4-7
      platforms: generatePlatforms('normal', i),
      traps: generateTraps('normal', i),
      items: generateItems(i),
      goal: { x: 750, y: 100 },
    });
  }

  // 困难难度 - 20个关卡
  for (let i = 0; i < 20; i++) {
    levels.hard.push({
      id: `hard_${i}`,
      difficulty: 'hard',
      complexity: Math.floor(i / 5) + 7, // 7-10
      platforms: generatePlatforms('hard', i),
      traps: generateTraps('hard', i),
      items: generateItems(i),
      goal: { x: 750, y: 100 },
    });
  }

  return levels;
};

// 生成平台
function generatePlatforms(difficulty: Difficulty, levelIndex: number) {
  const platforms = [];
  const baseY = 550;
  
  // 起始平台
  platforms.push({
    x: 0,
    y: baseY,
    width: 100,
    height: 20,
    type: 'normal' as const,
  });

  // 根据难度生成不同数量的平台
  const platformCount = difficulty === 'easy' ? 8 : difficulty === 'normal' ? 6 : 4;
  const spacing = 800 / (platformCount + 1);

  for (let i = 1; i <= platformCount; i++) {
    const x = spacing * i;
    const y = baseY - (Math.sin(i * 0.5 + levelIndex) * 100 + 50);
    const width = difficulty === 'easy' ? 120 : difficulty === 'normal' ? 100 : 80;
    
    platforms.push({
      x,
      y,
      width,
      height: 20,
      type: Math.random() > 0.7 ? 'moving' as const : 'normal' as const,
      movePattern: Math.random() > 0.7 ? {
        startX: x - 50,
        endX: x + 50,
        speed: 50,
      } : undefined,
    });
  }

  // 终点平台
  platforms.push({
    x: 700,
    y: 100,
    width: 100,
    height: 20,
    type: 'normal' as const,
  });

  return platforms;
}

// 生成陷阱（基于Hello World字母）
function generateTraps(difficulty: Difficulty, levelIndex: number) {
  const traps = [];
  const letters: Array<'H' | 'E' | 'L' | 'O' | 'W' | 'R' | 'D'> = ['H', 'E', 'L', 'L', 'O', 'W', 'O', 'R', 'L', 'D'];
  
  const trapCount = difficulty === 'easy' ? 3 : difficulty === 'normal' ? 5 : 7;
  
  for (let i = 0; i < trapCount; i++) {
    const letter = letters[(levelIndex + i) % letters.length];
    const x = 100 + (i * 600 / trapCount);
    const y = 400 - (Math.cos(i + levelIndex) * 100);
    
    traps.push({
      x,
      y,
      type: letter,
      width: 40,
      height: 40,
      pattern: getLetterPattern(letter),
    });
  }

  return traps;
}

// 获取字母陷阱的运动模式
function getLetterPattern(letter: string): string {
  const patterns: Record<string, string> = {
    H: 'vertical', // H形：上下移动
    E: 'horizontal', // E形：左右移动
    L: 'corner', // L形：直角移动
    O: 'circle', // O形：圆周运动
    W: 'wave', // W形：波浪运动
    R: 'rotate', // R形：旋转
    D: 'diagonal', // D形：对角线移动
  };
  return patterns[letter] || 'static';
}

// 生成道具
function generateItems(levelIndex: number) {
  const items = [];
  const letters = ['H', 'E', 'L', 'L', 'O', 'W', 'O', 'R', 'L', 'D'];
  
  // 每个关卡随机放置1-2个道具
  const itemCount = Math.random() > 0.5 ? 2 : 1;
  
  for (let i = 0; i < itemCount; i++) {
    const letter = letters[(levelIndex + i) % letters.length];
    items.push({
      x: 200 + (i * 400),
      y: 300 - (Math.sin(levelIndex + i) * 100),
      letter,
    });
  }

  return items;
}

// 获取所有关卡
export const ALL_LEVELS = generateLevels();

// 随机选择关卡
export function selectRandomLevels(difficulty: Difficulty, count: number, progressBonus = 0): LevelData[] {
  const availableLevels = ALL_LEVELS[difficulty];
  const selected: LevelData[] = [];
  const used = new Set<number>();

  for (let i = 0; i < count; i++) {
    // 动态难度：根据进度增加复杂度
    const minComplexity = Math.min(10, Math.floor(i / 3) + 1 + progressBonus);
    const validLevels = availableLevels.filter(
      (level, index) => !used.has(index) && level.complexity >= minComplexity
    );

    if (validLevels.length === 0) break;

    const randomIndex = Math.floor(Math.random() * validLevels.length);
    const selectedLevel = validLevels[randomIndex];
    const originalIndex = availableLevels.indexOf(selectedLevel);
    
    used.add(originalIndex);
    selected.push(selectedLevel);
  }

  return selected;
}
