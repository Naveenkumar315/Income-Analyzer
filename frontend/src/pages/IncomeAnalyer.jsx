import { useUpload } from "../context/UploadContext";
import UnderwritingRuleResult from "../custom_components/UnderwritingRuleResults";
import UploadedDocument from "../custom_components/UploadedDocument";
import LoanExatraction from "../custom_components/LoanExtraction";
import { useEffect } from "react";
import api from "../api/client";

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


  useEffect(() => {
    if (showSection.startAnalyzing) {
      // getAnalyzedResult()
      const controller = new AbortController();
      fetchAllData(controller.signal);
      return () => controller.abort();
    }
  }, [showSection.startAnalyzing])


  const getAnalyzedResult = async () => {
    try {
      let email = sessionStorage.getItem("email") || ""
      let loanId = sessionStorage.getItem("loanId") || ""
      const response = await api.post("/verify-rules", null, {
        params: { email, loanID: loanId },
      });
      console.log("response", response)
      if (response.status === 200) {
        setReport(response?.data)
      }
    } catch (error) {
      console.error(`getAnalyzedResult error: ${error}`);
    }
  }

  const fetchAllData = async (signal) => {
    setIsLoading(true);

    const email = sessionStorage.getItem("email") || "";
    const loanId = sessionStorage.getItem("loanId") || "";

    try {
      const requests = [
        api.post("/verify-rules", null, { params: { email, loanID: loanId }, signal }),
        api.post("/income-calc", null, { params: { email, loanID: loanId }, signal }),
        api.post("/income-insights", null, { params: { email, loanID: loanId }, signal }),
      ];

      const [rulesRes, incomeRes, insightsRes] = await Promise.allSettled(requests);

      console.log('incomeRes', incomeRes)
      console.log('rulesRes', rulesRes);


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

    } finally {
      setIsLoading(false);
    }
  };


  // Remove the useEffect that was resetting the state
  // The state management is now handled in Home.jsx

  return (
    <div className="h-full flex flex-col overflow-hidden">
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
          />
        )}
      </div>
    </div>
  );
};

export default IncomeAnalyzer;
