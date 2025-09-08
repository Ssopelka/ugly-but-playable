import { useState, useEffect } from 'react';
import { Tetris } from '@/components/games/Tetris';
import { Pong } from '@/components/games/Pong';
import { Zuma } from '@/components/games/Zuma';
import { Snake } from '@/components/games/Snake';
import { Breakout } from '@/components/games/Breakout';
import { Memory } from '@/components/games/Memory';
import { Shooter } from '@/components/games/Shooter';
import { Maze } from '@/components/games/Maze';
import { AnnoyingPopup, FloatingEmojis, BouncingButton } from '@/components/AnnoyingElements';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [currentGame, setCurrentGame] = useState<'none' | 'tetris' | 'pong' | 'zuma' | 'snake' | 'breakout' | 'memory' | 'shooter' | 'maze'>('none');
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    // Annoying sound alerts
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        console.log('💩 BEEP BEEP! 💩');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen bg-background p-2 relative overflow-hidden container drunk">
      <FloatingEmojis />
      {showPopup && <AnnoyingPopup />}
      
      <div className="max-w-6xl mx-auto">
        {/* Ужасный заголовок */}
        <div className="text-center mb-2 tilt-left wobble">
          <h1 className="text-3xl font-bold text-primary blink mb-2 lag-physics">
            🎮 УБЛЮДСКИЙ ИГРОВОЙ ПОРТАЛ 🎮
          </h1>
          <p className="text-sm text-secondary shake mb-2 tilt-right">
            8 игр для твоих страданий! 😈
          </p>
        </div>

        {/* Кнопки выбора игры */}
        <div className="flex justify-center gap-1 mb-2 flex-wrap text-xs tilt-right">
          <Button onClick={() => setCurrentGame('tetris')} size="sm" variant="destructive" className="text-xs">🟩 ТЕТРИС</Button>
          <Button onClick={() => setCurrentGame('pong')} size="sm" variant="destructive" className="text-xs">🏓 ПОНГ</Button>
          <Button onClick={() => setCurrentGame('zuma')} size="sm" variant="destructive" className="text-xs">🐍 ЗУМА</Button>
          <Button onClick={() => setCurrentGame('snake')} size="sm" variant="destructive" className="text-xs">🐍 ЗМЕЙКА</Button>
          <Button onClick={() => setCurrentGame('breakout')} size="sm" variant="destructive" className="text-xs">🧱 АРКАНОИД</Button>
          <Button onClick={() => setCurrentGame('memory')} size="sm" variant="destructive" className="text-xs">🧠 ПАМЯТЬ</Button>
          <Button onClick={() => setCurrentGame('shooter')} size="sm" variant="destructive" className="text-xs">🚀 СТРЕЛЯЛКА</Button>
          <Button onClick={() => setCurrentGame('maze')} size="sm" variant="destructive" className="text-xs">🌀 ЛАБИРИНТ</Button>
        </div>

        {/* Игровая область */}
        <div className="flex justify-center game-container h-96 overflow-hidden">
          {currentGame === 'tetris' && <div className="tilt-left"><Tetris /></div>}
          {currentGame === 'pong' && <div className="tilt-right"><Pong /></div>}
          {currentGame === 'zuma' && <div className="wobble"><Zuma /></div>}
          {currentGame === 'snake' && <div className="lag-physics"><Snake /></div>}
          {currentGame === 'breakout' && <div className="drunk"><Breakout /></div>}
          {currentGame === 'memory' && <div className="shake"><Memory /></div>}
          {currentGame === 'shooter' && <div className="glitch"><Shooter /></div>}
          {currentGame === 'maze' && <div className="rotate"><Maze /></div>}
          {currentGame === 'none' && (
            <div className="text-center p-4 bg-card rounded-lg border-2 border-destructive lag-physics">
              <div className="text-2xl mb-2 rainbow drunk">🎯</div>
              <h3 className="text-lg font-bold text-primary blink mb-2 shake">
                Выбери игру!
              </h3>
            </div>
          )}
        </div>

        {/* Ублюдские элементы */}
        <div className="fixed bottom-1 right-1">
          <Button onClick={() => window.alert('НЕ ЛЕЗЬ!')} variant="destructive" size="sm" className="text-xs rotate">
            НЕ НАЖИМАЙ!
          </Button>
        </div>

        <div className="fixed top-1 left-1 text-lg shake">🤡</div>
        <div className="fixed top-1 right-1 text-lg blink">💀</div>
        <div className="fixed bottom-1 left-1 text-lg rainbow">🌈</div>
      </div>
    </div>
  );
};

export default Index;
