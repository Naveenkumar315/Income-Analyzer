import React, { useEffect, useState, useRef, useCallback } from "react";
import { useUpload } from "../context/UploadContext";
import UnderwritingRuleResult from "../custom_components/underWriting/UnderwritingRuleResults";
import UploadedDocument from "../custom_components/UploadedDocument";
import LoanExatraction from "../custom_components/LoanExtraction/LoanExtraction";
import StepChips from "../utils/StepChips";

const BACKEND_URL = "http://localhost:8080";

const IncomeAnalyzer = () => {
  const {
    showSection,
    setShowSection,
    // loanId = sessionStorage.getItem("loanId"),
    // setLoanId,
    activeStep,
    setActiveStep,
    goBack,
    setReport,
    report,
    isLoading,
    setIsLoading,
    analyzedState,
    setAnalyzedState,
    borrowerList,
    filtered_borrower,
    set_filter_borrower,
  } = useUpload();

  const [loadingStep, setLoadingStep] = useState(0);
  const [firstBorrowerCompleted, setFirstBorrowerCompleted] = useState(false);
  const [loanId, setLoanId] = useState(sessionStorage.getItem("loanId"));
  const eventSourceRef = useRef(null);

  const handleStepChange = useCallback(
    (step) => {
      setActiveStep(step);
      setShowSection((prev) => ({
        ...prev,
        processLoanSection: false,
        provideLoanIDSection: false,
        extractedSection: step === 0,
        startAnalyzing: step === 1,
      }));
    },
    [setActiveStep, setShowSection]
  );

  const handleCancel = useCallback(() => {
    console.log("🛑 Cancel requested — closing SSE connection...");
    eventSourceRef.current?.close();
    setIsLoading(false);
    setLoadingStep(0);
    setReport({});
    handleStepChange(0);
  }, [setIsLoading, setReport, handleStepChange]);

  const startSSEAnalysis = useCallback(async () => {
    if (
      sessionStorage.getItem("loanId").trim().length === 0 ||
      borrowerList.length === 0
    ) {
      console.warn("Loan ID or borrower list missing. SSE will not start.");
      return;
    }

    const email = sessionStorage.getItem("email") || "";
    const params = new URLSearchParams({
      email,
      loanId,
      borrowers: borrowerList.join(","),
    });

    eventSourceRef.current?.close();

    eventSourceRef.current = new EventSource(
      `${BACKEND_URL}/start-analysis?${params.toString()}`,
      { withCredentials: true }
    );

    setIsLoading(true);
    setLoadingStep(0);
    setFirstBorrowerCompleted(false);

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("SSE event received:", data);
        const {
          borrower,
          report: borrowerReport,
          step,
          totalSteps,
          done,
        } = data;

        if (borrowerReport) {
          setReport((prev) => ({ ...prev, [borrower]: borrowerReport }));
        }

        if (borrower === borrowerList[0] && step && totalSteps) {
          setLoadingStep(step);
        }

        if (borrower === borrowerList[0] && done && !firstBorrowerCompleted) {
          setFirstBorrowerCompleted(true);
          setIsLoading(false);
          handleStepChange(1);
        }
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    eventSourceRef.current.onerror = (err) => {
      console.error("SSE connection error:", err);
      eventSourceRef.current?.close();
      setIsLoading(false);
    };
  }, [
    borrowerList,
    loanId,
    setReport,
    setIsLoading,
    handleStepChange,
    firstBorrowerCompleted,
  ]);

  useEffect(() => {
    if (showSection.startAnalyzing) {
      if (!loanId) {
        console.warn("Cannot start analysis: Loan ID missing.");
        return;
      }
      startSSEAnalysis();

      return () => {
        console.log("Cleaning up SSE connection...");
        eventSourceRef.current?.close();
      };
    }
  }, [showSection.startAnalyzing, loanId, startSSEAnalysis]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {!showSection.provideLoanIDSection && (
        <StepChips activeStep={activeStep} onStepChange={handleStepChange} />
      )}
      <div className="bg-white rounded-lg px-2 flex-1 overflow-auto pb-2 shadow">
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
            handleStepChange={handleStepChange}
          />
        )}
        {showSection.startAnalyzing && (
          <UnderwritingRuleResult
            report={report}
            setReport={setReport}
            loadingStep={loadingStep}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default IncomeAnalyzer;
