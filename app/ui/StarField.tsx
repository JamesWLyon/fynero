"use client";

import { useEffect, useRef } from "react";
import seedrandom from "seedrandom";

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const rng = seedrandom("fynero-stars");
    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Max radius a star can have (in px). Original was 2 + 0.5; scaled to 2/3.
    const MAX_STAR_SIZE = (2 * (2 / 3)) + 0.5;

    // Minimum time (in seconds) for one full twinkle cycle (sin period = 2π / speed).
    // A full cycle at this min speed takes exactly MIN_TWINKLE_PERIOD seconds.
    const MIN_TWINKLE_PERIOD = 2.0;

    // Converted to radians-per-frame at 60fps: speed = 2π / (period * 60)
    const MAX_TWINKLE_SPEED = (2 * Math.PI) / (MIN_TWINKLE_PERIOD * 60);

    // How much a star's opacity can vary above/below its base (0–1 scale)
    const TWINKLE_AMPLITUDE = 0.15;

    const stars = Array.from({ length: 1200 }).map(() => ({
      x: rng() * canvas.width,
      y: rng() * canvas.height,
      // Size in range (0.5, MAX_STAR_SIZE]
      size: rng() * (MAX_STAR_SIZE - 0.5) + 0.5,
      // Resting opacity before twinkle is applied
      baseOpacity: rng() * 0.5 + 0.3,
      opacity: 0,
      // Radians advanced per frame; capped so full cycle >= MIN_TWINKLE_PERIOD
      twinkleSpeed: rng() * MAX_TWINKLE_SPEED,
      // Random phase offset so stars don't all pulse in sync
      twinkleOffset: rng() * Math.PI * 2,
    }));

    // Frame counter used as the time input for the twinkle sine wave
    let t = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const star of stars) {
        const twinkle = Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
        star.opacity = star.baseOpacity + twinkle * TWINKLE_AMPLITUDE;

        ctx.globalAlpha = Math.max(0, star.opacity);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fill();

        if (star.size > 1.8 * (2 / 3)) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = "white";
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      ctx.globalAlpha = 1;
      t++;
      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}