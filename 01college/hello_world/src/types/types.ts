// 数据库表类型定义

export interface Player {
  id: string;
  nickname: string | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  player_id: string;
  difficulty: 'easy' | 'normal' | 'hard';
  earned_at: string;
}

export interface GameRecord {
  id: string;
  player_id: string;
  difficulty: 'easy' | 'normal' | 'hard';
  levels_completed: number;
  items_collected: string[];
  hidden_level_completed: boolean;
  play_time: number;
  created_at: string;
}

// 游戏相关类型

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface LevelData {
  id: string;
  difficulty: Difficulty;
  platforms: Platform[];
  traps: Trap[];
  items: ItemSpawn[];
  goal: Position;
  complexity: number; // 1-10，用于动态难度
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: 'normal' | 'moving' | 'breakable';
  movePattern?: {
    startX: number;
    endX: number;
    speed: number;
  };
}

export interface Trap {
  x: number;
  y: number;
  type: 'H' | 'E' | 'L' | 'O' | 'W' | 'R' | 'D'; // Hello World字母
  width: number;
  height: number;
  pattern?: string; // 陷阱的运动模式
}

export interface ItemSpawn {
  x: number;
  y: number;
  letter: string; // H, E, L, L, O, W, O, R, L, D
}

export interface Position {
  x: number;
  y: number;
}

export interface PlayerState {
  id: string;
  position: Position;
  velocity: Position;
  isAlive: boolean;
  collectedItems: string[];
  currentLevel: number;
  totalLevels: number;
}

export interface GameState {
  difficulty: Difficulty;
  currentLevelIndex: number;
  levelsCompleted: number;
  collectedItems: string[];
  playTime: number;
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  isVictory: boolean;
  showHiddenLevel: boolean;
}

// 字母道具效果
export interface LetterItem {
  letter: string;
  name: string;
  description: string;
  effect: string;
}
