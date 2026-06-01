"use client";

import React, { useEffect, useRef } from "react";

interface HeroToClubAnimationProps {
  active?: boolean;
  className?: string;
  onComplete?: () => void;
  progress?: number;
}

const CANVAS_SIZE = 560;
const CX = CANVAS_SIZE / 2;
const CY = CANVAS_SIZE / 2;

const orbits = [
  { rx: 148, ry: 50, angleDeg: -60, offsets: [0, Math.PI], speed: 0.016 },
  { rx: 148, ry: 50, angleDeg: 0, offsets: [Math.PI * 0.33, Math.PI * 1.33], speed: 0.013 },
  { rx: 148, ry: 50, angleDeg: 60, offsets: [Math.PI * 0.66, Math.PI * 1.66], speed: 0.018 },
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
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

function getInitialScale() {
  if (typeof window === "undefined") return 1.09375;
  const width = window.innerWidth;
  if (width >= 1024) {
    // Desktop: HeroAtom scale is 1.25, parent is 640px
    return (560 * 1.25) / 640; // 1.09375
  } else if (width >= 640) {
    // SM/Tablet: HeroAtom scale is 0.65, parent is 300px
    return (560 * 0.65) / 300; // 1.21333
  } else {
    // Mobile: HeroAtom scale is 0.5, parent is 240px
    return (560 * 0.5) / 240; // 1.16667
  }
}

function getTargetScale() {
  if (typeof window === "undefined") return 1.3;
  const width = window.innerWidth;
  if (width >= 1024) {
    return 1.35; // 35% larger on desktop
  } else if (width >= 640) {
    return 1.4; // 40% larger on tablet
  } else {
    return 1.3; // 30% larger on mobile
  }
}

const HeroToClubAnimation: React.FC<HeroToClubAnimationProps> = ({
  active = true,
  className = "",
  onComplete,
  progress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const isControlledRef = useRef(typeof progress === "number");
  const progressRef = useRef(progress ?? (active ? 1 : 0));
  const completeRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    isControlledRef.current = typeof progress === "number";

    if (typeof progress === "number") {
      progressRef.current = clamp(progress);
    }
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d")!;
    const atomContainer = container;

    if (!ctx) return;

    let frameId = 0;
    let elapsed = 0;

    function drawOrbit(rx: number, ry: number, angleDeg: number) {
      const angle = (angleDeg * Math.PI) / 180;

      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "#023B8E";
      ctx.lineWidth = 0.9;
      ctx.stroke();
      ctx.restore();
    }

    function getPos(rx: number, ry: number, angleDeg: number, theta: number) {
      const angle = (angleDeg * Math.PI) / 180;
      const ex = rx * Math.cos(theta);
      const ey = ry * Math.sin(theta);

      return {
        x: CX + ex * Math.cos(angle) - ey * Math.sin(angle),
        y: CY + ex * Math.sin(angle) + ey * Math.cos(angle),
      };
    }

    function drawElectron(x: number, y: number, withShadow: boolean) {
      const radius = 8;

      if (withShadow) {
        const shadow = ctx.createRadialGradient(x + 1.5, y + 2, 0, x + 1.5, y + 2, radius * 1.4);
        shadow.addColorStop(0, "rgba(0,10,40,0.38)");
        shadow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = shadow;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#011f5b";
      ctx.fill();

      const metal = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
      metal.addColorStop(0, "rgba(160,195,255,0)");
      metal.addColorStop(0.18, "rgba(190,220,255,0.55)");
      metal.addColorStop(0.48, "rgba(10,50,140,0.15)");
      metal.addColorStop(0.75, "rgba(100,150,230,0.25)");
      metal.addColorStop(1, "rgba(180,210,255,0)");
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = metal;
      ctx.fill();

      const highlight = ctx.createRadialGradient(
        x - radius * 0.38,
        y - radius * 0.42,
        0,
        x - radius * 0.38,
        y - radius * 0.42,
        radius * 0.62,
      );
      highlight.addColorStop(0, "rgba(235,248,255,0.95)");
      highlight.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = highlight;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x - radius * 0.32, y - radius * 0.36, radius * 0.17, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,240,0.97)";
      ctx.fill();
    }

    function drawNucleus() {
      const radius = 22;

      ctx.beginPath();
      ctx.arc(CX, CY, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#7a5000";
      ctx.fill();

      const metal = ctx.createLinearGradient(CX - radius, CY - radius, CX + radius, CY + radius);
      metal.addColorStop(0, "#fff8c0");
      metal.addColorStop(0.22, "#D4A373");
      metal.addColorStop(0.5, "#b07d10");
      metal.addColorStop(0.72, "#e8c050");
      metal.addColorStop(1, "#a06800");
      ctx.beginPath();
      ctx.arc(CX, CY, radius, 0, Math.PI * 2);
      ctx.fillStyle = metal;
      ctx.fill();

      const rim = ctx.createRadialGradient(CX, CY, radius * 0.55, CX, CY, radius);
      rim.addColorStop(0, "rgba(0,0,0,0)");
      rim.addColorStop(1, "rgba(60,30,0,0.6)");
      ctx.beginPath();
      ctx.arc(CX, CY, radius, 0, Math.PI * 2);
      ctx.fillStyle = rim;
      ctx.fill();

      const blob = ctx.createRadialGradient(CX - radius * 0.3, CY - radius * 0.34, 0, CX - radius * 0.3, CY - radius * 0.34, radius * 0.7);
      blob.addColorStop(0, "rgba(255,255,210,0.82)");
      blob.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.arc(CX, CY, radius, 0, Math.PI * 2);
      ctx.fillStyle = blob;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(CX - radius * 0.28, CY - radius * 0.3, radius * 0.16, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,240,0.97)";
      ctx.fill();
    }

    function draw() {
      if (!isControlledRef.current) {
        const target = activeRef.current ? 1 : 0;
        progressRef.current += (target - progressRef.current) * 0.055;
      }

      const p = clamp(progressRef.current);
      const eased = easeInOut(p);
      const settle = easeInOut(clamp((p - 0.56) / 0.44));
      const pulseScale = 1 + Math.sin(Math.PI * p) * 0.2;
      const rotateY = eased * 360;
      const rotateX = Math.sin(Math.PI * eased) * 12;
      const rotateZ = Math.sin(Math.PI * eased) * -15;

      const initialScale = getInitialScale();
      const targetScale = getTargetScale();
      const currentScale = initialScale + (targetScale - initialScale) * eased;
      const finalScale = currentScale * pulseScale;

      atomContainer.style.transform = `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg) scale(${finalScale})`;
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      orbits.forEach((orbit) => drawOrbit(orbit.rx, orbit.ry, orbit.angleDeg));
      drawNucleus();

      orbits.forEach((orbit) => {
        orbit.offsets.forEach((offset, index) => {
          const movingTheta = offset + elapsed * orbit.speed;
          const targetTheta = index === 0 ? 0 : Math.PI;
          const theta = movingTheta + shortestAngle(movingTheta, targetTheta) * settle;
          const pos = getPos(orbit.rx, orbit.ry, orbit.angleDeg, theta);

          drawElectron(pos.x, pos.y, settle < 0.94);
        });
      });

      if (p >= 0.995 && !completeRef.current) {
        completeRef.current = true;
        onCompleteRef.current?.();
      }

      if (p < 0.995) {
        completeRef.current = false;
      }

      elapsed += 1;
      frameId = requestAnimationFrame(draw);
    }

    draw();

    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div ref={containerRef} className={`hero-to-club-atom ${className}`}>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="block h-auto w-full origin-center"
      />
    </div>
  );
};

export default HeroToClubAnimation;
