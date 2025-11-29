import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Difficulty } from '@/types/types';

interface BattleArenaProps {
  difficulty: Difficulty;
  playerStats: {
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    attack: number;
    defense: number;
  };
  onVictory: () => void;
  onDefeat: () => void;
}

interface BattleLog {
  message: string;
  type: 'player' | 'enemy' | 'system';
}

export function BattleArena({ difficulty, playerStats: initialPlayerStats, onVictory, onDefeat }: BattleArenaProps) {
  const [playerStats, setPlayerStats] = useState(initialPlayerStats);
  const [enemyStats, setEnemyStats] = useState({
    hp: 0,
    maxHp: 0,
    attack: 0,
    defense: 0,
  });
  const [battleLog, setBattleLog] = useState<BattleLog[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isDefending, setIsDefending] = useState(false);
  const [battleEnded, setBattleEnded] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // 初始化敌人属性
  useEffect(() => {
    const enemyConfig = {
      easy: { hp: 80, attack: 8, defense: 3 },
      normal: { hp: 120, attack: 12, defense: 5 },
      hard: { hp: 150, attack: 15, defense: 8 },
    };

    const config = enemyConfig[difficulty];
    setEnemyStats({
      hp: config.hp,
      maxHp: config.hp,
      attack: config.attack,
      defense: config.defense,
    });

    addLog('战斗开始！你遇到了强大的AI对手！', 'system');
  }, [difficulty]);

  const addLog = (message: string, type: BattleLog['type']) => {
    setBattleLog(prev => [...prev.slice(-4), { message, type }]);
  };

  // 玩家攻击
  const handleAttack = () => {
    if (!isPlayerTurn || battleEnded) return;
    setSelectedAction('attack');

    const damage = Math.max(1, playerStats.attack - enemyStats.defense);
    setEnemyStats(prev => ({
      ...prev,
      hp: Math.max(0, prev.hp - damage),
    }));

    addLog(`你发起攻击，造成 ${damage} 点伤害！`, 'player');

    setTimeout(() => {
      checkBattleEnd(enemyStats.hp - damage, playerStats.hp);
      setSelectedAction(null);
      setIsPlayerTurn(false);
    }, 1000);
  };

  // 玩家防御
  const handleDefend = () => {
    if (!isPlayerTurn || battleEnded) return;
    setSelectedAction('defend');
    setIsDefending(true);

    addLog('你进入防御姿态，下次受到的伤害减半！', 'player');

    setTimeout(() => {
      setSelectedAction(null);
      setIsPlayerTurn(false);
    }, 1000);
  };

  // 玩家使用技能
  const handleSkill = () => {
    if (!isPlayerTurn || battleEnded || playerStats.mp < 20) return;
    setSelectedAction('skill');

    const damage = Math.floor(playerStats.attack * 1.5);
    setEnemyStats(prev => ({
      ...prev,
      hp: Math.max(0, prev.hp - damage),
    }));
    setPlayerStats(prev => ({
      ...prev,
      mp: prev.mp - 20,
    }));

    addLog(`你使用强力技能，造成 ${damage} 点伤害！（消耗20MP）`, 'player');

    setTimeout(() => {
      checkBattleEnd(enemyStats.hp - damage, playerStats.hp);
      setSelectedAction(null);
      setIsPlayerTurn(false);
    }, 1000);
  };

  // 敌人回合
  useEffect(() => {
    if (!isPlayerTurn && !battleEnded && enemyStats.hp > 0) {
      const timer = setTimeout(() => {
        // AI决策逻辑
        const action = Math.random();
        
        if (action < 0.7) {
          // 70%概率攻击
          const baseDamage = Math.max(1, enemyStats.attack - playerStats.defense);
          const damage = isDefending ? Math.floor(baseDamage / 2) : baseDamage;
          
          setPlayerStats(prev => ({
            ...prev,
            hp: Math.max(0, prev.hp - damage),
          }));

          addLog(`敌人发起攻击，造成 ${damage} 点伤害！`, 'enemy');

          setTimeout(() => {
            checkBattleEnd(enemyStats.hp, playerStats.hp - damage);
            setIsDefending(false);
            setIsPlayerTurn(true);
          }, 1000);
        } else {
          // 30%概率防御
          addLog('敌人进入防御姿态！', 'enemy');
          setTimeout(() => {
            setIsDefending(false);
            setIsPlayerTurn(true);
          }, 1000);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, battleEnded, enemyStats.hp, playerStats.hp, playerStats.defense, enemyStats.attack, isDefending]);

  // 检查战斗结束
  const checkBattleEnd = (enemyHp: number, playerHp: number) => {
    if (enemyHp <= 0) {
      setBattleEnded(true);
      addLog('你赢得了战斗！', 'system');
      setTimeout(() => onVictory(), 2000);
    } else if (playerHp <= 0) {
      setBattleEnded(true);
      addLog('你被击败了...', 'system');
      setTimeout(() => onDefeat(), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 p-4">
      {/* 标题 */}
      <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-2 border-red-500/50">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            🔥 第11关：AI对决 🔥
          </CardTitle>
        </CardHeader>
      </Card>

      {/* 战斗区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 玩家状态 */}
        <Card className={`${isPlayerTurn && !battleEnded ? 'ring-2 ring-primary' : ''} transition-all`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>😊 玩家</span>
              {isPlayerTurn && !battleEnded && (
                <Badge variant="default">你的回合</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* HP条 */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-red-500 font-medium">❤️ HP</span>
                <span className="font-bold">{playerStats.hp}/{playerStats.maxHp}</span>
              </div>
              <Progress 
                value={(playerStats.hp / playerStats.maxHp) * 100} 
                className="h-3"
              />
            </div>

            {/* MP条 */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-blue-500 font-medium">💧 MP</span>
                <span className="font-bold">{playerStats.mp}/{playerStats.maxMp}</span>
              </div>
              <Progress 
                value={(playerStats.mp / playerStats.maxMp) * 100} 
                className="h-3"
              />
            </div>

            {/* 属性 */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-orange-500">⚔️</span>
                <span>攻击: {playerStats.attack}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-500">🛡️</span>
                <span>防御: {playerStats.defense}</span>
              </div>
            </div>

            {isDefending && (
              <Badge variant="secondary" className="w-full justify-center">
                🛡️ 防御中
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* 敌人状态 */}
        <Card className={`${!isPlayerTurn && !battleEnded ? 'ring-2 ring-destructive' : ''} transition-all`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🤖 AI对手</span>
              {!isPlayerTurn && !battleEnded && (
                <Badge variant="destructive">敌人回合</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* HP条 */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-red-500 font-medium">❤️ HP</span>
                <span className="font-bold">{enemyStats.hp}/{enemyStats.maxHp}</span>
              </div>
              <Progress 
                value={(enemyStats.hp / enemyStats.maxHp) * 100} 
                className="h-3"
              />
            </div>

            {/* 属性 */}
            <div className="grid grid-cols-2 gap-2 text-sm pt-8">
              <div className="flex items-center gap-1">
                <span className="text-orange-500">⚔️</span>
                <span>攻击: {enemyStats.attack}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-500">🛡️</span>
                <span>防御: {enemyStats.defense}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 战斗日志 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">战斗日志</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 min-h-[100px]">
            {battleLog.map((log, index) => (
              <div
                key={index}
                className={`text-sm p-2 rounded ${
                  log.type === 'player'
                    ? 'bg-primary/10 text-primary'
                    : log.type === 'enemy'
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {log.message}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <Button
              onClick={handleAttack}
              disabled={!isPlayerTurn || battleEnded}
              variant={selectedAction === 'attack' ? 'default' : 'outline'}
              className="h-20 flex flex-col gap-1"
            >
              <span className="text-2xl">⚔️</span>
              <span>攻击</span>
            </Button>

            <Button
              onClick={handleDefend}
              disabled={!isPlayerTurn || battleEnded}
              variant={selectedAction === 'defend' ? 'default' : 'outline'}
              className="h-20 flex flex-col gap-1"
            >
              <span className="text-2xl">🛡️</span>
              <span>防御</span>
            </Button>

            <Button
              onClick={handleSkill}
              disabled={!isPlayerTurn || battleEnded || playerStats.mp < 20}
              variant={selectedAction === 'skill' ? 'default' : 'outline'}
              className="h-20 flex flex-col gap-1"
            >
              <span className="text-2xl">✨</span>
              <span>技能</span>
              <span className="text-xs">(20MP)</span>
            </Button>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isPlayerTurn && !battleEnded && '选择你的行动'}
            {!isPlayerTurn && !battleEnded && '等待敌人行动...'}
            {battleEnded && '战斗结束'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
