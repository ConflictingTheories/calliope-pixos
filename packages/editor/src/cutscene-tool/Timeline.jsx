/*
 * ---------------------------------------------------------------
 *          PixoSpritz – Editor – Cutscene Timeline
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Visual timeline component for cutscene editing with scrubber,
 * zoom controls, and track-based event visualization.
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import './timeline.css';

/**
 * Event type configurations for timeline visualization
 */
const EVENT_CONFIGS = {
  dialogue: { color: '#7dd3fc', icon: '💬', label: 'Dialogue', defaultDuration: 3000 },
  cutin: { color: '#f472b6', icon: '🎭', label: 'Cutin', defaultDuration: 2000 },
  wait: { color: '#fbbf24', icon: '⏱️', label: 'Wait', defaultDuration: 1000 },
  action: { color: '#a78bfa', icon: '⚡', label: 'Action', defaultDuration: 500 },
  transition: { color: '#34d399', icon: '🔄', label: 'Transition', defaultDuration: 500 },
  audio: { color: '#fb923c', icon: '🔊', label: 'Audio', defaultDuration: 2000 },
};

/**
 * Calculate timeline position and duration from events
 */
function calculateEventTimings(events) {
  let currentTime = 0;
  return events.map((event, idx) => {
    const config = EVENT_CONFIGS[event.type] || EVENT_CONFIGS.action;
    const duration = event.duration ? event.duration * 1000 : config.defaultDuration;

    const timing = {
      ...event,
      idx,
      startTime: currentTime,
      duration,
      endTime: currentTime + duration,
    };

    currentTime += duration;
    return timing;
  });
}

/**
 * Format time in MM:SS.mmm format
 */
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
}

/**
 * Timeline component for visual cutscene editing
 *
 * @param {object} props
 * @param {Array} props.events - Array of cutscene events
 * @param {number} props.currentTime - Current playback time in ms
 * @param {boolean} props.isPlaying - Whether cutscene is playing
 * @param {number} props.selectedIndex - Index of selected event
 * @param {function(number):void} props.onSeek - Callback when user seeks to time
 * @param {function(number):void} props.onSelectEvent - Callback when user selects event
 * @param {function(number, object):void} props.onEventChange - Callback when event is modified
 * @param {function():void} props.onPlay - Callback to start playback
 * @param {function():void} props.onPause - Callback to pause playback
 * @param {function():void} props.onStop - Callback to stop playback
 */
export default function Timeline({
  events = [],
  currentTime = 0,
  isPlaying = false,
  selectedIndex = null,
  onSeek,
  onSelectEvent,
  onEventChange,
  onPlay,
  onPause,
  onStop,
}) {
  const [zoom, setZoom] = useState(1); // pixels per ms
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDraggingScrubber, setIsDraggingScrubber] = useState(false);
  const [isDraggingEvent, setIsDraggingEvent] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);

  const timelineRef = useRef(null);
  const rulerRef = useRef(null);
  const tracksRef = useRef(null);

  // Calculate event timings
  const timedEvents = useMemo(() => calculateEventTimings(events), [events]);

  // Total duration of timeline
  const totalDuration = useMemo(() => {
    if (timedEvents.length === 0) return 5000;
    const lastEvent = timedEvents[timedEvents.length - 1];
    return Math.max(lastEvent.endTime + 2000, 5000); // Add padding
  }, [timedEvents]);

  // Timeline width in pixels
  const timelineWidth = useMemo(() => totalDuration * zoom * 0.1, [totalDuration, zoom]);

  // Ruler tick marks
  const rulerTicks = useMemo(() => {
    const ticks = [];
    const interval = zoom > 0.5 ? 1000 : zoom > 0.2 ? 5000 : 10000;
    for (let t = 0; t <= totalDuration; t += interval) {
      ticks.push({
        time: t,
        major: t % (interval * 5) === 0,
      });
    }
    return ticks;
  }, [totalDuration, zoom]);

  /**
   * Handle scrubber drag
   */
  const handleScrubberMouseDown = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingScrubber(true);
  }, []);

  /**
   * Handle mouse move for scrubber dragging
   */
  const handleMouseMove = useCallback(
    e => {
      if (!isDraggingScrubber || !rulerRef.current) return;

      const rect = rulerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollLeft;
      const time = Math.max(0, Math.min(totalDuration, x / (zoom * 0.1)));

      if (onSeek) {
        onSeek(time);
      }
    },
    [isDraggingScrubber, scrollLeft, zoom, totalDuration, onSeek]
  );

  /**
   * Handle mouse up
   */
  const handleMouseUp = useCallback(() => {
    setIsDraggingScrubber(false);
    setIsDraggingEvent(null);
  }, []);

  // Global mouse events for dragging
  useEffect(() => {
    if (isDraggingScrubber || isDraggingEvent !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingScrubber, isDraggingEvent, handleMouseMove, handleMouseUp]);

  /**
   * Handle click on ruler to seek
   */
  const handleRulerClick = useCallback(
    e => {
      if (!rulerRef.current || isDraggingScrubber) return;

      const rect = rulerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollLeft;
      const time = Math.max(0, Math.min(totalDuration, x / (zoom * 0.1)));

      if (onSeek) {
        onSeek(time);
      }
    },
    [scrollLeft, zoom, totalDuration, onSeek, isDraggingScrubber]
  );

  /**
   * Handle event click
   */
  const handleEventClick = useCallback(
    (e, idx) => {
      e.stopPropagation();
      if (onSelectEvent) {
        onSelectEvent(idx);
      }
    },
    [onSelectEvent]
  );

  /**
   * Handle scroll
   */
  const handleScroll = useCallback(e => {
    setScrollLeft(e.target.scrollLeft);
  }, []);

  /**
   * Handle zoom change
   */
  const handleZoom = useCallback(delta => {
    setZoom(prev => Math.max(0.1, Math.min(2, prev + delta)));
  }, []);

  // Scrubber position
  const scrubberPosition = currentTime * zoom * 0.1;

  return (
    <div className="timeline-container">
      {/* Toolbar */}
      <div className="timeline-toolbar">
        <div className="timeline-controls">
          <button className="timeline-btn" onClick={onStop} title="Stop (Reset to start)">
            ⏹
          </button>
          <button
            className={`timeline-btn timeline-btn-primary ${isPlaying ? 'active' : ''}`}
            onClick={isPlaying ? onPause : onPlay}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
        </div>

        <div className="timeline-time-display">
          <span className="timeline-current-time">{formatTime(currentTime)}</span>
          <span className="timeline-separator">/</span>
          <span className="timeline-total-time">{formatTime(totalDuration)}</span>
        </div>

        <div className="timeline-zoom-controls">
          <button className="timeline-btn" onClick={() => handleZoom(-0.1)} title="Zoom Out">
            −
          </button>
          <span className="timeline-zoom-label">{Math.round(zoom * 100)}%</span>
          <button className="timeline-btn" onClick={() => handleZoom(0.1)} title="Zoom In">
            +
          </button>
        </div>
      </div>

      {/* Timeline area */}
      <div ref={timelineRef} className="timeline-scroll-area" onScroll={handleScroll}>
        {/* Ruler */}
        <div
          ref={rulerRef}
          className="timeline-ruler"
          style={{ width: timelineWidth }}
          onClick={handleRulerClick}
        >
          {rulerTicks.map((tick, idx) => (
            <div
              key={idx}
              className={`timeline-tick ${tick.major ? 'major' : 'minor'}`}
              style={{ left: tick.time * zoom * 0.1 }}
            >
              {tick.major && <span className="timeline-tick-label">{formatTime(tick.time)}</span>}
            </div>
          ))}

          {/* Scrubber */}
          <div
            className={`timeline-scrubber ${isDraggingScrubber ? 'dragging' : ''}`}
            style={{ left: scrubberPosition }}
            onMouseDown={handleScrubberMouseDown}
          >
            <div className="timeline-scrubber-head" />
            <div className="timeline-scrubber-line" />
          </div>
        </div>

        {/* Tracks */}
        <div ref={tracksRef} className="timeline-tracks" style={{ width: timelineWidth }}>
          {/* Single track for now - could be expanded to multiple tracks */}
          <div className="timeline-track">
            <div className="timeline-track-label">Events</div>
            <div className="timeline-track-content">
              {timedEvents.map((event, idx) => {
                const config = EVENT_CONFIGS[event.type] || EVENT_CONFIGS.action;
                const isSelected = selectedIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`timeline-event ${isSelected ? 'selected' : ''}`}
                    style={{
                      left: event.startTime * zoom * 0.1,
                      width: Math.max(20, event.duration * zoom * 0.1),
                      '--event-color': config.color,
                    }}
                    onClick={e => handleEventClick(e, idx)}
                    title={`${config.label}: ${event.speaker || event.command || ''}`}
                  >
                    <span className="timeline-event-icon">{config.icon}</span>
                    <span className="timeline-event-label">{event.speaker || event.type}</span>
                  </div>
                );
              })}

              {/* Current time indicator line */}
              <div className="timeline-playhead" style={{ left: scrubberPosition }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for managing timeline playback state
 */
export function useTimelinePlayback(events, options = {}) {
  const { speed = 1, onComplete } = options;

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(null);

  const timedEvents = useMemo(() => calculateEventTimings(events), [events]);
  const totalDuration = useMemo(() => {
    if (timedEvents.length === 0) return 0;
    return timedEvents[timedEvents.length - 1].endTime;
  }, [timedEvents]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      return;
    }

    const animate = timestamp => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const delta = (timestamp - lastTimeRef.current) * speed;
      lastTimeRef.current = timestamp;

      setCurrentTime(prev => {
        const next = prev + delta;
        if (next >= totalDuration) {
          setIsPlaying(false);
          if (onComplete) onComplete();
          return totalDuration;
        }
        return next;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, speed, totalDuration, onComplete]);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);
  const seek = useCallback(
    time => {
      setCurrentTime(Math.max(0, Math.min(totalDuration, time)));
    },
    [totalDuration]
  );

  // Get current event index
  const currentEventIndex = useMemo(() => {
    for (let i = 0; i < timedEvents.length; i++) {
      if (currentTime >= timedEvents[i].startTime && currentTime < timedEvents[i].endTime) {
        return i;
      }
    }
    return -1;
  }, [currentTime, timedEvents]);

  return {
    currentTime,
    isPlaying,
    play,
    pause,
    stop,
    seek,
    currentEventIndex,
    totalDuration,
  };
}
