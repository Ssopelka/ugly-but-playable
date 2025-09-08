import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const GRID_SIZE = 4;
const CARDS = ['🤡', '💩', '👹', '💀', '🤮', '🔥', '⚡', '🌈'];

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const Memory = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  const initializeGame = () => {
    const gameCards = [...CARDS, ...CARDS]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(gameCards);
    setFlippedCards([]);
    setScore(0);
    setMoves(0);
    setIsPlaying(true);
  };

  const handleCardClick = (cardId: number) => {
    if (!isPlaying || flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);
      
      if (firstCard?.value === secondCard?.value) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true }
              : c
          ));
          setScore(prev => prev + 100);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    const matchedCards = cards.filter(c => c.isMatched).length;
    if (matchedCards === cards.length && cards.length > 0) {
      setIsPlaying(false);
    }
  }, [cards]);

  return (
    <div className="flex flex-col items-center gap-2 p-2 bg-card rounded-lg border-2 border-primary tilt-right">
      <h3 className="text-lg font-bold text-accent blink">🧠 ПАМЯТЬ 🧠</h3>
      <div className="text-sm font-bold text-secondary">
        ОЧКИ: {score} | ХОДЫ: {moves}
      </div>
      
      <div className="grid grid-cols-4 gap-1 max-w-xs">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`
              w-12 h-12 rounded border-2 text-lg font-bold transition-all
              ${card.isMatched 
                ? 'bg-green-500 border-green-600' 
                : card.isFlipped 
                  ? 'bg-yellow-400 border-yellow-500' 
                  : 'bg-red-500 border-red-600 hover:bg-red-400'
              }
              ${!card.isMatched && !card.isFlipped ? 'shake' : ''}
            `}
          >
            {card.isFlipped || card.isMatched ? card.value : '❓'}
          </button>
        ))}
      </div>
      
      <Button onClick={initializeGame} variant="secondary" size="sm" className="rainbow">
        {isPlaying ? 'РЕСТАРТ' : 'СТАРТ'}
      </Button>
    </div>
  );
};