import { useState, useEffect } from 'react';
import { Tetris } from '@/components/games/Tetris';
import { Pong } from '@/components/games/Pong';
import { Zuma } from '@/components/games/Zuma';
import { AnnoyingPopup, FloatingEmojis, BouncingButton } from '@/components/AnnoyingElements';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [currentGame, setCurrentGame] = useState<'none' | 'tetris' | 'pong' | 'zuma'>('none');
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
    <div className="min-h-screen bg-background p-4 relative overflow-x-hidden container drunk">
      <FloatingEmojis />
      {showPopup && <AnnoyingPopup />}
      
      <div className="max-w-6xl mx-auto">
        {/* Ужасный заголовок */}
        <div className="text-center mb-8 tilt-left wobble">
          <h1 className="text-6xl font-bold text-primary blink mb-4 lag-physics">
            🎮 УБЛЮДСКИЙ ИГРОВОЙ ПОРТАЛ 🎮
          </h1>
          <p className="text-2xl text-secondary shake mb-4 tilt-right">
            Добро пожаловать в АД игр! 😈
          </p>
          <div className="text-lg text-accent rotate drunk">
            ⚠️ ВНИМАНИЕ: Дизайн может вызвать рвоту! ⚠️
          </div>
        </div>

        {/* Кнопки выбора игры */}
        <div className="flex justify-center gap-6 mb-8 flex-wrap tilt-right">
          <BouncingButton onClick={() => setCurrentGame('tetris')}>
            🟩 ТЕТРИС БОЛЬ 🟩
          </BouncingButton>
          
          <BouncingButton onClick={() => setCurrentGame('pong')}>
            🏓 ПОНГ СТРАДАНИЯ 🏓
          </BouncingButton>
          
          <BouncingButton onClick={() => setCurrentGame('zuma')}>
            🐍 ЗУМА КОШМАР 🐍
          </BouncingButton>
          
          <Button 
            onClick={() => setCurrentGame('none')}
            variant="secondary"
            className="glitch wobble"
          >
            ❌ НИЧЕГО ❌
          </Button>
        </div>

        {/* Игровая область */}
        <div className="flex justify-center game-container">
          {currentGame === 'tetris' && <div className="tilt-left"><Tetris /></div>}
          {currentGame === 'pong' && <div className="tilt-right"><Pong /></div>}
          {currentGame === 'zuma' && <div className="wobble"><Zuma /></div>}
          {currentGame === 'none' && (
            <div className="text-center p-8 bg-card rounded-lg border-4 border-destructive lag-physics">
              <div className="text-4xl mb-4 rainbow drunk">🎯</div>
              <h3 className="text-2xl font-bold text-primary blink mb-4 shake">
                Выбери свои страдания!
              </h3>
              <p className="text-lg text-muted-foreground shake wobble">
                Нажми на одну из кнопок выше... если сможешь! 😈
              </p>
            </div>
          )}
        </div>

        {/* Дополнительные ублюдские элементы */}
        <div className="fixed bottom-4 right-4">
          <Button 
            onClick={() => window.alert('А НУ НЕ ЛЕЗЬ! ДЕБИЛ!')}
            variant="destructive"
            className="rotate"
          >
            НЕ НАЖИМАЙ!
          </Button>
        </div>

        <div className="fixed top-4 left-4">
          <div className="text-2xl shake">🤡</div>
        </div>

        <div className="fixed top-4 right-4">
          <div className="text-2xl blink">💀</div>
        </div>

        <div className="fixed bottom-4 left-4">
          <div className="text-2xl rainbow">🌈</div>
        </div>

        {/* Ублюдский футер */}
        <div className="text-center mt-12 p-4 bg-muted rounded-lg border-2 border-accent">
          <p className="text-sm text-muted-foreground glitch">
            © 2024 Ублюдский Портал. Все права нарушены. 
            Если у вас болят глаза - это нормально! 🤮
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
