/**
 * ---------------------------------------------------------------
 *                AI Generator - Main Component
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Full-featured AI generator panel for creating game assets.
 * Supports multiple modalities: Image, Audio, and Text generation.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Button,
  Input,
  SelectPicker,
  Message,
  Progress,
  ButtonGroup,
} from 'rsuite';

import {
  aiService,
  analyzePrompt,
  createOrchestrator,
} from './services/index.js';

import './styles/ai-generator.css';

// Modality options
const MODALITIES = [
  { label: 'Auto-detect', value: 'auto' },
  { label: 'Sprite Package', value: 'sprite' },
  { label: 'Portrait', value: 'portrait' },
  { label: 'Spritesheet', value: 'spritesheet' },
  { label: 'Audio', value: 'audio' },
  { label: 'Cutscene', value: 'cutscene' },
  { label: 'Script', value: 'script' },
];

/**
 * Asset Card Component
 */
function AssetCard({ asset, onSave, saving }) {
  const renderPreview = () => {
    switch (asset.type) {
    case 'image':
      return (
        <div className="asset-card-image">
          <img
            src={asset.base64 ? `data:image/png;base64,${asset.base64}` : URL.createObjectURL(asset.content)}
            alt={asset.name}
          />
        </div>
      );
    case 'audio':
      return (
        <div className="asset-card-audio">
          <audio controls src={URL.createObjectURL(asset.content)} />
        </div>
      );
    case 'config':
    case 'text':
      return (
        <div className="asset-card-text">
          <pre>{typeof asset.content === 'string' ? asset.content : JSON.stringify(asset.content, null, 2)}</pre>
        </div>
      );
    default:
      return <div className="asset-card-unknown">Preview unavailable</div>;
    }
  };

  return (
    <div className="asset-card">
      <div className="asset-card-header">
        <span className="asset-card-type">{asset.subtype || asset.type}</span>
        <span className="asset-card-name">{asset.name}</span>
      </div>
      {renderPreview()}
      <div className="asset-card-footer">
        <span className="asset-card-path">{asset.path}</span>
        <Button 
          size="xs" 
          appearance="primary" 
          onClick={() => onSave(asset)}
          loading={saving}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

/**
 * Main AI Generator Component
 */
function AIGenerator({ writeFile, onFileGenerated, refreshFolder }) {
  // State
  const [prompt, setPrompt] = useState('');
  const [modality, setModality] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [savingAsset, setSavingAsset] = useState(null);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [countdown, setCountdown] = useState(null);
  
  const resultsRef = useRef(null);
  const countdownRef = useRef(null);

  // Check if configured
  const isConfigured = aiService.isConfigured();

  // Warn before closing if there are unsaved results
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (results?.assets?.length > 0) {
        e.preventDefault();
        e.returnValue = 'You have unsaved generated assets. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [results]);

  // Handle countdown for rate limiting
  useEffect(() => {
    if (status?.phase === 'rate-limited' && status?.retryInfo?.delayMs) {
      const endTime = Date.now() + status.retryInfo.delayMs;
      
      const updateCountdown = () => {
        const remaining = Math.max(0, endTime - Date.now());
        setCountdown(Math.ceil(remaining / 1000));
        
        if (remaining > 0) {
          countdownRef.current = requestAnimationFrame(updateCountdown);
        }
      };
      
      updateCountdown();
      
      return () => {
        if (countdownRef.current) {
          cancelAnimationFrame(countdownRef.current);
        }
      };
    } else {
      setCountdown(null);
    }
  }, [status]);

  // Debounced analysis on prompt change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (prompt.trim().length > 10) {
        const result = analyzePrompt(prompt);
        setAnalysis(result);
      } else {
        setAnalysis(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [prompt]);

  // Scroll to results when generated
  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [results]);

  // Handle generation
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (!isConfigured) {
      setError('Configure your API key in Options (⚙️) to use AI generation');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const orchestrator = createOrchestrator({
        writeFile,
        onProgress: (p) => setProgress(p),
        onStatusChange: (s) => setStatus(s),
      });

      const generationResults = await orchestrator.generateFromPrompt(prompt);
      setResults(generationResults);

      if (generationResults.errors.length > 0) {
        setError(`Completed with ${generationResults.errors.length} error(s)`);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setStatus(null);
      setProgress(null);
    }
  }, [prompt, isConfigured, writeFile]);

  // Handle retrying only failed assets (conserves tokens)
  const handleRetryFailed = useCallback(async () => {
    if (!results?.errors?.length) return;

    const retryableErrors = results.errors.filter(err => err.retryable);
    if (retryableErrors.length === 0) {
      setError('No retryable errors found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orchestrator = createOrchestrator({
        writeFile,
        onProgress: (p) => setProgress(p),
        onStatusChange: (s) => setStatus(s),
      });

      const retryResults = await orchestrator.retryFailedAssets(retryableErrors);

      // Merge new assets with existing ones
      setResults(prev => ({
        ...prev,
        assets: [...prev.assets, ...retryResults.assets],
        errors: retryResults.errors, // Replace errors with remaining errors
      }));

      if (retryResults.errors.length > 0) {
        setError(`Retry completed with ${retryResults.errors.length} error(s)`);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setStatus(null);
      setProgress(null);
    }
  }, [results, writeFile]);

  // Handle saving single asset
  const handleSaveAsset = useCallback(async (asset) => {
    if (!writeFile) return;

    setSavingAsset(asset.path);
    try {
      const orchestrator = createOrchestrator({ writeFile });
      await orchestrator.writeAssetsToZip([asset], writeFile);
      
      if (refreshFolder) refreshFolder();
      if (onFileGenerated) onFileGenerated(asset);
      
    } catch (err) {
      setError(`Failed to save: ${err.message}`);
    } finally {
      setSavingAsset(null);
    }
  }, [writeFile, refreshFolder, onFileGenerated]);

  // Handle saving all assets
  const handleSaveAll = useCallback(async () => {
    if (!results?.assets || !writeFile) return;

    setLoading(true);
    setError(null);

    try {
      const orchestrator = createOrchestrator({
        writeFile,
        onProgress: (p) => setProgress(p),
        onStatusChange: (s) => setStatus(s),
      });

      const writeResults = await orchestrator.writeAssetsToZip(results.assets, writeFile);

      if (writeResults.failed.length > 0) {
        setError(`Failed to save ${writeResults.failed.length} file(s)`);
      } else {
        setStatus({ phase: 'saved', message: `Saved ${writeResults.success.length} file(s)` });
        if (refreshFolder) refreshFolder();
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }, [results, writeFile, refreshFolder]);

  return (
    <div className="ai-generator">
      {/* Header */}
      <header className="ai-generator-header">
        <h2>AI Asset Generator</h2>
        <span className="ai-header-hint">Configure API key in Options</span>
      </header>

      {/* Main Content */}
      <div className="ai-generator-content">
        {/* API Key Warning */}
        {!isConfigured && (
          <Message type="warning" showIcon className="ai-warning">
            <span>Configure your API key in the main Options dialog to use AI generation.</span>
          </Message>
        )}

        {/* Prompt Section */}
        <section className="ai-prompt-section">
          <label>Describe what you want to create:</label>
          <Input
            as="textarea"
            rows={3}
            value={prompt}
            onChange={setPrompt}
            placeholder="e.g., Create a wizard character sprite with blue robes, 8 direction walk animation, and a portrait..."
            disabled={loading}
          />
          
          <div className="ai-prompt-controls">
            <SelectPicker
              data={MODALITIES}
              value={modality}
              onChange={setModality}
              cleanable={false}
              disabled={loading}
              searchable={false}
              style={{ width: 140 }}
              size="sm"
            />
            <Button
              appearance="primary"
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              loading={loading}
            >
              Generate
            </Button>
          </div>
        </section>

        {/* Analysis Preview */}
        {analysis && !loading && !results && (
          <section className="ai-analysis">
            <div className="ai-analysis-label">Will generate:</div>
            <div className="ai-analysis-tags">
              {analysis.detectedAssets.map((asset, i) => (
                <span key={i} className="ai-tag">{asset}</span>
              ))}
            </div>
            {analysis.spriteConfig && (
              <div className="ai-analysis-config">
                <span>{analysis.spriteConfig.preset}</span>
                <span>{analysis.spriteConfig.tileSize.join('×')}px</span>
                <span>{analysis.spriteConfig.directions}dir</span>
              </div>
            )}
          </section>
        )}

        {/* Progress */}
        {loading && status && (
          <section className={`ai-progress ${status.phase === 'rate-limited' ? 'ai-progress-rate-limited' : ''}`}>
            <div className="ai-progress-status">
              <span className="ai-progress-phase">{status.phase}</span>
              <span className="ai-progress-message">{status.message}</span>
            </div>
            {status.phase === 'rate-limited' && countdown !== null && (
              <div className="ai-countdown">
                <div className="ai-countdown-timer">{countdown}s</div>
                <div className="ai-countdown-label">until retry</div>
                <Progress.Line
                  percent={Math.max(0, 100 - (countdown / (status.retryInfo?.delayMs / 1000 || 60)) * 100)}
                  status="active"
                  showInfo={false}
                />
              </div>
            )}
            {progress && status.phase !== 'rate-limited' && (
              <Progress.Line
                percent={Math.round((progress.current / progress.total) * 100)}
                status="active"
                showInfo={false}
              />
            )}
          </section>
        )}

        {/* Error */}
        {error && (
          <Message type="error" showIcon closable onClose={() => setError(null)} className="ai-error">
            {error}
          </Message>
        )}

        {/* Results */}
        {results && results.assets.length > 0 && (
          <section className="ai-results" ref={resultsRef}>
            <div className="ai-results-header">
              <h3>Generated Assets ({results.assets.length})</h3>
              <ButtonGroup>
                <Button size="sm" appearance="primary" onClick={handleSaveAll} disabled={loading}>
                  Save All to Package
                </Button>
              </ButtonGroup>
            </div>
            
            <div className="ai-results-grid">
              {results.assets.map((asset, index) => (
                <AssetCard
                  key={index}
                  asset={asset}
                  onSave={handleSaveAsset}
                  saving={savingAsset === asset.path}
                />
              ))}
            </div>

            {results.errors.length > 0 && (
              <div className="ai-results-errors">
                <div className="ai-errors-header">
                  <h4>Errors ({results.errors.length})</h4>
                  {results.errors.some(err => err.retryable) && (
                    <Button 
                      size="xs" 
                      appearance="primary" 
                      onClick={handleRetryFailed}
                      disabled={loading}
                      loading={loading}
                    >
                      🔄 Retry Failed ({results.errors.filter(e => e.retryable).length})
                    </Button>
                  )}
                </div>
                {results.errors.map((err, i) => (
                  <Message key={i} type="error" showIcon>
                    <strong>[{err.phase}]</strong> {err.message}
                    {err.retryable && <span className="ai-error-retryable"> (retryable)</span>}
                  </Message>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Success message */}
        {status?.phase === 'saved' && (
          <Message type="success" showIcon className="ai-success">
            {status.message}
          </Message>
        )}
      </div>
    </div>
  );
}

export default AIGenerator;
