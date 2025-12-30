import React from 'react';
import { Check } from 'lucide-react';

/**
 * Stepper component for multi-step processes
 * @param {Object} props
 * @param {Array} props.steps - Array of step objects with title and description
 * @param {number} props.currentStep - Current active step (0-indexed)
 */
export const Stepper = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                index < currentStep
                  ? 'bg-accent-primary border-accent-primary text-bg-primary'
                  : index === currentStep
                  ? 'border-accent-primary text-accent-primary'
                  : 'border-primary text-muted'
              }`}
            >
              {index < currentStep ? (
                <Check size={16} />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <div className="mt-2 text-center">
              <p className={`text-sm font-medium ${
                index <= currentStep ? 'text-primary' : 'text-muted'
              }`}>
                {step.title}
              </p>
              <p className="text-xs text-muted mt-1">{step.description}</p>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-4 transition-colors ${
                index < currentStep ? 'bg-accent-primary' : 'bg-primary'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};