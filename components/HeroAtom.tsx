"use client";

import React, { useRef, useEffect } from 'react';

interface HeroAtomProps {
  /**
   * Mutable ref containing transition progress (0→1).
   * 0 = normal orbiting electrons.
   * 0→1 = spins 360°, electrons settle to stationary.
   * 1 = fully settled.
   */
  progressRef?: React.MutableRefObject<number>;
  className?: string;
  onElectronClick?: (slug: string) => void;
  onElectronHover?: (slug: string | null) => void;
}

const CANVAS_SIZE = 640;
const CX = CANVAS_SIZE / 2;
const CY = CANVAS_SIZE / 2;

const orbits = [
  { rx: 170, ry: 57, angleDeg: -60, offsets: [0, Math.PI], speed: 0.016 },
  { rx: 170, ry: 57, angleDeg: 0, offsets: [Math.PI * 0.33, Math.PI * 1.33], speed: 0.013 },
  { rx: 170, ry: 57, angleDeg: 60, offsets: [Math.PI * 0.66, Math.PI * 1.66], speed: 0.018 },
];

const CLUB_MAPPING = [
  { orbitIdx: 0, electronIdx: 0, slug: 'stem', name: 'STEM Club' },
  { orbitIdx: 0, electronIdx: 1, slug: 'sports', name: 'Sports Club' },
  { orbitIdx: 1, electronIdx: 0, slug: 'literature', name: 'Literature Club' },
  { orbitIdx: 1, electronIdx: 1, slug: 'arts', name: 'Arts & Craft Club' },
  { orbitIdx: 2, electronIdx: 0, slug: 'entertainment', name: 'Entertainment Club' },
  { orbitIdx: 2, electronIdx: 1, slug: 'social', name: 'Social Club' },
];

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function shortestAngle(start: number, end: number) {
  let diff = (end - start) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

const HeroAtom: React.FC<HeroAtomProps> = ({ progressRef, className, onElectronClick, onElectronHover }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const electronCoordsRef = useRef<{ x: number; y: number; slug: string; name: string }[]>([]);
  const hoveredSlugRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let elapsed = 0;

    function drawOrbit(rx: number, ry: number, angleDeg: number) {
      const a = (angleDeg * Math.PI) / 180;
      ctx!.save();
      ctx!.translate(CX, CY);
      ctx!.rotate(a);
      ctx!.beginPath();
      ctx!.ellipse(0, 0, rx, ry, 0, 0, 2 * Math.PI);
      ctx!.strokeStyle = '#023B8E';
      ctx!.lineWidth = 0.9;
      ctx!.stroke();
      ctx!.restore();
    }

    function getPos(rx: number, ry: number, angleDeg: number, theta: number) {
      const a = (angleDeg * Math.PI) / 180;
      const ex = rx * Math.cos(theta);
      const ey = ry * Math.sin(theta);
      return {
        x: CX + ex * Math.cos(a) - ey * Math.sin(a),
        y: CY + ex * Math.sin(a) + ey * Math.cos(a),
      };
    }

    function drawElectron(x: number, y: number) {
      const r = 9;

      // Shadow
      const shadow = ctx!.createRadialGradient(x + 1.5, y + 2, 0, x + 1.5, y + 2, r * 1.4);
      shadow.addColorStop(0, 'rgba(0,10,40,0.38)');
      shadow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx!.beginPath();
      ctx!.arc(x, y, r * 1.4, 0, 2 * Math.PI);
      ctx!.fillStyle = shadow;
      ctx!.fill();

      // Base blue
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = '#011f5b';
      ctx!.fill();

      // Metallic sheen
      const metal = ctx!.createLinearGradient(x - r, y - r, x + r, y + r);
      metal.addColorStop(0, 'rgba(160,195,255,0.0)');
      metal.addColorStop(0.08, 'rgba(160,195,255,0.0)');
      metal.addColorStop(0.18, 'rgba(190,220,255,0.55)');
      metal.addColorStop(0.3, 'rgba(80,130,220,0.30)');
      metal.addColorStop(0.48, 'rgba(10,50,140,0.15)');
      metal.addColorStop(0.62, 'rgba(5,30,100,0.0)');
      metal.addColorStop(0.75, 'rgba(100,150,230,0.25)');
      metal.addColorStop(0.88, 'rgba(180,210,255,0.18)');
      metal.addColorStop(1, 'rgba(180,210,255,0.0)');
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = metal;
      ctx!.fill();

      // Highlight
      const hl = ctx!.createRadialGradient(
        x - r * 0.38, y - r * 0.42, 0,
        x - r * 0.38, y - r * 0.42, r * 0.62
      );
      hl.addColorStop(0, 'rgba(235,248,255,0.95)');
      hl.addColorStop(0.35, 'rgba(180,220,255,0.45)');
      hl.addColorStop(1, 'rgba(255,255,255,0)');
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, 2 * Math.PI);
      ctx!.fillStyle = hl;
      ctx!.fill();

      // Speck
      ctx!.beginPath();
      ctx!.arc(x - r * 0.32, y - r * 0.36, r * 0.17, 0, 2 * Math.PI);
      ctx!.fillStyle = 'rgba(255,255,240,0.97)';
      ctx!.fill();
    }

    function drawNucleus() {
      const r = 25;

      ctx!.beginPath();
      ctx!.arc(CX, CY, r, 0, 2 * Math.PI);
      ctx!.fillStyle = '#7a5000';
      ctx!.fill();

      const metal = ctx!.createLinearGradient(CX - r, CY - r, CX + r, CY + r);
      metal.addColorStop(0, '#fff8c0');
      metal.addColorStop(0.08, '#f5d84a');
      metal.addColorStop(0.22, '#D4A373');
      metal.addColorStop(0.38, '#8a5e00');
      metal.addColorStop(0.5, '#b07d10');
      metal.addColorStop(0.62, '#D4A373');
      metal.addColorStop(0.72, '#e8c050');
      metal.addColorStop(0.82, '#c49520');
      metal.addColorStop(0.9, '#f0d060');
      metal.addColorStop(1, '#a06800');
      ctx!.beginPath();
      ctx!.arc(CX, CY, r, 0, 2 * Math.PI);
      ctx!.fillStyle = metal;
      ctx!.fill();

      const rim = ctx!.createRadialGradient(CX, CY, r * 0.55, CX, CY, r);
      rim.addColorStop(0, 'rgba(0,0,0,0)');
      rim.addColorStop(1, 'rgba(60,30,0,0.6)');
      ctx!.beginPath();
      ctx!.arc(CX, CY, r, 0, 2 * Math.PI);
      ctx!.fillStyle = rim;
      ctx!.fill();

      const blob = ctx!.createRadialGradient(
        CX - r * 0.3, CY - r * 0.34, 0,
        CX - r * 0.3, CY - r * 0.34, r * 0.7
      );
      blob.addColorStop(0, 'rgba(255,255,210,0.82)');
      blob.addColorStop(0.5, 'rgba(255,245,160,0.25)');
      blob.addColorStop(1, 'rgba(255,255,255,0)');
      ctx!.beginPath();
      ctx!.arc(CX, CY, r, 0, 2 * Math.PI);
      ctx!.fillStyle = blob;
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(CX - r * 0.28, CY - r * 0.3, r * 0.16, 0, 2 * Math.PI);
      ctx!.fillStyle = 'rgba(255,255,240,0.97)';
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(CX - r * 0.46, CY - r * 0.14, r * 0.065, 0, 2 * Math.PI);
      ctx!.fillStyle = 'rgba(255,255,255,0.75)';
      ctx!.fill();
    }

    function frame() {
      if (!ctx || !canvas || !container) return;

      const p = clamp01(progressRef?.current ?? 0);
      const eased = easeInOut(p);
      const settle = easeInOut(clamp01((p - 0.56) / 0.44));

      /* ── Spin + pulse transforms on the container ── */
      if (p > 0.001) {
        const rotY = eased * 360;
        const rotX = Math.sin(Math.PI * eased) * 12;
        const rotZ = Math.sin(Math.PI * eased) * -15;
        const pulse = 1 + Math.sin(Math.PI * p) * 0.15;
        container.style.transform =
          `perspective(1000px) rotateY(${rotY}deg) rotateX(${rotX}deg) rotateZ(${rotZ}deg) scale(${pulse})`;
      } else {
        container.style.transform = '';
      }

      /* ── Draw ── */
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      orbits.forEach((o) => drawOrbit(o.rx, o.ry, o.angleDeg));
      drawNucleus();

      const newCoords: { x: number; y: number; slug: string; name: string }[] = [];

      orbits.forEach((o, orbitIdx) => {
        o.offsets.forEach((off, idx) => {
          const movingTheta = off + elapsed * o.speed;
          let theta = movingTheta;

          // Blend toward stationary position when settling
          if (p > 0.001) {
            const target = idx === 0 ? 0 : Math.PI;
            theta = movingTheta + shortestAngle(movingTheta, target) * settle;
          }

          const pos = getPos(o.rx, o.ry, o.angleDeg, theta);
          
          // Find mapping
          const map = CLUB_MAPPING.find(m => m.orbitIdx === orbitIdx && m.electronIdx === idx);
          const isHovered = map && map.slug === hoveredSlugRef.current;

          if (isHovered) {
            // Draw a beautiful outer pulsing halo
            ctx.save();
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 16 + Math.sin(elapsed * 0.15) * 3, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(2, 59, 142, 0.2)';
            ctx.fill();
            ctx.restore();
          }

          drawElectron(pos.x, pos.y);

          if (map) {
            newCoords.push({ x: pos.x, y: pos.y, slug: map.slug, name: map.name });
          }
        });
      });

      electronCoordsRef.current = newCoords;

      // Draw tooltip if an electron is hovered
      if (hoveredSlugRef.current) {
        const hoveredEc = newCoords.find(ec => ec.slug === hoveredSlugRef.current);
        if (hoveredEc) {
          ctx.save();
          
          const text = hoveredEc.name;
          ctx.font = 'bold 12px sans-serif';
          const textWidth = ctx.measureText(text).width;
          
          const padX = 10;
          const padY = 6;
          const rectW = textWidth + padX * 2;
          const rectH = 24;
          
          const rectX = hoveredEc.x - rectW / 2;
          const rectY = hoveredEc.y - 38; // 38px above the electron
          
          // Draw a soft shadow for the tooltip
          ctx.shadowColor = 'rgba(0, 10, 40, 0.18)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 4;
          
          // Tooltip container
          ctx.fillStyle = '#011f5b'; // primary color
          ctx.beginPath();
          const radius = 6;
          ctx.roundRect ? ctx.roundRect(rectX, rectY, rectW, rectH, radius) : ctx.rect(rectX, rectY, rectW, rectH);
          ctx.fill();
          
          // Draw small triangle at bottom
          ctx.shadowColor = 'transparent';
          ctx.beginPath();
          ctx.moveTo(hoveredEc.x - 6, rectY + rectH);
          ctx.lineTo(hoveredEc.x + 6, rectY + rectH);
          ctx.lineTo(hoveredEc.x, rectY + rectH + 5);
          ctx.closePath();
          ctx.fillStyle = '#011f5b';
          ctx.fill();
          
          // Tooltip text
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, hoveredEc.x, rectY + rectH / 2);
          
          ctx.restore();
        }
      }

      elapsed++;
      animationId = requestAnimationFrame(frame);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;

      const rect = canvasEl.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const x = (clientX / rect.width) * CANVAS_SIZE;
      const y = (clientY / rect.height) * CANVAS_SIZE;

      let hoveredSlug: string | null = null;
      let minDistance = 24;

      for (const ec of electronCoordsRef.current) {
        const dx = x - ec.x;
        const dy = y - ec.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          hoveredSlug = ec.slug;
          break;
        }
      }

      if (hoveredSlug !== hoveredSlugRef.current) {
        hoveredSlugRef.current = hoveredSlug;
        if (onElectronHover) onElectronHover(hoveredSlug);
      }

      if (hoveredSlug) {
        canvasEl.style.cursor = 'pointer';
      } else {
        canvasEl.style.cursor = '';
      }
    };

    const handleClick = (e: MouseEvent) => {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;

      const rect = canvasEl.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const x = (clientX / rect.width) * CANVAS_SIZE;
      const y = (clientY / rect.height) * CANVAS_SIZE;

      let clickedSlug: string | null = null;
      let minDistance = 24;

      for (const ec of electronCoordsRef.current) {
        const dx = x - ec.x;
        const dy = y - ec.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          clickedSlug = ec.slug;
          break;
        }
      }

      if (clickedSlug && onElectronClick) {
        onElectronClick(clickedSlug);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    animationId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [progressRef, onElectronClick, onElectronHover]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="block"
      />
    </div>
  );
};

export default HeroAtom;