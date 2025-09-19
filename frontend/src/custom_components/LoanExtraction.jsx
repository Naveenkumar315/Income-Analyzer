import { useEffect, useState } from "react";
import Button from "../components/Button";
import UploadedModel from "./UploadedModel";
import DescriptionIcon from "@mui/icons-material/Description";
import UnderwritingRulesModel from "./UnderwritingRulesModel";
import UnuploadedScreen from "./UnuploadedScreen";
import { useUpload } from "../context/UploadContext";
import LoanPackagePanel from "./LoanPackagePanel";
import PersonSharpIcon from "@mui/icons-material/PersonSharp";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const LoanExatraction = ({ showSection = {}, setShowSection = () => {} }) => {
  const { isUploaded, normalized_json } = useUpload();
  const [rulesModel, setRulesModel] = useState(false);
  const [rawData, setRawData] = useState(normalized_json || {});
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openBorrowers, setOpenBorrowers] = useState({});

  useEffect(() => {
    setRawData(normalized_json);
  }, [normalized_json]);

  const borrowers = rawData ? Object.keys(rawData) : [];

  // Select first borrower + first category by default
  useEffect(() => {
    if (borrowers.length > 0 && !selectedBorrower) {
      const firstBorrower = borrowers[0];
      const categories = Object.keys(rawData[firstBorrower] || {});
      setSelectedBorrower(firstBorrower);
      if (categories.length > 0) {
        setSelectedCategory(categories[0]);
      }
    }
  }, [borrowers, rawData, selectedBorrower]);

  const toggleBorrower = (name) => {
    setOpenBorrowers((prev) => ({ ...prev, [name]: !prev[name] }));
  };

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

      {isUploaded?.uploaded ? (
        <div className="flex border-t border-gray-300 h-[calc(100vh-150px)]">
          {/* Borrower + categories list */}
          <div className="w-[25%] border-r border-gray-300 p-2 overflow-y-auto">
            <p className="font-semibold mb-2 text-[#26a3dd]">Loan Package</p>
            <ul>
              {borrowers.map((name) => {
                const categories = Object.keys(rawData[name] || {});
                return (
                  <li key={name} className="mb-2">
                    {/* Borrower header */}
                    <div
                      className={`flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 ${
                        name === selectedBorrower
                          ? "border-l-4 border-[#26a3dd] font-medium bg-gray-100 rounded-r-md"
                          : "border-gray-200"
                      }`}
                      onClick={() => toggleBorrower(name)}
                    >
                      <div className="flex items-center gap-2">
                        <PersonSharpIcon fontSize="small" />
                        <span className="capitalize">{name.toLowerCase()}</span>
                      </div>
                      {openBorrowers[name] ? (
                        <ExpandLessIcon fontSize="small" />
                      ) : (
                        <ExpandMoreIcon fontSize="small" />
                      )}
                    </div>

                    {/* Categories */}
                    {openBorrowers[name] && (
                      <ul className="ml-6 mt-1">
                        {categories.map((cat) => (
                          <li
                            key={cat}
                            onClick={() => {
                              setSelectedBorrower(name);
                              setSelectedCategory(cat);
                            }}
                            className={`p-1 cursor-pointer text-sm hover:bg-gray-50 ${
                              name === selectedBorrower &&
                              cat === selectedCategory
                                ? "text-sky-600 font-semibold"
                                : "text-gray-700"
                            }`}
                          >
                            {cat}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Document panel */}
          <div className="w-[75%] p-4 overflow-y-auto">
            {selectedBorrower && selectedCategory ? (
              <LoanPackagePanel
                borrower={selectedBorrower}
                category={selectedCategory}
                docs={rawData[selectedBorrower][selectedCategory]}
              />
            ) : (
              <div className="text-gray-400 flex items-center justify-center h-full">
                Select a category to view documents
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
