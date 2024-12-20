'use client';
'use no memo';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useAutoAdapter } from './adapters/auto';

// Types
import { NextStepContextType } from './types';

// Example Hooks Usage:
// const { setCurrentStep, closeNextStep, startNextStep } = useNextStep();

// // To trigger a specific step
// setCurrentStep(2); // step 3

// // To close/start onboarding
// closeNextStep();
// startNextStep();

const NextStepContext = createContext<NextStepContextType | undefined>(undefined);

const useNextStep = () => {
  const context = useContext(NextStepContext);
  if (context === undefined) {
    throw new Error('useNextStep must be used within a NextStepProvider');
  }
  return context; 
};

const NextStepProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  const [currentStep, setCurrentStepState] = useState(0);
  const [isNextStepVisible, setNextStepVisible] = useState(false);

  const router = useAutoAdapter();

  const setCurrentStep = useCallback((step: number, delay?: number) => {
    if (delay) {
      setTimeout(() => {
        setCurrentStepState(step);
        setNextStepVisible(true);
      }, delay);
    } else {
      setCurrentStepState(step);
      setNextStepVisible(true);
    }
  }, []);

  const closeNextStep = useCallback(() => {
    setNextStepVisible(false);
    setCurrentTour(null);
  }, []);

  const startNextStep = useCallback((tourName: string) => {
    setCurrentTour(tourName);
    setCurrentStepState(0);
    setNextStepVisible(true);
  }, []);

  
  return (
    <NextStepContext.Provider
      value={{
        currentTour,
        currentStep,
        setCurrentStep,
        closeNextStep,
        startNextStep,
        isNextStepVisible,
        router,
      }}
    >
      {children}
    </NextStepContext.Provider>
  );
};

export { NextStepProvider, useNextStep };
