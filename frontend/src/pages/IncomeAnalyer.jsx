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

  // 🔹 Main data loader
  const fetchAllData = async (signal) => {
    const email = sessionStorage.getItem("email") || "";
    const loanId = sessionStorage.getItem("loanId") || "";

    if (!borrowerList.length) return;

    // 🔹 If already analyzed, load from DB
    if (analyzedState.isAnalyzed) {
      try {
        setIsLoading(true);
        const res = await api.post(
          "/get-analyzed-data",
          { email, loanId }, // <-- corrected key
          { signal }
        );

        const data = res.data?.analyzed_data || {};
        setReport(data);
        console.log("✅ Loaded analyzed data from DB", data);

        // 🔹 Check if all borrowers are present
        const missingBorrowers = borrowerList.filter(
          (b) => !Object.prototype.hasOwnProperty.call(data, b)
        );

        if (missingBorrowers.length > 0) {
          console.log("🔄 Missing borrowers detected:", missingBorrowers);

          // analyze missing borrowers in background
          Promise.all(
            missingBorrowers.map((b) =>
              analyzeBorrower(b, email, loanId, signal)
            )
          )
            .then(() => {
              console.log("✅ Missing borrowers analyzed and saved");
            })
            .catch((err) =>
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

    // 🔹 Standard flow for fresh analysis
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

      const results = await Promise.allSettled(requests);
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

      // 🔹 Update report incrementally
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
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};

export default IncomeAnalyzer;
