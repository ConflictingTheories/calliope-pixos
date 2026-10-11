import './styles/OptionsDialog.css';
import Dialog from './Dialog.jsx';

import { useEffect, useRef, useState } from 'react';
import { constants } from '../../business/index.js';
import { aiService, AI_PROVIDERS } from '../../../ai-generator/services/index.js';

// AI Provider options
const AI_PROVIDER_OPTIONS = [
  { value: AI_PROVIDERS.OPENAI, label: 'OpenAI' },
  { value: AI_PROVIDERS.ANTHROPIC, label: 'Anthropic' },
  { value: AI_PROVIDERS.GOOGLE, label: 'Google' },
  { value: AI_PROVIDERS.CUSTOM, label: 'Custom' },
];

function OptionsDialog({ data, onSetOptions, onResetOptions, onClose, messages }) {
  const [zoomFactor, setZoomFactor] = useState('');
  const [hideNavigationBar, setHideNavigationBar] = useState(false);
  const [hideDownloadManager, setHideDownloadManager] = useState(false);
  const [hideInfobar, setHideInfobar] = useState(false);
  const [hideTitleBar, setHideTitleBar] = useState(false);
  const [showSupportPanel, setShowSupportPanel] = useState(true);
  const [skin, setSkin] = useState('default');
  const [defaultExportPassword, setDefaultExportPassword] = useState('');
  const [promptForExportPassword, setPromptForExportPassword] = useState(false);
  const [keepOrder, setKeepOrder] = useState(false);
  const [checkSignature, setCheckSignature] = useState(false);
  const [bufferedWrite, setBufferedWrite] = useState(false);
  const [maxWorkers, setMaxWorkers] = useState('0');
  const [chunkSize, setChunkSize] = useState('0');
  const defaultPasswordInputRef = useRef(null);

  // AI Settings state
  const [aiProvider, setAiProvider] = useState(AI_PROVIDERS.OPENAI);
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [aiCustomEndpoint, setAiCustomEndpoint] = useState('');
  const aiApiKeyInputRef = useRef(null);

  function handleChangeZoomFactor(event) {
    setZoomFactor(event.target.value);
  }

  function handleChangeHideNavigationBar(event) {
    setHideNavigationBar(event.target.checked);
  }

  function handleChangeHideDownloadManager(event) {
    setHideDownloadManager(event.target.checked);
  }

  function handleChangeHideInfobar(event) {
    setHideInfobar(event.target.checked);
  }

  function handleChangeHideTitleBar(event) {
    setHideTitleBar(event.target.checked);
  }

  function handleChangeShowSupportPanel(event) {
    setShowSupportPanel(event.target.checked);
  }

  function handleChangeSkin(event) {
    setSkin(event.target.value);
  }

  function handleChangePromptForExportPassword(event) {
    setPromptForExportPassword(event.target.checked);
  }

  function handleFocusDefaultExportPassword() {
    defaultPasswordInputRef.current.select();
  }

  function handleChangeDefaultExportPassword(event) {
    setDefaultExportPassword(event.target.value);
  }

  function handleChangeKeepOrder(event) {
    setKeepOrder(event.target.checked);
  }

  function handleChangeBufferedWrite(event) {
    setBufferedWrite(event.target.checked);
  }

  function handleChangeCheckSignature(event) {
    setCheckSignature(event.target.checked);
  }

  function handleChangeMaxWorkers(event) {
    setMaxWorkers(event.target.value);
  }

  function handleChangeChunkSize(event) {
    setChunkSize(event.target.value);
  }

  // AI Settings handlers
  function handleChangeAiProvider(event) {
    setAiProvider(event.target.value);
  }

  function handleChangeAiApiKey(event) {
    setAiApiKey(event.target.value);
  }

  function handleFocusAiApiKey() {
    aiApiKeyInputRef.current.select();
  }

  function handleChangeAiModel(event) {
    setAiModel(event.target.value);
  }

  function handleChangeAiCustomEndpoint(event) {
    setAiCustomEndpoint(event.target.value);
  }

  function handleSubmit() {
    // Save AI settings separately via aiService
    aiService.updateConfig({
      provider: aiProvider,
      apiKey: aiApiKey,
      customEndpoint: aiCustomEndpoint,
      models: { chat: aiModel },
    });
    onSetOptions({
      zoomFactor: Number(zoomFactor),
      hideNavigationBar,
      hideDownloadManager,
      hideInfobar,
      hideTitleBar,
      skin,
      promptForExportPassword,
      defaultExportPassword,
      keepOrder,
      checkSignature,
      bufferedWrite,
      maxWorkers: Number(maxWorkers),
      chunkSize: Number(chunkSize) * 1024,
      showSupportPanel,
    });
  }

  function updateData() {
    if (data) {
      const {
        zoomFactor,
        hideNavigationBar,
        hideDownloadManager,
        hideInfobar,
        hideTitleBar,
        skin,
        promptForExportPassword,
        defaultExportPassword,
        keepOrder,
        checkSignature,
        bufferedWrite,
        maxWorkers,
        chunkSize,
        showSupportPanel,
      } = data;
      setZoomFactor(zoomFactor);
      setHideNavigationBar(hideNavigationBar);
      setHideDownloadManager(hideDownloadManager);
      setHideInfobar(hideInfobar);
      setHideTitleBar(hideTitleBar);
      setSkin(skin);
      setPromptForExportPassword(promptForExportPassword);
      setDefaultExportPassword(defaultExportPassword);
      setKeepOrder(keepOrder);
      setCheckSignature(checkSignature);
      setBufferedWrite(bufferedWrite);
      setMaxWorkers(maxWorkers);
      setChunkSize(chunkSize / 1024);
      setShowSupportPanel(showSupportPanel);

      // Load AI settings from aiService
      const aiConfig = aiService.getConfig();
      setAiProvider(aiConfig.provider || AI_PROVIDERS.OPENAI);
      setAiApiKey(aiConfig.apiKey || '');
      setAiModel(aiConfig.models?.chat || '');
      setAiCustomEndpoint(aiConfig.customEndpoint || '');
    }
  }

  useEffect(updateData, [data]);
  return (
    <Dialog
      className="options-dialog"
      data={data}
      title={messages.OPTIONS_TITLE}
      onOpen={updateData}
      onSubmit={handleSubmit}
      onReset={onResetOptions}
      onClose={onClose}
      resetLabel={messages.DIALOG_RESET_BUTTON_LABEL}
      cancelLabel={messages.DIALOG_CANCEL_BUTTON_LABEL}
      submitLabel={messages.OPTIONS_DIALOG_BUTTON_LABEL}
    >
      <label>
        <span>{messages.OPTIONS_ZOOM_FACTOR_LABEL}</span>
        <input
          value={zoomFactor}
          type="number"
          required
          min={20}
          max={500}
          step={5}
          onChange={handleChangeZoomFactor}
        />
      </label>
      <label>
        <span>{messages.OPTIONS_HIDE_NAVIGATION_BAR_LABEL}</span>
        <input
          checked={hideNavigationBar}
          type="checkbox"
          onChange={handleChangeHideNavigationBar}
        />
      </label>
      <label>
        <span>{messages.OPTIONS_HIDE_DOWNLOAD_MANAGER_LABEL}</span>
        <input
          checked={hideDownloadManager}
          type="checkbox"
          onChange={handleChangeHideDownloadManager}
        />
      </label>
      <label>
        <span>{messages.OPTIONS_HIDE_INFOBAR_LABEL}</span>
        <input checked={hideInfobar} type="checkbox" onChange={handleChangeHideInfobar} />
      </label>
      <label>
        <span>{messages.OPTIONS_HIDE_TITLE_BAR_LABEL}</span>
        <input checked={hideTitleBar} type="checkbox" onChange={handleChangeHideTitleBar} />
      </label>
      <label>
        <span>{messages.OPTIONS_SHOW_SUPPORT_PANEL_LABEL}</span>
        <input checked={showSupportPanel} type="checkbox" onChange={handleChangeShowSupportPanel} />
      </label>
      <label>
        <span>{messages.OPTIONS_SELECT_SKIN_LABEL}</span>
        <select value={skin} onChange={handleChangeSkin}>
          <option value={constants.OPTIONS_DEFAULT_SKIN}>
            {messages.OPTIONS_DEFAULT_SKIN_LABEL}
          </option>
          <option value={constants.OPTIONS_DOS_SKIN}>{messages.OPTIONS_DOS_SKIN_LABEL}</option>
        </select>
      </label>
      <label>
        <span>{messages.OPTIONS_EXPORT_ZIP_PASSWORD_LABEL}</span>
        <input
          checked={promptForExportPassword}
          type="checkbox"
          onChange={handleChangePromptForExportPassword}
        />
      </label>
      <label>
        <span>{messages.OPTIONS_DEFAULT_PASSWORD_LABEL}</span>
        <input
          type="password"
          autoComplete="off"
          value={defaultExportPassword}
          onFocus={handleFocusDefaultExportPassword}
          onChange={handleChangeDefaultExportPassword}
          ref={defaultPasswordInputRef}
        />
      </label>
      <label>
        <span>{messages.OPTIONS_CHECK_SIGNATURE_LABEL}</span>
        <input checked={checkSignature} type="checkbox" onChange={handleChangeCheckSignature} />
      </label>
      <label>
        <span>{messages.OPTIONS_BUFFERED_WRITE_LABEL}</span>
        <input checked={bufferedWrite} type="checkbox" onChange={handleChangeBufferedWrite} />
      </label>
      <label>
        <span>{messages.OPTIONS_MAX_WORKERS_LABEL}</span>
        <input
          value={maxWorkers}
          type="number"
          required
          disabled={!bufferedWrite}
          min={1}
          onChange={handleChangeMaxWorkers}
        />
      </label>
      <label>
        <span>{messages.OPTIONS_KEEP_ORDER_LABEL}</span>
        <input checked={keepOrder} type="checkbox" onChange={handleChangeKeepOrder} />
      </label>
      <label>
        <span>{messages.OPTIONS_CHUNK_SIZE_LABEL}</span>
        <input value={chunkSize} type="number" required min={1} onChange={handleChangeChunkSize} />
      </label>

      {/* AI Settings Section */}
      <div className="options-section-header">AI Generator Settings</div>
      <label>
        <span>AI Provider:</span>
        <select value={aiProvider} onChange={handleChangeAiProvider}>
          {AI_PROVIDER_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>API Key:</span>
        <input
          type="password"
          autoComplete="off"
          value={aiApiKey}
          onFocus={handleFocusAiApiKey}
          onChange={handleChangeAiApiKey}
          ref={aiApiKeyInputRef}
          placeholder="Enter your API key"
        />
      </label>
      <label>
        <span>Model:</span>
        <input
          type="text"
          value={aiModel}
          onChange={handleChangeAiModel}
          placeholder="gpt-4o, claude-3-5-sonnet, etc."
        />
      </label>
      {aiProvider === AI_PROVIDERS.CUSTOM && (
        <label>
          <span>Custom Endpoint:</span>
          <input
            type="text"
            value={aiCustomEndpoint}
            onChange={handleChangeAiCustomEndpoint}
            placeholder="https://api.example.com/v1"
          />
        </label>
      )}
      <div className="options-help-text">API keys are stored locally in your browser only.</div>
    </Dialog>
  );
}

export default OptionsDialog;
