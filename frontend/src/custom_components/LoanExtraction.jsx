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

import { FaFolder, FaFolderOpen } from "react-icons/fa";
import BackLink from "./BackLink";
import EnterBorrowerName from "./EnterBorrowerName";
import Checkbox from "@mui/material/Checkbox";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { TbArrowMerge } from "react-icons/tb";
import CloseIcon from "@mui/icons-material/Close";
import api from "../api/client";
// import { FaFolderOpen } from "react-icons/fa";
const LoanExatraction = ({
  showSection = {},
  setShowSection = () => {},
  goBack,
}) => {
  const { isUploaded, normalized_json } = useUpload();
  const [rulesModel, setRulesModel] = useState(false);
  const [rawData, setRawData] = useState(normalized_json || {});
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openBorrowers, setOpenBorrowers] = useState({});
  const [addBorrower, setAddBorrower] = useState({
    model: false,
    borrowerName: "",
  });

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

  const [selectMode, setSelectMode] = useState(false);
  const [selectedBase, setSelectedBase] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMerge = async (targetBorrower, newName) => {
    const email = sessionStorage.getItem("email");
    const loanID = sessionStorage.getItem("loanId");
    const username = sessionStorage.getItem("username") || "User";

    // Build merged structure
    const mergedData = { ...rawData };
    const mergedDocs = {
      ...mergedData[selectedBase],
      ...mergedData[targetBorrower],
    };
    delete mergedData[selectedBase];
    delete mergedData[targetBorrower];
    mergedData[newName] = mergedDocs;

    const res = await api.post("/clean-json", {
      username,
      email,
      loanID,
      file_name: "merge_update",
      raw_json: mergedData,
    });

    setRawData(res.data.cleaned_json);
    setSelectMode(false);
    setSelectedBase(null);
  };

  return (
    <>
      <BackLink onClick={goBack} />

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
                <div className="font-semibold mb-2 text-[#26a3dd] flex justify-between items-center">
                  <span>Loan Package</span>
                  {selectMode ? (
                    <div className="flex items-center gap-3">
                      <TbArrowMerge
                        className="text-blue-500 cursor-pointer"
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                      />
                      <CloseIcon
                        className="text-red-400 cursor-pointer"
                        onClick={() => {
                          setSelectMode(false);
                          setSelectedBase(null);
                        }}
                      />
                    </div>
                  ) : (
                    <p
                      className="cursor-pointer"
                      onClick={() => setSelectMode(true)}
                    >
                      Select
                    </p>
                  )}
                </div>

                <ul>
                  {borrowers.map((name) => {
                    const categories = Object.keys(rawData[name] || {});
                    return (
                      <li key={name} className="mb-2">
                        <div
                          className={`flex items-center justify-between p-2 ${
                            name === selectedBorrower
                              ? "bg-gray-100 font-medium"
                              : ""
                          }`}
                        >
                          {selectMode && (
                            <Checkbox
                              size="small"
                              checked={selectedBase === name}
                              onChange={() => setSelectedBase(name)}
                            />
                          )}
                          <div
                            className="flex items-center gap-2 cursor-pointer flex-1"
                            onClick={() => toggleBorrower(name)}
                          >
                            <PersonSharpIcon fontSize="small" />
                            <span className="capitalize">
                              {name.toLowerCase()}
                            </span>
                          </div>
                          {openBorrowers[name] ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
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
                                  className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors
                                    ${
                                      name === selectedBorrower &&
                                      cat === selectedCategory
                                        ? "bg-blue-100 text-blue-600 font-semibold"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                  {name === selectedBorrower &&
                                  cat === selectedCategory ? (
                                    <FaFolderOpen className="text-blue-500" />
                                  ) : (
                                    <FaFolder className="text-gray-500" />
                                  )}
                                  <span className="truncate">{cat}</span>
                                  <span className="ml-auto text-xs text-gray-500">
                                    ({docCount})
                                  </span>
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

      {addBorrower?.model && (
        <EnterBorrowerName
          setAddBorrower={setAddBorrower}
          addBorrower={addBorrower}
        />
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {borrowers
          .filter((b) => b !== selectedBase)
          .map((b) => (
            <MenuItem
              key={b}
              onClick={() => {
                setAnchorEl(null);
                setAddBorrower({
                  model: true,
                  borrowerName: "",
                  from: selectedBase,
                  to: b,
                  onSave: (newName) => handleMerge(b, newName),
                });
              }}
            >
              {b}
            </MenuItem>
          ))}
      </Menu>
    </>
  );
};

export default LoanExatraction;
