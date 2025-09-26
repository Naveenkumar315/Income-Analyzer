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
    setAnalyzedState,
    borrowerList,
  } = useUpload();

  const [loadingStep, setLoadingStep] = useState(0);
  const controllerRef = useRef(null);

  useEffect(() => {
    handle_view_result_checker();
    if (Object.keys(report).length) return;
    if (showSection.startAnalyzing) {
      controllerRef.current = new AbortController();
      fetchAllData(controllerRef.current.signal);
      return () => controllerRef.current?.abort();
    }
    return () => {
      setReport({});
    };
  }, [showSection.startAnalyzing]);

  const handleCancel = () => {
    controllerRef.current?.abort();
    setIsLoading(false);
    setLoadingStep(0);
    setReport({});
    setShowSection((prev) => ({
      ...prev,
      startAnalyzing: false,
      extractedSection: true,
    }));
  };

  // 🔹 Sequential analysis: first borrower with loader, rest in background
  const fetchAllData = async (signal) => {
    const email = sessionStorage.getItem("email") || "";
    const loanId = sessionStorage.getItem("loanId") || "";

    if (!borrowerList.length) return;

    // Step 1: global loader for first borrower
    setIsLoading(true);
    setLoadingStep(0);

    // Step 2: analyze first borrower
    const firstBorrower = borrowerList[0];
    await analyzeBorrower(firstBorrower, email, loanId, signal);

    // Step 3: hide loader and show UI
    setIsLoading(false);
    handleStepChange(1);

    // Step 4: background analyze the rest
    for (let i = 1; i < borrowerList.length; i++) {
      const borrower = borrowerList[i];
      analyzeBorrower(borrower, email, loanId, signal); // background, no loader
    }
  };

  // 🔹 Analyze one borrower
  const analyzeBorrower = async (borrower, email, loanId, signal) => {
    console.log(`▶️ Starting analysis for borrower: ${borrower}`);
    try {
      const requests = [
        api.post("/verify-rules", null, {
          params: { email, loanID: loanId, borrower },
          signal,
        }),
        api.post("/income-calc", null, {
          params: { email, loanID: loanId, borrower },
          signal,
        }),
        api.post("/income-insights", null, {
          params: { email, loanID: loanId, borrower },
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

      if (signal.aborted) return;

      const [rulesRes, incomeRes, insightsRes] = results;
      const getData = (r) => (r.status === "fulfilled" ? r.value.data : null);

      const rulesData = getData(rulesRes);
      const incomeData = getData(incomeRes);
      const insightsData = getData(insightsRes);

      const incomeSummary = incomeData?.income?.[0]?.checks.reduce(
        (acc, item) => {
          acc[item.field] = item.value;
          return acc;
        },
        {}
      );

      const summaryData = incomeData?.income?.[0]?.checks;
      const insightsComment =
        insightsData?.income_insights?.insight_commentry || "";

      // Save into state per borrower
      setReport((prev) => ({
        ...prev,
        [borrower]: {
          rules: rulesData,
          summary: summaryData,
          income_summary: incomeSummary,
          summaryData,
          insights: insightsComment,
        },
      }));

      console.log(`✅ Finished borrower: ${borrower}`);

      // Save to DB
      await update_analyzed_data_into_db(
        email,
        loanId,
        rulesData,
        incomeSummary,
        summaryData,
        insightsComment,
        borrower
      );
    } catch (ex) {
      console.error(`❌ Error analyzing borrower ${borrower}`, ex);
    }
  };

  const update_analyzed_data_into_db = async (
    email,
    loanId,
    rulesData,
    incomeSummary,
    summaryData,
    insightsComment,
    borrower
  ) => {
    try {
      await api.post("/store-analyzed-data", {
        email,
        loanID: loanId,
        borrower,
        analyzed_data: {
          rules: rulesData,
          summary: summaryData,
          income_summary: incomeSummary,
          summaryData,
          insights: insightsComment,
        },
      });
      setAnalyzedState({ isAnalyzed: true, analyzed_data: {} });
      console.log(`✅ analyzed_data stored successfully for ${borrower}`);
    } catch (err) {
      console.error(`❌ failed to store analyzed_data for ${borrower}`, err);
    }
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
    setShowSection((prev) => ({
      ...prev,
      processLoanSection: false,
      provideLoanIDSection: false,
      extractedSection: step === 0,
      startAnalyzing: step === 1,
    }));
  };

  const handle_view_result_checker = async () => {
    try {
      const response = await api.post("/view-loan", {
        email: sessionStorage.getItem("email") || "",
        loanId: sessionStorage.getItem("loanId") || "",
      });

      const data = response.data;
      if (!Object.keys(data).length) return;

      setAnalyzedState((prev) => ({
        ...prev,
        isAnalyzed: data.analyzed_data || false,
      }));
    } catch (error) {
      console.error("Error fetching loan data:", error);
    }
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
            handleStepChange={handleStepChange}
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
