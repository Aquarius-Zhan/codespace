import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CheatPanelProps {
  onSkipLevel: () => void;
  onCompleteAll: () => void;
  currentLevel: number;
  totalLevels: number;
}

export function CheatPanel({ onSkipLevel, onCompleteAll, currentLevel, totalLevels }: CheatPanelProps) {
  const [showWarning, setShowWarning] = useState(false);

  const handleSkipLevel = () => {
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 2000);
    onSkipLevel();
  };

  const handleCompleteAll = () => {
    if (window.confirm('确定要跳过所有关卡并直接获得胜利吗？\n\n这将立即完成游戏并获得成就。')) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      onCompleteAll();
    }
  };

  return (
    <Card className="border-destructive bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          ⚡ 开发者模式
        </CardTitle>
        <CardDescription>
          作弊功能仅用于测试，使用后将影响游戏体验
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {showWarning && (
          <Alert className="bg-destructive text-destructive-foreground">
            <AlertDescription className="font-semibold">
              ⚠️ 作弊模式已激活！
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Button
            onClick={handleSkipLevel}
            variant="outline"
            className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            disabled={currentLevel >= totalLevels - 1}
          >
            跳过当前关卡 ({currentLevel + 1}/{totalLevels})
          </Button>

          <Button
            onClick={handleCompleteAll}
            variant="destructive"
            className="w-full"
          >
            一键通关所有关卡
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• 跳过关卡：立即进入下一关</p>
          <p>• 一键通关：直接完成所有关卡并获得成就</p>
          <p className="text-destructive font-semibold">注意：作弊不会获得真正的成就感！</p>
        </div>
      </CardContent>
    </Card>
  );
}
