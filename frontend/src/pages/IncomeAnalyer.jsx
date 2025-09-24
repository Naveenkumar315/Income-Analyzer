import { useUpload } from "../context/UploadContext";
import UnderwritingRuleResult from "../custom_components/UnderwritingRuleResults";
import UploadedDocument from "../custom_components/UploadedDocument";
import LoanExatraction from "../custom_components/LoanExtraction";
import { useEffect, useState, useRef } from "react";
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
    isLoading,
    setIsLoading,
    analyzedState,
  } = useUpload();

  const [loadingStep, setLoadingStep] = useState(0);
  const controllerRef = useRef(null);

  useEffect(() => {
    if (report) return;
    if (showSection.startAnalyzing) {
      controllerRef.current = new AbortController();
      fetchAllData(controllerRef.current.signal);
      return () => controllerRef.current?.abort();
    }
  }, [showSection.startAnalyzing]);

  const handleCancel = () => {
    // abort requests
    controllerRef.current?.abort();

    // reset state
    setIsLoading(false);
    setLoadingStep(0);
    setReport({
      rules: null,
      summary: [],
      income_summary: {},
      summaryData: {},
      insights: "",
    });

    // go back to previous step (optional)
    setShowSection((prev) => ({
      ...prev,
      startAnalyzing: false,
      extractedSection: true,
    }));
  };

  const fetchAllData = async (signal) => {
    setIsLoading(true);
    setLoadingStep(0);

    const email = sessionStorage.getItem("email") || "";
    const loanId = sessionStorage.getItem("loanId") || "";

    if (analyzedState?.isAnalyzed) {
      
    }

    try {
      const requests = [
        api.post("/verify-rules", null, {
          params: { email, loanID: loanId },
          signal,
        }),
        api.post("/income-calc", null, {
          params: { email, loanID: loanId },
          signal,
        }),
        api.post("/income-insights", null, {
          params: { email, loanID: loanId },
          signal,
        }),
      ];

      const results = await Promise.allSettled(
        requests.map(async (req) => {
          const res = await req;
          setLoadingStep((prev) => prev + 1);
          return res;
        })
      );

      if (signal.aborted) return; // stop processing if canceled

      const [rulesRes, incomeRes, insightsRes] = results;
      const getData = (r) => (r.status === "fulfilled" ? r.value.data : null);

      const rulesData = getData(rulesRes);
      const incomeData = getData(incomeRes);
      const insightsData = getData(insightsRes);

      const incomeChecks = incomeData?.income?.[0]?.checks || [];
      const currentIncomeChecks = incomeChecks.filter((x) =>
        x.field.includes("current")
      );

      const incomeSummary = currentIncomeChecks.reduce((acc, item) => {
        acc[item.field] = item.value;
        return acc;
      }, {});

      const summaryData = currentIncomeChecks.reduce((acc, item) => {
        acc[item.field] = item;
        return acc;
      }, {});

      const insightsComment =
        insightsData?.income_insights?.insight_commentry || "";

      setReport({
        rules: rulesData,
        summary: currentIncomeChecks,
        income_summary: incomeSummary,
        summaryData,
        insights: insightsComment,
      });

      // ✅ pass email + loanId down
      update_analyzed_data_into_db(
        email,
        loanId,
        rulesData,
        currentIncomeChecks,
        incomeSummary,
        summaryData,
        insightsComment
      );
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  const update_analyzed_data_into_db = async (
    email,
    loanId,
    rulesData,
    currentIncomeChecks,
    incomeSummary,
    summaryData,
    insightsComment
  ) => {
    try {
      await api.post("/store-analyzed-data", {
        email,
        loanID: loanId,
        analyzed_data: {
          rules: rulesData,
          summary: currentIncomeChecks,
          income_summary: incomeSummary,
          summaryData,
          insights: insightsComment, // already a string
        },
      });
      console.log("✅ analyzed_data stored successfully");
    } catch (err) {
      console.error("❌ failed to store analyzed_data", err);
    }
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
    setShowSection((prev) => ({
      ...prev,
      processLoanSection: false,
      provideLoanIDSection: false,
      extractedSection: step === 0 ? true : false,
      startAnalyzing: step === 1 ? true : false,
    }));
  };

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
            loadingStep={loadingStep}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default IncomeAnalyzer;
