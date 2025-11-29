import { supabase } from './supabase';
import type { Player, Achievement, GameRecord } from '@/types/types';

// 玩家相关API
export const playerApi = {
  // 创建新玩家
  async createPlayer(nickname?: string): Promise<Player | null> {
    const { data, error } = await supabase
      .from('players')
      .insert({ nickname: nickname || null })
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('创建玩家失败:', error);
      return null;
    }
    return data;
  },

  // 获取玩家信息
  async getPlayer(playerId: string): Promise<Player | null> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .maybeSingle();
    
    if (error) {
      console.error('获取玩家信息失败:', error);
      return null;
    }
    return data;
  },

  // 更新玩家昵称
  async updateNickname(playerId: string, nickname: string): Promise<boolean> {
    const { error } = await supabase
      .from('players')
      .update({ nickname })
      .eq('id', playerId);
    
    if (error) {
      console.error('更新昵称失败:', error);
      return false;
    }
    return true;
  }
};

// 成就相关API
export const achievementApi = {
  // 添加成就
  async addAchievement(playerId: string, difficulty: 'easy' | 'normal' | 'hard'): Promise<Achievement | null> {
    // 检查是否已有该难度的成就
    const { data: existing } = await supabase
      .from('achievements')
      .select('*')
      .eq('player_id', playerId)
      .eq('difficulty', difficulty)
      .maybeSingle();
    
    if (existing) {
      return existing;
    }

    const { data, error } = await supabase
      .from('achievements')
      .insert({ player_id: playerId, difficulty })
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('添加成就失败:', error);
      return null;
    }
    return data;
  },

  // 获取玩家所有成就
  async getPlayerAchievements(playerId: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('player_id', playerId)
      .order('earned_at', { ascending: false });
    
    if (error) {
      console.error('获取成就失败:', error);
      return [];
    }
    return Array.isArray(data) ? data : [];
  }
};

// 游戏记录相关API
export const gameRecordApi = {
  // 创建游戏记录
  async createRecord(record: Omit<GameRecord, 'id' | 'created_at'>): Promise<GameRecord | null> {
    const { data, error } = await supabase
      .from('game_records')
      .insert(record)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error('创建游戏记录失败:', error);
      return null;
    }
    return data;
  },

  // 获取玩家游戏记录
  async getPlayerRecords(playerId: string, limit = 10): Promise<GameRecord[]> {
    const { data, error } = await supabase
      .from('game_records')
      .select('*')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('获取游戏记录失败:', error);
      return [];
    }
    return Array.isArray(data) ? data : [];
  },

  // 获取最佳记录
  async getBestRecord(playerId: string, difficulty: 'easy' | 'normal' | 'hard'): Promise<GameRecord | null> {
    const { data, error } = await supabase
      .from('game_records')
      .select('*')
      .eq('player_id', playerId)
      .eq('difficulty', difficulty)
      .order('levels_completed', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('获取最佳记录失败:', error);
      return null;
    }
    return data;
  },

  // 获取排行榜
  async getLeaderboard(difficulty: 'easy' | 'normal' | 'hard', limit = 10): Promise<GameRecord[]> {
    const { data, error } = await supabase
      .from('game_records')
      .select('*')
      .eq('difficulty', difficulty)
      .order('levels_completed', { ascending: false })
      .order('play_time', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('获取排行榜失败:', error);
      return [];
    }
    return Array.isArray(data) ? data : [];
  }
};
