import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export const AnnoyingPopup = () => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isVisible, setIsVisible] = useState(true);

  const moveRandomly = () => {
    setPosition({
      x: Math.random() * (window.innerWidth - 200),
      y: Math.random() * (window.innerHeight - 100)
    });
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bg-destructive p-4 border-4 border-accent rounded-lg z-50 blink"
      style={{ left: position.x, top: position.y }}
    >
      <div className="text-destructive-foreground font-bold">
        🚨 ВНИМАНИЕ! 🚨
      </div>
      <div className="text-sm">Поймай меня если сможешь!</div>
      <Button 
        size="sm" 
        variant="secondary"
        className="shake mt-2"
        onMouseEnter={moveRandomly}
        onClick={() => setIsVisible(false)}
      >
        Закрыть
      </Button>
    </div>
  );
};

export const FloatingEmojis = () => {
  const [emojis, setEmojis] = useState<Array<{ id: number; emoji: string; x: number; y: number }>>([]);

  useEffect(() => {
    const emojiList = ['💩', '🤡', '🤮', '👹', '💀', '🔥', '⚡', '🌈'];
    
    const interval = setInterval(() => {
      const newEmoji = {
        id: Date.now(),
        emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
        x: Math.random() * window.innerWidth,
        y: window.innerHeight
      };
      
      setEmojis(prev => [...prev.slice(-10), newEmoji]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {emojis.map(emoji => (
        <div
          key={emoji.id}
          className="absolute text-4xl animate-bounce"
          style={{
            left: emoji.x,
            top: emoji.y,
            animation: 'float 5s linear forwards'
          }}
        >
          {emoji.emoji}
        </div>
      ))}
      <style>{`
        @keyframes float {
          from { transform: translateY(0px); }
          to { transform: translateY(-100vh); }
        }
      `}</style>
    </div>
  );
};

export const BouncingButton = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => {
  const [isRunning, setIsRunning] = useState(false);

  const runAway = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 2000);
  };

  return (
    <Button
      onClick={isRunning ? undefined : onClick}
      onMouseEnter={runAway}
      className={`transition-all duration-300 ${isRunning ? 'transform translate-x-20 translate-y-10 rotate-12' : ''} rainbow`}
      variant="destructive"
    >
      {children}
    </Button>
  );
};