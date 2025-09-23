import { useUpload } from "../context/UploadContext";
import UnderwritingRuleResult from "../custom_components/UnderwritingRuleResults";
import UploadedDocument from "../custom_components/UploadedDocument";
import LoanExatraction from "../custom_components/LoanExtraction";
import { useEffect, useState } from "react";
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
  } = useUpload();

  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (showSection.startAnalyzing) {
      // getAnalyzedResult()
      const controller = new AbortController();
      fetchAllData(controller.signal);
      return () => controller.abort();
    }
  }, [showSection.startAnalyzing]);

  const getAnalyzedResult = async () => {
    try {
      let email = sessionStorage.getItem("email") || "";
      let loanId = sessionStorage.getItem("loanId") || "";
      const response = await api.post("/verify-rules", null, {
        params: { email, loanID: loanId },
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

  const fetchAllData = async (signal) => {
    setIsLoading(true);

    const email = sessionStorage.getItem("email") || "";
    const loanId = sessionStorage.getItem("loanId") || "";

    try {
      // open loader at step 1
      setLoadingStep(0);
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
        requests.map(async (req, idx) => {
          const res = await req;
          setLoadingStep((prev) => prev + 1);
          return res;
        })
      );

      const [rulesRes, incomeRes, insightsRes] = results;

      // console.log("analyzing_data", { rulesRes, incomeRes, insightsRes });
      // console.log("rulesRes", rulesRes);

      // helper to extract data if fulfilled
      const getData = (r) => (r.status === "fulfilled" ? r.value.data : null);

      const rulesData = getData(rulesRes);
      const incomeData = getData(incomeRes);
      const insightsData = getData(insightsRes);

      // process income-calc into the structures you need
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

      // set the report once
      setReport({
        rules: rulesData,
        summary: currentIncomeChecks,
        income_summary: incomeSummary,
        summaryData,
        insights: insightsData?.income_insights?.insight_commentry || "",
      });

      console.log("Fianl AD : ", {
        rules: rulesData,
        summary: currentIncomeChecks,
        income_summary: incomeSummary,
        summaryData,
        insights: insightsData?.income_insights?.insight_commentry || "",
      });
    } finally {
      setIsLoading(false);
    }
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
            loadingStep={loadingStep}
          />
        )}
      </div>
    </div>
  );
};

export default IncomeAnalyzer;
