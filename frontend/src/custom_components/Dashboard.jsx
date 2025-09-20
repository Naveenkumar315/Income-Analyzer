import { useEffect, useState } from "react";
import LoanExatraction from "./LoanExtraction";
import ProcessLoanTable from "./ProcessLoanTable";
import UploadedDocument from "./UploadedDocument";
import UnderwritingRuleResult from "./UnderwritingRuleResults";
import api from "../api/client";
import StepChips from "../custom_components/StepChips";

const Dashboard = () => {
  const [showSection, setShowSection] = useState({
    processLoanSection: true,
    provideLoanIDSection: false,
    extractedSection: false,
    uploadedModel: false,
    startAnalyzing: false,
  });
  const [loanId, setLoanId] = useState("");
  const [data, setData] = useState([]);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    handleCheckData();
  }, []);

  const handleCheckData = async () => {
    try {
      const Loggined_email = sessionStorage.getItem("email") || "";
      const res = await api.post("/uploaded-data/by-email", {
        email: Loggined_email,
      });
      if (res.data && res.data.length > 0) {
        setData(transformUploadedData(res.data));
      }
    } catch (err) {
      console.error("Error fetching uploaded data", err);
    }
  };

  const transformUploadedData = (resData) =>
    resData.map((item) => ({
      loanId: item.loanID || "",
      fileName: item.file_name || "",
      borrower: item.borrower || "",
      loanType: "Wager",
      status: "Completed",
      lastUpdated: new Date(item.updated_at).toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      uploadedBy: item.borrower || "",
      actions: "",
    }));

  const columns = [
    { id: "loanId", label: "Loan ID" },
    { id: "fileName", label: "File Name" },
    { id: "borrower", label: "Borrower Name" },
    { id: "loanType", label: "Loan Type" },
    { id: "status", label: "Status", isCustom: true },
    { id: "lastUpdated", label: "Last Updated" },
    { id: "uploadedBy", label: "Uploaded By" },
    { id: "actions", label: "Actions", isCustom: true },
  ];

  const handleStepChange = (step) => {
    setActiveStep(step);
    setShowSection((prev) => ({
      ...prev,
      processLoanSection: false,
      provideLoanIDSection: false,
      extractedSection: step !== 1,
      startAnalyzing: step === 1,
    }));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {!showSection.processLoanSection && !showSection.provideLoanIDSection && (
        <StepChips activeStep={activeStep} onStepChange={handleStepChange} />
      )}

      <div
        className="bg-white rounded-lg p-2 flex-1 overflow-auto"
        style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
      >
        {showSection.processLoanSection && (
          <ProcessLoanTable
            columns={columns}
            data={data}
            setShowSection={setShowSection}
          />
        )}

        {showSection.provideLoanIDSection && (
          <UploadedDocument
            setShowSection={setShowSection}
            setLoanId={setLoanId}
            loanId={loanId}
          />
        )}

        {showSection.extractedSection && (
          <LoanExatraction
            showSection={showSection}
            setShowSection={setShowSection}
            loanId={loanId}
            setActiveStep={setActiveStep}
          />
        )}

        {showSection.startAnalyzing && (
          <UnderwritingRuleResult
            showSection={showSection}
            setShowSection={setShowSection}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
