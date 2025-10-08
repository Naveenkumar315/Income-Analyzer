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
    set_filter_borrower,
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

  // 🛑 STOP button handler — immediate cancel + close loader
  const handleCancel = () => {
    try {
      console.log("🛑 Cancel requested — aborting all requests...");
      controllerRef.current = true; // mark as cancelled
      controllerRef.current?.abort();
    } catch (err) {
      console.error("Abort failed:", err);
    } finally {
      setIsLoading(false);
      setLoadingStep(0);
      setReport({});
      controllerRef.current = null;

      // ✅ force reset UI to extraction (step 0)
      handleStepChange(0);
    }
  };

  // 🔹 Main orchestrator
  const fetchAllData = async (signal) => {
    debugger;
    const email = sessionStorage.getItem("email") || "";
    const loanId = sessionStorage.getItem("loanId") || "";

    if (!borrowerList.length) return;

    // If already analyzed → load from DB
    if (analyzedState.isAnalyzed) {
      try {
        setIsLoading(true);
        const res = await api.post(
          "/get-analyzed-data",
          { email, loanId },
          { signal }
        );

        const data = res.data?.analyzed_data || {};
        setReport(data);

        const missingBorrowers = borrowerList.filter(
          (b) => !Object.prototype.hasOwnProperty.call(data, b)
        );

        if (missingBorrowers.length > 0) {
          console.log("🔄 Missing borrowers detected:", missingBorrowers);
          Promise.all(
            missingBorrowers.map((b) =>
              analyzeBorrower(b, email, loanId, signal)
            )
          ).catch((err) =>
            console.error("❌ Error analyzing missing borrowers", err)
          );
        }

        setIsLoading(false);
        handleStepChange(1);
        return;
      } catch (err) {
        console.error("❌ Failed to load analyzed data:", err);
        setIsLoading(false);
      }
    }

    // Fresh run
    setIsLoading(true);
    setLoadingStep(0);

    const firstBorrower = borrowerList[0];
    await analyzeBorrower(firstBorrower, email, loanId, signal);

    setIsLoading(false);
    handleStepChange(1);

    const remainingBorrowers = borrowerList.slice(1);
    Promise.all(
      remainingBorrowers.map((b) => analyzeBorrower(b, email, loanId, signal))
    ).then(() => {
      console.log("✅ All background borrowers analyzed");
    });
  };

  // ✅ NEW analyzeBorrower with live loader update
  const analyzeBorrower = async (borrower, email, loanId, signal) => {
    console.log(`▶️ Starting analysis for borrower: ${borrower}`);

    const totalSteps = 3;
    let step = 0;

    const updateProgress = () => {
      step += 1;
      setLoadingStep(step);
    };

    try {
      // Bank Statement
      const bankStatement = await api.post("/banksatement-insights", null, {
        params: { email, loanID: loanId },
        signal,
      });

      console.log("bankStatement", bankStatement);
      let bank_Statement =
        bankStatement?.data?.income_insights?.insight_commentry || "";

      // 1️⃣ Verify Rules
      const rulesRes = await api.post("/verify-rules", null, {
        params: { email, loanID: loanId, borrower },
        signal,
      });
      const rulesData = rulesRes.data;
      updateProgress();

      // 2️⃣ Income Calculation
      const incomeRes = await api.post("/income-calc", null, {
        params: { email, loanID: loanId, borrower },
        signal,
      });
      const incomeData = incomeRes.data;
      updateProgress();

      // 3️⃣ Income Insights
      const insightsRes = await api.post("/income-insights", null, {
        params: { email, loanID: loanId, borrower },
        signal,
      });
      const insightsData = insightsRes.data;
      updateProgress();

      if (signal.aborted) return;

      const incomeSummary =
        incomeData?.income?.[0]?.checks?.reduce((acc, item) => {
          acc[item.field] = item.value;
          return acc;
        }, {}) || {};

      const summaryData = incomeData?.income?.[0]?.checks || [];
      const insightsComment =
        insightsData?.income_insights?.insight_commentry || "";

      setReport((prev) => ({
        ...prev,
        [borrower]: {
          rules: rulesData,
          summary: summaryData,
          income_summary: incomeSummary,
          summaryData,
          insights: insightsComment,
          bankStatment: bank_Statement,
        },
      }));

      console.log(`✅ Finished borrower: ${borrower}`);

      await update_analyzed_data_into_db(
        email,
        loanId,
        rulesData,
        incomeSummary,
        summaryData,
        insightsComment,
        borrower
      );

      setAnalyzedState({ isAnalyzed: true, analyzed_data: {} });
    } catch (ex) {
      if (signal.aborted) {
        console.warn("🛑 Analysis aborted — stopping execution immediately");
        return;
      }
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
      console.log(`✅ analyzed_data stored successfully for ${borrower}`);
    } catch (err) {
      console.error(`❌ failed to store analyzed_data for ${borrower}`, err);
    }
  };

  const handleStepChange = (step) => {
    debugger;
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
            onCancel={handleCancel} // ✅ Stop button now fully functional
          />
        )}
      </div>
    </div>
  );
};

export default IncomeAnalyzer;
