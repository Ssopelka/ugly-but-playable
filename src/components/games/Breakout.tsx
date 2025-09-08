import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 250;
const PADDLE_WIDTH = 60;
const PADDLE_HEIGHT = 10;
const BALL_SIZE = 8;
const BRICK_WIDTH = 30;
const BRICK_HEIGHT = 15;

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

interface Brick {
  x: number;
  y: number;
  visible: boolean;
  color: string;
}

export const Breakout = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paddle, setPaddle] = useState({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2 });
  const [ball, setBall] = useState<Ball>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, dx: 3, dy: -3 });
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);

  const initializeBricks = useCallback(() => {
    const newBricks: Brick[] = [];
    const colors = ['hsl(0, 100%, 50%)', 'hsl(60, 100%, 50%)', 'hsl(120, 100%, 50%)', 'hsl(240, 100%, 50%)'];
    
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 10; col++) {
        newBricks.push({
          x: col * (BRICK_WIDTH + 2) + 5,
          y: row * (BRICK_HEIGHT + 2) + 30,
          visible: true,
          color: colors[row]
        });
      }
    }
    setBricks(newBricks);
  }, []);

  const updateGame = useCallback(() => {
    if (!isPlaying) return;

    setBall(prevBall => {
      let newBall = { ...prevBall };
      
      newBall.x += newBall.dx;
      newBall.y += newBall.dy;
      
      // Wall bouncing
      if (newBall.x <= 0 || newBall.x >= CANVAS_WIDTH - BALL_SIZE) {
        newBall.dx = -newBall.dx;
      }
      if (newBall.y <= 0) {
        newBall.dy = -newBall.dy;
      }
      
      // Paddle collision
      if (newBall.y >= CANVAS_HEIGHT - 40 && 
          newBall.x >= paddle.x && 
          newBall.x <= paddle.x + PADDLE_WIDTH) {
        newBall.dy = -Math.abs(newBall.dy);
      }
      
      // Game over
      if (newBall.y > CANVAS_HEIGHT) {
        setIsPlaying(false);
      }
      
      return newBall;
    });

    // Brick collision
    setBricks(prevBricks => {
      const newBricks = [...prevBricks];
      let hit = false;
      
      newBricks.forEach(brick => {
        if (brick.visible && 
            ball.x < brick.x + BRICK_WIDTH &&
            ball.x + BALL_SIZE > brick.x &&
            ball.y < brick.y + BRICK_HEIGHT &&
            ball.y + BALL_SIZE > brick.y) {
          brick.visible = false;
          setScore(prev => prev + 10);
          hit = true;
        }
      });
      
      if (hit) {
        setBall(prev => ({ ...prev, dy: -prev.dy }));
      }
      
      return newBricks;
    });
  }, [isPlaying, ball, paddle]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(updateGame, 16);
    return () => clearInterval(interval);
  }, [updateGame, isPlaying]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    setPaddle({ x: Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, mouseX - PADDLE_WIDTH / 2)) });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = 'hsl(0, 0%, 10%)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw bricks
    bricks.forEach(brick => {
      if (brick.visible) {
        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT);
      }
    });
    
    // Draw paddle
    ctx.fillStyle = 'hsl(300, 100%, 50%)';
    ctx.fillRect(paddle.x, CANVAS_HEIGHT - 20, PADDLE_WIDTH, PADDLE_HEIGHT);
    
    // Draw ball
    ctx.fillStyle = 'hsl(60, 100%, 50%)';
    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
  }, [bricks, paddle, ball]);

  useEffect(() => {
    draw();
  }, [draw]);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setBall({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, dx: 3, dy: -3 });
    setPaddle({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2 });
    initializeBricks();
  };

  return (
    <div className="flex flex-col items-center gap-2 p-2 bg-card rounded-lg border-2 border-primary tilt-left">
      <h3 className="text-lg font-bold text-accent blink">🧱 АРКАНОИД 🧱</h3>
      <div className="text-sm font-bold text-secondary">ОЧКИ: {score}</div>
      
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-destructive cursor-none"
        onMouseMove={handleMouseMove}
      />
      
      <Button onClick={startGame} variant="secondary" size="sm" className="rotate">
        {isPlaying ? 'РЕСТАРТ' : 'СТАРТ'}
      </Button>
    </div>
  );
};