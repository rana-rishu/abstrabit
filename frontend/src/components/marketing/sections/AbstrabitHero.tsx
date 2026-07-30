import React, { useEffect, useRef } from 'react';

export const AbstrabitHero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Scattered Animated Floating Dots Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Create 90 scattered particles
    const particleCount = 90;
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      alpha: number;
      vx: number;
      vy: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.6 + 0.2,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw floating scattered dots
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around canvas edges
        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="pt-36 pb-16 bg-black text-white relative overflow-hidden">
      {/* Scattered Animated Dot Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Main Display Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-3">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
            Become an AI Powered <br />
            Enterprise
          </h1>
          <p className="text-sm font-medium text-zinc-400 tracking-wide mt-2 font-mono">
            The Abstrabit Platform
          </p>
        </div>

        {/* Large Featured Article Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-black/90 rounded-3xl p-2 sm:p-4 border border-white/10 shadow-2xl backdrop-blur-xl">
          {/* Left Column: Robot Image */}
          <div className="relative rounded-3xl overflow-hidden aspect-square sm:aspect-square bg-zinc-900 shadow-xl border border-white/10">
            <img
              src="/images/hero_robot.jpg"
              alt="Agent Behavior Is the New Search Behavior"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Right Column: Content */}
          <div className="flex flex-col justify-center gap-6 p-4 sm:p-8">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-[1.15] tracking-tight hover:text-zinc-300 transition-colors cursor-pointer">
              Agent Behavior Is the New Search Behavior
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
};
