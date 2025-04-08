
import React from 'react';
import { Check } from 'lucide-react';

interface FormStepNavigationProps {
  steps: Array<{ title: string; description: string }>;
  currentStep: number;
}

const FormStepNavigation: React.FC<FormStepNavigationProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex justify-between mb-6 sm:mb-8">
      {steps.map((step, index) => (
        <div 
          key={index}
          className={`flex flex-col items-center ${
            index === currentStep ? "opacity-100" : "opacity-60"
          }`}
        >
          <div 
            className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium ${
              index < currentStep
                ? "bg-green-100 text-green-600"
                : index === currentStep
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {index < currentStep ? (
              <Check className="h-4 w-4" />
            ) : (
              index + 1
            )}
          </div>
          <div className="mt-1 sm:mt-2 text-center">
            <p className="text-xs sm:text-sm font-medium">{step.title}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 hidden md:block">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FormStepNavigation;
