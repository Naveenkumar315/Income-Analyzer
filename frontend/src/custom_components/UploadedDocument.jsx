import { useState, useEffect } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import BackLink from "./BackLink";
import api from "../api/client"; // axios instance

const UploadedDocument = ({
  setShowSection = () => {},
  loanId = "",
  setLoanId,
  goBack,
}) => {
  const [errorMsg, setErrorMsg] = useState("");
  const [checking, setChecking] = useState(false);
  const [isUnique, setIsUnique] = useState(true);

  // Debounce loanId validation
  useEffect(() => {
    if (!loanId) {
      setIsUnique(true);
      setErrorMsg("");
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setChecking(true);
        const email = sessionStorage.getItem("email");
        const res = await api.get("/check-loanid", {
          params: { email, loanID: loanId },
        });
        if (res.data.exists) {
          setIsUnique(false);
          setErrorMsg("This Loan ID already exists for your account.");
        } else {
          setIsUnique(true);
          setErrorMsg("");
        }
      } catch (err) {
        console.error("Error checking loanId:", err);
      } finally {
        setChecking(false);
      }
    }, 200); // 500ms debounce

    return () => clearTimeout(timeout);
  }, [loanId]);

  const handle_loanid_change = (e) => {
    const id_value = e.target.value || "";
    setLoanId(id_value);
  };

  const handle_continue = () => {
    if (!loanId.trim() || !isUnique) return;

    sessionStorage.setItem("loanId", loanId);
    setShowSection((prev) => ({
      ...prev,
      extractedSection: true,
      uploadedModel: true,
      processLoanSection: false,
      provideLoanIDSection: false,
    }));
  };

  return (
    <div
      className="flex items-center justify-center bg-gray-50 overflow-hidden"
      style={{ height: "80dvh" }}
    >
      <div className="bg-white rounded-xl shadow-md p-10 w-full max-w-md text-center relative">
        {goBack && (
          <div className="absolute left-4 top-4">
            <BackLink onClick={goBack} />
          </div>
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
            onChange={handle_loanid_change}
          />
          {errorMsg && <p className="text-red-500 text-sm mt-1">{errorMsg}</p>}
        </div>

        <div className="mt-6">
          <Button
            label={checking ? "Checking..." : "Continue"}
            disabled={!loanId.length || !isUnique || checking}
            onClick={handle_continue}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadedDocument;
