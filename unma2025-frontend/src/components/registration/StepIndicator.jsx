import React from "react";

const StepIndicator = ({
  steps,
  currentStep,
  onStepClick,
  completedSteps = [],
}) => {
  return (
    <div className="mb-6 overflow-x-auto">
      {/* Mobile view - show current/total with navigation */}
      <div className="flex md:hidden justify-between items-center bg-gray-50 p-3 rounded-lg mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </span>
          {onStepClick && (
            <div className="flex space-x-1">
              {currentStep > 0 && (
                <button
                  onClick={() => onStepClick(currentStep - 1)}
                  className="p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                  title="Previous step"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}
              {currentStep < steps.length - 1 &&
                completedSteps.includes(currentStep + 1) && (
                  <button
                    onClick={() => onStepClick(currentStep + 1)}
                    className="p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    title="Next step"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                )}
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-blue-600">
          {steps[currentStep]}
        </span>
      </div>

      {/* Desktop view - horizontal steps */}
      <div className="hidden md:flex items-center justify-start overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isClickable =
            onStepClick && (isCompleted || index <= currentStep);

          return (
            <div
              key={index}
              className={`flex items-center ${
                index === steps.length - 1
                  ? "flex-shrink-0"
                  : "flex-shrink-0 mr-2"
              }`}
            >
              <div
                onClick={() => isClickable && onStepClick(index)}
                className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-medium transition-all duration-200
                  ${
                    index < currentStep || isCompleted
                      ? "bg-green-500 text-white"
                      : index === currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }
                  ${
                    isClickable
                      ? "cursor-pointer hover:scale-110 hover:shadow-md"
                      : "cursor-default"
                  }
                `}
                title={isClickable ? `Go to ${step}` : step}
              >
                {index < currentStep || isCompleted ? (
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>

              <span
                onClick={() => isClickable && onStepClick(index)}
                className={`ml-2 text-xs whitespace-nowrap transition-colors duration-200
                  ${
                    index === currentStep
                      ? "font-medium text-blue-600"
                      : "text-gray-600"
                  }
                  ${
                    isClickable
                      ? "cursor-pointer hover:text-blue-600"
                      : "cursor-default"
                  }
                `}
                title={isClickable ? `Go to ${step}` : step}
              >
                {step}
              </span>

              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-6 mx-2 transition-colors duration-200
                    ${
                      index < currentStep || isCompleted
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
        <div
          className="bg-blue-600 h-1.5 rounded-full"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default StepIndicator;
