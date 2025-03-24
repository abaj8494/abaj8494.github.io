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
  nextDirectionChange: number;
  url: string;
}

function App() {
  const [balls, setBalls] = useState<Ball[]>([]);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const svgFiles = [
    { svg: 'trade.svg', url: 'https://trade.abaj.ai' },
    { svg: 'real_inferno.svg', url: 'https://bots.abaj.ai' },
    { svg: 'imag_jet.svg', url: 'https://arcade.abaj.ai' },
    { svg: 'abs_hsv.svg', url: 'https://abaj.ai' },
    { svg: 'tools.svg', url: 'https://tools.abaj.ai' }
  ];
  const MIN_BALL_SIZE = 100; // Minimum size in pixels
  const MAX_BALL_SIZE = 250; // Maximum size in pixels
  const BALL_SIZE_VW = 15; // Size in viewport width percentage
  const [ballSize, setBallSize] = useState(250);
  const BOUNCE_DAMPING = 0.8;
  const REPULSION_DISTANCE = 300;
  const REPULSION_FORCE = 1.5;
  const RANDOM_MOVEMENT_SPEED = 3.0;
  const DIRECTION_CHANGE_INTERVAL = 1500;

  // Function to resolve overlap between two balls with elastic collision physics
  const resolveOverlap = (ball1: Ball, ball2: Ball) => {
    const dx = ball1.x - ball2.x;
    const dy = ball1.y - ball2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < ballSize) {
      // Calculate collision normal
      const nx = dx / distance;
      const ny = dy / distance;

      // Calculate relative velocity
      const relativeVelocityX = ball1.vx - ball2.vx;
      const relativeVelocityY = ball1.vy - ball2.vy;
      const relativeSpeed = relativeVelocityX * nx + relativeVelocityY * ny;

      // Only resolve if balls are moving towards each other
      if (relativeSpeed < 0) {
        // Calculate impulse
        const impulse = 2 * relativeSpeed;
        
        // Update velocities with impulse
        const newVx1 = ball1.vx - impulse * nx;
        const newVy1 = ball1.vy - impulse * ny;
        const newVx2 = ball2.vx + impulse * nx;
        const newVy2 = ball2.vy + impulse * ny;

        // Move balls apart to prevent sticking
        const overlap = (ballSize - distance) / 2;
        const moveX = nx * overlap;
        const moveY = ny * overlap;

        // Calculate new rotation speeds based on collision
        const collisionAngle = Math.atan2(dy, dx);
        const relativeRotation = ball1.rotationSpeed - ball2.rotationSpeed;
        const newRotationSpeed1 = ball1.rotationSpeed - relativeRotation * 0.5;
        const newRotationSpeed2 = ball2.rotationSpeed + relativeRotation * 0.5;

        return {
          ball1: {
            ...ball1,
            x: ball1.x + moveX,
            y: ball1.y + moveY,
            vx: newVx1 * BOUNCE_DAMPING,
            vy: newVy1 * BOUNCE_DAMPING,
            rotationSpeed: newRotationSpeed1 * BOUNCE_DAMPING
          },
          ball2: {
            ...ball2,
            x: ball2.x - moveX,
            y: ball2.y - moveY,
            vx: newVx2 * BOUNCE_DAMPING,
            vy: newVy2 * BOUNCE_DAMPING,
            rotationSpeed: newRotationSpeed2 * BOUNCE_DAMPING
          }
        };
      }
    }
    return { ball1, ball2 };
  };

  // Add new useEffect for handling window resize
  useEffect(() => {
    const updateBallSize = () => {
      const vwSize = (window.innerWidth * BALL_SIZE_VW) / 100;
      const newSize = Math.min(Math.max(vwSize, MIN_BALL_SIZE), MAX_BALL_SIZE);
      setBallSize(newSize);
    };

    // Initial calculation
    updateBallSize();

    // Add resize listener
    window.addEventListener('resize', updateBallSize);
    return () => window.removeEventListener('resize', updateBallSize);
  }, []);

  useEffect(() => {
    // Initialize balls
    const initialBalls: Ball[] = svgFiles.map((svgFile, index) => ({
      id: index,
      x: Math.random() * (window.innerWidth - ballSize),
      y: Math.random() * (window.innerHeight - ballSize),
      vx: (Math.random() - 0.5) * RANDOM_MOVEMENT_SPEED * 2,
      vy: (Math.random() - 0.5) * RANDOM_MOVEMENT_SPEED * 2,
      svg: svgFile.svg,
      url: svgFile.url,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      nextDirectionChange: Date.now() + Math.random() * DIRECTION_CHANGE_INTERVAL
    }));
    setBalls(initialBalls);

    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const updateBalls = () => {
      setBalls(prevBalls => {
        let updatedBalls = [...prevBalls];
        const currentTime = Date.now();

        // Update each ball
        updatedBalls = updatedBalls.map(ball => {
          let newVx = ball.vx;
          let newVy = ball.vy;

          // Independent movement - always active
          if (currentTime > ball.nextDirectionChange) {
            // Set new random direction
            const angle = Math.random() * Math.PI * 2;
            const speed = RANDOM_MOVEMENT_SPEED * (0.8 + Math.random() * 0.4);
            newVx = Math.cos(angle) * speed;
            newVy = Math.sin(angle) * speed;
            ball.nextDirectionChange = currentTime + Math.random() * DIRECTION_CHANGE_INTERVAL;
          }

          // Mouse repulsion - additional force
          const dx = ball.x - mousePosRef.current.x;
          const dy = ball.y - mousePosRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < REPULSION_DISTANCE) {
            const force = (REPULSION_DISTANCE - distance) / REPULSION_DISTANCE;
            const angle = Math.atan2(dy, dx);
            newVx += Math.cos(angle) * force * REPULSION_FORCE;
            newVy += Math.sin(angle) * force * REPULSION_FORCE;
          }

          // Apply friction
          const friction = 0.99;
          newVx *= friction;
          newVy *= friction;

          // Calculate new position
          let newX = ball.x + newVx;
          let newY = ball.y + newVy;

          // Bounce off walls
          if (newX < 0 || newX > window.innerWidth - ballSize) {
            newVx *= -BOUNCE_DAMPING;
            newX = newX < 0 ? 0 : window.innerWidth - ballSize;
            // Reverse rotation on wall collision
            ball.rotationSpeed *= -BOUNCE_DAMPING;
          }
          if (newY < 0 || newY > window.innerHeight - ballSize) {
            newVy *= -BOUNCE_DAMPING;
            newY = newY < 0 ? 0 : window.innerHeight - ballSize;
            // Reverse rotation on wall collision
            ball.rotationSpeed *= -BOUNCE_DAMPING;
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
        });

        // Resolve overlaps between all pairs of balls
        for (let i = 0; i < updatedBalls.length; i++) {
          for (let j = i + 1; j < updatedBalls.length; j++) {
            const result = resolveOverlap(updatedBalls[i], updatedBalls[j]);
            updatedBalls[i] = result.ball1;
            updatedBalls[j] = result.ball2;
          }
        }

        return updatedBalls;
      });

      // Request next animation frame
      animationFrameRef.current = requestAnimationFrame(updateBalls);
    };

    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(updateBalls);

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="container">
      {balls.map(ball => (
        <a
          key={ball.id}
          href={ball.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ball-link"
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
              width: `${ballSize}px`, 
              height: `${ballSize}px`,
              transition: 'transform 0.1s ease-out'
            }} 
          />
        </a>
      ))}
    </div>
  );
}

export default App
