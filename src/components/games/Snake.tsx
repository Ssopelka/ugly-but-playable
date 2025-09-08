import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 250;
const GRID_SIZE = 15;

interface Position {
  x: number;
  y: number;
}

export const Snake = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Position[]>([{ x: 150, y: 150 }]);
  const [food, setFood] = useState<Position>({ x: 90, y: 90 });
  const [direction, setDirection] = useState<Position>({ x: GRID_SIZE, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);

  const generateFood = useCallback(() => {
    const x = Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)) * GRID_SIZE;
    const y = Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)) * GRID_SIZE;
    return { x, y };
  }, []);

  const updateGame = useCallback(() => {
    if (!isPlaying) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;
      
      // Wrap around walls
      if (head.x < 0) head.x = CANVAS_WIDTH - GRID_SIZE;
      if (head.x >= CANVAS_WIDTH) head.x = 0;
      if (head.y < 0) head.y = CANVAS_HEIGHT - GRID_SIZE;
      if (head.y >= CANVAS_HEIGHT) head.y = 0;
      
      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setIsPlaying(false);
        return prevSnake;
      }
      
      newSnake.unshift(head);
      
      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }
      
      return newSnake;
    });
  }, [isPlaying, direction, food, generateFood]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(updateGame, 200);
    return () => clearInterval(interval);
  }, [updateGame, isPlaying]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isPlaying) return;
    
    switch (e.key) {
      case 'ArrowUp':
        if (direction.y === 0) setDirection({ x: 0, y: -GRID_SIZE });
        break;
      case 'ArrowDown':
        if (direction.y === 0) setDirection({ x: 0, y: GRID_SIZE });
        break;
      case 'ArrowLeft':
        if (direction.x === 0) setDirection({ x: -GRID_SIZE, y: 0 });
        break;
      case 'ArrowRight':
        if (direction.x === 0) setDirection({ x: GRID_SIZE, y: 0 });
        break;
    }
  }, [isPlaying, direction]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = 'hsl(240, 100%, 10%)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? 'hsl(120, 100%, 50%)' : 'hsl(120, 50%, 40%)';
      ctx.fillRect(segment.x, segment.y, GRID_SIZE - 1, GRID_SIZE - 1);
    });
    
    // Draw food
    ctx.fillStyle = 'hsl(0, 100%, 50%)';
    ctx.fillRect(food.x, food.y, GRID_SIZE - 1, GRID_SIZE - 1);
  }, [snake, food]);

  useEffect(() => {
    draw();
  }, [draw]);

  const startGame = () => {
    setIsPlaying(true);
    setSnake([{ x: 150, y: 150 }]);
    setDirection({ x: GRID_SIZE, y: 0 });
    setScore(0);
    setFood(generateFood());
  };

  return (
    <div className="flex flex-col items-center gap-2 p-2 bg-card rounded-lg border-2 border-primary wobble">
      <h3 className="text-lg font-bold text-accent blink">🐍 ЗМЕЙКА 🐍</h3>
      <div className="text-sm font-bold text-secondary">ОЧКИ: {score}</div>
      
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-destructive"
      />
      
      <Button onClick={startGame} variant="secondary" size="sm" className="shake">
        {isPlaying ? 'РЕСТАРТ' : 'СТАРТ'}
      </Button>
    </div>
  );
};