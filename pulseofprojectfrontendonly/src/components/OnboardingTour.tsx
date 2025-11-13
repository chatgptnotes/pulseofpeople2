import React, { useState, useEffect, useRef } from 'react';
import {
  Close as CloseIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Check as CheckIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import {
  OnboardingTour as Tour,
  OnboardingStep,
  completeTour,
  skipTour,
  updateTourStep,
} from '../lib/onboarding';

interface OnboardingTourProps {
  userId: string;
  tour: Tour;
  onComplete?: () => void;
  onSkip?: () => void;
}

export function OnboardingTour({ userId, tour, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = tour.steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === tour.steps.length - 1;

  useEffect(() => {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      setVisible(true);
      updateTargetPosition();
    }, 100);

    // Update position on window resize
    window.addEventListener('resize', updateTargetPosition);
    return () => window.removeEventListener('resize', updateTargetPosition);
  }, [currentStepIndex]);

  function updateTargetPosition() {
    if (!currentStep.target || currentStep.target === 'body') {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(currentStep.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);

      // Scroll element into view if needed
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    } else {
      setTargetRect(null);
    }
  }

  function handleNext() {
    if (isLastStep) {
      handleComplete();
    } else {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      updateTourStep(userId, nextIndex);
    }
  }

  function handlePrevious() {
    if (!isFirstStep) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      updateTourStep(userId, prevIndex);
    }
  }

  function handleSkip() {
    skipTour(userId, tour.id);
    setVisible(false);
    onSkip?.();
  }

  function handleComplete() {
    completeTour(userId, tour.id);
    setVisible(false);
    onComplete?.();
  }

  function getTooltipPosition(): React.CSSProperties {
    if (!targetRect) {
      // Center modal for body target
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10001,
      };
    }

    const placement = currentStep.placement || 'bottom';
    const tooltipWidth = 400;
    const tooltipHeight = 200;
    const gap = 16;

    let style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 10001,
    };

    switch (placement) {
      case 'top':
        style.left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        style.top = targetRect.top - tooltipHeight - gap;
        break;
      case 'bottom':
        style.left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        style.top = targetRect.bottom + gap;
        break;
      case 'left':
        style.left = targetRect.left - tooltipWidth - gap;
        style.top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        break;
      case 'right':
        style.left = targetRect.right + gap;
        style.top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        break;
      case 'center':
        style.left = '50%';
        style.top = '50%';
        style.transform = 'translate(-50%, -50%)';
        break;
    }

    // Ensure tooltip stays within viewport
    if (style.left && typeof style.left === 'number') {
      style.left = Math.max(gap, Math.min(style.left, window.innerWidth - tooltipWidth - gap));
    }
    if (style.top && typeof style.top === 'number') {
      style.top = Math.max(gap, Math.min(style.top, window.innerHeight - tooltipHeight - gap));
    }

    return style;
  }

  function getHighlightStyle(): React.CSSProperties | null {
    if (!targetRect || !currentStep.highlight) {
      return null;
    }

    return {
      position: 'fixed',
      top: targetRect.top - 4,
      left: targetRect.left - 4,
      width: targetRect.width + 8,
      height: targetRect.height + 8,
      border: '3px solid #3b82f6',
      borderRadius: '8px',
      boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2)',
      zIndex: 10000,
      pointerEvents: 'none',
      animation: 'pulse 2s ease-in-out infinite',
    };
  }

  if (!visible) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
        style={{ transition: 'opacity 0.3s ease' }}
      />

      {/* Highlight */}
      {currentStep.highlight && targetRect && (
        <div style={getHighlightStyle()!} />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={getTooltipPosition()}
        className="bg-white rounded-lg shadow-2xl max-w-md animate-fadeIn"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <HelpIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{currentStep.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Step {currentStepIndex + 1} of {tour.steps.length}
              </p>
            </div>
          </div>
          {tour.showSkipButton && (
            <button
              onClick={handleSkip}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-700 leading-relaxed">{currentStep.content}</p>

          {/* Custom Action */}
          {currentStep.action && (
            <button
              onClick={currentStep.action.onClick}
              className="mt-4 w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition-colors"
            >
              {currentStep.action.label}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          {/* Progress Dots */}
          <div className="flex items-center space-x-1.5">
            {tour.steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStepIndex
                    ? 'bg-blue-600'
                    : index < currentStepIndex
                    ? 'bg-blue-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-2">
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <PrevIcon className="w-5 h-5 mr-1" />
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isLastStep ? (
                <>
                  <CheckIcon className="w-5 h-5 mr-1" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <NextIcon className="w-5 h-5 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

export default OnboardingTour;
