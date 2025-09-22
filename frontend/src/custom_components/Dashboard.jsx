import React, { useEffect, useState } from "react";
import LoanExatraction from "./LoanExtraction";
import ProcessLoanTable from "./ProcessLoanTable";
import UploadedDocument from "./UploadedDocument";
import UnderwritingRuleResult from "./UnderwritingRuleResults";
import api from "../api/client";
import StepChips from "../custom_components/StepChips";
import { useUpload } from "../context/UploadContext";

const Dashboard = ({ onAddLoanPackage }) => {
  const {
    showSection,
    setShowSection,
    loanId,
    setLoanId,
    data,
    setData,
    activeStep,
    setActiveStep,
    loading,
    setLoading,
    goBack,
  } = useUpload();

  useEffect(() => {
    handleCheckData();
  }, [showSection]);

  const handleCheckData = async () => {
    try {
      setLoading(true);
      const email = sessionStorage.getItem("email") || "";
      const res = await api.post("/uploaded-data/by-email", { email });
      if (res.data && res.data.length > 0) {
        setData(transformUploadedData(res.data));
        console.log("table data", transformUploadedData(res.data));
      }
    } catch (err) {
      console.error("Error fetching uploaded data", err);
    } finally {
      setLoading(false);
    }
  };

  const transformUploadedData = (resData) =>
    resData.map((item) => ({
      loanId: item.loanID || "",
      fileName: item.file_name || "",
      borrower: item.borrower || [],
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
      uploadedBy: item.uploadedBy || sessionStorage.getItem("username") || "",
      actions: "",
    }));

  const columns = [
    { id: "loanId", label: "Loan ID" },
    { id: "fileName", label: "File Name" },
    { id: "borrower", label: "Borrower Name", isCustom: true },
    { id: "status", label: "Status", isCustom: true },
    { id: "lastUpdated", label: "Last Updated" },
    { id: "uploadedBy", label: "Uploaded By" },
    { id: "actions", label: "Actions", isCustom: true },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="bg-white rounded-lg p-2 flex-1 overflow-auto shadow">
        {showSection.processLoanSection && (
          <>
            {/* <div className="flex justify-end mb-2">
              <button
                onClick={onAddLoanPackage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Loan Package
              </button>
            </div> */}
            <ProcessLoanTable
              columns={columns}
              data={data}
              loading={loading}
              setShowSection={setShowSection}
              onRefresh={handleCheckData}
              onAddLoanPackage={onAddLoanPackage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
