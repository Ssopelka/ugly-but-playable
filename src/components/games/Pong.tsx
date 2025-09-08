import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 300;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 60;
const BALL_SIZE = 10;
const PADDLE_SPEED = 5;

interface Position {
  x: number;
  y: number;
}

interface Ball extends Position {
  dx: number;
  dy: number;
}

export const Pong = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  
  const [playerPaddle, setPlayerPaddle] = useState<Position>({ 
    x: 10, 
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 
  });
  
  const [aiPaddle, setAiPaddle] = useState<Position>({ 
    x: CANVAS_WIDTH - 20, 
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 
  });
  
  const [ball, setBall] = useState<Ball>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    dx: 3,
    dy: 2
  });
  
  const [gameTime, setGameTime] = useState(0);

  const resetBall = useCallback(() => {
    setBall({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: Math.random() > 0.5 ? 3 : -3,
      dy: (Math.random() - 0.5) * 4
    });
  }, []);

  const updateGame = useCallback(() => {
    if (!isPlaying) return;

    setGameTime(prev => prev + 1);
    
    setBall(prevBall => {
      let newBall = { ...prevBall };
      
      // Ускорение шарика со временем
      const speedMultiplier = 1 + (gameTime * 0.001);
      
      // Move ball
      newBall.x += newBall.dx * speedMultiplier;
      newBall.y += newBall.dy * speedMultiplier;
      
      // Ball collision with top/bottom walls
      if (newBall.y <= 0 || newBall.y >= CANVAS_HEIGHT - BALL_SIZE) {
        newBall.dy = -newBall.dy;
      }
      
      // Ball collision with player paddle
      if (newBall.x <= playerPaddle.x + PADDLE_WIDTH &&
          newBall.x >= playerPaddle.x &&
          newBall.y >= playerPaddle.y &&
          newBall.y <= playerPaddle.y + PADDLE_HEIGHT) {
        newBall.dx = -newBall.dx;
        newBall.x = playerPaddle.x + PADDLE_WIDTH;
      }
      
      // Ball collision with AI paddle
      if (newBall.x >= aiPaddle.x - BALL_SIZE &&
          newBall.x <= aiPaddle.x &&
          newBall.y >= aiPaddle.y &&
          newBall.y <= aiPaddle.y + PADDLE_HEIGHT) {
        newBall.dx = -newBall.dx;
        newBall.x = aiPaddle.x - BALL_SIZE;
      }
      
      // Score
      if (newBall.x <= 0) {
        setAiScore(prev => prev + 1);
        setTimeout(resetBall, 1000);
        return {
          x: CANVAS_WIDTH / 2,
          y: CANVAS_HEIGHT / 2,
          dx: 0,
          dy: 0
        };
      }
      
      if (newBall.x >= CANVAS_WIDTH) {
        setPlayerScore(prev => prev + 1);
        setTimeout(resetBall, 1000);
        return {
          x: CANVAS_WIDTH / 2,
          y: CANVAS_HEIGHT / 2,
          dx: 0,
          dy: 0
        };
      }
      
      return newBall;
    });

    // AI paddle movement (simple AI)
    setAiPaddle(prev => {
      const paddleCenter = prev.y + PADDLE_HEIGHT / 2;
      const ballCenter = ball.y + BALL_SIZE / 2;
      let newY = prev.y;
      
      if (paddleCenter < ballCenter - 10) {
        newY += PADDLE_SPEED * 0.7; // Make AI slightly slower
      } else if (paddleCenter > ballCenter + 10) {
        newY -= PADDLE_SPEED * 0.7;
      }
      
      // Keep paddle in bounds
      newY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newY));
      
      return { ...prev, y: newY };
    });
  }, [isPlaying, ball, playerPaddle, aiPaddle, resetBall]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isPlaying) return;
    
    setPlayerPaddle(prev => {
      let newY = prev.y;
      
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        newY -= PADDLE_SPEED;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        newY += PADDLE_SPEED;
      }
      
      // Keep paddle in bounds
      newY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newY));
      
      return { ...prev, y: newY };
    });
  }, [isPlaying]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(updateGame, 16); // ~60 FPS
    return () => clearInterval(interval);
  }, [updateGame, isPlaying]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas with ugly background
    ctx.fillStyle = 'hsl(60, 100%, 25%)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw center line
    ctx.strokeStyle = 'hsl(0, 100%, 50%)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw player paddle
    ctx.fillStyle = 'hsl(120, 100%, 50%)';
    ctx.fillRect(playerPaddle.x, playerPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    
    // Draw AI paddle
    ctx.fillStyle = 'hsl(300, 100%, 50%)';
    ctx.fillRect(aiPaddle.x, aiPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    
    // Draw ball
    ctx.fillStyle = 'hsl(0, 100%, 50%)';
    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
    
    // Draw scores
    ctx.fillStyle = 'hsl(240, 100%, 50%)';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(playerScore.toString(), CANVAS_WIDTH / 4, 30);
    ctx.fillText(aiScore.toString(), (CANVAS_WIDTH * 3) / 4, 30);
  }, [playerPaddle, aiPaddle, ball, playerScore, aiScore]);

  useEffect(() => {
    draw();
  }, [draw]);

  const startGame = () => {
    setIsPlaying(true);
    setPlayerScore(0);
    setAiScore(0);
    setGameTime(0);
    resetBall();
  };

  const stopGame = () => {
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-card rounded-lg border-4 border-primary">
      <h2 className="text-2xl font-bold text-accent blink">🏓 ГОВЁНЫЙ ПОНГ 🏓</h2>
      
      <div className="flex gap-8 text-lg font-bold">
        <span className="text-secondary shake">Игрок: {playerScore}</span>
        <span className="text-destructive rotate">ИИ: {aiScore}</span>
      </div>
      
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="game-canvas glitch"
      />
      
      <div className="flex gap-2">
        <Button onClick={startGame} variant="secondary" className="rainbow">
          СТАРТ
        </Button>
        <Button onClick={stopGame} variant="destructive" className="shake">
          СТОП
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground text-center">
        ⬆️⬇️ или W/S для управления
      </div>
    </div>
  );
};
