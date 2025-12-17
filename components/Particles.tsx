import React, { useEffect, useState } from 'react';
import { ParticleData } from '../types';

interface ParticleSystemProps {
  trigger: boolean;
  x?: number;
  y?: number;
  color?: string;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ trigger, x = 0, y = 0, color = '#000' }) => {
  const [particles, setParticles] = useState<ParticleData[]>([]);

  useEffect(() => {
    if (trigger) {
      const newParticles: ParticleData[] = [];
      const particleCount = 20;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 8 + 2;
        newParticles.push({
          id: Date.now() + i,
          x: x,
          y: y,
          color: color,
          size: Math.random() * 10 + 4,
          velocity: {
            x: Math.cos(angle) * velocity,
            y: Math.sin(angle) * velocity
          }
        });
      }
      setParticles(prev => [...prev, ...newParticles]);
    }
  }, [trigger, x, y, color]);

  // Animation Loop
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.velocity.x,
        y: p.y + p.velocity.y,
        size: p.size * 0.9, // Shrink
        velocity: {
            x: p.velocity.x * 0.95, // Drag
            y: p.velocity.y * 0.95 + 0.2 // Gravity
        }
      })).filter(p => p.size > 0.5));
    }, 16);

    return () => clearInterval(interval);
  }, [particles]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: 0.8,
            boxShadow: `0 0 ${p.size/2}px ${p.color}`
          }}
        />
      ))}
    </div>
  );
};

export default ParticleSystem;