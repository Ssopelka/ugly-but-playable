import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';

const MAZE_SIZE = 15;

interface Position {
  x: number;
  y: number;
}

export const Maze = () => {
  const [maze, setMaze] = useState<boolean[][]>([]);
  const [player, setPlayer] = useState<Position>({ x: 1, y: 1 });
  const [goal, setGoal] = useState<Position>({ x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const generateMaze = useCallback(() => {
    // Simple maze generation - create a basic maze pattern
    const newMaze: boolean[][] = Array(MAZE_SIZE).fill(null).map(() => Array(MAZE_SIZE).fill(true));
    
    // Create paths (false = walkable, true = wall)
    for (let y = 1; y < MAZE_SIZE - 1; y += 2) {
      for (let x = 1; x < MAZE_SIZE - 1; x += 2) {
        newMaze[y][x] = false;
        
        // Random direction for path
        const directions = [
          { dx: 0, dy: -2 },
          { dx: 2, dy: 0 },
          { dx: 0, dy: 2 },
          { dx: -2, dy: 0 }
        ];
        
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const newX = x + dir.dx;
        const newY = y + dir.dy;
        
        if (newX > 0 && newX < MAZE_SIZE - 1 && newY > 0 && newY < MAZE_SIZE - 1) {
          newMaze[y + dir.dy / 2][x + dir.dx / 2] = false;
          newMaze[newY][newX] = false;
        }
      }
    }
    
    // Ensure start and goal are walkable
    newMaze[1][1] = false;
    newMaze[MAZE_SIZE - 2][MAZE_SIZE - 2] = false;
    
    // Add some random openings
    for (let i = 0; i < 10; i++) {
      const x = Math.floor(Math.random() * MAZE_SIZE);
      const y = Math.floor(Math.random() * MAZE_SIZE);
      if (x > 0 && x < MAZE_SIZE - 1 && y > 0 && y < MAZE_SIZE - 1) {
        newMaze[y][x] = false;
      }
    }
    
    setMaze(newMaze);
  }, []);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (!isPlaying || won) return;
    
    const newX = player.x + dx;
    const newY = player.y + dy;
    
    if (newX >= 0 && newX < MAZE_SIZE && 
        newY >= 0 && newY < MAZE_SIZE && 
        !maze[newY]?.[newX]) {
      setPlayer({ x: newX, y: newY });
      setMoves(prev => prev + 1);
      
      // Check if reached goal
      if (newX === goal.x && newY === goal.y) {
        setWon(true);
        setIsPlaying(false);
      }
    }
  }, [isPlaying, won, player, maze, goal]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        movePlayer(0, -1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        movePlayer(0, 1);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        movePlayer(-1, 0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        movePlayer(1, 0);
        break;
    }
  }, [movePlayer]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const startGame = () => {
    setIsPlaying(true);
    setWon(false);
    setMoves(0);
    setPlayer({ x: 1, y: 1 });
    setGoal({ x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 });
    generateMaze();
  };

  return (
    <div className="flex flex-col items-center gap-2 p-2 bg-card rounded-lg border-2 border-primary lag-physics">
      <h3 className="text-lg font-bold text-accent blink">🌀 ЛАБИРИНТ 🌀</h3>
      <div className="text-sm font-bold text-secondary">
        ХОДЫ: {moves} {won && '🎉 ПОБЕДА! 🎉'}
      </div>
      
      <div className="grid grid-cols-15 gap-0 text-xs" style={{ gridTemplateColumns: `repeat(${MAZE_SIZE}, 12px)` }}>
        {maze.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`
                w-3 h-3 border-0
                ${cell 
                  ? 'bg-red-600' 
                  : x === player.x && y === player.y 
                    ? 'bg-yellow-400 blink' 
                    : x === goal.x && y === goal.y 
                      ? 'bg-green-500 rainbow' 
                      : 'bg-blue-900'
                }
              `}
            >
              {x === player.x && y === player.y ? '😀' : 
               x === goal.x && y === goal.y ? '🎯' : ''}
            </div>
          ))
        )}
      </div>
      
      <div className="text-xs text-center">
        ⬆️⬇️⬅️➡️ или WASD
      </div>
      
      <Button onClick={startGame} variant="secondary" size="sm" className="drunk">
        {isPlaying ? 'НОВЫЙ' : 'СТАРТ'}
      </Button>
    </div>
  );
};