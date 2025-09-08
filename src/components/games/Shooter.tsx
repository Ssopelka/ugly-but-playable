import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 250;

interface Bullet {
  x: number;
  y: number;
  dy: number;
}

interface Enemy {
  x: number;
  y: number;
  dy: number;
  color: string;
}

export const Shooter = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState({ x: CANVAS_WIDTH / 2 });
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [keys, setKeys] = useState<Set<string>>(new Set());

  const spawnEnemy = useCallback(() => {
    if (!isPlaying) return;
    
    const colors = ['hsl(0, 100%, 50%)', 'hsl(300, 100%, 50%)', 'hsl(60, 100%, 50%)'];
    setEnemies(prev => [...prev, {
      x: Math.random() * (CANVAS_WIDTH - 20),
      y: -20,
      dy: 1 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)]
    }]);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(spawnEnemy, 1000);
    return () => clearInterval(interval);
  }, [spawnEnemy, isPlaying]);

  const updateGame = useCallback(() => {
    if (!isPlaying) return;

    // Move player
    if (keys.has('ArrowLeft') && player.x > 0) {
      setPlayer(prev => ({ x: prev.x - 5 }));
    }
    if (keys.has('ArrowRight') && player.x < CANVAS_WIDTH - 20) {
      setPlayer(prev => ({ x: prev.x + 5 }));
    }

    // Move bullets
    setBullets(prev => prev
      .map(bullet => ({ ...bullet, y: bullet.y + bullet.dy }))
      .filter(bullet => bullet.y > 0)
    );

    // Move enemies
    setEnemies(prev => prev
      .map(enemy => ({ ...enemy, y: enemy.y + enemy.dy }))
      .filter(enemy => enemy.y < CANVAS_HEIGHT)
    );

    // Check bullet-enemy collisions
    setBullets(prevBullets => {
      const remainingBullets: Bullet[] = [];
      
      prevBullets.forEach(bullet => {
        let hit = false;
        
        setEnemies(prevEnemies => 
          prevEnemies.filter(enemy => {
            if (!hit && 
                bullet.x < enemy.x + 20 &&
                bullet.x + 5 > enemy.x &&
                bullet.y < enemy.y + 20 &&
                bullet.y + 10 > enemy.y) {
              hit = true;
              setScore(prev => prev + 10);
              return false;
            }
            return true;
          })
        );
        
        if (!hit) {
          remainingBullets.push(bullet);
        }
      });
      
      return remainingBullets;
    });

    // Check enemy-player collisions
    enemies.forEach(enemy => {
      if (enemy.x < player.x + 20 &&
          enemy.x + 20 > player.x &&
          enemy.y < CANVAS_HEIGHT - 30 &&
          enemy.y + 20 > CANVAS_HEIGHT - 50) {
        setIsPlaying(false);
      }
    });
  }, [isPlaying, player, keys, enemies]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(updateGame, 16);
    return () => clearInterval(interval);
  }, [updateGame, isPlaying]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setKeys(prev => new Set(prev).add(e.key));
    
    if (e.key === ' ' && isPlaying) {
      setBullets(prev => [...prev, {
        x: player.x + 10,
        y: CANVAS_HEIGHT - 50,
        dy: -8
      }]);
    }
  }, [isPlaying, player]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setKeys(prev => {
      const newKeys = new Set(prev);
      newKeys.delete(e.key);
      return newKeys;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = 'hsl(240, 50%, 5%)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw player
    ctx.fillStyle = 'hsl(120, 100%, 50%)';
    ctx.fillRect(player.x, CANVAS_HEIGHT - 30, 20, 20);
    
    // Draw bullets
    ctx.fillStyle = 'hsl(60, 100%, 50%)';
    bullets.forEach(bullet => {
      ctx.fillRect(bullet.x, bullet.y, 5, 10);
    });
    
    // Draw enemies
    enemies.forEach(enemy => {
      ctx.fillStyle = enemy.color;
      ctx.fillRect(enemy.x, enemy.y, 20, 20);
    });
  }, [player, bullets, enemies]);

  useEffect(() => {
    draw();
  }, [draw]);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setBullets([]);
    setEnemies([]);
    setPlayer({ x: CANVAS_WIDTH / 2 });
  };

  return (
    <div className="flex flex-col items-center gap-2 p-2 bg-card rounded-lg border-2 border-primary wobble">
      <h3 className="text-lg font-bold text-accent blink">🚀 СТРЕЛЯЛКА 🚀</h3>
      <div className="text-sm font-bold text-secondary">ОЧКИ: {score}</div>
      
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-destructive"
      />
      
      <div className="text-xs text-center">
        ←→ движение, ПРОБЕЛ стрелять
      </div>
      
      <Button onClick={startGame} variant="secondary" size="sm" className="glitch">
        {isPlaying ? 'РЕСТАРТ' : 'СТАРТ'}
      </Button>
    </div>
  );
};