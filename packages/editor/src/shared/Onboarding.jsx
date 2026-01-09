/**
 * ---------------------------------------------------------------
 *                First-Time User Experience
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Onboarding component for new users. Shows a quick-start wizard
 * that guides users through creating their first game.
 */

import React, { useState, useCallback } from 'react';
import { Modal, Button, Steps, Panel, Tag, Message } from '../ui';

import './styles/onboarding.css';

/**
 * Onboarding steps
 */
const ONBOARDING_STEPS = [
  {
    title: 'Welcome to PixoSpritz! 🎮',
    content: `
      <p><strong>PixoSpritz</strong> is the easiest way to create games, cutscenes, and interactive stories.</p>
      <p>No coding experience required! Just describe what you want, and our AI will generate a complete game package.</p>
      <div class="onboarding-features">
        <div class="feature">✨ AI-Powered Generation</div>
        <div class="feature">🎨 Built-in Editors</div>
        <div class="feature">📦 One-Click Export</div>
        <div class="feature">🌐 Play Anywhere</div>
      </div>
    `,
  },
  {
    title: 'Start with a Template',
    content: `
      <p>The fastest way to get started is with a <strong>template</strong>:</p>
      <ol>
        <li>Open the <strong>AI Generator</strong> (✨ icon in sidebar)</li>
        <li>Browse the <strong>Templates</strong> tab</li>
        <li>Click a template to select it</li>
        <li>Hit <strong>Generate</strong> and watch the magic happen!</li>
      </ol>
      <p class="tip">💡 <strong>Tip:</strong> Start with a "Starter" template - they only take 2-3 minutes to generate.</p>
    `,
  },
  {
    title: 'Create Your Own',
    content: `
      <p>Want something unique? Use the <strong>Custom Prompt</strong> tab:</p>
      <div class="prompt-example">
        <em>"Create a space adventure game where you explore an abandoned space station, 
        meet friendly aliens, and solve puzzles to escape."</em>
      </div>
      <p>The AI understands natural language! Describe characters, locations, and story - 
      it'll generate sprites, maps, cutscenes, and scripts automatically.</p>
    `,
  },
  {
    title: 'Edit and Customize',
    content: `
      <p>After generation, fine-tune your game with our editors:</p>
      <ul>
        <li><strong>🗺️ Map Editor</strong> - Modify zones, add objects and triggers</li>
        <li><strong>🎨 Sprite Editor</strong> - Edit character animations</li>
        <li><strong>🎬 Cutscene Editor</strong> - Adjust dialogue and cinematics</li>
        <li><strong>📝 Script Editor</strong> - Add custom game logic</li>
      </ul>
      <p>Everything is visual and interactive - no code required!</p>
    `,
  },
  {
    title: 'Play and Share',
    content: `
      <p>When you're happy with your game:</p>
      <ol>
        <li><strong>Preview</strong> - Test your game in the built-in player</li>
        <li><strong>Export</strong> - Download as a .pxz package</li>
        <li><strong>Share</strong> - Upload to the PixoSpritz Gallery (coming soon!)</li>
        <li><strong>Embed</strong> - Add to your website, blog, or social media</li>
      </ol>
      <p class="highlight">Games are small (~5-10MB), load instantly, and work offline!</p>
    `,
  },
];

/**
 * Check if user has completed onboarding
 */
export function hasCompletedOnboarding() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('pixospritz_onboarding_complete') === 'true';
  }
  return false;
}

/**
 * Mark onboarding as complete
 */
export function completeOnboarding() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('pixospritz_onboarding_complete', 'true');
  }
}

/**
 * Reset onboarding (for testing)
 */
export function resetOnboarding() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('pixospritz_onboarding_complete');
  }
}

/**
 * Onboarding Modal Component
 */
function OnboardingModal({ show, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = useCallback(() => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
      onComplete();
    }
  }, [currentStep, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    completeOnboarding();
    onComplete();
  }, [onComplete]);

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <Modal
      open={show}
      onClose={handleSkip}
      size="md"
      className="onboarding-modal"
    >
      <Modal.Header>
        <Modal.Title>
          <span className="onboarding-title">{step.title}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="onboarding-content">
          {/* Step indicator */}
          <div className="onboarding-steps">
            {ONBOARDING_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`onboarding-step-dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
                onClick={() => setCurrentStep(idx)}
              />
            ))}
          </div>

          {/* Step content */}
          <div
            className="onboarding-step-content"
            dangerouslySetInnerHTML={{ __html: step.content }}
          />
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="onboarding-footer">
          <Button appearance="subtle" onClick={handleSkip}>
            Skip Tutorial
          </Button>
          <div className="onboarding-nav">
            {currentStep > 0 && (
              <Button appearance="ghost" onClick={handlePrev}>
                Previous
              </Button>
            )}
            <Button appearance="primary" onClick={handleNext}>
              {currentStep === ONBOARDING_STEPS.length - 1 ? "Let's Go! 🚀" : 'Next'}
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

/**
 * Welcome Banner Component
 * Shows a compact banner for returning users who might want a refresher
 */
function WelcomeBanner({ onShowTutorial }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Message type="info" showIcon closable onClose={() => setDismissed(true)} className="welcome-banner">
      <span>
        Welcome back! Need a refresher?{' '}
        <Button appearance="link" size="xs" onClick={onShowTutorial}>
          View Tutorial
        </Button>
      </span>
    </Message>
  );
}

/**
 * Quick Tips Component
 * Contextual tips shown based on current editor state
 */
export function QuickTip({ context }) {
  const tips = {
    'empty-project': '💡 Start by opening the AI Generator (✨) and choosing a template!',
    'ai-generator': "💡 Try the 'Hello World' template - it generates in under 2 minutes!",
    'map-editor': '💡 Click a cell to select it, then use the tileset palette to paint.',
    'sprite-editor': "💡 Use the animation preview to test your sprite's movement.",
    'cutscene-editor': '💡 Add @char lines for character portraits, @action for animations.',
    'script-editor': '💡 PixoScript is Lua-like - no semicolons needed!',
  };

  const tip = tips[context];
  if (!tip) return null;

  return (
    <div className="quick-tip">
      {tip}
    </div>
  );
}

export { OnboardingModal, WelcomeBanner };
export default OnboardingModal;
