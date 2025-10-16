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
      self_employee_response,
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
            self_employee: self_employee_response,
          },
        });
        console.log(`✅ analyzed_data stored successfully for ${borrower}`);
      } catch (err) {
        console.error(`❌ failed to store analyzed_data for ${borrower}`, err);
      }
    },
    []
  );

  const analyzeBorrower = useCallback(
    async (borrower, email, loanId, signal, bank_Statement) => {
      console.log(`▶️ Starting analysis for borrower: ${borrower}`);
      const totalSteps = 3;
      let step = 0;
      const updateProgress = () => {
        step += 1;
        setLoadingStep(step);
      };

      try {
        const rulesRes = await api.post("/verify-rules", null, {
          params: { email, loanID: loanId, borrower },
          signal,
        });
        console.log("****")
        if (signal.aborted) return;
        updateProgress();

        const incomeRes = await api.post("/income-calc", null, {
          params: { email, loanID: loanId, borrower },
          signal,
        });
        if (signal.aborted) return;
        updateProgress();

        const insightsRes = await api.post("/income-insights", null, {
          params: { email, loanID: loanId, borrower },
          signal,
        });
        if (signal.aborted) return;
        updateProgress();

        const incomeSummary =
          incomeRes.data?.income?.[0]?.checks?.reduce(
            (acc, item) => ({ ...acc, [item.field]: item.value }),
            {}
          ) || {};
        const summaryData = incomeRes.data?.income?.[0]?.checks || [];
        const insightsComment =
          insightsRes.data?.income_insights?.insight_commentry || "";

        debugger
        const { data } = await api.post("/income-self_emp", null, {
          params: { email, loanID: loanId, borrower },
          signal,
        });
        const self_employee_response = data?.income || {}
        console.log("****self_employee_response", self_employee_response)

        const finalReport = {
          rules: rulesRes.data,
          summary: summaryData,
          income_summary: incomeSummary,
          insights: insightsComment,
          bankStatement: bank_Statement,
          self_employee: self_employee_response,
        };

        setReport((prev) => ({ ...prev, [borrower]: finalReport }));
        console.log(`✅ Finished borrower: ${borrower}`);

        await update_analyzed_data_into_db(
          email,
          loanId,
          finalReport.rules,
          finalReport.income_summary,
          finalReport.summary,
          finalReport.insights,
          borrower,
          finalReport.bankStatement,
          self_employee_response,
        );
      } catch (ex) {
        if (!signal.aborted)
          console.error(`❌ Error analyzing borrower ${borrower}`, ex);
        else console.warn(`🛑 Analysis aborted for ${borrower}`);
      }
    },
    [setReport, update_analyzed_data_into_db]
  );

  const fetchAllData = useCallback(
    async (signal) => {
      const email = sessionStorage.getItem("email") || "";
      const loanId = sessionStorage.getItem("loanId") || "";
      if (!borrowerList.length) return;

      setIsLoading(true);
      setLoadingStep(0);

      try {
        if (analyzedState.isAnalyzed) {
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
            await Promise.all(
              missingBorrowers.map((b) =>
                analyzeBorrower(b, email, loanId, signal, [])
              )
            );
          }
        } else {
          const bankStatementRes = await api.post(
            "/banksatement-insights",
            null,
            { params: { email, loanID: loanId }, signal }
          );
          const bank_Statement =
            bankStatementRes?.data?.income_insights?.insight_commentry || [];

          // Run all borrowers in parallel
          await Promise.all(
            borrowerList.map((b) =>
              analyzeBorrower(b, email, loanId, signal, bank_Statement)
            )
          );
          setAnalyzedState((prev) => ({ ...prev, isAnalyzed: true }));
        }
      } catch (err) {
        if (!signal.aborted) console.error("❌ Failed to fetch data:", err);
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
          handleStepChange(1);
        }
      }
    },
    [
      borrowerList,
      analyzedState.isAnalyzed,
      setIsLoading,
      setReport,
      analyzeBorrower,
      handleStepChange,
      setAnalyzedState,
    ]
  );

  useEffect(() => {
    handle_view_result_checker();
    if (showSection.startAnalyzing) {
      controllerRef.current = new AbortController();
      fetchAllData(controllerRef.current.signal);
      return () => controllerRef.current?.abort();
    }
  }, [showSection.startAnalyzing, fetchAllData, handle_view_result_checker]);

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
