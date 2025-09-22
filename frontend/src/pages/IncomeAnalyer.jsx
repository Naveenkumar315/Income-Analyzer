import { useUpload } from "../context/UploadContext";
import UnderwritingRuleResult from "../custom_components/UnderwritingRuleResults";
import UploadedDocument from "../custom_components/UploadedDocument";
import LoanExatraction from "../custom_components/LoanExtraction";
import { useEffect } from "react";

const IncomeAnalyzer = () => {
  const {
    showSection,
    setShowSection,
    loanId,
    setLoanId,
    activeStep,
    setActiveStep,
    goBack,
  } = useUpload();

  useEffect(() => {
    setShowSection((prev) => ({
      ...prev,
      processLoanSection: false,
      provideLoanIDSection: true,
      extractedSection: false,
    }));
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden">
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
          />
        )}
      </div>
    </div>
  );
};
export default IncomeAnalyzer;
