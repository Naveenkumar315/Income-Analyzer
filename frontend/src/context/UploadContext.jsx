import { createContext, useContext, useEffect, useState } from "react";

// Create context
const UploadContext = createContext();

// Provider component
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
      }}
    >
      {children}
    </UploadContext.Provider>
  );
};

// Custom hook (nice shortcut)
export const useUpload = () => useContext(UploadContext);
