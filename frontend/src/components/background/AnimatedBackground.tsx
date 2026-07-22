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
    const baseColor = "#050507"; 

    // Colors matching our new design system
    const colors = [
      { r: 108, g: 63, b: 255 }, // Primary Purple
      { r: 0, g: 240, b: 255 },  // Cyan Accent
      { r: 138, g: 88, b: 255 }, // Secondary Purple
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const createParticles = () => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      // Adjust density based on screen size
      const density = isMobile ? 25000 : 15000;
      const count = Math.floor((canvas.width * canvas.height) / density);
      const maxCount = isMobile ? 40 : 100;
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
      const maxDist = 180;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.15;
            
            // Create a gradient for the line between the two particles' colors
            const grad = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
            grad.addColorStop(0, `rgba(${particles[i].color}, ${opacity})`);
            grad.addColorStop(1, `rgba(${particles[j].color}, ${opacity})`);
            
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.8;
            ctx.stroke();
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
    });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050507]" aria-hidden="true">
      {/* Base grid */}
      <div className="absolute inset-0 bg-grid opacity-100" />

      {/* Canvas for particles and network lines */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full" 
        style={{ willChange: 'transform' }} 
      />

      {/* Ambient Orbs - Animated floating gradients */}
      
      {/* Primary Purple Orb */}
      <div
        className="absolute top-0 left-1/4 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-20 animate-float pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(108,63,255,0.4) 0%, transparent 60%)",
          animationDuration: "12s",
        }}
      />

      {/* Cyan Accent Orb */}
      <div
        className="absolute top-1/2 right-0 translate-x-1/4 w-[600px] h-[600px] rounded-full opacity-15 animate-float pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(0,240,255,0.3) 0%, transparent 60%)",
          animationDuration: "15s",
          animationDelay: "-5s",
        }}
      />

      {/* Secondary Purple Orb */}
      <div
        className="absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/4 w-[700px] h-[700px] rounded-full opacity-15 animate-float pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(138,88,255,0.3) 0%, transparent 60%)",
          animationDuration: "18s",
          animationDelay: "-2s",
        }}
      />
    </div>
  );
}
