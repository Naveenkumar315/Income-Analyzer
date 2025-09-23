import { useUpload } from "../context/UploadContext";
import UnderwritingRuleResult from "../custom_components/UnderwritingRuleResults";
import UploadedDocument from "../custom_components/UploadedDocument";
import LoanExatraction from "../custom_components/LoanExtraction";
import { useEffect } from "react";
import api from "../api/client";
import StepChips from "../custom_components/StepChips";

const IncomeAnalyzer = () => {
  const {
    showSection,
    setShowSection,
    loanId,
    setLoanId,
    activeStep,
    setActiveStep,
    goBack,
    setReport,
    report,
  } = useUpload();

  useEffect(() => {
    if (showSection.startAnalyzing) {
      getAnalyzedResult();
    }
  }, [showSection.startAnalyzing]);

  const getAnalyzedResult = async () => {
    try {
      const response = await api.post("/get-analyzing-data", {
        email: sessionStorage.getItem("email") || "",
        loanID: sessionStorage.getItem("loanId") || "",
        username: sessionStorage.getItem("username") || "",
      });
      console.log("response", response);
      if (response.status === 200) {
        setReport(response?.data);
      }
    } catch (error) {
      console.error(`getAnalyzedResult error: ${error}`);
    }
  };

  const handleStepChange = (step) => {
    console.log("handleStepChange", step);

    setActiveStep(step);
    setShowSection((prev) => ({
      ...prev,
      processLoanSection: false,
      provideLoanIDSection: false,
      extractedSection: step === 0 ? true : false,
      startAnalyzing: step === 1 ? true : false,
    }));
  };

  // Remove the useEffect that was resetting the state
  // The state management is now handled in Home.jsx

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {!showSection.provideLoanIDSection && (
        <StepChips activeStep={activeStep} onStepChange={handleStepChange} />
      )}
      <div className="bg-white rounded-lg p-2 flex-1 overflow-auto shadow">
        {showSection.provideLoanIDSection && (
          <UploadedDocument
            setShowSection={setShowSection}
            setLoanId={setLoanId}
            loanId={loanId}
            goBack={goBack}
          />
        )}

        {showSection.extractedSection && (
          <LoanExatraction
            showSection={showSection}
            setShowSection={setShowSection}
            loanId={loanId}
            setActiveStep={setActiveStep}
            goBack={goBack}
          />
        )}

        {showSection.startAnalyzing && (
          <UnderwritingRuleResult
            showSection={showSection}
            setShowSection={setShowSection}
            goBack={goBack}
            report={report}
            setReport={setReport}
          />
        )}
      </div>
    </div>
  );
};

export default IncomeAnalyzer;
