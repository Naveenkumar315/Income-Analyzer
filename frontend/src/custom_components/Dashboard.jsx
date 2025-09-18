import { useState } from "react";
import LoanExatraction from "./LoanExtraction";
import ProcessLoanTable from "./ProcessLoanTable";
import UploadedDocument from "./UploadedDocument";

const Dashboard = () => {
  const [showSection, setShowSection] = useState({
    processLoanSection: true,
    provideLoanIDSection: false,
    extractedSection: false,
    uploadedModel: false,
  });
  const [loanId, setLoanId] = useState("");

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

  const data = [
    {
      loanId: "LN-20250915-001",
      fileName: "123456789_W2.json",
      borrower: "John Doe",
      loanType: "Conventional",
      status: "Completed",
      lastUpdated: "2025-09-14 10:45 AM",
      uploadedBy: "John Doe",
      actions: "",
    },
    {
      loanId: "LN-20250914-005",
      fileName: "12345_LoanFile.json",
      borrower: "Lando Norris",
      loanType: "FHA",
      status: "Pending",
      lastUpdated: "2025-09-13 04:22 PM",
      uploadedBy: "Emily Johnson",
      actions: "",
    },
    {
      loanId: "LN-20250914-005",
      fileName: "12345_LoanFile.json",
      borrower: "Lando Norris",
      loanType: "FHA",
      status: "Error",
      lastUpdated: "2025-09-13 04:22 PM",
      uploadedBy: "Emily Johnson",
      actions: "",
    },
    {
      loanId: "LN-20250915-001",
      fileName: "123456789_W2.json",
      borrower: "John Doe",
      loanType: "Conventional",
      status: "Completed",
      lastUpdated: "2025-09-14 10:45 AM",
      uploadedBy: "John Doe",
      actions: "",
    },
    {
      loanId: "LN-20250914-005",
      fileName: "12345_LoanFile.json",
      borrower: "Lando Norris",
      loanType: "FHA",
      status: "Pending",
      lastUpdated: "2025-09-13 04:22 PM",
      uploadedBy: "Emily Johnson",
      actions: "",
    },
    {
      loanId: "LN-20250914-005",
      fileName: "12345_LoanFile.json",
      borrower: "Lando Norris",
      loanType: "FHA",
      status: "Error",
      lastUpdated: "2025-09-13 04:22 PM",
      uploadedBy: "Emily Johnson",
      actions: "",
    },
  ];
  console.log("UploadedModel rendered with loanId:", loanId);
  return (
    <>
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
          <div className="bg-white rounded-lg p-2 min-h-[400px] max-h-[calc(100vh-80px)] ">
            <LoanExatraction
              showSection={showSection}
              setShowSection={setShowSection}
              loanId={loanId}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
