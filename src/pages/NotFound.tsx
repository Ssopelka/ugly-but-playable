import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-destructive blink">💀 404 💀</h1>
        <p className="mb-4 text-2xl text-primary shake">СТРАНИЦА СДОХЛА!</p>
        <p className="mb-8 text-lg text-secondary glitch">Ты попал не туда, дебил! 🤡</p>
        <a 
          href="/" 
          className="inline-block px-6 py-3 bg-accent text-accent-foreground rounded-lg font-bold hover:bg-destructive hover:text-destructive-foreground transition-all rainbow"
        >
          🏠 ДОМОЙ, ЧМОНЯ! 🏠
        </a>
      </div>
    </div>
  );
};

export default NotFound;
