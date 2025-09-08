import { useState, useEffect } from 'react';
import { Tetris } from '@/components/games/Tetris';
import { Pong } from '@/components/games/Pong';
import { AnnoyingPopup, FloatingEmojis, BouncingButton } from '@/components/AnnoyingElements';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [currentGame, setCurrentGame] = useState<'none' | 'tetris' | 'pong'>('none');
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
    <div className="min-h-screen bg-background p-4 relative overflow-x-hidden">
      <FloatingEmojis />
      {showPopup && <AnnoyingPopup />}
      
      <div className="max-w-6xl mx-auto">
        {/* Ужасный заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-primary blink mb-4">
            🎮 УБЛЮДСКИЙ ИГРОВОЙ ПОРТАЛ 🎮
          </h1>
          <p className="text-2xl text-secondary shake mb-4">
            Добро пожаловать в АД игр! 😈
          </p>
          <div className="text-lg text-accent rotate">
            ⚠️ ВНИМАНИЕ: Дизайн может вызвать рвоту! ⚠️
          </div>
        </div>

        {/* Кнопки выбора игры */}
        <div className="flex justify-center gap-6 mb-8 flex-wrap">
          <BouncingButton onClick={() => setCurrentGame('tetris')}>
            🟩 ТЕТРИС БОЛЬ 🟩
          </BouncingButton>
          
          <BouncingButton onClick={() => setCurrentGame('pong')}>
            🏓 ПОНГ СТРАДАНИЯ 🏓
          </BouncingButton>
          
          <Button 
            onClick={() => setCurrentGame('none')}
            variant="secondary"
            className="glitch"
          >
            ❌ НИЧЕГО ❌
          </Button>
        </div>

        {/* Игровая область */}
        <div className="flex justify-center">
          {currentGame === 'tetris' && <Tetris />}
          {currentGame === 'pong' && <Pong />}
          {currentGame === 'none' && (
            <div className="text-center p-8 bg-card rounded-lg border-4 border-destructive">
              <div className="text-4xl mb-4 rainbow">🎯</div>
              <h3 className="text-2xl font-bold text-primary blink mb-4">
                Выбери свои страдания!
              </h3>
              <p className="text-lg text-muted-foreground shake">
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
