import { useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";

const UploadedDocument = ({
  setShowSection = () => {},
  loanId = "",
  setLoanId,
  goBack, // <- added
}) => {
  const handle_loanid_change = (e) => {
    try {
      const id_value = e.target.value || "";
      setLoanId(id_value);
    } catch (ex) {
      console.error("error in handle_loanid_change fn", ex);
    }
  };

  const handle_continue = () => {
    if (!loanId.trim()) return;

    sessionStorage.setItem("loanId", loanId);
    try {
      setShowSection((prev) => ({
        ...prev,
        extractedSection: true,
        uploadedModel: true,
        processLoanSection: false,
        provideLoanIDSection: false,
      }));
    } catch (ex) {
      console.error("error in handle_continue fn", ex);
    }
  };

  return (
    <div
      className="flex items-center justify-center bg-gray-50 overflow-hidden"
      style={{ height: "80dvh" }}
    >
      <div className="bg-white rounded-xl shadow-md p-10 w-full max-w-md text-center relative">
        {/* Back button */}
        {goBack && (
          <p
            onClick={goBack}
            className="absolute left-4 top-4 text-blue-400 cursor-pointer"
          >
            ← Back
          </p>
        )}

        <h2 className="text-lg font-semibold text-gray-800">Income Analyzer</h2>
        <p className="text-sm text-gray-500 mt-1">
          Provide Loan ID to begin income analysis
        </p>

        <div className="mt-6 text-left">
          <Input
            label="Loan ID"
            placeholder="Enter"
            name="loanId"
            value={loanId}
            onChange={(e) => handle_loanid_change(e)}
          />
        </div>

        <div className="mt-6">
          <Button
            label="Continue"
            disabled={!loanId.length}
            onClick={() => handle_continue()}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadedDocument;
