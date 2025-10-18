import React, { useEffect, useState, useRef, useCallback } from "react";
import { useUpload } from "../context/UploadContext";
import UnderwritingRuleResult from "../custom_components/underWriting/UnderwritingRuleResults";
import UploadedDocument from "../custom_components/UploadedDocument";
import LoanExatraction from "../custom_components/LoanExtraction/LoanExtraction";
import api from "../api/client";
import StepChips from "../utils/StepChips";

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

  const handle_view_result_checker = useCallback(async () => {
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
  }, [setAnalyzedState]);

  const update_analyzed_data_into_db = useCallback(
    async (
      email,
      loanId,
      rulesData,
      incomeSummary,
      summaryData,
      insightsComment,
      borrower,
      bank_Statement,
      self_employee
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
            insights: insightsComment,
            bankStatement: bank_Statement,
            self_employee: self_employee,
          },
        });
        console.log(`✅ analyzed_data stored successfully for ${borrower}`);
      } catch (err) {
        console.error(`❌ failed to store analyzed_data for ${borrower}`, err);
      }
    },
    []
  );

  /**
   * Analyzes a single borrower.
   * 'isBackground' flag controls whether to update the main loading modal.
   */
  const analyzeBorrower = useCallback(
    async (
      borrower,
      email,
      loanId,
      signal,
      bank_Statement,
      isBackground = false // Flag to control modal
    ) => {
      console.log(
        `▶️ ${
          isBackground ? "Background" : "Starting"
        } analysis for: ${borrower}`
      );
      const totalSteps = 3;
      let step = 0;

      const updateProgress = () => {
        if (!isBackground) {
          // Only update modal if it's the foreground task
          step += 1;
          setLoadingStep(step);
        }
      };

      try {
        const rulesRes = await api.post("/verify-rules", null, {
          params: { email, loanID: loanId, borrower },
          signal,
        });
        if (signal.aborted) throw new Error("Aborted");
        updateProgress();

        const incomeRes = await api.post("/income-calc", null, {
          params: { email, loanID: loanId, borrower },
          signal,
        });
        if (signal.aborted) throw new Error("Aborted");
        updateProgress();

        const insightsRes = await api.post("/income-insights", null, {
          params: { email, loanID: loanId, borrower },
          signal,
        });
        if (signal.aborted) throw new Error("Aborted");
        updateProgress();

        const incomeSummary =
          incomeRes.data?.income?.[0]?.checks?.reduce(
            (acc, item) => ({ ...acc, [item.field]: item.value }),
            {}
          ) || {};
        const summaryData = incomeRes.data?.income?.[0]?.checks || [];
        const insightsComment =
          insightsRes.data?.income_insights?.insight_commentry || "";

        debugger;
        const { data } = await api.post("/income-self_emp", null, {
          params: { email, loanID: loanId, borrower },
          signal,
        });
        if (signal.aborted) throw new Error("Aborted");
        const self_employee_response = data?.income || {};
        console.log("****self_employee_response", self_employee_response);

        const finalReport = {
          rules: rulesRes.data,
          summary: summaryData,
          income_summary: incomeSummary,
          insights: insightsComment,
          bankStatement: bank_Statement,
          self_employee: self_employee_response,
        };

        // This state update enables the dropdown for this borrower
        setReport((prev) => ({ ...prev, [borrower]: finalReport }));
        console.log(
          `✅ Finished ${
            isBackground ? "background" : ""
          } analysis for: ${borrower}`
        );

        await update_analyzed_data_into_db(
          email,
          loanId,
          finalReport.rules,
          finalReport.income_summary,
          finalReport.summary,
          finalReport.insights,
          borrower,
          finalReport.bankStatement,
          finalReport.self_employee
        );
      } catch (ex) {
        if (ex.message === "Aborted") {
          console.warn(`🛑 Analysis aborted for ${borrower}`);
        } else if (!signal.aborted) {
          console.error(`❌ Error analyzing borrower ${borrower}`, ex);
          // Optionally set an error state for this specific borrower
          // setReport((prev) => ({ ...prev, [borrower]: { error: true } }));
        }
      }
    },
    [setReport, update_analyzed_data_into_db]
  );

  useEffect(() => {
    handle_view_result_checker();

    if (showSection.startAnalyzing) {
      controllerRef.current = new AbortController();
      const signal = controllerRef.current.signal;

      const email = sessionStorage.getItem("email") || "";
      const loanId = sessionStorage.getItem("loanId") || "";

      if (!borrowerList.length) {
        console.warn("No borrowers in list. Stopping analysis.");
        return;
      }

      const runAnalysisFlow = async () => {
        try {
          if (analyzedState.isAnalyzed) {
            // --- FLOW 1: Data is already analyzed ---
            console.log("🔄 Data already analyzed. Fetching from DB...");
            setIsLoading(true);
            const res = await api.post(
              "/get-analyzed-data",
              { email, loanId },
              { signal }
            );
            const data = res.data?.analyzed_data || {};
            setReport(data);

            const missingBorrowers = borrowerList.filter((b) => !data[b]);
            if (missingBorrowers.length > 0) {
              console.log("🔄 Missing borrowers detected:", missingBorrowers);
              const anyBankStatement =
                Object.keys(data).length > 0
                  ? data[Object.keys(data)[0]]?.bankStatement || []
                  : [];

              // **FIX: Run missing borrowers in parallel**
              const missingPromises = missingBorrowers.map((b) =>
                analyzeBorrower(
                  b,
                  email,
                  loanId,
                  signal,
                  anyBankStatement,
                  true // isBackground = true
                )
              );
              await Promise.all(missingPromises); // Wait for all missing to finish
              console.log("✅ Missing borrowers fetched in parallel.");
            }

            setIsLoading(false);
            handleStepChange(1);
          } else {
            // --- FLOW 2: New analysis (Manager's Requirement) ---
            console.log("🚀 Starting new analysis...");
            const firstBorrower = borrowerList[0];
            const remainingBorrowers = borrowerList.slice(1);

            // 1. Show loader for first borrower
            setIsLoading(true);
            setLoadingStep(0);

            // 2. Fetch bank statement insights (one-time call)
            const bankStatementRes = await api.post(
              "/banksatement-insights",
              null,
              { params: { email, loanID: loanId }, signal }
            );
            const bank_Statement =
              bankStatementRes?.data?.income_insights?.insight_commentry || [];

            // 3. Analyze *only* the first borrower (foreground task)
            console.log(`Fetching initial borrower: ${firstBorrower}`);
            await analyzeBorrower(
              firstBorrower,
              email,
              loanId,
              signal,
              bank_Statement,
              false // isBackground = false (shows loading modal)
            );

            // 4. Hide loader and show UI for the first borrower
            // This happens immediately after the first borrower is done
            setIsLoading(false);
            handleStepChange(1);

            // 5. Analyze all *remaining* borrowers in PARALLEL (background)
            if (remainingBorrowers.length > 0) {
              console.log(
                `Fetching ${remainingBorrowers.length} remaining borrowers in background (parallel)...`
              );

              // **THE FIX: Create an array of promises**
              const backgroundPromises = remainingBorrowers.map((borrower) =>
                analyzeBorrower(
                  borrower,
                  email,
                  loanId,
                  signal,
                  bank_Statement,
                  true // isBackground = true
                )
              );

              // Await all promises. This doesn't block the UI,
              // as the loader is already off.
              await Promise.all(backgroundPromises);

              console.log("✅ Background parallel analysis complete.");
            }

            // 6. Mark analysis as complete
            setAnalyzedState((prev) => ({ ...prev, isAnalyzed: true }));
          }
        } catch (err) {
          if (!signal.aborted) {
            console.error("❌ Failed to fetch data:", err);
            setIsLoading(false); // Ensure loader is off on error
          }
        }
      };

      runAnalysisFlow();

      return () => controllerRef.current?.abort();
    }
  }, [
    showSection.startAnalyzing,
    borrowerList,
    analyzedState.isAnalyzed,
    handle_view_result_checker,
    setIsLoading,
    setReport,
    analyzeBorrower,
    handleStepChange,
    setAnalyzedState,
  ]);

  const handleCancel = useCallback(() => {
    console.log("🛑 Cancel requested — aborting all requests...");
    controllerRef.current?.abort();
    setIsLoading(false);
    setLoadingStep(0);
    setReport({});
    handleStepChange(0);
  }, [setIsLoading, setReport, handleStepChange]);

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
            handleStepChange={handleStepChange}
          />
        )}
      </div>
    </div>
  );
};

export default IncomeAnalyzer;
