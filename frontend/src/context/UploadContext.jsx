import { createContext, useContext, useEffect, useState } from "react";

const UploadContext = createContext();

export const UploadProvider = ({ children }) => {
  const [isUploaded, setIsUploaded] = useState({ uploaded: false });
  const [showSection, setShowSection] = useState({
    processLoanSection: true,
    provideLoanIDSection: false,
    extractedSection: false,
    uploadedModel: false,
    startAnalyzing: false,
  });

  const [loanId, setLoanId] = useState("");
  const [data, setData] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [normalized_json, set_normalized_json] = useState(null);

  // Add state to track Income Analyzer progress
  const [incomeAnalyzerInitialized, setIncomeAnalyzerInitialized] =
    useState(false);
  const [incomeAnalyzerState, setIncomeAnalyzerState] = useState(null);

  useEffect(() => {
    console.log("++++++", normalized_json);
  }, [normalized_json]);

  const goBack = () => {
    if (showSection.startAnalyzing) {
      setShowSection((prev) => ({
        ...prev,
        startAnalyzing: false,
        extractedSection: true,
      }));
    } else if (showSection.extractedSection) {
      setShowSection((prev) => ({
        ...prev,
        extractedSection: false,
        provideLoanIDSection: true,
      }));
    } else if (showSection.provideLoanIDSection) {
      setShowSection((prev) => ({
        ...prev,
        provideLoanIDSection: false,
        processLoanSection: true,
      }));
    }
  };

  // Function to save Income Analyzer state when switching away
  const saveIncomeAnalyzerState = () => {
    if (
      showSection.extractedSection ||
      showSection.startAnalyzing ||
      showSection.provideLoanIDSection
    ) {
      setIncomeAnalyzerState({
        showSection: { ...showSection },
        loanId,
        isUploaded: { ...isUploaded },
        normalized_json,
        activeStep,
      });
      setIncomeAnalyzerInitialized(true);
    }
  };

  // Function to restore Income Analyzer state when switching back
  const restoreIncomeAnalyzerState = () => {
    if (incomeAnalyzerInitialized && incomeAnalyzerState) {
      setShowSection(incomeAnalyzerState.showSection);
      setLoanId(incomeAnalyzerState.loanId);
      setIsUploaded(incomeAnalyzerState.isUploaded);
      set_normalized_json(incomeAnalyzerState.normalized_json);
      setActiveStep(incomeAnalyzerState.activeStep);
    }
  };

  // Function to reset Income Analyzer state
  const resetIncomeAnalyzerState = () => {
    setIncomeAnalyzerInitialized(false);
    setIncomeAnalyzerState(null);
    setShowSection({
      processLoanSection: false,
      provideLoanIDSection: true,
      extractedSection: false,
      uploadedModel: false,
      startAnalyzing: false,
    });
    setLoanId("");
    setIsUploaded({ uploaded: false });
    set_normalized_json(null);
    setActiveStep(0);
  };

  return (
    <UploadContext.Provider
      value={{
        isUploaded,
        setIsUploaded,
        normalized_json,
        set_normalized_json,
        showSection,
        setShowSection,
        loanId,
        setLoanId,
        data,
        setData,
        activeStep,
        setActiveStep,
        loading,
        setLoading,
        goBack,
        // New functions for state management
        saveIncomeAnalyzerState,
        restoreIncomeAnalyzerState,
        resetIncomeAnalyzerState,
        incomeAnalyzerInitialized,
        incomeAnalyzerState,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};

export const useUpload = () => useContext(UploadContext);
