import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 25;

const TETROMINOS = [
  { shape: [[1, 1, 1, 1]], color: 'hsl(0, 100%, 50%)' }, // I
  { shape: [[1, 1], [1, 1]], color: 'hsl(60, 100%, 50%)' }, // O
  { shape: [[0, 1, 0], [1, 1, 1]], color: 'hsl(300, 100%, 50%)' }, // T
  { shape: [[0, 1, 1], [1, 1, 0]], color: 'hsl(120, 100%, 50%)' }, // S
  { shape: [[1, 1, 0], [0, 1, 1]], color: 'hsl(240, 100%, 50%)' }, // Z
  { shape: [[1, 0, 0], [1, 1, 1]], color: 'hsl(30, 100%, 50%)' }, // J
  { shape: [[0, 0, 1], [1, 1, 1]], color: 'hsl(180, 100%, 50%)' }, // L
];

interface Position {
  x: number;
  y: number;
}

interface Tetromino {
  shape: number[][];
  color: string;
  position: Position;
}

export const Tetris = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [board, setBoard] = useState<string[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(''))
  );
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const createNewPiece = useCallback((): Tetromino => {
    const randomTetromino = TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)];
    return {
      ...randomTetromino,
      position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 }
    };
  }, []);

  const rotatePiece = (piece: Tetromino): Tetromino => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    );
    return { ...piece, shape: rotated };
  };

  const isValidPosition = (piece: Tetromino, boardState: string[][]): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.position.x + x;
          const newY = piece.position.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && boardState[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const placePiece = (piece: Tetromino, boardState: string[][]): string[][] => {
    const newBoard = boardState.map(row => [...row]);
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.position.y + y;
          const boardX = piece.position.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color;
          }
        }
      }
    }
    
    return newBoard;
  };

  const clearLines = (boardState: string[][]): { newBoard: string[][]; linesCleared: number } => {
    const newBoard = boardState.filter(row => row.some(cell => !cell));
    const linesCleared = BOARD_HEIGHT - newBoard.length;
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(''));
    }
    
    return { newBoard, linesCleared };
  };

  const movePiece = useCallback((dx: number, dy: number) => {
    if (!currentPiece || gameOver) return;
    
    const newPiece = {
      ...currentPiece,
      position: { x: currentPiece.position.x + dx, y: currentPiece.position.y + dy }
    };
    
    if (isValidPosition(newPiece, board)) {
      setCurrentPiece(newPiece);
    } else if (dy > 0) {
      // Piece can't move down, place it
      const newBoard = placePiece(currentPiece, board);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
      
      setBoard(clearedBoard);
      setScore(prev => prev + linesCleared * 100);
      
      const nextPiece = createNewPiece();
      if (!isValidPosition(nextPiece, clearedBoard)) {
        setGameOver(true);
        setIsPlaying(false);
      } else {
        setCurrentPiece(nextPiece);
      }
    }
  }, [currentPiece, board, gameOver, createNewPiece]);

  const rotatePieceHandler = useCallback(() => {
    if (!currentPiece || gameOver) return;
    
    const rotatedPiece = rotatePiece(currentPiece);
    if (isValidPosition(rotatedPiece, board)) {
      setCurrentPiece(rotatedPiece);
    }
  }, [currentPiece, board, gameOver]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isPlaying) return;
    
    switch (e.code) {
      case 'ArrowLeft':
        movePiece(-1, 0);
        break;
      case 'ArrowRight':
        movePiece(1, 0);
        break;
      case 'ArrowDown':
        movePiece(0, 1);
        break;
      case 'ArrowUp':
      case 'Space':
        rotatePieceHandler();
        break;
    }
  }, [movePiece, rotatePieceHandler, isPlaying]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      movePiece(0, 1);
    }, 500);
    
    return () => clearInterval(interval);
  }, [movePiece, isPlaying]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = 'hsl(300, 100%, 25%)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw board
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x]) {
          ctx.fillStyle = board[y][x];
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          ctx.strokeStyle = 'hsl(0, 0%, 0%)';
          ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }
    
    // Draw current piece
    if (currentPiece) {
      ctx.fillStyle = currentPiece.color;
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const drawX = (currentPiece.position.x + x) * CELL_SIZE;
            const drawY = (currentPiece.position.y + y) * CELL_SIZE;
            ctx.fillRect(drawX, drawY, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = 'hsl(0, 0%, 0%)';
            ctx.strokeRect(drawX, drawY, CELL_SIZE, CELL_SIZE);
          }
        }
      }
    }
  }, [board, currentPiece]);

  useEffect(() => {
    draw();
  }, [draw]);

  const startGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('')));
    setCurrentPiece(createNewPiece());
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-card rounded-lg border-4 border-accent">
      <h2 className="text-2xl font-bold text-primary blink">🎮 УБЛЮДСКИЙ ТЕТРИС 🎮</h2>
      <div className="text-lg font-bold text-secondary shake">Очки: {score}</div>
      
      <canvas
        ref={canvasRef}
        width={BOARD_WIDTH * CELL_SIZE}
        height={BOARD_HEIGHT * CELL_SIZE}
        className="game-canvas rainbow"
      />
      
      <div className="flex gap-2">
        <Button onClick={startGame} variant="destructive" className="rotate">
          {isPlaying ? 'ПЕРЕЗАПУСК' : 'ИГРАТЬ'}
        </Button>
      </div>
      
      {gameOver && (
        <div className="text-xl font-bold text-destructive glitch">
          💀 КОНЕЦ ИГРЫ! 💀
        </div>
      )}
      
      <div className="text-sm text-muted-foreground text-center">
        ⬅️➡️ движение | ⬇️ ускорение | ⬆️/SPACE поворот
      </div>
    </div>
  );
};