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
  const [hasModifications, setHasModifications] = useState(false);
  const [loanId, setLoanId] = useState("");
  const [data, setData] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [normalized_json, set_normalized_json] = useState(null);
  const [report, setReport] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [analyzedState, setAnalyzedState] = useState({
    isAnalyzed: false,
    analyzed_data: {},
  });
  const [isSAClicked, setIsSAClicked] = useState(false);
  // Add state to track Income Analyzer progress
  const [incomeAnalyzerInitialized, setIncomeAnalyzerInitialized] =
    useState(false);
  const [incomeAnalyzerState, setIncomeAnalyzerState] = useState(null);
  const [filtered_borrower, set_filter_borrower] = useState("All");
  const [borrowerList, setBorrowerList] = useState([]);

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
        setReport,
        report,
        isLoading,
        setIsLoading,
        analyzedState,
        setAnalyzedState,
        setIsSAClicked,
        isSAClicked,
        filtered_borrower,
        set_filter_borrower,
        borrowerList,
        setBorrowerList,
        hasModifications,
        setHasModifications,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};

export const useUpload = () => useContext(UploadContext);
