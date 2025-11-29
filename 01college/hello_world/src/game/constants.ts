// 游戏常量配置

export const GAME_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  GRAVITY: 800,
  PLAYER_SPEED: 220,
  PLAYER_JUMP: -420,
  TOTAL_LEVELS: 10,
  PLAYER_SIZE: 28,
  PLATFORM_HEIGHT: 16,
  MIN_PLATFORM_WIDTH: 80,
  MAX_PLATFORM_WIDTH: 180,
};

export const COLORS = {
  PRIMARY: '#FF9500', // 橙黄色
  SECONDARY: '#98D8C8', // 薄荷绿
  ACCENT: '#9B59B6', // 活力紫
  BACKGROUND: '#FFF5E6',
  PLATFORM: '#8B4513',
  TRAP: '#E74C3C',
  ITEM: '#F1C40F',
};

// 字母道具配置
export const LETTER_ITEMS = [
  {
    letter: 'H',
    name: '护盾',
    description: '获得一次免伤保护',
    effect: 'shield',
  },
  {
    letter: 'E',
    name: '加速',
    description: '移动速度提升50%',
    effect: 'speed_boost',
  },
  {
    letter: 'L',
    name: '跳跃',
    description: '跳跃高度提升',
    effect: 'jump_boost',
  },
  {
    letter: 'L',
    name: '生命',
    description: '额外一次复活机会',
    effect: 'extra_life',
  },
  {
    letter: 'O',
    name: '无敌',
    description: '短时间无敌',
    effect: 'invincible',
  },
  {
    letter: 'W',
    name: '穿墙',
    description: '可以穿过陷阱',
    effect: 'phase',
  },
  {
    letter: 'O',
    name: '时停',
    description: '暂停陷阱运动',
    effect: 'time_stop',
  },
  {
    letter: 'R',
    name: '重置',
    description: '重置当前关卡',
    effect: 'reset',
  },
  {
    letter: 'L',
    name: '透视',
    description: '显示隐藏平台',
    effect: 'reveal',
  },
  {
    letter: 'D',
    name: '双跳',
    description: '可以二段跳',
    effect: 'double_jump',
  },
];

// 难度配置
export const DIFFICULTY_CONFIG = {
  easy: {
    name: '简单',
    color: COLORS.SECONDARY,
    trapDensity: 0.2,
    platformDensity: 0.9,
    complexityRange: [1, 3],
  },
  normal: {
    name: '普通',
    color: COLORS.PRIMARY,
    trapDensity: 0.35,
    platformDensity: 0.75,
    complexityRange: [3, 6],
  },
  hard: {
    name: '困难',
    color: COLORS.ACCENT,
    trapDensity: 0.5,
    platformDensity: 0.6,
    complexityRange: [6, 9],
  },
};
