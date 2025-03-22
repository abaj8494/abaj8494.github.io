import { useEffect, useState, useRef } from 'react'
import './App.css'

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  svg: string;
}

function App() {
  const [balls, setBalls] = useState<Ball[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const svgFiles = ['trade.svg', 'real_inferno.svg', 'imag_jet.svg', 'abs_hsv.svg'];

  useEffect(() => {
    // Initialize balls
    const initialBalls: Ball[] = svgFiles.map((svg, index) => ({
      id: index,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: 0,
      vy: 0,
      svg: svg
    }));
    setBalls(initialBalls);

    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const updateBalls = () => {
      setBalls(prevBalls => prevBalls.map(ball => {
        // Calculate distance to mouse
        const dx = ball.x - mousePos.x;
        const dy = ball.y - mousePos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If mouse is within 200 pixels, apply repulsion
        if (distance < 200) {
          const force = (200 - distance) / 200;
          const angle = Math.atan2(dy, dx);
          const newVx = ball.vx + Math.cos(angle) * force * 0.5;
          const newVy = ball.vy + Math.sin(angle) * force * 0.5;
          
          // Apply friction
          const friction = 0.95;
          return {
            ...ball,
            vx: newVx * friction,
            vy: newVy * friction,
            x: ball.x + newVx * friction,
            y: ball.y + newVy * friction
          };
        }

        // Apply friction when not being repelled
        return {
          ...ball,
          vx: ball.vx * 0.95,
          vy: ball.vy * 0.95,
          x: ball.x + ball.vx * 0.95,
          y: ball.y + ball.vy * 0.95
        };
      }));
    };

    const animationFrame = requestAnimationFrame(updateBalls);
    return () => cancelAnimationFrame(animationFrame);
  }, [mousePos]);

  return (
    <div ref={containerRef} className="container">
      {balls.map(ball => (
        <div
          key={ball.id}
          className="ball"
          style={{
            left: `${ball.x}px`,
            top: `${ball.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <img src={ball.svg} alt={`Ball ${ball.id}`} style={{ width: '50px', height: '50px' }} />
        </div>
      ))}
    </div>
  );
}

export default App
