import { useState, useEffect } from 'react';
import { GameCanvas } from '@/components/game/GameCanvas';
import { GameTutorial } from '@/components/game/GameTutorial';
import { CheatPanel } from '@/components/game/CheatPanel';
import { BattleArena } from '@/components/game/BattleArena';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Difficulty } from '@/types/types';
import { GAME_CONFIG, DIFFICULTY_CONFIG, LETTER_ITEMS } from '@/game/constants';
import { playerApi, achievementApi, gameRecordApi } from '@/db/api';
import { Sparkles, Trophy, Zap, Heart, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function GamePage() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'death' | 'victory' | 'hidden' | 'level10Complete' | 'battle'>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [collectedItems, setCollectedItems] = useState<string[]>([]);
  const [playerId, setPlayerId] = useState<string>('');
  const [achievements, setAchievements] = useState<any[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showCheatPanel, setShowCheatPanel] = useState(false);
  const [cheatMode, setCheatMode] = useState(false);
  const [playerStats, setPlayerStats] = useState({
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    attack: 10,
    defense: 5,
  });
  const { toast } = useToast();

  useEffect(() => {
    initPlayer();
  }, []);

  const initPlayer = async () => {
    let id = localStorage.getItem('hello_world_player_id');
    
    if (!id) {
      const player = await playerApi.createPlayer();
      if (player) {
        id = player.id;
        localStorage.setItem('hello_world_player_id', id);
      }
    }
    
    if (id) {
      setPlayerId(id);
      const playerAchievements = await achievementApi.getPlayerAchievements(id);
      setAchievements(playerAchievements);
    }
  };

  const startGame = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setCurrentLevel(0);
    setCollectedItems([]);
    setGameState('playing');
  };

  const handleLevelComplete = (items: string[], stats: any) => {
    setCollectedItems([...collectedItems, ...items]);
    setPlayerStats(stats);
    
    // 检查是否完成第10关
    if (currentLevel === GAME_CONFIG.TOTAL_LEVELS - 1) {
      // 完成第10关，显示特殊弹窗
      setGameState('level10Complete');
    } else {
      setCurrentLevel(currentLevel + 1);
      toast({
        title: '关卡完成！',
        description: `已完成 ${currentLevel + 1}/${GAME_CONFIG.TOTAL_LEVELS} 关`,
      });
    }
  };

  const handleDeath = () => {
    setGameState('death');
  };

  const handleVictory = async (items: string[], playTime: number) => {
    const allItems = [...collectedItems, ...items];
    setCollectedItems(allItems);
    setGameState('victory');

    if (playerId) {
      await gameRecordApi.createRecord({
        player_id: playerId,
        difficulty,
        levels_completed: GAME_CONFIG.TOTAL_LEVELS,
        items_collected: allItems,
        hidden_level_completed: false,
        play_time: playTime,
      });

      const achievement = await achievementApi.addAchievement(playerId, difficulty);
      if (achievement) {
        const updatedAchievements = await achievementApi.getPlayerAchievements(playerId);
        setAchievements(updatedAchievements);
      }
    }
  };

  // 进入第11关战斗
  const handleEnterBattle = () => {
    setGameState('battle');
  };

  // 跳过第11关，直接胜利
  const handleSkipBattle = async () => {
    setGameState('victory');
    
    if (playerId) {
      await gameRecordApi.createRecord({
        player_id: playerId,
        difficulty,
        levels_completed: GAME_CONFIG.TOTAL_LEVELS,
        items_collected: collectedItems,
        hidden_level_completed: false,
        play_time: 0,
      });

      const achievement = await achievementApi.addAchievement(playerId, difficulty);
      if (achievement) {
        const updatedAchievements = await achievementApi.getPlayerAchievements(playerId);
        setAchievements(updatedAchievements);
      }
    }
    
    toast({
      title: '🎉 恭喜通关！',
      description: '你已完成所有10个关卡！',
    });
  };

  // 战斗胜利
  const handleBattleVictory = async () => {
    if (playerId) {
      await gameRecordApi.createRecord({
        player_id: playerId,
        difficulty,
        levels_completed: GAME_CONFIG.TOTAL_LEVELS + 1,
        items_collected: collectedItems,
        hidden_level_completed: true,
        play_time: 0,
      });
    }
    
    setGameState('hidden');
    
    toast({
      title: '🎉 恭喜！',
      description: '你击败了AI对手，完成了所有挑战！',
    });
  };

  // 战斗失败
  const handleBattleDefeat = () => {
    setGameState('death');
    
    toast({
      title: '战斗失败',
      description: '你可以重新挑战第11关',
      variant: 'destructive',
    });
  };

  const handleSkipLevel = () => {
    if (currentLevel < GAME_CONFIG.TOTAL_LEVELS - 1) {
      setCurrentLevel(currentLevel + 1);
      setCheatMode(true);
      toast({
        title: '⚡ 作弊模式',
        description: `已跳过关卡 ${currentLevel + 1}`,
        variant: 'destructive',
      });
    }
  };

  const handleCompleteAll = async () => {
    setCheatMode(true);
    const playTime = 1;
    await handleVictory([], playTime);
    toast({
      title: '⚡ 作弊模式',
      description: '已完成所有关卡',
      variant: 'destructive',
    });
  };

  const restartLevel = () => {
    setGameState('playing');
    setCheatMode(false);
  };

  const backToMenu = () => {
    setGameState('menu');
    setCurrentLevel(0);
    setCollectedItems([]);
    setCheatMode(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 xl:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl xl:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Hello World
          </h1>
          <p className="text-lg xl:text-xl text-muted-foreground">
            Roguelite 平台跳跃冒险
          </p>
        </div>

        {gameState === 'menu' && (
          <div className="space-y-6">
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setShowTutorial(true)}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <HelpCircle className="w-5 h-5" />
                游戏说明
              </Button>
              <Button
                onClick={() => setShowCheatPanel(!showCheatPanel)}
                variant="outline"
                size="lg"
                className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Zap className="w-5 h-5" />
                开发者模式
              </Button>
            </div>

            {showCheatPanel && (
              <CheatPanel
                onSkipLevel={handleSkipLevel}
                onCompleteAll={handleCompleteAll}
                currentLevel={currentLevel}
                totalLevels={GAME_CONFIG.TOTAL_LEVELS}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  选择难度
                </CardTitle>
                <CardDescription>
                  挑战10个随机关卡，收集字母道具，完成冒险！
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 xl:grid-cols-3">
                {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((diff) => {
                  const config = DIFFICULTY_CONFIG[diff];
                  const hasAchievement = achievements.some(a => a.difficulty === diff);
                  
                  return (
                    <Card
                      key={diff}
                      className="cursor-pointer hover:shadow-lg transition-shadow border-2"
                      onClick={() => startGame(diff)}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {config.name}
                          {hasAchievement && <Trophy className="w-5 h-5 text-accent" />}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div>陷阱密度: {Math.floor(config.trapDensity * 100)}%</div>
                          <div>平台密度: {Math.floor(config.platformDensity * 100)}%</div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-accent" />
                  字母道具
                </CardTitle>
                <CardDescription>
                  在关卡中收集这些道具，在隐藏关卡中使用
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 xl:grid-cols-2">
                  {LETTER_ITEMS.map((item) => (
                    <div key={item.letter + item.name} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                      <Badge className="text-lg font-bold">{item.letter}</Badge>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {achievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-accent" />
                    我的成就
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {achievements.map((achievement) => (
                      <Badge key={achievement.id} variant="secondary" className="text-base px-4 py-2">
                        {DIFFICULTY_CONFIG[achievement.difficulty as Difficulty].name} 铭牌
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-4">
            {cheatMode && (
              <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-3 text-center">
                <p className="text-destructive font-semibold flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  ⚡ 作弊模式已激活
                </p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setGameState('paused')}>
                  暂停
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSkipLevel}
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  disabled={currentLevel >= GAME_CONFIG.TOTAL_LEVELS - 1}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  跳过
                </Button>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {DIFFICULTY_CONFIG[difficulty].name}
              </Badge>
            </div>
            
            <GameCanvas
              difficulty={difficulty}
              currentLevel={currentLevel}
              onLevelComplete={handleLevelComplete}
              onDeath={handleDeath}
            />
          </div>
        )}

        {/* 第11关战斗界面 */}
        {gameState === 'battle' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={backToMenu}>
                返回菜单
              </Button>
              <Badge variant="destructive" className="text-lg px-4 py-2">
                第11关：终极挑战
              </Badge>
            </div>
            
            <BattleArena
              difficulty={difficulty}
              playerStats={playerStats}
              onVictory={handleBattleVictory}
              onDefeat={handleBattleDefeat}
            />
          </div>
        )}

        {/* 第10关完成弹窗 */}
        <Dialog open={gameState === 'level10Complete'}>
          <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="text-3xl text-center font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Hello World
              </DialogTitle>
              <DialogDescription className="text-center text-lg pt-4">
                恭喜你成功完成了前10个关卡！
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="text-center space-y-2">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-lg font-medium">
                  你已解锁隐藏关卡！
                </p>
                <p className="text-muted-foreground">
                  第11关是一个特殊的AI战斗挑战
                </p>
                <p className="text-muted-foreground">
                  你可以使用在冒险中收集的属性与AI对决
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">你的当前属性：</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>❤️ HP: {playerStats.hp}/{playerStats.maxHp}</div>
                  <div>💧 MP: {playerStats.mp}/{playerStats.maxMp}</div>
                  <div>⚔️ 攻击: {playerStats.attack}</div>
                  <div>🛡️ 防御: {playerStats.defense}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  className="w-full h-12 text-lg" 
                  onClick={handleEnterBattle}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  接受挑战
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={handleSkipBattle}
                >
                  跳过挑战，直接完成游戏
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={gameState === 'paused'} onOpenChange={(open) => !open && setGameState('playing')}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>游戏暂停</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Button className="w-full" onClick={() => setGameState('playing')}>
                继续游戏
              </Button>
              <Button className="w-full" variant="outline" onClick={backToMenu}>
                返回菜单
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={gameState === 'death'} onOpenChange={(open) => !open && backToMenu()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl">挑战失败</DialogTitle>
              <DialogDescription>
                已完成 {currentLevel}/{GAME_CONFIG.TOTAL_LEVELS} 关
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center py-4">
                <Heart className="w-16 h-16 mx-auto text-destructive mb-4" />
                <p className="text-muted-foreground">不要放弃，再试一次！</p>
              </div>
              <Button className="w-full" onClick={restartLevel}>
                重新开始
              </Button>
              <Button className="w-full" variant="outline" onClick={backToMenu}>
                返回菜单
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={gameState === 'victory'} onOpenChange={(open) => !open && backToMenu()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Trophy className="w-8 h-8 text-accent" />
                恭喜通关！
              </DialogTitle>
              <DialogDescription>
                你成功完成了所有 {GAME_CONFIG.TOTAL_LEVELS} 个关卡！
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center py-4">
                <Sparkles className="w-16 h-16 mx-auto text-primary mb-4" />
                <p className="text-lg font-medium mb-2">
                  获得 {DIFFICULTY_CONFIG[difficulty].name} 铭牌
                </p>
                <p className="text-sm text-muted-foreground">
                  收集道具: {collectedItems.length} 个
                </p>
                {cheatMode && (
                  <p className="text-xs text-destructive mt-2">
                    ⚡ 作弊模式完成
                  </p>
                )}
              </div>
              <Button className="w-full" onClick={backToMenu}>
                返回菜单
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <GameTutorial open={showTutorial} onOpenChange={setShowTutorial} />
      </div>
    </div>
  );
}
