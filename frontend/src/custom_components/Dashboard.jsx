import { useEffect, useState } from "react";
import LoanExatraction from "./LoanExtraction";
import ProcessLoanTable from "./ProcessLoanTable";
import UploadedDocument from "./UploadedDocument";
import UnderwritingRuleResult from "./UnderwritingRuleResults";
import api from "../api/client";
import StepChips from "./StepChips";

const Dashboard = ({ email }) => {
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
      debugger;
      const Loggined_email = sessionStorage.getItem("email") || "";
      const data = await fetchUploadedData(Loggined_email);
      console.log("User Loan Data:", data);
      // { loanID: "LD-9080", file_name: "IC_LOAN_50490...", updated_at: "...", borrower: "firstKey" }
      if (data && data.length > 0) {
        setData(transformUploadedData(data));
      }
    } catch (err) {
      console.error("Error fetching uploaded data", err);
    }
  };

  const fetchUploadedData = async (email) => {
    const res = await api.post("/uploaded-data/by-email", {
      email,
    });
    return res.data;
  };

  const transformUploadedData = (resData) => {
    return resData.map((item) => {
      return {
        loanId: item.loanID || "", // rename loanID → loanId
        fileName: item.file_name || "", // rename file_name → fileName
        borrower: item.borrower || "",
        loanType: "Wager", // hardcoded
        status: "Completed", // hardcoded
        lastUpdated: new Date(item.updated_at).toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }), // format datetime → "MM/DD/YYYY, hh:mm AM/PM"
        uploadedBy: item.borrower || "", // assuming uploadedBy = borrower
        actions: "", // placeholder
      };
    });
  };

  // columns.js
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

  // const data = [
  //   {
  //     loanId: "LN-20250915-001",
  //     fileName: "123456789_W2.json",
  //     borrower: "John Doe",
  //     loanType: "Conventional",
  //     status: "Completed",
  //     lastUpdated: "2025-09-14 10:45 AM",
  //     uploadedBy: "John Doe",
  //     actions: "",
  //   },
  //   {
  //     loanId: "LN-20250914-005",
  //     fileName: "12345_LoanFile.json",
  //     borrower: "Lando Norris",
  //     loanType: "FHA",
  //     status: "Pending",
  //     lastUpdated: "2025-09-13 04:22 PM",
  //     uploadedBy: "Emily Johnson",
  //     actions: "",
  //   },
  //   {
  //     loanId: "LN-20250914-005",
  //     fileName: "12345_LoanFile.json",
  //     borrower: "Lando Norris",
  //     loanType: "FHA",
  //     status: "Error",
  //     lastUpdated: "2025-09-13 04:22 PM",
  //     uploadedBy: "Emily Johnson",
  //     actions: "",
  //   },
  //   {
  //     loanId: "LN-20250915-001",
  //     fileName: "123456789_W2.json",
  //     borrower: "John Doe",
  //     loanType: "Conventional",
  //     status: "Completed",
  //     lastUpdated: "2025-09-14 10:45 AM",
  //     uploadedBy: "John Doe",
  //     actions: "",
  //   },
  //   {
  //     loanId: "LN-20250914-005",
  //     fileName: "12345_LoanFile.json",
  //     borrower: "Lando Norris",
  //     loanType: "FHA",
  //     status: "Pending",
  //     lastUpdated: "2025-09-13 04:22 PM",
  //     uploadedBy: "Emily Johnson",
  //     actions: "",
  //   },
  //   {
  //     loanId: "LN-20250914-005",
  //     fileName: "12345_LoanFile.json",
  //     borrower: "Lando Norris",
  //     loanType: "FHA",
  //     status: "Error",
  //     lastUpdated: "2025-09-13 04:22 PM",
  //     uploadedBy: "Emily Johnson",
  //     actions: "",
  //   },
  // ];


  const handleStepChange = (step) => {
    setActiveStep(step);
    if (step === 1) {
      setShowSection((prev) => ({
        ...prev,
        processLoanSection: false,
        provideLoanIDSection: false,
        extractedSection: false,
        uploadedModel: false,
        startAnalyzing: true,
      }))
    } else {
      setShowSection((prev) => ({
        ...prev,
        processLoanSection: false,
        provideLoanIDSection: false,
        extractedSection: true,
        uploadedModel: false,
        startAnalyzing: false,
      }))
    }
  };

  return (
    <>

      <main className="flex-1 bg-gray-100 p-4">
        {
          (!showSection.processLoanSection && !showSection.provideLoanIDSection) && (<><StepChips activeStep={activeStep} onStepChange={handleStepChange} /></>)
        }

        <div
          className="bg-white rounded-lg p-2 min-h-[calc(90vh-90px)] max-h-[calc(80vh-80px)]"
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
            <>
              <UploadedDocument
                setShowSection={setShowSection}
                setLoanId={setLoanId}
                loanId={loanId}
              />
            </>
          )}

          {showSection.extractedSection && (
            <div>
              <div className="bg-white rounded-lg p-2 min-h-[350px] max-h-[calc(100vh-80px)] ">
                <LoanExatraction
                  showSection={showSection}
                  setShowSection={setShowSection}
                  loanId={loanId}
                  setActiveStep={setActiveStep}
                />
              </div>
            </div>
          )}

          {showSection.startAnalyzing && (
            <>
              <div className="">
                <UnderwritingRuleResult
                  showSection={showSection}
                  setShowSection={setShowSection}
                />
              </div>
            </>
          )}

        </div></main>
    </>
  );
};

export default Dashboard;
