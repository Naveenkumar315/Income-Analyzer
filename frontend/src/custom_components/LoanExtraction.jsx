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

  useEffect(() => setRawData(normalized_json), [normalized_json]);

  const borrowers = rawData ? Object.keys(rawData) : [];

  useEffect(() => {
    if (borrowers.length > 0 && !selectedBorrower) {
      const firstBorrower = borrowers[0];
      const categories = Object.keys(rawData[firstBorrower] || {});
      setSelectedBorrower(firstBorrower);
      if (categories.length > 0) setSelectedCategory(categories[0]);
      setOpenBorrowers({ [firstBorrower]: true });
    }
  }, [borrowers, rawData, selectedBorrower]);

  const toggleBorrower = (name) =>
    setOpenBorrowers((prev) => ({ ...prev, [name]: !prev[name] }));

  const HandleProcess = () =>
    setShowSection((prev) => ({
      ...prev,
      processLoanSection: false,
      provideLoanIDSection: false,
      extractedSection: false,
      uploadedModel: false,
      startAnalyzing: true,
    }));

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 shrink-0">
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
      <div className="flex flex-1 min-h-0 border-t border-gray-300">
        {isUploaded?.uploaded ? (
          <>
            {/* Borrower + categories */}
            <div className="w-[25%] border-r border-gray-300 p-2 overflow-auto">
              <p className="font-semibold mb-2 text-[#26a3dd]">Loan Package</p>
              <ul>
                {borrowers.map((name) => {
                  const categories = Object.keys(rawData[name] || {});
                  return (
                    <li key={name} className="mb-2">
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
                          <span className="capitalize">
                            {name.toLowerCase()}
                          </span>
                        </div>
                        {openBorrowers[name] ? (
                          <ExpandLessIcon fontSize="small" />
                        ) : (
                          <ExpandMoreIcon fontSize="small" />
                        )}
                      </div>

                      {openBorrowers[name] && (
                        <ul className="ml-6 mt-1">
                          {categories.map((cat) => {
                            const docCount = rawData[name][cat]?.length || 0;
                            return (
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
                                {cat} ({docCount})
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Document panel */}
            <div className="w-[75%] p-4 overflow-auto">
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
          </>
        ) : (
          <UnuploadedScreen setShowSection={setShowSection} />
        )}
      </div>

      {/* Floating button */}
      <div className="fixed bottom-4 right-4 w-[50px] h-[50px] rounded-3xl bg-[#12699D] shadow-lg flex items-center justify-center cursor-pointer">
        <DescriptionIcon
          onClick={() => setRulesModel(true)}
          className="text-white"
        />
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
