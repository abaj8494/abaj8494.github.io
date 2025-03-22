import { useEffect, useState, useRef } from 'react'
import './App.css'

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  svg: string;
  rotation: number;
  rotationSpeed: number;
}

function App() {
  const [balls, setBalls] = useState<Ball[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const svgFiles = ['trade.svg', 'real_inferno.svg', 'imag_jet.svg', 'abs_hsv.svg'];
  const BALL_SIZE = 250; // 5 times larger than original 50px
  const BOUNCE_DAMPING = 0.8;
  const REPULSION_DISTANCE = 300;
  const REPULSION_FORCE = 1.5;

  useEffect(() => {
    // Initialize balls
    const initialBalls: Ball[] = svgFiles.map((svg, index) => ({
      id: index,
      x: Math.random() * (window.innerWidth - BALL_SIZE),
      y: Math.random() * (window.innerHeight - BALL_SIZE),
      vx: (Math.random() - 0.5) * 4, // Initial random velocity
      vy: (Math.random() - 0.5) * 4,
      svg: svg,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 5 // Random rotation speed
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

        let newVx = ball.vx;
        let newVy = ball.vy;

        // If mouse is within repulsion distance, apply repulsion
        if (distance < REPULSION_DISTANCE) {
          const force = (REPULSION_DISTANCE - distance) / REPULSION_DISTANCE;
          const angle = Math.atan2(dy, dx);
          newVx += Math.cos(angle) * force * REPULSION_FORCE;
          newVy += Math.sin(angle) * force * REPULSION_FORCE;
        }

        // Apply friction
        const friction = 0.98;
        newVx *= friction;
        newVy *= friction;

        // Calculate new position
        let newX = ball.x + newVx;
        let newY = ball.y + newVy;

        // Bounce off walls
        if (newX < 0 || newX > window.innerWidth - BALL_SIZE) {
          newVx *= -BOUNCE_DAMPING;
          newX = newX < 0 ? 0 : window.innerWidth - BALL_SIZE;
        }
        if (newY < 0 || newY > window.innerHeight - BALL_SIZE) {
          newVy *= -BOUNCE_DAMPING;
          newY = newY < 0 ? 0 : window.innerHeight - BALL_SIZE;
        }

        // Update rotation
        const newRotation = (ball.rotation + ball.rotationSpeed) % 360;

        return {
          ...ball,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          rotation: newRotation
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
            transform: `translate(-50%, -50%) rotate(${ball.rotation}deg)`
          }}
        >
          <img 
            src={ball.svg} 
            alt={`Ball ${ball.id}`} 
            style={{ 
              width: `${BALL_SIZE}px`, 
              height: `${BALL_SIZE}px`,
              transition: 'transform 0.1s ease-out'
            }} 
          />
        </div>
      ))}
    </div>
  );
}

export default App
