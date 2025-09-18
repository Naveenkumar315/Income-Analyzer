import React, { createContext, useContext, useState } from "react";
import LoadingModal from "../custom_components/LoaderModal"; // adjust path

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const showLoader = ({
    progress = 0,
    message = "",
    currentStep = 0,
    totalSteps = 0,
  }) => {
    setLoading(true);
    setProgress(progress);
    setMessage(message);
    setCurrentStep(currentStep);
    setTotalSteps(totalSteps);
    setIsCompleted(false);
  };

  const updateProgress = (progress, step, total, msg) => {
    setProgress(progress);
    if (step !== undefined) setCurrentStep(step);
    if (total !== undefined) setTotalSteps(total);
    if (msg !== undefined) setMessage(msg);
  };

  const completeLoader = (msg) => {
    setIsCompleted(true);
    if (msg) setMessage(msg);
  };

  const hideLoader = () => {
    setLoading(false);
    setProgress(0);
    setMessage("");
    setCurrentStep(0);
    setTotalSteps(0);
    setIsCompleted(false);
  };

  return (
    <LoaderContext.Provider
      value={{ showLoader, updateProgress, completeLoader, hideLoader }}
    >
      {children}
      {loading && (
        <LoadingModal
          progress={progress}
          message={message}
          currentStep={currentStep}
          totalSteps={totalSteps}
          isCompleted={isCompleted}
          completedMessage={message}
          onCancel={hideLoader}
        />
      )}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);
