import React, { useState } from 'react';
import './FirstTimeWizard.css';

/**
 * FirstTimeWizard - Onboarding guide for new users
 * Takes users through initial setup and first game creation
 */
export default function FirstTimeWizard({ onComplete, engine }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [projectData, setProjectData] = useState({
    name: '',
    template: 'empty',
    width: 320,
    height: 180,
  });

  const steps = [
    {
      title: 'Welcome to PixoSpritz',
      description: "Let's create your first game in a few simple steps!",
      content: () => (
        <div className="wizard-welcome">
          <div className="wizard-icon">🎮</div>
          <p>PixoSpritz is a powerful tool for creating retro-style games.</p>
          <p>This wizard will help you get started.</p>
        </div>
      ),
      canSkip: true,
    },
    {
      title: 'Project Setup',
      description: 'Give your project a name and choose a template',
      content: () => (
        <div className="wizard-form">
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              placeholder="My First Game"
              value={projectData.name}
              onChange={e => setProjectData({ ...projectData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Template</label>
            <select
              value={projectData.template}
              onChange={e => setProjectData({ ...projectData, template: e.target.value })}
            >
              <option value="empty">Empty Project</option>
              <option value="topdown">Top-Down Adventure</option>
              <option value="platformer">Platformer</option>
              <option value="puzzle">Puzzle Game</option>
            </select>
          </div>

          <div className="form-group">
            <label>Resolution</label>
            <div className="resolution-selector">
              <button
                className={projectData.width === 320 ? 'active' : ''}
                onClick={() =>
                  setProjectData({
                    ...projectData,
                    width: 320,
                    height: 180,
                  })
                }
              >
                320x180
              </button>
              <button
                className={projectData.width === 640 ? 'active' : ''}
                onClick={() =>
                  setProjectData({
                    ...projectData,
                    width: 640,
                    height: 360,
                  })
                }
              >
                640x360
              </button>
              <button
                className={projectData.width === 800 ? 'active' : ''}
                onClick={() =>
                  setProjectData({
                    ...projectData,
                    width: 800,
                    height: 600,
                  })
                }
              >
                800x600
              </button>
            </div>
          </div>
        </div>
      ),
      canSkip: false,
    },
    {
      title: 'Create Your First Sprite',
      description: "Let's make something visible!",
      content: () => (
        <div className="wizard-info">
          <div className="wizard-step-icon">🖼️</div>
          <p>Sprites are the visual elements of your game - characters, enemies, objects.</p>
          <p>In the next step, you'll create your first sprite.</p>
        </div>
      ),
      canSkip: true,
    },
    {
      title: 'Create Your First Map',
      description: 'Design a game world',
      content: () => (
        <div className="wizard-info">
          <div className="wizard-step-icon">🗺️</div>
          <p>Maps are where your game takes place.</p>
          <p>You can place sprites and tiles on your map.</p>
        </div>
      ),
      canSkip: true,
    },
    {
      title: 'Add Interactivity',
      description: 'Write your first script',
      content: () => (
        <div className="wizard-info">
          <div className="wizard-step-icon">✨</div>
          <p>Scripts control game logic and make things interactive.</p>
          <p>Learn the basics of PixoScript, our Lua-based scripting language.</p>
          <code className="wizard-code">
            {`function main()
  print("Hello, game!")
end`}
          </code>
        </div>
      ),
      canSkip: true,
    },
    {
      title: "You're Ready!",
      description: 'Start creating your game',
      content: () => (
        <div className="wizard-completion">
          <div className="completion-check">✓</div>
          <p>You now have the basics down!</p>
          <p>Explore the editor, check out tutorials, and start building.</p>
          <div className="next-steps">
            <h4>Next Steps:</h4>
            <ul>
              <li>👀 Visit Tutorials for step-by-step guides</li>
              <li>📖 Read the API Documentation</li>
              <li>💬 Join our Discord community</li>
              <li>🚀 Start building your game!</li>
            </ul>
          </div>
        </div>
      ),
      canSkip: false,
    },
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    // Create project or close wizard
    if (onComplete) {
      onComplete(projectData);
    }
  };

  return (
    <div className="wizard-overlay">
      <div className="wizard-container">
        {/* Progress indicator */}
        <div className="wizard-progress">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`progress-dot ${
                idx === currentStep ? 'active' : idx < currentStep ? 'completed' : ''
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="wizard-content">
          <h2>{currentStepData.title}</h2>
          <p className="wizard-description">{currentStepData.description}</p>
          <div className="wizard-body">{currentStepData.content()}</div>
        </div>

        {/* Navigation */}
        <div className="wizard-controls">
          <button
            className="btn btn-secondary"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </button>

          <div className="wizard-buttons-right">
            {currentStepData.canSkip && (
              <button className="btn btn-text" onClick={handleSkip}>
                Skip
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={currentStep === 1 && !projectData.name}
            >
              {currentStep === steps.length - 1 ? 'Start Creating' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
