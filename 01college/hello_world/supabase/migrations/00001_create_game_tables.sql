/*
# Hello World游戏数据库结构

## 1. 表说明

### players表
存储匿名玩家信息（基于UUID）
- `id` (uuid, primary key): 玩家唯一标识
- `nickname` (text): 玩家昵称（可选）
- `created_at` (timestamptz): 创建时间

### achievements表
存储玩家获得的永久铭牌成就
- `id` (uuid, primary key): 成就ID
- `player_id` (uuid, foreign key): 玩家ID
- `difficulty` (text): 难度等级（easy/normal/hard）
- `earned_at` (timestamptz): 获得时间

### game_records表
存储游戏记录
- `id` (uuid, primary key): 记录ID
- `player_id` (uuid, foreign key): 玩家ID
- `difficulty` (text): 难度等级
- `levels_completed` (integer): 完成关卡数
- `items_collected` (jsonb): 收集的道具
- `hidden_level_completed` (boolean): 是否完成隐藏关卡
- `play_time` (integer): 游戏时长（秒）
- `created_at` (timestamptz): 记录时间

## 2. 安全策略
- 所有表为公开访问，不启用RLS
- 任何人都可以创建和查看数据
*/

-- 创建玩家表
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text,
  created_at timestamptz DEFAULT now()
);

-- 创建成就表
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'normal', 'hard')),
  earned_at timestamptz DEFAULT now()
);

-- 创建游戏记录表
CREATE TABLE IF NOT EXISTS game_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'normal', 'hard')),
  levels_completed integer NOT NULL DEFAULT 0,
  items_collected jsonb DEFAULT '[]'::jsonb,
  hidden_level_completed boolean DEFAULT false,
  play_time integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_achievements_player_id ON achievements(player_id);
CREATE INDEX IF NOT EXISTS idx_game_records_player_id ON game_records(player_id);
CREATE INDEX IF NOT EXISTS idx_game_records_difficulty ON game_records(difficulty);
