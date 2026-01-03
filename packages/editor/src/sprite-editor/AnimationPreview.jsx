/*
 * ---------------------------------------------------------------
 *        Pixospritz – Editor – Animation Preview Component
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Displays animated sprite previews with playback controls.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import './animation-preview.css';

/**
 * AnimationPreview - Renders animated sprite sequences with controls
 *
 * @param {object} props
 * @param {Array} props.frames - Array of frame data [{x, y, width, height}, ...]
 * @param {string} props.spriteSheetSrc - Source image URL for sprite sheet
 * @param {number} props.frameWidth - Default frame width
 * @param {number} props.frameHeight - Default frame height
 * @param {number} [props.initialSpeed=200] - Animation speed in ms per frame
 * @param {boolean} [props.loop=true] - Whether to loop animation
 * @param {number} [props.scale=2] - Display scale multiplier
 * @param {string} [props.direction='S'] - Current direction being previewed
 * @param {function} [props.onFrameChange] - Callback when frame changes
 * @returns {JSX.Element}
 */
function AnimationPreview({
  frames = [],
  spriteSheetSrc,
  frameWidth = 16,
  frameHeight = 16,
  initialSpeed = 200,
  loop = true,
  scale = 2,
  direction = 'S',
  onFrameChange,
}) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const animationRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [speed, setSpeed] = useState(initialSpeed);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [pingPong, setPingPong] = useState(false);
  const [direction_, setDirection] = useState(1); // 1 = forward, -1 = backward

  // Load sprite sheet image
  useEffect(() => {
    if (!spriteSheetSrc) return;

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
    img.onerror = () => {
      setImageLoaded(false);
    };
    img.src = spriteSheetSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [spriteSheetSrc]);

  // Draw current frame
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;

    if (!ctx || !img || !imageLoaded) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Enable pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;

    const frame = frames[currentFrame];
    if (!frame) {
      // Draw placeholder if no frame
      ctx.fillStyle = '#333';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#666';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No frames', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Extract frame coordinates
    const sx = frame.x ?? 0;
    const sy = frame.y ?? 0;
    const sw = frame.width ?? frameWidth;
    const sh = frame.height ?? frameHeight;

    // Draw frame scaled to canvas
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  }, [frames, currentFrame, frameWidth, frameHeight, imageLoaded]);

  // Redraw on frame change
  useEffect(() => {
    drawFrame();
    onFrameChange?.(currentFrame);
  }, [currentFrame, drawFrame, onFrameChange]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || frames.length === 0) {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    animationRef.current = setInterval(() => {
      setCurrentFrame((prev) => {
        let next = prev + direction_;

        if (pingPong) {
          if (next >= frames.length - 1) {
            setDirection(-1);
            return frames.length - 1;
          } else if (next <= 0) {
            setDirection(1);
            return 0;
          }
          return next;
        } else {
          if (next >= frames.length) {
            if (loop) {
              return 0;
            } else {
              setIsPlaying(false);
              return prev;
            }
          }
          return next;
        }
      });
    }, speed);

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, speed, frames.length, loop, pingPong, direction_]);

  // Playback controls
  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const stop = () => {
    setIsPlaying(false);
    setCurrentFrame(0);
    setDirection(1);
  };
  const stepForward = () => {
    setIsPlaying(false);
    setCurrentFrame((prev) => (prev + 1) % Math.max(1, frames.length));
  };
  const stepBackward = () => {
    setIsPlaying(false);
    setCurrentFrame((prev) => (prev - 1 + frames.length) % Math.max(1, frames.length));
  };
  const goToFirst = () => {
    setIsPlaying(false);
    setCurrentFrame(0);
  };
  const goToLast = () => {
    setIsPlaying(false);
    setCurrentFrame(Math.max(0, frames.length - 1));
  };

  const canvasWidth = frameWidth * scale;
  const canvasHeight = frameHeight * scale;

  return (
    <div className="animation-preview">
      {/* Preview Canvas */}
      <div className="animation-preview-canvas-container">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="animation-preview-canvas"
        />
        <div className="animation-preview-info">
          <span className="animation-preview-direction">{direction}</span>
          <span className="animation-preview-frame-count">
            {frames.length > 0 ? `${currentFrame + 1}/${frames.length}` : '0/0'}
          </span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="animation-preview-controls">
        <button onClick={goToFirst} title="First Frame" className="animation-btn">⏮</button>
        <button onClick={stepBackward} title="Previous Frame" className="animation-btn">⏪</button>
        {isPlaying ? (
          <button onClick={pause} title="Pause" className="animation-btn animation-btn-primary">⏸</button>
        ) : (
          <button onClick={play} title="Play" className="animation-btn animation-btn-primary">▶</button>
        )}
        <button onClick={stop} title="Stop" className="animation-btn">⏹</button>
        <button onClick={stepForward} title="Next Frame" className="animation-btn">⏩</button>
        <button onClick={goToLast} title="Last Frame" className="animation-btn">⏭</button>
      </div>

      {/* Speed & Options */}
      <div className="animation-preview-options">
        <div className="animation-preview-option">
          <label>Speed (ms):</label>
          <input
            type="range"
            min="16"
            max="1000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span className="animation-preview-speed-value">{speed}</span>
        </div>
        <div className="animation-preview-option">
          <label>
            <input
              type="checkbox"
              checked={loop}
              onChange={(e) => e.target.checked}
              disabled
            />
            Loop
          </label>
          <label>
            <input
              type="checkbox"
              checked={pingPong}
              onChange={(e) => setPingPong(e.target.checked)}
            />
            Ping-Pong
          </label>
        </div>
      </div>

      {/* Frame Timeline */}
      {frames.length > 0 && (
        <div className="animation-preview-timeline">
          {frames.map((frame, idx) => (
            <button
              key={idx}
              className={`animation-timeline-frame ${idx === currentFrame ? 'active' : ''}`}
              onClick={() => {
                setIsPlaying(false);
                setCurrentFrame(idx);
              }}
              title={`Frame ${idx + 1}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AnimationPreview;
