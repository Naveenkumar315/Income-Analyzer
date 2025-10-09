import React from "react";

const LoadingModal = ({
  progress,
  currentStep,
  totalSteps,
  message,
  onCancel,
  isCompleted = false,
  completedMessage = "Analyzing Successfully Completed",
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-gradient-to-b from-white to-sky-50 shadow-xl rounded-lg p-10 w-[500px] text-center">
        {!isCompleted ? (
          <>
            {/* Progress Circle */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center w-28 h-28 rounded-full border-4 border-sky-200">
                <span className="text-2xl font-semibold text-sky-600">
                  {progress}%
                </span>
              </div>
            </div>

            {/* Status message */}
            <p className="text-gray-700 mb-4">
              {message || `Analyzing ${currentStep} of ${totalSteps}`}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div
                className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Cancel button */}
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-2 border border-sky-500 text-sky-600 rounded-md hover:bg-sky-50 transition"
              >
                Stop
              </button>
            )}
          </>
        ) : (
          <>
            {/* Completed state */}
            <div className="flex items-center justify-center mb-6">
              <svg
                className="h-16 w-16 text-sky-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2l4-4m6 2a9 9 0 11-18 0a9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-700">{completedMessage}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoadingModal;
