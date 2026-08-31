import React, { useEffect, useRef } from 'react';

const GlobalInteractiveGrid = () => {
  const gridRef = useRef(null);

  useEffect(() => {
    let animationFrameId;

    const handleMouseMove = (e) => {
      if (gridRef.current) {
        // Use requestAnimationFrame for smooth performance
        animationFrameId = requestAnimationFrame(() => {
          if (gridRef.current) {
            gridRef.current.style.setProperty("--mouse-x", `${e.clientX}px`);
            gridRef.current.style.setProperty("--mouse-y", `${e.clientY}px`);
          }
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div 
      ref={gridRef} 
      className="fixed inset-0 z-0 pointer-events-none hidden sm:block motion-reduce:hidden transition-opacity duration-1000"
    >
      {/* Soft Radial Glow */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle 350px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), rgba(42, 157, 143, 0.15), transparent 80%)'
        }}
      />
      
      {/* Highlighted Neon Grid */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(42, 157, 143, 0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(42, 157, 143, 0.6) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle 250px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle 250px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), black 0%, transparent 100%)',
        }}
      />
    </div>
  );
};

export default GlobalInteractiveGrid;
