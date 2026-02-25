/*
 * ---------------------------------------------------------------
 *                 Pixospritz – Editor – Audio Preview
 * ---------------------------------------------------------------
 * Copyright (c) 2022‑2025  Kyle Derby MacInnis
 *
 * This component provides a simple audio player for previewing
 * sound effects and music contained within a Pixospritz package.
 * Given a data URI encoded audio file, the component renders
 * an HTML5 audio element with playback controls.  If no audio
 * content is provided the component will render nothing.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { collect } from 'react-recollect';
import './audio-preview.css';

/**
 * AudioPreview displays an audio element for a provided data URI.
 *
 * Props:
 *  - content (string): A data URI containing the encoded audio
 *    file.  Supported formats include mp3, wav and ogg.  If
 *    content is undefined or null the component will render
 *    nothing.
 */
const formatDuration = seconds => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
};

const deriveMetadataFromContent = dataUri => {
  if (!dataUri) {
    return {
      format: '—',
      sizeBytes: 0,
      sizeLabel: '—',
      bitrateLabel: '—',
      durationLabel: '—',
    };
  }

  const [header, payload] = dataUri.split(',');
  const mimeMatch = header?.match(/data:(.*?);/);
  const format = mimeMatch ? mimeMatch[1] : 'unknown';
  const sizeBytes = payload ? Math.round((payload.length * 3) / 4) : 0;
  const sizeLabel = sizeBytes ? `${(sizeBytes / 1024).toFixed(1)} KB` : '—';

  return {
    format,
    sizeBytes,
    sizeLabel,
    bitrateLabel: '—',
    durationLabel: '—',
  };
};

const AudioPreview = ({ content }) => {
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const [stats, setStats] = useState(() => deriveMetadataFromContent(content));
  const [audioElementKey, setAudioElementKey] = useState(0);

  useEffect(() => {
    setStats(prev => ({ ...prev, ...deriveMetadataFromContent(content), durationLabel: '—' }));
  }, [content]);

  useEffect(() => {
    setAudioElementKey(prev => (content ? prev + 1 : 0));
  }, [content]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl || !content) return undefined;

    const handleMetadata = () => {
      setStats(prev => {
        const duration = audioEl.duration;
        const bitrateLabel =
          prev.sizeBytes && Number.isFinite(duration) && duration > 0
            ? `${Math.max(1, Math.round((prev.sizeBytes * 8) / duration / 1000))} kbps`
            : prev.bitrateLabel;
        return {
          ...prev,
          durationLabel: formatDuration(duration),
          bitrateLabel,
        };
      });
    };

    audioEl.addEventListener('loadedmetadata', handleMetadata);
    return () => audioEl.removeEventListener('loadedmetadata', handleMetadata);
  }, [content]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const resizeCanvas = () => {
      const parentWidth = canvas.parentElement ? canvas.parentElement.clientWidth : 480;
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = parentWidth * pixelRatio;
      canvas.height = 140 * pixelRatio;
      canvas.style.width = `${parentWidth}px`;
      canvas.style.height = '140px';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    const audioEl = audioRef.current;
    const canvas = canvasRef.current;
    if (!audioEl || !canvas || !content || !audioElementKey) {
      return undefined;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return undefined;

    const audioCtx = new AudioCtx();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.7;

    let source;
    try {
      source = audioCtx.createMediaElementSource(audioEl);
    } catch (error) {
      console.warn('Audio visualizer disabled:', error);
      audioCtx.close();
      return undefined;
    }

    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    audioContextRef.current = audioCtx;
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const renderFrame = () => {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      const { width, height } = canvas;
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, width, height);

      const pixelScale = 6 * (window.devicePixelRatio || 1);
      const gap = 2 * (window.devicePixelRatio || 1);
      const totalBars = Math.floor(width / (pixelScale + gap));
      const step = Math.max(1, Math.floor(dataArray.length / totalBars));

      for (let i = 0; i < totalBars; i += 1) {
        const value = dataArray[i * step] / 255;
        const barHeight = Math.max(pixelScale, height * value);
        const x = i * (pixelScale + gap);
        const y = height - barHeight;

        ctx.fillStyle = i % 4 === 0 ? '#ff6b9d' : '#4ecdc4';
        ctx.fillRect(x, y, pixelScale, barHeight);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(x, y, pixelScale, pixelScale);
      }
    };

    const resumeContext = () => {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    };

    audioEl.addEventListener('play', resumeContext);
    renderFrame();

    return () => {
      audioEl.removeEventListener('play', resumeContext);
      cancelAnimationFrame(animationFrameRef.current);
      analyser.disconnect();
      source.disconnect();
      audioCtx.close();
    };
  }, [content, audioElementKey]);

  const statItems = useMemo(
    () => [
      { label: 'Format', value: stats.format },
      { label: 'Duration', value: stats.durationLabel || '—' },
      { label: 'Size', value: stats.sizeLabel },
      { label: 'Bitrate', value: stats.bitrateLabel },
    ],
    [stats]
  );

  if (!content) {
    return (
      <div className="audio-preview-panel audio-preview-empty">
        <p>Select an audio asset from the sidebar to preview the waveform and metadata.</p>
      </div>
    );
  }

  return (
    <section className="audio-preview-panel">
      <div className="audio-card">
        <header className="audio-card__header">
          <div>
            <p className="eyebrow">Pixel Equalizer</p>
            <h3>Retro Audio Monitor</h3>
            <p className="subtext">
              Enjoy a CRT-inspired visualizer while you inspect your assets.
            </p>
          </div>
          <audio
            key={audioElementKey}
            controls
            src={content}
            ref={audioRef}
            preload="metadata"
            className="audio-card__player"
          >
            Your browser does not support the <code>audio</code> element.
          </audio>
        </header>
        <div className="audio-visualizer">
          <canvas ref={canvasRef} />
          <div className="pixel-grid-overlay" aria-hidden="true" />
        </div>
        <div className="audio-stats">
          {statItems.map(item => (
            <div key={item.label} className="audio-stat">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default collect(AudioPreview);
