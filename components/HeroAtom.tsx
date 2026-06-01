import React, { useRef, useEffect } from 'react';

const HeroAtom: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = 280,
      cy = 280;

    const orbits = [
      { rx: 148, ry: 50, angleDeg: -60, offsets: [0, Math.PI], speed: 0.016 },
      { rx: 148, ry: 50, angleDeg: 0, offsets: [Math.PI * 0.33, Math.PI * 1.33], speed: 0.013 },
      { rx: 148, ry: 50, angleDeg: 60, offsets: [Math.PI * 0.66, Math.PI * 1.66], speed: 0.018 },
    ];

    let animationId: number;
    let elapsed = 0;

    function drawOrbit(rx: number, ry: number, angleDeg: number) {
      const a = (angleDeg * Math.PI) / 180;
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

    function getPos(rx: number, ry: number, angleDeg: number, theta: number) {
      const a = (angleDeg * Math.PI) / 180;
      const ex = rx * Math.cos(theta);
      const ey = ry * Math.sin(theta);
      return {
        x: cx + ex * Math.cos(a) - ey * Math.sin(a),
        y: cy + ex * Math.sin(a) + ey * Math.cos(a),
      };
    }

    function drawElectron(x: number, y: number) {
      const r = 8;

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
      const hl = ctx!.createRadialGradient(x - r * 0.38, y - r * 0.42, 0, x - r * 0.38, y - r * 0.42, r * 0.62);
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
      ctx!.fillStyle = 'rgba(255,255,255,0.97)';
      ctx!.fill();
    }

    function drawNucleus() {
      const r = 22;

      // Base brown
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx!.fillStyle = '#7a5000';
      ctx!.fill();

      // Metallic gold gradient
      const metal = ctx!.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
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
      ctx!.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx!.fillStyle = metal;
      ctx!.fill();

      // Rim shadow
      const rim = ctx!.createRadialGradient(cx, cy, r * 0.55, cx, cy, r);
      rim.addColorStop(0, 'rgba(0,0,0,0)');
      rim.addColorStop(1, 'rgba(60,30,0,0.6)');
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx!.fillStyle = rim;
      ctx!.fill();

      // Soft highlight blob
      const blob = ctx!.createRadialGradient(cx - r * 0.3, cy - r * 0.34, 0, cx - r * 0.3, cy - r * 0.34, r * 0.7);
      blob.addColorStop(0, 'rgba(255,255,210,0.82)');
      blob.addColorStop(0.5, 'rgba(255,245,160,0.25)');
      blob.addColorStop(1, 'rgba(255,255,255,0)');
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx!.fillStyle = blob;
      ctx!.fill();

      // Bright speck
      ctx!.beginPath();
      ctx!.arc(cx - r * 0.28, cy - r * 0.3, r * 0.16, 0, 2 * Math.PI);
      ctx!.fillStyle = 'rgba(255,255,240,0.97)';
      ctx!.fill();

      // Secondary speck
      ctx!.beginPath();
      ctx!.arc(cx - r * 0.46, cy - r * 0.14, r * 0.065, 0, 2 * Math.PI);
      ctx!.fillStyle = 'rgba(255,255,255,0.75)';
      ctx!.fill();
    }

    function frame() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      orbits.forEach((o) => drawOrbit(o.rx, o.ry, o.angleDeg));
      drawNucleus();
      orbits.forEach((o) => {
        o.offsets.forEach((off) => {
          const theta = off + elapsed * o.speed;
          const p = getPos(o.rx, o.ry, o.angleDeg, theta);
          drawElectron(p.x, p.y);
        });
      });
      elapsed++;
      animationId = requestAnimationFrame(frame);
    }

    animationId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={560}
      height={560}
      className="block"
    />
  );
};

export default HeroAtom;