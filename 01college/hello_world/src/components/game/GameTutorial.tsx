import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GameTutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GameTutorial({ open, onOpenChange }: GameTutorialProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">游戏说明与教程</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">基础操作</TabsTrigger>
            <TabsTrigger value="elements">游戏元素</TabsTrigger>
            <TabsTrigger value="difficulty">难度说明</TabsTrigger>
            <TabsTrigger value="tips">游戏技巧</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>🎮 操作方式</CardTitle>
                <CardDescription>掌握基础操作，开始你的冒险</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">键盘控制（推荐）</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <kbd className="px-2 py-1 bg-background border rounded">←</kbd>
                      <span>向左移动</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <kbd className="px-2 py-1 bg-background border rounded">→</kbd>
                      <span>向右移动</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <kbd className="px-2 py-1 bg-background border rounded">↑</kbd>
                      <span>或</span>
                      <kbd className="px-2 py-1 bg-background border rounded">空格</kbd>
                      <span>跳跃（支持二连跳✨）</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">移动端控制</h4>
                  <div className="text-sm space-y-1">
                    <p>• 点击屏幕左侧：向左移动</p>
                    <p>• 点击屏幕右侧：向右移动</p>
                    <p>• 点击屏幕中间：跳跃</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎯 游戏目标</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>1. 从起点出发，到达关卡终点（绿色星星⭐）</p>
                <p>2. 避开所有红色陷阱，不要触碰它们</p>
                <p>3. 尽量收集路上的绿色道具</p>
                <p>4. 连续通过10个关卡，获得成就铭牌</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>⚠️ 失败条件</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• 触碰到任何红色陷阱</p>
                <p>• 掉落到屏幕底部</p>
                <p className="text-destructive font-semibold">注意：失败后将从第1关重新开始！</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="elements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>🎨 视觉元素识别</CardTitle>
                <CardDescription>了解游戏中的各种元素</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted rounded">
                    <div className="w-12 h-12 rounded flex items-center justify-center text-2xl" style={{ backgroundColor: 'hsl(30 100% 50%)' }}>
                      😊
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-primary">玩家角色（橙黄色）</h4>
                      <p className="text-sm text-muted-foreground">这就是你！可爱的橙色方块，带有笑脸表情</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-muted rounded">
                    <div className="w-12 h-12 rounded flex items-center justify-center" style={{ backgroundColor: 'hsl(30 8% 50%)' }}>
                      <div className="w-10 h-3 bg-current"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">平台（中性灰色）</h4>
                      <p className="text-sm text-muted-foreground">可以站立的安全区域，用于移动和跳跃</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-muted rounded">
                    <div className="w-12 h-12 rounded flex items-center justify-center text-2xl" style={{ backgroundColor: 'hsl(0 85% 60%)' }}>
                      H
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-destructive">陷阱（警示红色）</h4>
                      <p className="text-sm text-muted-foreground">危险！触碰即死亡。基于"Hello World"字母设计</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-muted rounded">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: 'hsl(150 70% 55%)' }}>
                      L
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold" style={{ color: 'hsl(150 70% 45%)' }}>道具（互动绿色）</h4>
                      <p className="text-sm text-muted-foreground">可收集的字母道具，增加分数和成就感</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-muted rounded">
                    <div className="w-12 h-12 rounded flex items-center justify-center text-2xl" style={{ color: 'hsl(160 45% 70%)' }}>
                      ⭐
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-secondary">终点（绿色星星）</h4>
                      <p className="text-sm text-muted-foreground">关卡的目标位置，触碰即可通关</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🔤 字母陷阱类型</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-muted rounded">
                  <span className="font-semibold">H</span> - 双柱结构
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="font-semibold">E</span> - 三层横向
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="font-semibold">L</span> - 直角结构
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="font-semibold">O</span> - 圆环结构
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="font-semibold">W</span> - 波浪结构
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="font-semibold">R</span> - 圆弧+斜腿
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="font-semibold">D</span> - 半圆结构
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>💎 字母道具效果</CardTitle>
                <CardDescription>收集道具提升属性，为第11关战斗做准备</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="p-3 bg-muted rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">H</span>
                    <span className="font-semibold">Health（生命）</span>
                  </div>
                  <p className="text-muted-foreground">HP +15，最大HP +10</p>
                </div>

                <div className="p-3 bg-muted rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">E</span>
                    <span className="font-semibold">Energy（能量）</span>
                  </div>
                  <p className="text-muted-foreground">MP +15，最大MP +10</p>
                </div>

                <div className="p-3 bg-muted rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">L</span>
                    <span className="font-semibold">Level（等级）</span>
                  </div>
                  <p className="text-muted-foreground">攻击 +2，防御 +1，最大HP +5</p>
                </div>

                <div className="p-3 bg-muted rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">O</span>
                    <span className="font-semibold">Offense（进攻）</span>
                  </div>
                  <p className="text-muted-foreground">攻击 +3</p>
                </div>

                <div className="p-3 bg-muted rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">W</span>
                    <span className="font-semibold">Ward（护盾）</span>
                  </div>
                  <p className="text-muted-foreground">防御 +3</p>
                </div>

                <div className="p-3 bg-muted rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">R</span>
                    <span className="font-semibold">Recovery（恢复）</span>
                  </div>
                  <p className="text-muted-foreground">HP +25，MP +15（大量恢复）</p>
                </div>

                <div className="p-3 bg-muted rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">D</span>
                    <span className="font-semibold">Defense（防御）</span>
                  </div>
                  <p className="text-muted-foreground">防御 +2，最大HP +5</p>
                </div>

                <div className="p-3 bg-primary/10 border border-primary rounded">
                  <p className="font-semibold text-primary">💡 提示</p>
                  <p className="text-muted-foreground mt-1">
                    收集的道具会提升你的属性，这些属性将在完成第10关后的隐藏战斗关卡中使用！
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="difficulty" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>🎲 难度级别说明</CardTitle>
                <CardDescription>选择适合你的挑战难度</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border-2 border-secondary rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-lg text-secondary">简单模式</h4>
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">推荐新手</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>• 陷阱数量：约3个/关卡（密度20%）</p>
                      <p>• 平台数量：约12个/关卡（密度90%）</p>
                      <p>• 平台宽度：更宽，更容易站立</p>
                      <p>• 通关难度：⭐</p>
                      <p className="text-muted-foreground">适合第一次玩的玩家，轻松体验游戏乐趣</p>
                    </div>
                  </div>

                  <div className="p-4 border-2 border-primary rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-lg text-primary">普通模式</h4>
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">平衡挑战</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>• 陷阱数量：约5个/关卡（密度35%）</p>
                      <p>• 平台数量：约10个/关卡（密度75%）</p>
                      <p>• 平台宽度：标准宽度</p>
                      <p>• 通关难度：⭐⭐</p>
                      <p className="text-muted-foreground">适合有一定经验的玩家，平衡的挑战体验</p>
                    </div>
                  </div>

                  <div className="p-4 border-2 border-accent rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-lg text-accent">困难模式</h4>
                      <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">高手挑战</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>• 陷阱数量：约7个/关卡（密度50%）</p>
                      <p>• 平台数量：约8个/关卡（密度60%）</p>
                      <p>• 平台宽度：较窄，需要精准操作</p>
                      <p>• 通关难度：⭐⭐⭐</p>
                      <p className="text-muted-foreground">适合追求极限挑战的高手玩家</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🏆 成就系统</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>完成10个关卡后，将获得对应难度的永久铭牌：</p>
                <div className="space-y-1 ml-4">
                  <p>🥉 简单铭牌 - 完成简单模式</p>
                  <p>🥈 普通铭牌 - 完成普通模式</p>
                  <p>🥇 困难铭牌 - 完成困难模式</p>
                </div>
                <p className="text-muted-foreground mt-2">所有成就都会永久保存！</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>💡 通关技巧</CardTitle>
                <CardDescription>掌握这些技巧，提高通关率</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-1">1. 观察先行</h4>
                  <p className="text-muted-foreground">不要急于前进，先观察平台和陷阱的位置，规划好跳跃路线</p>
                </div>

                <div className="p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-1">2. 掌握跳跃节奏</h4>
                  <p className="text-muted-foreground">跳跃有固定的弧线，练习掌握跳跃的距离和高度。支持二连跳，可以在空中再跳一次！</p>
                </div>

                <div className="p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-1">3. 善用二连跳✨</h4>
                  <p className="text-muted-foreground">二连跳是你的救命稻草！跳跃失误时可以在空中调整方向，或跨越更远的距离</p>
                </div>

                <div className="p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-1">4. 利用平台边缘</h4>
                  <p className="text-muted-foreground">在平台边缘起跳可以跳得更远，但要注意不要掉下去</p>
                </div>

                <div className="p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-1">5. 识别陷阱模式</h4>
                  <p className="text-muted-foreground">每个字母陷阱都有独特形态，学会快速识别它们</p>
                </div>

                <div className="p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-1">6. 道具收集策略</h4>
                  <p className="text-muted-foreground">道具不是必须的，如果位置危险可以选择跳过</p>
                </div>

                <div className="p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-1">7. 保持冷静</h4>
                  <p className="text-muted-foreground">失败是正常的，每次失败都是学习的机会</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎯 关卡通关路径</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>每个关卡都经过精心设计，确保至少有一条可行的通关路径：</p>
                <div className="space-y-1 ml-4">
                  <p>• 起点平台：位于左下角，宽度充足</p>
                  <p>• 中间平台：分布合理，可以逐步前进</p>
                  <p>• 终点平台：位于右上角，附近有终点星星</p>
                  <p>• 陷阱分布：不会完全阻挡通关路径</p>
                </div>
                <p className="text-primary font-semibold mt-2">提示：仔细观察，总能找到安全的路线！</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>⚡ 快捷操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• 游戏中可以点击"暂停"按钮暂停游戏</p>
                <p>• 失败后可以立即重新开始</p>
                <p>• 完成关卡后自动进入下一关</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => onOpenChange(false)}>
            开始游戏
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
