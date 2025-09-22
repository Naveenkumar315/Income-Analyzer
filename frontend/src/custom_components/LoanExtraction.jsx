import React, { useEffect, useState } from "react";
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
import { TbArrowRight } from "react-icons/tb";
import CloseIcon from "@mui/icons-material/Close";
import api from "../api/client";
import ConfirmMoveModal from "./ConfirmMoveModal";

import { toast } from "react-toastify";

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

  const [selectMode, setSelectMode] = useState(false);
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [moveAnchorEl, setMoveAnchorEl] = useState(null);
  const [moveModal, setMoveModal] = useState(null);

  useEffect(() => setRawData(normalized_json || {}), [normalized_json]);

  const borrowers = rawData ? Object.keys(rawData) : [];

  const toggleBorrower = (name) =>
    setOpenBorrowers((prev) => ({ ...prev, [name]: !prev[name] }));

  // --- Add Borrower ---
  const handleAddBorrower = async (name) => {
    try {
      const updated = { ...rawData, [name]: {} }; // empty borrower
      const res = await api.post("/update-cleaned-data", {
        email: sessionStorage.getItem("email") || "",
        loanID: sessionStorage.getItem("loanId") || "",
        username: sessionStorage.getItem("username") || "",
        action: "add_borrower",
        raw_json: updated,
      });
      setRawData(res.data.cleaned_json);
      toast.success(`Borrower "${name}" added`);
    } catch (err) {
      console.error("Error adding borrower:", err);
      toast.error("Failed to add borrower");
    }
  };

  // --- Borrower Merge (unchanged) ---
  const handleMerge = async (targetBorrower, newName) => {
    if (!selectedBase) return;
    try {
      const mergedData = JSON.parse(JSON.stringify(rawData));
      const baseCats = mergedData[selectedBase] || {};
      const targetCats = mergedData[targetBorrower] || {};
      const unionCats = { ...baseCats };

      Object.keys(targetCats).forEach((cat) => {
        if (!Array.isArray(unionCats[cat])) unionCats[cat] = [];
        unionCats[cat] = unionCats[cat].concat(targetCats[cat]);
      });

      delete mergedData[selectedBase];
      delete mergedData[targetBorrower];
      mergedData[newName] = unionCats;

      const res = await api.post("/update-cleaned-data", {
        email: sessionStorage.getItem("email") || "",
        loanID: sessionStorage.getItem("loanId") || "",
        username: sessionStorage.getItem("username") || "",
        action: "folder_merge",
        raw_json: mergedData || {},
      });

      setRawData(res.data.cleaned_json);
      setSelectMode(false);
      setSelectedBase(null);

      toast.success(
        `Borrowers ${selectedBase} and ${targetBorrower} merged into ${newName}`
      );
    } catch (err) {
      console.error("Error in handleMerge:", err);
      toast.error("Failed to merge borrowers. Please try again.");
    }
  };

  // --- File Move (unchanged) ---
  const handleMove = async (toBorrower) => {
    if (!selectedFiles.length) return;
    try {
      const mergedData = JSON.parse(JSON.stringify(rawData));
      selectedFiles.forEach(({ borrower, category }) => {
        const docs = mergedData[borrower][category] || [];
        if (!mergedData[toBorrower][category])
          mergedData[toBorrower][category] = [];
        mergedData[toBorrower][category] =
          mergedData[toBorrower][category].concat(docs);
        mergedData[borrower][category] = [];
      });
      Object.keys(mergedData).forEach((b) => {
        Object.keys(mergedData[b] || {}).forEach((cat) => {
          if (
            Array.isArray(mergedData[b][cat]) &&
            mergedData[b][cat].length === 0
          ) {
            delete mergedData[b][cat];
          }
        });
      });
      const res = await api.post("/update-cleaned-data", {
        email: sessionStorage.getItem("email") || "",
        loanID: sessionStorage.getItem("loanId") || "",
        username: sessionStorage.getItem("username") || "",
        action: "file_merge",
        raw_json: mergedData || {},
      });
      setRawData(res.data.cleaned_json);
      setSelectMode(false);
      setSelectedFiles([]);
      toast.success(`Moved ${selectedFiles.length} file(s) to ${toBorrower}`);
    } catch (err) {
      console.error("Error in handleMove:", err);
      toast.error("Failed to move files. Please try again.");
    }
  };

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 px-4 pt-4 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="font-medium flex gap-5">
            Loan ID : {sessionStorage.getItem("loanId") || ""}
          </div>
          {isUploaded?.uploaded && (
            <div className="flex gap-2">
              <Button
                variant="upload-doc"
                width={200}
                label="Upload Documents"
                onClick={() =>
                  setShowSection((p) => ({ ...p, uploadedModel: true }))
                }
              />
              <Button
                variant="start-analyze"
                width={200}
                label="Start Analyzing"
                onClick={() =>
                  setShowSection((p) => ({ ...p, startAnalyzing: true }))
                }
              />
            </div>
          )}
        </div>

        <div className="flex flex-1 min-h-0">
          {isUploaded?.uploaded ? (
            <>
              {/* Borrower Panel */}
              <div className="w-[25%] border-r border-gray-300 flex flex-col">
                {/* Borrower Header */}
                {/* Borrower Header */}
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                  <div className="font-semibold text-[#26a3dd] flex justify-between items-center">
                    <span>Borrowers</span>
                    <div className="flex items-center gap-4">
                      {/* Add Borrower Anchor */}
                      <p
                        className="cursor-pointer hover:text-[#1976d2]"
                        onClick={() =>
                          setAddBorrower({
                            model: true,
                            borrowerName: "",
                            onSave: handleAddBorrower,
                          })
                        }
                      >
                        Add Borrower
                      </p>
                      {selectMode ? (
                        <div className="flex items-center gap-3">
                          {/* Merge */}
                          <TbArrowMerge
                            className={`cursor-pointer ${
                              selectedBase && selectedFiles.length === 0
                                ? "text-blue-500"
                                : "text-gray-300"
                            }`}
                            onClick={(e) =>
                              selectedBase &&
                              selectedFiles.length === 0 &&
                              setAnchorEl(e.currentTarget)
                            }
                          />
                          {/* Move */}
                          <TbArrowRight
                            className={`cursor-pointer ${
                              selectedFiles.length > 0 && !selectedBase
                                ? "text-blue-500"
                                : "text-gray-300"
                            }`}
                            onClick={(e) =>
                              selectedFiles.length > 0 &&
                              !selectedBase &&
                              setMoveAnchorEl(e.currentTarget)
                            }
                          />
                          <CloseIcon
                            className="text-red-400 cursor-pointer"
                            onClick={() => {
                              setSelectMode(false);
                              setSelectedBase(null);
                              setSelectedFiles([]);
                            }}
                          />
                        </div>
                      ) : (
                        <p
                          className="cursor-pointer hover:text-[#1976d2]"
                          onClick={() => setSelectMode(true)}
                        >
                          Select
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Borrower List */}
                <div className="flex-1 overflow-y-auto px-4 py-2">
                  <ul className="space-y-2">
                    {borrowers.map((name) => {
                      const categories = Object.keys(rawData[name] || {});
                      return (
                        <li key={name}>
                          <div
                            className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 rounded-md"
                            onClick={() => toggleBorrower(name)}
                          >
                            <div className="flex items-center gap-2">
                              {selectMode && (
                                <Checkbox
                                  size="small"
                                  checked={selectedBase === name}
                                  onChange={() => {
                                    setSelectedFiles([]);
                                    setSelectedBase(name);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                              <PersonSharpIcon fontSize="small" />
                              <span className="font-medium">{name}</span>
                            </div>
                            {openBorrowers[name] ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </div>
                          {openBorrowers[name] && (
                            <ul className="ml-8 mt-2 space-y-1">
                              {categories.map((cat) => {
                                const docs = rawData[name][cat] || [];
                                return (
                                  <li key={cat}>
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100">
                                      <FaFolder className="text-gray-500" />
                                      <span className="truncate text-sm">
                                        {cat}
                                      </span>
                                      <span className="ml-auto text-xs text-gray-500">
                                        ({docs.length})
                                      </span>
                                    </div>
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
              </div>

              {/* Right Panel */}
              <div className="w-[75%] flex flex-col">
                <div className="flex-1 overflow-y-auto p-4">
                  {selectedBorrower && selectedCategory ? (
                    <LoanPackagePanel
                      borrower={selectedBorrower}
                      category={selectedCategory}
                      docs={rawData[selectedBorrower][selectedCategory] || []}
                    />
                  ) : (
                    <div className="text-gray-400 flex items-center justify-center h-full">
                      Select a category to view documents
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <UnuploadedScreen setShowSection={setShowSection} />
            </div>
          )}
        </div>

        {/* Floating Rules Button */}
        <div className="fixed bottom-4 right-4 w-[50px] h-[50px] bg-[#12699D] rounded-full flex items-center justify-center shadow-lg hover:bg-[#0f5a7a] transition-colors">
          <DescriptionIcon
            onClick={() => setRulesModel(true)}
            className="text-white cursor-pointer"
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

      {/* Borrower Add/Merge Modal */}
      {addBorrower?.model && (
        <EnterBorrowerName
          setAddBorrower={setAddBorrower}
          addBorrower={addBorrower}
          from_name={addBorrower.from || ""}
          to_name={addBorrower.to || ""}
        />
      )}

      {/* Confirm Move Modal */}
      {moveModal && (
        <ConfirmMoveModal
          fromBorrower={moveModal.from}
          toBorrower={moveModal.to}
          files={moveModal.files}
          onCancel={() => setMoveModal(null)}
          onConfirm={() => {
            handleMove(moveModal.to);
            setMoveModal(null);
          }}
        />
      )}
    </>
  );
};

export default React.memo(LoanExatraction);
