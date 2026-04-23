"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

type BeamsBackgroundProps = {
  className?: string;
  intensity?: "subtle" | "medium" | "strong";
  theme?: "dark" | "light";
};

function getScale(intensity: NonNullable<BeamsBackgroundProps["intensity"]>) {
  if (intensity === "subtle") return 6;
  if (intensity === "medium") return 5;
  return 4;
}

function getTargetFps(
  intensity: NonNullable<BeamsBackgroundProps["intensity"]>
) {
  if (intensity === "subtle") return 12;
  if (intensity === "medium") return 18;
  return 24;
}

export function BeamsBackground({
  className,
  intensity = "strong",
  theme = "dark",
}: BeamsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const bufferCanvas = document.createElement("canvas");
    const bufferCtx = bufferCanvas.getContext("2d", { alpha: false });
    if (!bufferCtx) return;

    let width = 0;
    let height = 0;
    let imageData: ImageData | null = null;
    let data: Uint8ClampedArray | null = null;
    const baseScale = getScale(intensity);
    const frameInterval = 1000 / getTargetFps(intensity);
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const maxBufferPixels = 180_000;
    let lastFrameTime = 0;
    let isVisible = !document.hidden;

    const resizeCanvas = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const adaptiveScale = Math.max(
        baseScale,
        Math.ceil(Math.sqrt((viewportWidth * viewportHeight) / maxBufferPixels))
      );

      canvas.width = viewportWidth;
      canvas.height = viewportHeight;
      width = Math.max(1, Math.floor(viewportWidth / adaptiveScale));
      height = Math.max(1, Math.floor(viewportHeight / adaptiveScale));
      bufferCanvas.width = width;
      bufferCanvas.height = height;
      imageData = bufferCtx.createImageData(width, height);
      data = imageData.data;
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        lastFrameTime = 0;
      }
    };

    window.addEventListener("resize", resizeCanvas);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    resizeCanvas();

    const startTime = Date.now();

    const sinTable = new Float32Array(1024);
    const cosTable = new Float32Array(1024);
    for (let i = 0; i < 1024; i += 1) {
      const angle = (i / 1024) * Math.PI * 2;
      sinTable[i] = Math.sin(angle);
      cosTable[i] = Math.cos(angle);
    }

    const fastSin = (value: number) => {
      const index = Math.floor(((value % (Math.PI * 2)) / (Math.PI * 2)) * 1024) & 1023;
      return sinTable[index];
    };

    const fastCos = (value: number) => {
      const index = Math.floor(((value % (Math.PI * 2)) / (Math.PI * 2)) * 1024) & 1023;
      return cosTable[index];
    };

    const render = (timestamp: number) => {
      if (!imageData || !data || width <= 0 || height <= 0) {
        frameRef.current = window.requestAnimationFrame(render);
        return;
      }

      if (!isVisible) {
        frameRef.current = window.requestAnimationFrame(render);
        return;
      }

      if (!reduceMotion && lastFrameTime !== 0) {
        const elapsed = timestamp - lastFrameTime;
        if (elapsed < frameInterval) {
          frameRef.current = window.requestAnimationFrame(render);
          return;
        }
      }

      lastFrameTime = timestamp;
      const time = (Date.now() - startTime) * 0.001;

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const uX = (2 * x - width) / height;
          const uY = (2 * y - height) / height;

          let a = 0;
          let d = 0;

          for (let i = 0; i < 4; i += 1) {
            a += fastCos(i - d + time * 0.5 - a * uX);
            d += fastSin(i * uY + a);
          }

          const wave = (fastSin(a) + fastCos(d)) * 0.5;
          let r = 0;
          let g = 0;
          let b = 0;

          if (theme === "light") {
            const waveIntensity = 0.92 + 0.06 * wave;
            const baseVal = 0.94 + 0.025 * fastCos(uX * 0.7 + uY + time * 0.18);
            const blueAccent = 0.028 * fastSin(a * 1.3 + time * 0.16);
            const cyanAccent = 0.022 * fastCos(d * 1.5 - time * 0.12);
            const roseAccent = 0.018 * fastSin((uX - uY) * 2.2 + time * 0.1);

            r = Math.max(
              0,
              Math.min(1, baseVal + roseAccent * 0.85 - blueAccent * 0.15)
            ) * waveIntensity;
            g = Math.max(
              0,
              Math.min(1, baseVal + cyanAccent * 0.65 + blueAccent * 0.1)
            ) * waveIntensity;
            b = Math.max(
              0,
              Math.min(1, baseVal + blueAccent * 0.9 + cyanAccent * 0.35)
            ) * waveIntensity;
          } else {
            const waveIntensity = 0.3 + 0.4 * wave;
            const baseVal = 0.1 + 0.15 * fastCos(uX + uY + time * 0.3);
            const blueAccent = 0.2 * fastSin(a * 1.5 + time * 0.2);
            const purpleAccent = 0.15 * fastCos(d * 2 + time * 0.1);

            r = Math.max(0, Math.min(1, baseVal + purpleAccent * 0.8)) * waveIntensity;
            g = Math.max(0, Math.min(1, baseVal + blueAccent * 0.6)) * waveIntensity;
            b =
              Math.max(0, Math.min(1, baseVal + blueAccent * 1.2 + purpleAccent * 0.4)) *
              waveIntensity;
          }

          const index = (y * width + x) * 4;
          data[index] = r * 255;
          data[index + 1] = g * 255;
          data[index + 2] = b * 255;
          data[index + 3] = 255;
        }
      }

      bufferCtx.putImageData(imageData, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bufferCanvas, 0, 0, width, height, 0, 0, canvas.width, canvas.height);

      if (!reduceMotion) {
        frameRef.current = window.requestAnimationFrame(render);
      }
    };

    frameRef.current = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.cancelAnimationFrame(frameRef.current);
    };
  }, [intensity, theme]);

  return <canvas ref={canvasRef} className={cn("absolute inset-0 h-full w-full", className)} />;
}
