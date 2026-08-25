"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  radius: number;
  opacity: number;
  color: string;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let mouse = { x: -1000, y: -1000 };
    
    // Using a base background color to simulate alpha=false performance boost
    // while still giving us a canvas we can clear
    const baseColor = "#0A0710"; 

    // Colors matching our new design system
    const colors = [
      { r: 84, g: 39, b: 106 },  // Violet #54276A
      { r: 178, g: 58, b: 135 }, // Magenta Glow #B23A87
      { r: 122, g: 29, b: 92 },  // Magenta #7A1D5C
    ];


    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    let mouseMoveRaf: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseMoveRaf) return;
      mouseMoveRaf = requestAnimationFrame(() => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouseMoveRaf = null;
      });
    };
    
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const createParticles = () => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      // Drastically reduce density on mobile for performance
      const density = isMobile ? 35000 : 15000;
      const count = Math.floor((canvas.width * canvas.height) / density);
      const maxCount = isMobile ? 25 : 100;
      const finalCount = Math.min(count, maxCount);

      particles = Array.from({ length: finalCount }, () => {
        const colorSet = colors[Math.floor(Math.random() * colors.length)];
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          baseRadius: Math.random() * 1.5 + 0.5,
          radius: 0,
          opacity: Math.random() * 0.5 + 0.1,
          color: `${colorSet.r}, ${colorSet.g}, ${colorSet.b}`,
        };
      });
      // Initialize radius
      particles.forEach(p => p.radius = p.baseRadius);
    };

    const drawParticle = (p: Particle) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
      ctx.fill();
    };

    const drawConnections = () => {
      const isMobile = window.innerWidth <= 768;
      // Skip drawing connections on mobile completely to boost FPS
      if (isMobile) return;

      const maxDist = 180;
      
      // Spatial hashing optimization for connections
      const cellSize = maxDist;
      const grid: { [key: string]: Particle[] } = {};
      
      // Populate grid
      particles.forEach(p => {
        const cellX = Math.floor(p.x / cellSize);
        const cellY = Math.floor(p.y / cellSize);
        const key = `${cellX},${cellY}`;
        if (!grid[key]) grid[key] = [];
        grid[key].push(p);
      });

      // Draw connections using grid
      const drawnPairs = new Set<string>();

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        const cellX = Math.floor(p1.x / cellSize);
        const cellY = Math.floor(p1.y / cellSize);

        // Check current and adjacent cells
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const neighborKey = `${cellX + dx},${cellY + dy}`;
            const neighbors = grid[neighborKey];
            
            if (neighbors) {
              for (let j = 0; j < neighbors.length; j++) {
                const p2 = neighbors[j];
                
                // Prevent duplicate lines and self-connections
                if (p1 === p2) continue;
                
                // Create a unique id for the pair to avoid drawing twice
                // use object references or coordinates to identify pair
                const pairId = p1.x < p2.x ? `${p1.x}-${p2.x}` : `${p2.x}-${p1.x}`;
                if (drawnPairs.has(pairId)) continue;
                drawnPairs.add(pairId);

                const distX = p1.x - p2.x;
                const distY = p1.y - p2.y;
                const distSq = distX * distX + distY * distY;

                if (distSq < maxDist * maxDist) {
                  const dist = Math.sqrt(distSq);
                  const opacity = (1 - dist / maxDist) * 0.15;
                  
                  const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                  grad.addColorStop(0, `rgba(${p1.color}, ${opacity})`);
                  grad.addColorStop(1, `rgba(${p2.color}, ${opacity})`);
                  
                  ctx.beginPath();
                  ctx.moveTo(p1.x, p1.y);
                  ctx.lineTo(p2.x, p2.y);
                  ctx.strokeStyle = grad;
                  ctx.lineWidth = 0.8;
                  ctx.stroke();
                }
              }
            }
          }
        }
      }
    };

    const animate = () => {
      // Clear with base color instead of clearRect since alpha is false for performance
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Mouse interaction
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxMouseDist = 150;

        if (dist < maxMouseDist) {
          // Attract slightly
          const force = (maxMouseDist - dist) / maxMouseDist;
          p.x += (dx / dist) * force * 0.5;
          p.y += (dy / dist) * force * 0.5;
          // Increase size slightly on hover
          p.radius = p.baseRadius + force * 1.5;
        } else {
          // Restore original size
          if (p.radius > p.baseRadius) {
            p.radius -= 0.1;
          }
        }

        drawParticle(p);
      });

      drawConnections();
      animationId = requestAnimationFrame(animate);
    };

    resize();
    createParticles();
    animate();

    window.addEventListener("resize", () => {
      resize();
      createParticles();
    }, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      cancelAnimationFrame(animationId);
      if (mouseMoveRaf) cancelAnimationFrame(mouseMoveRaf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0A0710]" aria-hidden="true">
      {/* Base grid */}
      <div className="absolute inset-0 bg-grid opacity-100" />

      {/* Canvas for particles and network lines */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full" 
        style={{ willChange: 'transform' }} 
      />

      {/* Ambient Orbs - Animated floating gradients */}
      
      {/* Primary Violet Orb */}
      <div
        className="absolute top-0 left-1/4 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-20 animate-float pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(84,39,106,0.4) 0%, transparent 60%)",
          animationDuration: "12s",
        }}
      />

      {/* Magenta Glow Accent Orb */}
      <div
        className="absolute top-1/2 right-0 translate-x-1/4 w-[600px] h-[600px] rounded-full opacity-15 animate-float pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(178,58,135,0.3) 0%, transparent 60%)",
          animationDuration: "15s",
          animationDelay: "-5s",
        }}
      />

      {/* Deep Magenta Orb */}
      <div
        className="absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/4 w-[700px] h-[700px] rounded-full opacity-15 animate-float pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(122,29,92,0.3) 0%, transparent 60%)",
          animationDuration: "18s",
          animationDelay: "-2s",
        }}
      />
    </div>
  );
}
