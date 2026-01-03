/**
 * ---------------------------------------------------------------
 *                AI Generator - Main Component
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Full-featured AI generator panel for creating game assets.
 * Supports multiple modalities: Image, Audio, and Text generation.
 */

import { debug } from '../shared/debug-logger.js';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Button,
  Input,
  SelectPicker,
  Message,
  Progress,
  ButtonGroup,
  Toggle,
  Nav,
} from 'rsuite';

import {
  aiService,
  analyzePrompt,
  createOrchestrator,
  createGamePackageOrchestrator,
} from './services/index.js';

import TemplateSelector from './TemplateSelector.jsx';
import './styles/ai-generator.css';

// Modality options
const MODALITIES = [
  { label: 'Auto-detect', value: 'auto' },
  { label: '🎮 Full Game Package', value: 'game' },
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

  // UI state
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' or 'custom'
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const resultsRef = useRef(null);
  const countdownRef = useRef(null);

  // Check if configured
  const isConfigured = aiService.isConfigured();

  // Handle template selection
  const handleSelectTemplate = useCallback((template) => {
    setSelectedTemplate(template);
    setPrompt(template.prompt);
    setModality('game');
    setActiveTab('custom'); // Switch to custom tab to show the prompt
  }, []);

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
      let generationResults;

      // Determine effective modality (auto-detect or user-selected)
      let effectiveModality = modality;

      if (modality === 'auto') {
        // Check if prompt analyzer detected a game request
        const promptAnalysis = analyzePrompt(prompt);
        if (promptAnalysis.isGameRequest) {
          effectiveModality = 'game';
          debug('AIGenerator', ' Auto-detected full game request');
        }
      }

      // Use Game Package Orchestrator for full game generation
      if (effectiveModality === 'game') {
        setStatus({ phase: 'initializing', message: 'Starting full game generation...' });

        const gameOrchestrator = createGamePackageOrchestrator({
          writeFile,
          onProgress: (p) => setProgress(p),
          onStatusChange: (s) => setStatus(s),
        });

        generationResults = await gameOrchestrator.generateGamePackage(prompt);
      } else {
        // Use regular orchestrator for individual assets
        const orchestrator = createOrchestrator({
          writeFile,
          onProgress: (p) => setProgress(p),
          onStatusChange: (s) => setStatus(s),
        });

        generationResults = await orchestrator.generateFromPrompt(prompt);
      }

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
  }, [prompt, modality, isConfigured, writeFile]);

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
    if (!results?.assets || !writeFile) {
      console.error('[AI Generator] Cannot save: no assets or writeFile function');
      return;
    }

    debug('AIGenerator', ' Starting save of', results.assets.length, 'assets');
    setLoading(true);
    setError(null);

    try {
      const orchestrator = createOrchestrator({
        writeFile,
        onProgress: (p) => setProgress(p),
        onStatusChange: (s) => setStatus(s),
      });

      const writeResults = await orchestrator.writeAssetsToZip(results.assets, writeFile);

      // Always refresh folder to show saved files
      if (refreshFolder) {
        refreshFolder();
      }

      if (writeResults.failed.length > 0) {
        setError(`Failed to save ${writeResults.failed.length} file(s). ${writeResults.success.length} file(s) saved successfully.`);
      } else {
        setStatus({ phase: 'saved', message: `Saved ${writeResults.success.length} file(s)` });
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

      {/* Tab Navigation */}
      <Nav appearance="subtle" activeKey={activeTab} onSelect={setActiveTab} className="ai-generator-tabs">
        <Nav.Item eventKey="templates" icon={<span>🎮</span>}>
          Templates
        </Nav.Item>
        <Nav.Item eventKey="custom" icon={<span>✨</span>}>
          Custom Prompt
        </Nav.Item>
      </Nav>

      {/* Main Content */}
      <div className="ai-generator-content">
        {/* API Key Warning */}
        {!isConfigured && (
          <Message type="warning" showIcon className="ai-warning">
            <span>Configure your API key in the main Options dialog to use AI generation.</span>
          </Message>
        )}

        {/* Template Selector Tab */}
        {activeTab === 'templates' && (
          <TemplateSelector
            onSelectTemplate={handleSelectTemplate}
            selectedTemplate={selectedTemplate}
          />
        )}

        {/* Custom Prompt Tab */}
        {activeTab === 'custom' && (
          <>
            {/* Selected Template Banner */}
            {selectedTemplate && (
              <div className="ai-template-banner">
                <span>📋 Using template: <strong>{selectedTemplate.name}</strong></span>
                <Button
                  size="xs"
                  appearance="ghost"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Clear
                </Button>
              </div>
            )}

            {/* Prompt Section */}
            <section className="ai-prompt-section">
              <label>
                {modality === 'game'
                  ? 'Describe the game you want to create:'
                  : 'Describe what you want to create:'}
              </label>
              <Input
                as="textarea"
                rows={modality === 'game' ? 5 : 3}
                value={prompt}
                onChange={setPrompt}
                placeholder={modality === 'game'
                  ? 'e.g., Create a fantasy RPG where a young mage must collect 4 elemental crystals from different dungeons. Include a mentor NPC, shopkeeper, and final boss. The game should have an intro cutscene and quest dialogues...'
                  : 'e.g., Create a wizard character sprite with blue robes, 8 direction walk animation, and a portrait...'}
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
                  style={{ width: 180 }}
                  size="sm"
                />
                <Button
                  appearance="primary"
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  loading={loading}
                >
                  {modality === 'game' ? '🎮 Generate Game' : 'Generate'}
                </Button>
              </div>

              {modality === 'game' && !loading && (
                <div className="ai-game-hint">
                  <strong>Full Game Generation</strong> will create: player character, NPCs, enemies,
                  cutscenes, scripts, zones, and manifest.json - a complete playable package!
                </div>
              )}
            </section>
          </>
        )}

        {/* Analysis Preview */}
        {analysis && !loading && !results && (
          <section className="ai-analysis">
            {analysis.isGameRequest ? (
              <>
                <div className="ai-analysis-label ai-game-detected">
                  🎮 Full Game Detected! Will generate:
                </div>
                <div className="ai-analysis-tags">
                  <span className="ai-tag ai-tag-game">Player Character</span>
                  <span className="ai-tag ai-tag-game">NPCs</span>
                  <span className="ai-tag ai-tag-game">Enemies</span>
                  <span className="ai-tag ai-tag-game">Cutscenes</span>
                  <span className="ai-tag ai-tag-game">Scripts</span>
                  <span className="ai-tag ai-tag-game">Zones</span>
                  <span className="ai-tag ai-tag-game">Manifest</span>
                </div>
              </>
            ) : (
              <>
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
              </>
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

        {/* Game Concept Summary (for full game generation) */}
        {results && results.concept && (
          <section className="ai-game-concept">
            <h3>🎮 {results.concept.title}</h3>
            <p className="ai-game-synopsis">{results.concept.synopsis}</p>
            <div className="ai-game-details">
              <div className="ai-game-detail">
                <strong>Genre:</strong> {results.concept.genre}
              </div>
              <div className="ai-game-detail">
                <strong>Setting:</strong> {results.concept.setting}
              </div>
              <div className="ai-game-detail">
                <strong>Mood:</strong> {results.concept.mood}
              </div>
            </div>
            <div className="ai-game-lists">
              <div className="ai-game-list">
                <strong>Characters:</strong>
                <ul>
                  {results.concept.characters?.map((c, i) => (
                    <li key={i}>{c.displayName || c.name} ({c.type})</li>
                  ))}
                </ul>
              </div>
              <div className="ai-game-list">
                <strong>Locations:</strong>
                <ul>
                  {results.concept.locations?.map((l, i) => (
                    <li key={i}>{l.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Package Validation Status */}
        {results && results.validation && (
          <section className={`ai-validation ${results.validation.isComplete ? 'ai-validation-complete' : 'ai-validation-incomplete'}`}>
            <div className="ai-validation-header">
              {results.validation.isComplete ? (
                <span className="ai-validation-status">✓ Package Complete</span>
              ) : (
                <span className="ai-validation-status">⚠️ Package Incomplete</span>
              )}
              <span className="ai-validation-stats">
                {results.validation.stats.completed}/{results.validation.stats.total} required assets
              </span>
            </div>

            {!results.validation.isComplete && results.validation.missing.length > 0 && (
              <div className="ai-validation-missing">
                <strong>Missing Required Assets:</strong>
                <ul>
                  {results.validation.missing.map((item, i) => (
                    <li key={i} className="ai-missing-item">❌ {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {results.validation.isComplete && (
              <div className="ai-validation-generated">
                <strong>Generated:</strong>
                <ul>
                  {results.validation.generated.map((item, i) => (
                    <li key={i} className="ai-generated-item">✓ {item.path}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
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
