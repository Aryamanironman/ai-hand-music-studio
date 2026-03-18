/**
 * WaveformVisualizer.jsx
 * Real-time audio waveform visualization using Canvas.
 * Gets data from the Tone.js analyser node.
 */

import { useRef, useEffect, useCallback } from 'react';
import soundEngine from '../utils/soundEngine';

const WaveformVisualizer = ({ isActive, height = 160 }) => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  /**
   * Draw the waveform on the canvas.
   */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const h = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, h);

    // Get waveform data
    const waveformData = soundEngine.getWaveformData();

    // Draw background grid (subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 1; i < gridLines; i++) {
      const y = (h / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Center line
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(width, h / 2);
    ctx.stroke();

    // Draw waveform
    const sliceWidth = width / waveformData.length;
    let x = 0;

    // Gradient stroke
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#8b5cf6');
    gradient.addColorStop(0.3, '#a78bfa');
    gradient.addColorStop(0.5, '#06b6d4');
    gradient.addColorStop(0.7, '#22d3ee');
    gradient.addColorStop(1, '#8b5cf6');

    // Main waveform line
    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < waveformData.length; i++) {
      const v = (waveformData[i] + 1) / 2; // Normalize [-1, 1] to [0, 1]
      const y = v * h;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.stroke();

    // Glow effect (fainter copy behind)
    x = 0;
    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.15;

    for (let i = 0; i < waveformData.length; i++) {
      const v = (waveformData[i] + 1) / 2;
      const y = v * h;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Continue animation
    animFrameRef.current = requestAnimationFrame(draw);
  }, []);

  /**
   * Resize canvas to match container.
   */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = height + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    canvas.width = rect.width;
    canvas.height = height;
  }, [height]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (isActive) {
      draw();
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isActive, draw, resizeCanvas]);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">
          Waveform
        </h3>
        <div className="flex items-center gap-2">
          <span className={`status-dot ${isActive ? 'online' : 'offline'}`}></span>
          <span className="text-xs text-white/40">
            {isActive ? 'Live' : 'Inactive'}
          </span>
        </div>
      </div>
      <div className="waveform-container" style={{ height: `${height}px` }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default WaveformVisualizer;
