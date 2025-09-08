import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 400;
const BALL_SIZE = 20;
const SHOOTER_SIZE = 30;

interface Ball {
  x: number;
  y: number;
  color: string;
  id: number;
}

interface ShooterBall {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
}

const COLORS = ['hsl(0, 100%, 50%)', 'hsl(120, 100%, 50%)', 'hsl(240, 100%, 50%)', 'hsl(60, 100%, 50%)', 'hsl(300, 100%, 50%)'];

export const Zuma = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [chain, setChain] = useState<Ball[]>([]);
  const [shooterBalls, setShooterBalls] = useState<ShooterBall[]>([]);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [angle, setAngle] = useState(0);
  const [chainPosition, setChainPosition] = useState(0);

  const initializeChain = useCallback(() => {
    const newChain: Ball[] = [];
    for (let i = 0; i < 15; i++) {
      newChain.push({
        x: 50 + i * (BALL_SIZE + 2),
        y: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        id: i
      });
    }
    setChain(newChain);
    setChainPosition(0);
  }, []);

  const updateGame = useCallback(() => {
    if (!isPlaying) return;

    // Двигаем цепочку
    setChainPosition(prev => prev + 0.5);
    setChain(prev => prev.map(ball => ({
      ...ball,
      x: ball.x + 0.5
    })));

    // Двигаем выстреленные шарики
    setShooterBalls(prev => 
      prev.map(ball => ({
        ...ball,
        x: ball.x + ball.dx,
        y: ball.y + ball.dy
      })).filter(ball => 
        ball.x > 0 && ball.x < CANVAS_WIDTH && 
        ball.y > 0 && ball.y < CANVAS_HEIGHT
      )
    );

    // Проверяем столкновения
    setShooterBalls(prevShooters => {
      let remainingShooters = [...prevShooters];
      
      prevShooters.forEach(shooter => {
        setChain(prevChain => {
          const chainIndex = prevChain.findIndex(ball => 
            Math.abs(ball.x - shooter.x) < BALL_SIZE && 
            Math.abs(ball.y - shooter.y) < BALL_SIZE
          );
          
          if (chainIndex !== -1) {
            remainingShooters = remainingShooters.filter(s => s !== shooter);
            
            // Вставляем шарик в цепочку
            const newChain = [...prevChain];
            newChain.splice(chainIndex, 0, {
              x: shooter.x,
              y: shooter.y,
              color: shooter.color,
              id: Date.now()
            });
            
            // Проверяем совпадения
            let matches = 1;
            let startIndex = chainIndex;
            
            // Считаем влево
            while (startIndex > 0 && newChain[startIndex - 1].color === shooter.color) {
              startIndex--;
              matches++;
            }
            
            // Считаем вправо
            let endIndex = chainIndex;
            while (endIndex < newChain.length - 1 && newChain[endIndex + 1].color === shooter.color) {
              endIndex++;
              matches++;
            }
            
            // Удаляем если 3 или больше
            if (matches >= 3) {
              newChain.splice(startIndex, matches);
              setScore(prev => prev + matches * 100);
            }
            
            return newChain;
          }
          
          return prevChain;
        });
      });
      
      return remainingShooters;
    });

    // Проверяем конец игры
    if (chain.length > 0 && chain[chain.length - 1].x > CANVAS_WIDTH - 50) {
      setIsPlaying(false);
    }
  }, [isPlaying, chain]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(updateGame, 16);
    return () => clearInterval(interval);
  }, [updateGame, isPlaying]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Очищаем канвас ужасным фоном
    ctx.fillStyle = 'hsl(50, 100%, 30%)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Рисуем путь змейкой
    ctx.strokeStyle = 'hsl(0, 100%, 50%)';
    ctx.lineWidth = 40;
    ctx.beginPath();
    for (let x = 0; x < CANVAS_WIDTH; x += 10) {
      const y = 100 + Math.sin(x * 0.02) * 50;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Рисуем цепочку шариков
    chain.forEach((ball, index) => {
      const pathY = 100 + Math.sin(ball.x * 0.02) * 50;
      ctx.fillStyle = ball.color;
      ctx.fillRect(ball.x, pathY - BALL_SIZE/2, BALL_SIZE, BALL_SIZE);
      
      // Уродливая рамка
      ctx.strokeStyle = 'hsl(0, 0%, 0%)';
      ctx.lineWidth = 2;
      ctx.strokeRect(ball.x, pathY - BALL_SIZE/2, BALL_SIZE, BALL_SIZE);
    });
    
    // Рисуем стрелок
    const shooterX = CANVAS_WIDTH / 2;
    const shooterY = CANVAS_HEIGHT - 50;
    
    ctx.save();
    ctx.translate(shooterX, shooterY);
    ctx.rotate(angle);
    
    // Ужасный стрелок
    ctx.fillStyle = 'hsl(300, 100%, 50%)';
    ctx.fillRect(-SHOOTER_SIZE/2, -SHOOTER_SIZE/2, SHOOTER_SIZE, SHOOTER_SIZE);
    ctx.fillStyle = currentColor;
    ctx.fillRect(-10, -30, 20, 30);
    
    ctx.restore();
    
    // Рисуем выстреленные шарики
    shooterBalls.forEach(ball => {
      ctx.fillStyle = ball.color;
      ctx.fillRect(ball.x - BALL_SIZE/2, ball.y - BALL_SIZE/2, BALL_SIZE, BALL_SIZE);
    });
    
    // Счет
    ctx.fillStyle = 'hsl(0, 100%, 50%)';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`ОЧКИ: ${score}`, 10, 30);
    ctx.fillText(`ШАРИКОВ: ${chain.length}`, 10, 60);
  }, [chain, shooterBalls, currentColor, angle, score]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const shooterX = CANVAS_WIDTH / 2;
    const shooterY = CANVAS_HEIGHT - 50;
    
    setAngle(Math.atan2(mouseY - shooterY, mouseX - shooterX));
  }, []);

  const handleShoot = useCallback(() => {
    if (!isPlaying) return;
    
    const shooterX = CANVAS_WIDTH / 2;
    const shooterY = CANVAS_HEIGHT - 50;
    const speed = 8;
    
    setShooterBalls(prev => [...prev, {
      x: shooterX,
      y: shooterY,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      color: currentColor
    }]);
    
    setCurrentColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  }, [isPlaying, angle, currentColor]);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setShooterBalls([]);
    setCurrentColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    initializeChain();
  };

  const stopGame = () => {
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-card rounded-lg border-4 border-accent wobble">
      <h2 className="text-2xl font-bold text-destructive rainbow">🐍 ГОВЁНАЯ ЗУМА 🐍</h2>
      
      <div className="text-lg font-bold text-primary blink">
        ОЧКИ: {score} | ШАРИКОВ: {chain.length}
      </div>
      
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="game-canvas glitch cursor-crosshair"
        onMouseMove={handleMouseMove}
        onClick={handleShoot}
      />
      
      <div className="flex gap-2">
        <Button onClick={startGame} variant="secondary" className="shake">
          НАЧАТЬ СТРАДАНИЯ
        </Button>
        <Button onClick={stopGame} variant="destructive" className="rotate">
          ОСТАНОВИТЬ БОЛЬ
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground text-center blink">
        Двигай мышкой и кликай чтобы стрелять
      </div>
    </div>
  );
};