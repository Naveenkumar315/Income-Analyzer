import { useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";

const UploadedDocument = () => {
  const [loanId, setLoanId] = useState("");

  const handle_loanid_change = (e) => {
    try {
      const id_value = e.target.value || "";
      setLoanId(id_value);
    } catch (ex) {
      console.error("error in handle_loanid_change fn", ex);
    }
  };
  return (
    <div
      className="flex items-center justify-center  bg-gray-50 overflow-hidden"
      style={{ height: "80dvh" }}
    >
      <div className="bg-white rounded-xl shadow-md p-10 w-full max-w-md text-center">
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
          <Button label="Continue" disabled={!loanId.length} />
        </div>
      </div>
    </div>
  );
};

export default UploadedDocument;
