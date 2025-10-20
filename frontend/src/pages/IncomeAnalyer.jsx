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
      isBackground = false
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

        const { data } = await api.post("/income-self_emp", null, {
          params: { email, loanID: loanId, borrower },
          signal,
        });
        if (signal.aborted) throw new Error("Aborted");
        const self_employee_response = data?.income || {};

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

        return { success: true, borrower };
      } catch (ex) {
        if (ex.message === "Aborted") {
          console.warn(`🛑 Analysis aborted for ${borrower}`);
          return { success: false, borrower, error: "Aborted" };
        } else if (!signal.aborted) {
          console.error(`❌ Error analyzing borrower ${borrower}`, ex);
          return { success: false, borrower, error: ex.message };
        }
        return { success: false, borrower, error: "Unknown error" };
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

              // Run missing borrowers in parallel with individual completion tracking
              missingBorrowers.forEach((borrower) => {
                analyzeBorrower(
                  borrower,
                  email,
                  loanId,
                  signal,
                  anyBankStatement,
                  true
                ).then((result) => {
                  if (result.success) {
                    console.log(`✅ ${borrower} background analysis completed`);
                  } else {
                    console.error(`❌ ${borrower} background analysis failed`);
                  }
                });
              });
            }

            setIsLoading(false);
            handleStepChange(1);
          } else {
            // --- FLOW 2: New analysis ---
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
            setIsLoading(false);
            handleStepChange(1);

            // 5. Analyze all *remaining* borrowers in PARALLEL (background)
            if (remainingBorrowers.length > 0) {
              console.log(
                `🚀 Starting ${remainingBorrowers.length} background borrowers in parallel...`
              );

              // Start all background analyses without waiting for all to complete
              remainingBorrowers.forEach((borrower) => {
                analyzeBorrower(
                  borrower,
                  email,
                  loanId,
                  signal,
                  bank_Statement,
                  true // isBackground = true
                ).then((result) => {
                  if (result.success) {
                    console.log(`✅ ${borrower} completed and UI updated`);
                  } else {
                    console.error(`❌ ${borrower} failed:`, result.error);
                  }
                });
              });

              // Track completion of all background tasks without blocking
              Promise.allSettled(
                remainingBorrowers.map((borrower) =>
                  analyzeBorrower(
                    borrower,
                    email,
                    loanId,
                    signal,
                    bank_Statement,
                    true
                  )
                )
              ).then((results) => {
                const successful = results.filter(
                  (r) => r.status === "fulfilled" && r.value.success
                ).length;
                const failed = results.filter(
                  (r) =>
                    r.status === "rejected" ||
                    (r.status === "fulfilled" && !r.value.success)
                ).length;
                console.log(
                  `📊 Background analysis complete: ${successful} succeeded, ${failed} failed`
                );

                // Mark analysis as complete only when all background tasks are done
                setAnalyzedState((prev) => ({ ...prev, isAnalyzed: true }));
              });
            } else {
              // No remaining borrowers, mark as complete immediately
              setAnalyzedState((prev) => ({ ...prev, isAnalyzed: true }));
            }
          }
        } catch (err) {
          if (!signal.aborted) {
            console.error("❌ Failed to fetch data:", err);
            setIsLoading(false);
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
