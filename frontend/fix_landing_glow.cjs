const fs = require("fs");
const path = "src/pages/public/LandingPage.jsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  "import React, { useState, useEffect, useCallback } from 'react';",
  "import React, { useState, useEffect, useCallback, useRef } from 'react';"
);

const hooksCode = `
  const targetMousePosition = useRef({ x: -1000, y: -1000 });
  const currentGlowPosition = useRef({ x: -1000, y: -1000 });
  const rafId = useRef(null);
  const heroRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    targetMousePosition.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    
    if (mediaQuery.matches || isTouch) return;

    const updateGlowPosition = () => {
      const dx = targetMousePosition.current.x - currentGlowPosition.current.x;
      const dy = targetMousePosition.current.y - currentGlowPosition.current.y;
      
      currentGlowPosition.current.x += dx * 0.1;
      currentGlowPosition.current.y += dy * 0.1;

      if (heroRef.current) {
        heroRef.current.style.setProperty('--mouse-x', \\\`\\${currentGlowPosition.current.x}px\\\`);
        heroRef.current.style.setProperty('--mouse-y', \\\`\\${currentGlowPosition.current.y}px\\\`);
      }

      rafId.current = requestAnimationFrame(updateGlowPosition);
    };

    rafId.current = requestAnimationFrame(updateGlowPosition);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);
`;

content = content.replace(
  `const [metricsCount, setMetricsCount] = useState("...");`,
  `const [metricsCount, setMetricsCount] = useState("...");\n` + hooksCode
);

content = content.replace(
  `<section className="relative overflow-hidden pt-20 pb-32 bg-slate-50 dark:bg-slate-950">`,
  `<section ref={heroRef} onMouseMove={handleMouseMove} className="relative overflow-hidden pt-20 pb-32 bg-slate-50 dark:bg-slate-950 group">`
);

const interactiveGlow = `
          {/* Interactive Mouse Glow & Highlighted Grid (Hidden on Mobile/Reduced Motion) */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 hidden sm:block motion-reduce:hidden z-0">
            {/* Soft Radial Glow */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle 350px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), rgba(42, 157, 143, 0.15), transparent 80%)'
              }}
            />
            {/* Highlighted Neon Grid */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: 'linear-gradient(to right, rgba(42, 157, 143, 0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(42, 157, 143, 0.6) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                maskImage: 'radial-gradient(circle 250px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), black 0%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(circle 250px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), black 0%, transparent 100%)',
              }}
            />
          </div>
`;

content = content.replace(
  `          {/* Central Breathing Glow */}`,
  interactiveGlow + `\n          {/* Central Breathing Glow */}`
);

fs.writeFileSync(path, content);
console.log("Success");
