/**
 * ---------------------------------------------------------------
 *                AI Generator - Main Component
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Full-featured AI generator panel for creating game assets.
 * Supports multiple modalities: Image, Audio, and Text generation.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Panel,
  Button,
  Input,
  SelectPicker,
  Message,
  Progress,
  Modal,
  Form,
  Tabs,
  IconButton,
  Tooltip,
  Whisper,
  ButtonToolbar,
  Divider,
} from 'rsuite';

import {
  aiService,
  AI_PROVIDERS,
  analyzePrompt,
  createOrchestrator,
} from './services/index.js';

import './styles/ai-generator.css';

// Modality options
const MODALITIES = [
  { label: 'Auto-detect', value: 'auto' },
  { label: 'Sprite Package', value: 'sprite' },
  { label: 'Portrait Image', value: 'portrait' },
  { label: 'Spritesheet', value: 'spritesheet' },
  { label: 'Audio / Voice', value: 'audio' },
  { label: 'Cutscene / Dialogue', value: 'cutscene' },
  { label: 'Script', value: 'script' },
  { label: 'Configuration', value: 'config' },
];

// Provider options
const PROVIDERS = [
  { label: 'OpenAI', value: AI_PROVIDERS.OPENAI },
  { label: 'Anthropic (Claude)', value: AI_PROVIDERS.ANTHROPIC },
  { label: 'Google (Gemini)', value: AI_PROVIDERS.GOOGLE },
  { label: 'Custom Endpoint', value: AI_PROVIDERS.CUSTOM },
];

/**
 * Settings Modal Component
 */
function SettingsModal({ open, onClose }) {
  const [config, setConfig] = useState(aiService.getConfig());

  const handleSave = useCallback(() => {
    aiService.updateConfig(config);
    onClose();
  }, [config, onClose]);

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <Modal.Header>
        <Modal.Title>AI Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form fluid>
          <Form.Group>
            <Form.ControlLabel>AI Provider</Form.ControlLabel>
            <SelectPicker
              data={PROVIDERS}
              value={config.provider}
              onChange={(value) => setConfig({ ...config, provider: value })}
              block
              cleanable={false}
            />
          </Form.Group>

          <Form.Group>
            <Form.ControlLabel>API Key</Form.ControlLabel>
            <Input
              type="password"
              value={config.apiKey}
              onChange={(value) => setConfig({ ...config, apiKey: value })}
              placeholder="Enter your API key"
            />
            <Form.HelpText>
              Your API key is stored locally and never sent to our servers.
            </Form.HelpText>
          </Form.Group>

          {config.provider === AI_PROVIDERS.CUSTOM && (
            <Form.Group>
              <Form.ControlLabel>Custom Endpoint URL</Form.ControlLabel>
              <Input
                value={config.customEndpoint}
                onChange={(value) => setConfig({ ...config, customEndpoint: value })}
                placeholder="https://your-api.com/v1/chat/completions"
              />
            </Form.Group>
          )}

          <Form.Group>
            <Form.ControlLabel>Chat Model</Form.ControlLabel>
            <Input
              value={config.models?.chat || ''}
              onChange={(value) => setConfig({
                ...config,
                models: { ...config.models, chat: value }
              })}
              placeholder="gpt-4o, claude-3-5-sonnet, etc."
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} appearance="subtle">Cancel</Button>
        <Button onClick={handleSave} appearance="primary">Save</Button>
      </Modal.Footer>
    </Modal>
  );
}

/**
 * Asset Preview Component
 */
function AssetPreview({ asset }) {
  if (!asset) return null;

  const renderPreview = () => {
    switch (asset.type) {
      case 'image':
        return (
          <div className="ai-asset-preview-image">
            <img
              src={asset.base64 ? `data:image/png;base64,${asset.base64}` : URL.createObjectURL(asset.content)}
              alt={asset.name}
            />
          </div>
        );
      case 'audio':
        return (
          <div className="ai-asset-preview-audio">
            <audio controls src={URL.createObjectURL(asset.content)} />
          </div>
        );
      case 'config':
      case 'text':
        return (
          <div className="ai-asset-preview-text">
            <pre>{typeof asset.content === 'string' ? asset.content : JSON.stringify(asset.content, null, 2)}</pre>
          </div>
        );
      default:
        return <div className="ai-asset-preview-unknown">Preview not available</div>;
    }
  };

  return (
    <div className="ai-asset-preview">
      <div className="ai-asset-preview-header">
        <span className="ai-asset-type">{asset.subtype || asset.type}</span>
        <span className="ai-asset-name">{asset.name}</span>
      </div>
      {renderPreview()}
      <div className="ai-asset-path">{asset.path}</div>
    </div>
  );
}

/**
 * Generation Progress Component
 */
function GenerationProgress({ status, progress }) {
  if (!status) return null;

  return (
    <div className="ai-generation-progress">
      <div className="ai-progress-phase">{status.phase}</div>
      <div className="ai-progress-message">{status.message}</div>
      {progress && (
        <Progress.Line
          percent={Math.round((progress.current / progress.total) * 100)}
          status="active"
        />
      )}
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
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  // Check if configured
  const isConfigured = aiService.isConfigured();

  // Handle prompt analysis (for preview)
  const handleAnalyze = useCallback(() => {
    if (!prompt.trim()) return;
    const result = analyzePrompt(prompt);
    setAnalysis(result);
  }, [prompt]);

  // Debounced analysis on prompt change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (prompt.trim().length > 10) {
        handleAnalyze();
      } else {
        setAnalysis(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [prompt, handleAnalyze]);

  // Handle generation
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (!isConfigured) {
      setError('Please configure your API key in settings');
      setShowSettings(true);
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setSelectedAsset(null);

    try {
      const orchestrator = createOrchestrator({
        writeFile,
        onProgress: (p) => setProgress(p),
        onStatusChange: (s) => setStatus(s),
      });

      const generationResults = await orchestrator.generateFromPrompt(prompt);
      setResults(generationResults);

      // Auto-select first asset for preview
      if (generationResults.assets.length > 0) {
        setSelectedAsset(generationResults.assets[0]);
      }

      // Report errors if any
      if (generationResults.errors.length > 0) {
        setError(`Generation completed with ${generationResults.errors.length} error(s)`);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setStatus(null);
      setProgress(null);
    }
  }, [prompt, isConfigured, writeFile]);

  // Handle saving assets to zip
  const handleSaveToZip = useCallback(async () => {
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
        setStatus({ phase: 'saved', message: `Saved ${writeResults.success.length} file(s) to package` });

        // Refresh the folder view
        if (refreshFolder) {
          refreshFolder();
        }

        // Notify parent
        if (onFileGenerated) {
          writeResults.success.forEach(asset => onFileGenerated(asset));
        }
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }, [results, writeFile, refreshFolder, onFileGenerated]);

  // Render analysis preview
  const renderAnalysisPreview = () => {
    if (!analysis) return null;

    return (
      <div className="ai-analysis-preview">
        <div className="ai-analysis-header">Detected Assets</div>
        <div className="ai-analysis-assets">
          {analysis.detectedAssets.map((asset, i) => (
            <span key={i} className="ai-analysis-tag">{asset}</span>
          ))}
        </div>
        {analysis.spriteConfig && (
          <div className="ai-analysis-config">
            <div>Preset: {analysis.spriteConfig.preset}</div>
            <div>Size: {analysis.spriteConfig.tileSize.join('x')}</div>
            <div>Directions: {analysis.spriteConfig.directions}</div>
            <div>Frames: {analysis.spriteConfig.framesPerDirection}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Panel className="ai-generator-panel" bordered>
      <div className="ai-generator-header">
        <h4>AI Asset Generator</h4>
        <ButtonToolbar>
          <Whisper placement="top" speaker={<Tooltip>Settings</Tooltip>}>
            <IconButton
              icon={<span>⚙️</span>}
              onClick={() => setShowSettings(true)}
              size="sm"
            />
          </Whisper>
        </ButtonToolbar>
      </div>

      {!isConfigured && (
        <Message type="warning" style={{ marginBottom: 16 }}>
          Please configure your API key to use the AI generator.
          <Button size="xs" onClick={() => setShowSettings(true)} style={{ marginLeft: 8 }}>
            Open Settings
          </Button>
        </Message>
      )}

      <div className="ai-generator-input">
        <Form.Group>
          <Form.ControlLabel>What would you like to create?</Form.ControlLabel>
          <Input
            as="textarea"
            rows={4}
            value={prompt}
            onChange={setPrompt}
            placeholder="Describe the asset you want to generate. For example: 'Create a wizard sprite with a portrait, 8-direction walk animation, blue robes and a staff, pixel art style'"
            disabled={loading}
          />
        </Form.Group>

        <Form.Group>
          <Form.ControlLabel>Asset Type</Form.ControlLabel>
          <SelectPicker
            data={MODALITIES}
            value={modality}
            onChange={setModality}
            block
            cleanable={false}
            disabled={loading}
          />
          <Form.HelpText>
            Auto-detect analyzes your prompt to determine what to generate.
          </Form.HelpText>
        </Form.Group>
      </div>

      {renderAnalysisPreview()}

      {error && (
        <Message type="error" style={{ marginBottom: 16 }}>
          {error}
        </Message>
      )}

      {loading && <GenerationProgress status={status} progress={progress} />}

      <div className="ai-generator-actions">
        <Button
          appearance="primary"
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          loading={loading}
        >
          {loading ? 'Generating...' : 'Generate'}
        </Button>

        {results?.assets.length > 0 && (
          <Button
            appearance="ghost"
            onClick={handleSaveToZip}
            disabled={loading}
          >
            Save to Package
          </Button>
        )}
      </div>

      {results && (
        <div className="ai-generator-results">
          <Divider>Generated Assets ({results.assets.length})</Divider>

          <Tabs defaultActiveKey="0" appearance="subtle">
            {results.assets.map((asset, index) => (
              <Tabs.Tab
                key={index}
                eventKey={String(index)}
                title={asset.name}
                onClick={() => setSelectedAsset(asset)}
              >
                <AssetPreview asset={asset} />
              </Tabs.Tab>
            ))}
          </Tabs>

          {results.errors.length > 0 && (
            <div className="ai-generator-errors">
              <Divider>Errors</Divider>
              {results.errors.map((err, i) => (
                <Message key={i} type="error" style={{ marginBottom: 8 }}>
                  [{err.phase}] {err.message}
                </Message>
              ))}
            </div>
          )}
        </div>
      )}

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </Panel>
  );
}

export default AIGenerator;
