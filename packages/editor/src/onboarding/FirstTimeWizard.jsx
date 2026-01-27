import React, { useState } from 'react';
import './FirstTimeWizard.css';

const steps = [
  {
    title: 'Welcome to Pixospritz!',
    content: (
      <>
        <p>
          Let’s get you started making your first game. This wizard will guide you through the
          basics.
        </p>
      </>
    ),
  },
  {
    title: 'Create a Project',
    content: (
      <>
        <p>
          Click <b>New Project</b> to create a blank game, or choose a template to start from an
          example.
        </p>
      </>
    ),
  },
  {
    title: 'Explore the Editor',
    content: (
      <>
        <p>Use the sidebar to access maps, sprites, scripts, and more. Hover any tool for tips.</p>
      </>
    ),
  },
  {
    title: 'Need Help?',
    content: (
      <>
        <p>Check the Help menu or documentation panel for guides and tutorials at any time.</p>
      </>
    ),
  },
];

export default function FirstTimeWizard({ onClose }) {
  const [step, setStep] = useState(0);

  return (
    <div className="onboarding-modal">
      <div className="onboarding-title">{steps[step].title}</div>
      <div className="onboarding-content">{steps[step].content}</div>
      <div className="onboarding-steps">
        {steps.map((_, i) => (
          <span
            key={i}
            className={`onboarding-step-dot${i === step ? ' active' : ''}${i < step ? ' completed' : ''}`}
            onClick={() => setStep(i)}
          />
        ))}
      </div>
      <div className="onboarding-actions">
        {step > 0 && <button onClick={() => setStep(step - 1)}>Back</button>}
        {step < steps.length - 1 ? (
          <button onClick={() => setStep(step + 1)}>Next</button>
        ) : (
          <button onClick={onClose}>Finish</button>
        )}
      </div>
    </div>
  );
}
