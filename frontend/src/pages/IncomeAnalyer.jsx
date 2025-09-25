import { useUpload } from "../context/UploadContext";
import UnderwritingRuleResult from "../custom_components/UnderwritingRuleResults";
import UploadedDocument from "../custom_components/UploadedDocument";
import LoanExatraction from "../custom_components/LoanExtraction";
import { useEffect, useState, useRef } from "react";
import api from "../api/client";
import StepChips from "../custom_components/StepChips";
import { toast } from "react-toastify";

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
    isSAClicked,
    setAnalyzedState,
  } = useUpload();

  const [loadingStep, setLoadingStep] = useState(0);
  const controllerRef = useRef(null);

  useEffect(() => {
    debugger;

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

    // ✅ If already analyzed, fetch analyzed_data directly and exit
    if (analyzedState?.isAnalyzed) {
      try {
        const res = await api.post(
          "/get-analyzed-data",
          { email, loanId },
          { signal }
        );
        const data = res.data;
        // update state directly
        setReport(data.analyzed_data || {});
        handleStepChange(1);
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
      return; // ✅ stop further execution
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

      if (signal.aborted) return;

      const [rulesRes, incomeRes, insightsRes] = results;
      const getData = (r) => (r.status === "fulfilled" ? r.value.data : null);

      const rulesData = getData(rulesRes);
      const incomeData = getData(incomeRes);
      const insightsData = getData(insightsRes);

      // // process income-calc into the structures you need
      // const incomeChecks = incomeData?.income?.[0]?.checks || [];
      // const currentIncomeChecks = incomeChecks.filter((x) =>
      //   x.field.includes("current")
      // );

      const incomeSummary = incomeData?.income?.[0]?.checks.reduce(
        (acc, item) => {
          acc[item.field] = item.value;
          return acc;
        },
        {}
      );

      // const summaryData = incomeData?.income?.[0]?.checks.reduce((acc, item) => {
      //   acc[item.field] = item;
      //   return acc;
      // }, {});

      const summaryData = incomeData?.income?.[0]?.checks;

      const insightsComment =
        insightsData?.income_insights?.insight_commentry || "";
      debugger;
      setReport({
        rules: rulesData,
        summary: summaryData,
        income_summary: incomeSummary,
        summaryData,
        insights: insightsComment,
      });
      handleStepChange(1);
      update_analyzed_data_into_db(
        email,
        loanId,
        rulesData,
        // currentIncomeChecks,
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
    // currentIncomeChecks,
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
          summary: summaryData,
          income_summary: incomeSummary,
          summaryData,
          insights: insightsComment, // already a string
        },
      });
      setAnalyzedState({ isAnalyzed: true, analyzed_data: {} });
      console.log("✅ analyzed_data stored successfully");
    } catch (err) {
      console.error("❌ failed to store analyzed_data", err);
    }
  };

  const handleStepChange = (step) => {
    debugger;
    // if (step === 1 && !analyzedState.isAnalyzed) {
    //   toast.warn("Start analyzing first.");
    //   return;
    // }

    setActiveStep(step);
    setShowSection((prev) => ({
      ...prev,
      processLoanSection: false,
      provideLoanIDSection: false,
      extractedSection: step === 0 ? true : false,
      startAnalyzing: step === 1 ? true : false,
    }));
  };

  const handle_view_result_checker = async (row) => {
    try {
      // setReport({});
      const response = await api.post("/view-loan", {
        email: sessionStorage.getItem("email") || "",
        loanId: sessionStorage.getItem("loanId") || "",
      });

      const data = response.data;
      if (!Object.keys(data).length) {
        console.log("Data is empty!");
        return;
      }

      // console.log("check data", data);
      // sessionStorage.setItem("loanId", row.loanId || "");

      // set_normalized_json(data.cleaned_data);
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
