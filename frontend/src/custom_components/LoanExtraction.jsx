import { useEffect, useState } from "react";
import Button from "../components/Button";
import UploadedModel from "./UploadedModel";
import DescriptionIcon from "@mui/icons-material/Description";
import UnderwritingRulesModel from "./UnderwritingRulesModel";
import UnuploadedScreen from "./UnuploadedScreen";

import { useUpload } from "../context/UploadContext";
import LoanPackagePanel from "./LoanPackagePanel";
import PersonSharpIcon from "@mui/icons-material/PersonSharp";

const LoanExatraction = ({ showSection = {}, setShowSection = () => {} }) => {
  const { isUploaded, normalized_json } = useUpload();
  const [rulesModel, setRulesModel] = useState(false);
  const [rawData, setRawData] = useState(normalized_json || {});
  const [selectedBorrower, setSelectedBorrower] = useState(null);

  // Sync rawData with context
  useEffect(() => {
    setRawData(normalized_json);
  }, [normalized_json]);

  const borrowers = rawData ? Object.keys(rawData) : [];

  // Auto-select first borrower when data changes
  useEffect(() => {
    if (borrowers.length > 0 && !selectedBorrower) {
      setSelectedBorrower(borrowers[0]);
    }
  }, [borrowers, selectedBorrower]);

  const OpenRulesModel = () => setRulesModel(true);

  const HandleProcess = () => {
    setShowSection((prev) => ({
      ...prev,
      processLoanSection: false,
      provideLoanIDSection: false,
      extractedSection: false,
      uploadedModel: false,
      startAnalyzing: true,
    }));
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex justify-between items-center rounded-lg pb-3">
        <span className="font-medium">
          Upload & Extract Files {sessionStorage.getItem("loanId") || ""}
        </span>
        {isUploaded?.uploaded && (
          <div className="flex gap-2">
            <Button
              variant="upload-doc"
              width={200}
              label="Upload Documents"
              onClick={() =>
                setShowSection((prev) => ({ ...prev, uploadedModel: true }))
              }
            />
            <Button
              variant="start-analyze"
              width={200}
              label="Start Analyzing"
              onClick={HandleProcess}
            />
          </div>
        )}
      </div>

      {/* Main layout */}
      {isUploaded?.uploaded ? (
        <div className="flex border-t border-gray-300 h-[calc(100vh-100px)]">
          {/* Borrower list */}
          <div className="w-[25%] border-r border-gray-300 p-2 overflow-y-auto">
            <p className="font-semibold mb-2 text-[#26a3dd]">Loan Package</p>
            <ul>
              {borrowers.map((name) => (
                <li
                  key={name}
                  onClick={() => setSelectedBorrower(name)}
                  className={`flex items-center gap-2 p-2 cursor-pointer border-b hover:bg-gray-50 ${
                    name === selectedBorrower
                      ? "border-l-4 border-[#26a3dd] font-medium bg-gray-100 rounded-r-md"
                      : "border-gray-200"
                  }`}
                >
                  <PersonSharpIcon fontSize="small" />
                  <span className="capitalize">{name.toLowerCase()}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Document panel */}
          <div className="w-[75%] p-4 overflow-y-auto">
            {selectedBorrower ? (
              <LoanPackagePanel
                borrower={selectedBorrower}
                borrowerDocs={rawData[selectedBorrower]}
              />
            ) : (
              <div className="text-gray-400 flex items-center justify-center h-full">
                Select a borrower to view documents
              </div>
            )}
          </div>
        </div>
      ) : (
        <UnuploadedScreen setShowSection={setShowSection} />
      )}

      {/* Floating button */}
      <div className="fixed bottom-4 right-4 flex items-center justify-center w-[50px] h-[50px] rounded-3xl bg-[#12699D] shadow-lg cursor-pointer">
        <DescriptionIcon onClick={OpenRulesModel} className="text-white" />
      </div>

      <UnderwritingRulesModel
        rulesModel={rulesModel}
        OpenRulesModel={setRulesModel}
      />

      {showSection.uploadedModel && (
        <UploadedModel setShowSection={setShowSection} />
      )}
    </div>
  );
};

export default LoanExatraction;
