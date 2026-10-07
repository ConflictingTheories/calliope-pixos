/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

import { useState, useRef, useEffect } from 'react';

/**
 * TouchControls: virtual joystick + buttons for mobile play.
 *
 * - Left: virtual joystick for movement
 * - Right: A (interact), B (cancel/back) buttons
 * - Emits synthetic keyboard events the engine already handles
 */

export default function TouchControls({ onInput }) {
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const joystickRef = useRef(null);
  const baseRef = useRef(null);

  const JOYSTICK_RADIUS = 50;
  const DEAD_ZONE = 10;

  const handleTouchStart = e => {
    const touch = e.touches[0];
    const base = baseRef.current.getBoundingClientRect();
    const cx = base.left + base.width / 2;
    const cy = base.top + base.height / 2;
    setJoystickActive(true);
    updateJoystick(touch.clientX - cx, touch.clientY - cy);
  };

  const handleTouchMove = e => {
    if (!joystickActive) return;
    const touch = e.touches[0];
    const base = baseRef.current.getBoundingClientRect();
    const cx = base.left + base.width / 2;
    const cy = base.top + base.height / 2;
    updateJoystick(touch.clientX - cx, touch.clientY - cy);
  };

  const handleTouchEnd = () => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    onInput?.({ type: 'joystick', x: 0, y: 0 });
  };

  const updateJoystick = (dx, dy) => {
    const dist = Math.sqrt(dx * dx + dy * dy);
    let nx = dx, ny = dy;
    if (dist > JOYSTICK_RADIUS) {
      nx = (dx / dist) * JOYSTICK_RADIUS;
      ny = (dy / dist) * JOYSTICK_RADIUS;
    }
    setJoystickPos({ x: nx, y: ny });

    // Convert to directional input (with dead zone)
    const threshold = DEAD_ZONE;
    const input = { type: 'joystick', x: 0, y: 0 };
    if (Math.abs(nx) > threshold) input.x = nx > 0 ? 1 : -1;
    if (Math.abs(ny) > threshold) input.y = ny > 0 ? 1 : -1;
    onInput?.(input);
  };

  const handleButton = (button, pressed) => {
    onInput?.({ type: 'button', button, pressed });
  };

  return (
    <div className="touch-controls">
      {/* Joystick */}
      <div
        ref={baseRef}
        className="touch-joystick-base"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={joystickRef}
          className={`touch-joystick-knob ${joystickActive ? 'active' : ''}`}
          style={{
            transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
          }}
        />
      </div>

      {/* Buttons */}
      <div className="touch-buttons">
        <button
          className="touch-btn touch-btn-b"
          onTouchStart={() => handleButton('b', true)}
          onTouchEnd={() => handleButton('b', false)}
        >
          B
        </button>
        <button
          className="touch-btn touch-btn-a"
          onTouchStart={() => handleButton('a', true)}
          onTouchEnd={() => handleButton('a', false)}
        >
          A
        </button>
      </div>
    </div>
  );
}
