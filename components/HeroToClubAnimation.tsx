'use client';

import React, { useRef, useEffect } from 'react';

const HeroToClubAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = 280, cy = 280;

    const orbits = [
      { rx: 148, ry: 50, angleDeg: -60, offsets: [0, Math.PI], speed: 0.016 },
      { rx: 148, ry: 50, angleDeg: 0,   offsets: [Math.PI*0.33, Math.PI*1.33], speed: 0.013 },
      { rx: 148, ry: 50, angleDeg: 60,  offsets: [Math.PI*0.66, Math.PI*1.66], speed: 0.018 }
    ];

    let elapsed = 0;
    let rotAngle = 0;

    let animState: 'running' | 'spinning' | 'settling' | 'static' = 'running';
    let spinProgress = 0;
    let settleProgress = 0;
    let settleStartTime = 0;

    // Scale animation variables
    let currentScale = 1.35; 
    const START_SCALE = 1.35;
    const END_SCALE = 1.0;

    // Luxurious timing
    const RUN_DURATION = 90;       // 1.5 seconds running
    const SPIN_DURATION = 175;     // Tailored to be just a bit slower for premium pacing
    const SETTLE_DURATION = 360;   // 6 seconds - ultra slow luxury settling

    // Premium easing functions
    function easeInOutSine(t: number): number {
      return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    function easeOutCubic(t: number): number {
      return 1 - Math.pow(1 - t, 3);
    }

    function easeOutQuint(t: number): number {
      return 1 - Math.pow(1 - t, 5);
    }

    function easeInOutQuint(t: number): number {
      return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
    }

    // Unified luxury spin easing: perfectly smooth mathematical transition from start to finish
    function luxuryEase(t: number): number {
      return easeInOutQuint(t);
    }

    function drawOrbit(rx: number, ry: number, angleDeg: number): void {
      const a = angleDeg * Math.PI / 180;
      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.rotate(a);
      ctx!.beginPath();
      ctx!.ellipse(0, 0, rx, ry, 0, 0, 2 * Math.PI);
      ctx!.strokeStyle = '#023B8E';
      ctx!.lineWidth = 0.9;
      ctx!.stroke();
      ctx!.restore();
    }

    function getPos(rx: number, ry: number, angleDeg: number, theta: number): { x: number; y: number } {
      const a = angleDeg * Math.PI / 180;
      const ex = rx * Math.cos(theta);
      const ey = ry * Math.sin(theta);
      return {
        x: cx + ex * Math.cos(a) - ey * Math.sin(a),
        y: cy + ex * Math.sin(a) + ey * Math.cos(a)
      };
    }

    function drawElectron(x: number, y: number, withShadow: boolean = true): void {
      const r = 8;
      
      if (withShadow) {
        const shadow = ctx!.createRadialGradient(x+1.5, y+2, 0, x+1.5, y+2, r*1.4);
        shadow.addColorStop(0, 'rgba(0,10,40,0.38)');
        shadow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx!.beginPath();
        ctx!.arc(x, y, r*1.4, 0, 2*Math.PI);
        ctx!.fillStyle = shadow;
        ctx!.fill();
      }

      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2*Math.PI);
      ctx!.fillStyle = '#011f5b';
      ctx!.fill();

      const metal = ctx!.createLinearGradient(x-r, y-r, x+r, y+r);
      metal.addColorStop(0,    'rgba(160,195,255,0.0)');
      metal.addColorStop(0.18, 'rgba(190,220,255,0.55)');
      metal.addColorStop(0.48, 'rgba(10,50,140,0.15)');
      metal.addColorStop(0.75, 'rgba(100,150,230,0.25)');
      metal.addColorStop(1,    'rgba(180,210,255,0.0)');
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2*Math.PI);
      ctx!.fillStyle = metal;
      ctx!.fill();

      const hl = ctx!.createRadialGradient(x-r*0.38, y-r*0.42, 0, x-r*0.38, y-r*0.42, r*0.62);
      hl.addColorStop(0,   'rgba(235,248,255,0.95)');
      hl.addColorStop(1,   'rgba(255,255,255,0)');
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2*Math.PI);
      ctx!.fillStyle = hl;
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(x-r*0.32, y-r*0.36, r*0.17, 0, 2*Math.PI);
      ctx!.fillStyle = 'rgba(255,255,240,0.97)';
      ctx!.fill();
    }

    function drawNucleus(): void {
      const r = 22;
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, 2*Math.PI);
      ctx!.fillStyle = '#7a5000';
      ctx!.fill();

      const metal = ctx!.createLinearGradient(cx-r, cy-r, cx+r, cy+r);
      metal.addColorStop(0,    '#fff8c0');
      metal.addColorStop(0.22, '#D4A373');
      metal.addColorStop(0.50, '#b07d10');
      metal.addColorStop(0.72, '#e8c050');
      metal.addColorStop(1,    '#a06800');
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, 2*Math.PI);
      ctx!.fillStyle = metal;
      ctx!.fill();

      const rim = ctx!.createRadialGradient(cx, cy, r*0.55, cx, cy, r);
      rim.addColorStop(0, 'rgba(0,0,0,0)');
      rim.addColorStop(1, 'rgba(60,30,0,0.6)');
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, 2*Math.PI);
      ctx!.fillStyle = rim;
      ctx!.fill();

      const blob = ctx!.createRadialGradient(cx-r*0.30, cy-r*0.34, 0, cx-r*0.30, cy-r*0.34, r*0.7);
      blob.addColorStop(0,   'rgba(255,255,210,0.82)');
      blob.addColorStop(1,   'rgba(255,255,255,0)');
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, 2*Math.PI);
      ctx!.fillStyle = blob;
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(cx-r*0.28, cy-r*0.30, r*0.16, 0, 2*Math.PI);
      ctx!.fillStyle = 'rgba(255,255,240,0.97)';
      ctx!.fill();
    }

    let animationFrameId: number;

    function frame(): void {
      ctx!.clearRect(0, 0, 560, 560);

      // ── State Machine ──
      if (animState === 'running') {
        elapsed++;
        if (elapsed >= RUN_DURATION) {
          animState = 'spinning';
          spinProgress = 0;
        }
      } else if (animState === 'spinning') {
        spinProgress += 1 / SPIN_DURATION;
        elapsed++;
        
        // Fixed: Use epsilon check to guarantee reliable transition (no floating-point stalls)
        if (spinProgress >= 1 - 0.001) {
          animState = 'settling';
          settleProgress = 0;
          settleStartTime = elapsed;
          spinProgress = 1; // Clamp to ensure clean handoff
        }
      } else if (animState === 'settling') {
        settleProgress += 1 / SETTLE_DURATION;
        if (settleProgress >= 1) {
          animState = 'static';
          settleProgress = 1;
        }
      }

      // ── Rotation Logic ──
      if (animState === 'spinning') {
        const easedSpin = luxuryEase(spinProgress);
        rotAngle = easedSpin * 720;
      } else {
        rotAngle = 0;
      }

      // ── Parallel Scale Logic (Starts exactly when spin ends - zero delay) ──
      const SHRINK_START_SPIN_PROGRESS = 1.0; 
      let scaleProgress = 0;
      
      if (animState === 'running') {
        scaleProgress = 0;
      } else if (animState === 'spinning') {
        if (spinProgress >= SHRINK_START_SPIN_PROGRESS) {
          const elapsedShrinkFrames = (spinProgress - SHRINK_START_SPIN_PROGRESS) * SPIN_DURATION;
          const totalShrinkFrames = ((1 - SHRINK_START_SPIN_PROGRESS) * SPIN_DURATION) + SETTLE_DURATION;
          scaleProgress = elapsedShrinkFrames / totalShrinkFrames;
        }
      } else if (animState === 'settling') {
        const framesFromSpin = (1 - SHRINK_START_SPIN_PROGRESS) * SPIN_DURATION;
        const framesFromSettle = settleProgress * SETTLE_DURATION;
        const totalShrinkFrames = framesFromSpin + SETTLE_DURATION;
        scaleProgress = (framesFromSpin + framesFromSettle) / totalShrinkFrames;
      } else if (animState === 'static') {
        scaleProgress = 1;
      }
      
      scaleProgress = Math.min(1, Math.max(0, scaleProgress));
      const easedScale = easeInOutQuint(scaleProgress);
      currentScale = START_SCALE + (END_SCALE - START_SCALE) * easedScale;

      // ── Apply Transform ──
      container!.style.transform = `perspective(1000px) rotateY(${rotAngle}deg) rotateX(6deg) scale(${currentScale})`;

      // ── Draw Scene ──
      orbits.forEach(o => drawOrbit(o.rx, o.ry, o.angleDeg));
      drawNucleus();

      const shouldShowShadow = (animState === 'running' || animState === 'spinning');
      
      orbits.forEach((o, orbitIdx) => {
        o.offsets.forEach((off, elecIdx) => {
          let theta: number;
          let withShadow = shouldShowShadow;
          
          if (animState === 'running' || animState === 'spinning') {
            theta = off + elapsed * o.speed;
          } else {
            const targetTheta = (elecIdx === 0) ? 0 : Math.PI;
            
            if (animState === 'settling') {
              const t = easeOutCubic(settleProgress);
              const startTheta = off + settleStartTime * o.speed;
              
              let startMod = startTheta % (2 * Math.PI);
              if (startMod < 0) startMod += 2 * Math.PI;
              
              let diff = targetTheta - startMod;
              if (diff > Math.PI) diff -= 2 * Math.PI;
              if (diff < -Math.PI) diff += 2 * Math.PI;
              
              theta = startTheta + diff * t;
            } else {
              theta = targetTheta;
              withShadow = false;
            }
          }
          
          const p = getPos(o.rx, o.ry, o.angleDeg, theta);
          drawElectron(p.x, p.y, withShadow);
        });
      });

      animationFrameId = requestAnimationFrame(frame);
    }

    frame();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        #atom-container-hero {
          transform-style: preserve-3d;
          will-change: transform;
          transform-origin: center center;
        }
        #atom-hero { 
          display: block; 
          transform-origin: center center;
        }
      `}</style>
      <div id="atom-container-hero" ref={containerRef}>
        <canvas 
          id="atom-hero" 
          ref={canvasRef} 
          width={560} 
          height={560} 
        />
      </div>
    </>
  );
};

export default HeroToClubAnimation;